import { useDeriv } from '@/contexts/DerivContext';
import { BotsDeriv, ConfigBotsDeriv, Operation, OperationState } from '@/models/deriv';
import { DerivApiService } from '@/services/DerivApiService';
import { useCallback, useEffect, useRef, useState } from 'react';

export type { Operation } from '@/models/deriv';

export interface ExtendedOperationState extends OperationState {
  consecutiveLosses: number;
}

export const useOperations = (tabId: number) => {
  const apiService = useRef<DerivApiService | null>(null);
  const { userDeriv, updateUserBalance } = useDeriv();

  const [operationState, setOperationState] = useState<ExtendedOperationState>({
    isRunning: false,
    operations: [],
    totalProfit: 0,
    winRate: 0,
    consecutiveLosses: 0,
  });
  const [botConfig, setBotConfig] = useState<ConfigBotsDeriv | null>(null);
  const [operationLogs, setOperationLogs] = useState<string[]>([]);
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'waiting_for_proposal' | 'proposal_received' | 'contract_open'>('idle');
  const [activeContractId, setActiveContractId] = useState<number | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const balanceSubscriptionId = useRef<string | null>(null);
  const [profitTarget, setProfitTarget] = useState<number | null>(null);
  const [maxConsecutiveLosses, setMaxConsecutiveLosses] = useState<number | null>(null);

  const logOperation = useCallback((message: string) => {
    const logMessage = `[${new Date().toLocaleTimeString()}] [Aba ${tabId}] ${message}`;
    console.log(logMessage);
    setOperationLogs((prev) => [logMessage, ...prev.slice(0, 100)]);
  }, [tabId]);

  const stopOperations = useCallback((reason?: string) => {
    logOperation(`Parando operações${reason ? `: ${reason}` : ''}.`);
    if (apiService.current && balanceSubscriptionId.current) {
      apiService.current.sendMessage({ forget: balanceSubscriptionId.current });
      balanceSubscriptionId.current = null;
    }
    apiService.current?.disconnect();
    apiService.current = null;
    setOperationState((prev) => ({ ...prev, isRunning: false }));
    setTradeStatus('idle');
    setActiveContractId(null);
    setIsApiReady(false);
  }, [logOperation]);

  const extractPromptValues = useCallback((config: ConfigBotsDeriv) => {
    const profitPrompt = config.prompts.find(p => p.text.toLowerCase().includes('expectativa de lucro') || p.text.toLowerCase().includes('meta de ganho'));
    const lossPrompt = config.prompts.find(p => p.text.toLowerCase().includes('de perda'));
    console.log({ profitPrompt, lossPrompt })
    const profit = profitPrompt ? Number(profitPrompt.value) : null;
    const losses = lossPrompt ? Number(lossPrompt?.value) : null;
    console.log({ profitPromptFormat: profit, lossPromptFormat: losses })

    logOperation(`Valores extraídos dos prompts: Lucro Alvo = ${profit}, Máximo de Perdas Seguidas = ${losses}`);
    setProfitTarget(profit);
    setMaxConsecutiveLosses(losses);
  }, [logOperation]);

  const checkStopConditions = useCallback(() => {
    if (profitTarget !== null && operationState.totalProfit >= profitTarget) {
      stopOperations(`Meta de lucro de $${profitTarget} atingida.`);
      window.alert(`Meta de lucro de $${profitTarget} atingida.`)
      return true;
    }
    if (maxConsecutiveLosses !== null && operationState.consecutiveLosses >= maxConsecutiveLosses) {
      stopOperations(`Máximo de ${maxConsecutiveLosses} perdas seguidas atingido.`);
      window.alert(`Máximo de ${maxConsecutiveLosses} perdas seguidas atingido.`)
      return true;
    }
    return false;
  }, [profitTarget, maxConsecutiveLosses, operationState.totalProfit, operationState.consecutiveLosses, stopOperations]);

  const makeProposal = useCallback(() => {
    console.log(`[Aba ${tabId}] Estado antes de makeProposal:`, { isRunning: operationState.isRunning, isConnected: apiService.current?.isConnected(), tradeStatus });
    if (checkStopConditions()) return;
    if (!apiService.current || !botConfig) {
      logOperation("Aguardando configuração do bot para fazer proposta...");
      return;
    }
    logOperation("Enviando pedido de proposta de contrato...");
    setTradeStatus('waiting_for_proposal');
    const proposalRequest = {
      proposal: 1,
      subscribe: 1,
      amount: botConfig.prompts.find(p => p.text.toLowerCase().includes('entrada'))?.value || 1,
      basis: 'stake',
      contract_type: botConfig.trade_options.type || 'CALL',
      currency: 'USD',
      duration: botConfig.trade_options.duration,
      duration_unit: botConfig.trade_options.durationUnit,
      symbol: botConfig.trade_options.symbol,
    };
    apiService.current.sendMessage(proposalRequest);
  }, [botConfig, logOperation, checkStopConditions, operationState.isRunning, tabId]);

  const handleWebSocketMessage = useCallback((data: any) => {
    console.log(`[Aba ${tabId}] Mensagem WebSocket recebida:`, data);
    if (data.error) {
      logOperation(`ERRO DA API: ${data.error.message} (Código: ${data.error.code})`);
      if (data.error.code === 'RateLimit') {
        logOperation("Limite de taxa atingido. Aguardando 60 segundos antes de tentar novamente...");
        setTimeout(() => makeProposal(), 60000);
      } else if (data.error.code === 'authorization_required') {
        logOperation("Autorização necessária. Tentando reautenticar...");
        apiService.current?.sendMessage({ authorize: userDeriv?.token });
      } else {
        logOperation("Erro crítico. Parando operações...");
        stopOperations();
      }
      return;
    }

    switch (data.msg_type) {
      case 'balance': {
        const { balance, subscription } = data;
        const newBalance = balance.balance;
        logOperation(`Saldo atualizado: ${newBalance} ${balance.currency}`);
        if (subscription && subscription.id && !balanceSubscriptionId.current) {
          balanceSubscriptionId.current = subscription.id;
          logOperation(`Inscrito para atualizações de saldo. ID: ${subscription.id}`);
        }
        if (updateUserBalance) {
          updateUserBalance(newBalance);
        }
        break;
      }
      case 'proposal': {
        if (tradeStatus !== 'waiting_for_proposal') return;
        const proposal = data.proposal;
        logOperation(`Proposta recebida. ID: ${proposal.id}, Preço: ${proposal.display_value}`);
        setTradeStatus('proposal_received');
        logOperation(`Enviando ordem de compra...`);
        apiService.current?.sendMessage({
          buy: proposal.id,
          price: proposal.ask_price,
        });
        break;
      }
      case 'buy': {
        const buyInfo = data.buy;
        logOperation(`Contrato comprado com sucesso! ID do Contrato: ${buyInfo.contract_id}`);
        setActiveContractId(buyInfo.contract_id);
        setTradeStatus('contract_open');
        apiService.current?.sendMessage({
          proposal_open_contract: 1,
          contract_id: buyInfo.contract_id,
          subscribe: 1,
        });
        break;
      }
      case 'proposal_open_contract': {
        const contract = data.proposal_open_contract;
        if (contract.contract_id !== activeContractId) return;

        if (contract.is_sold) {
          logOperation(`Contrato ${contract.contract_id} fechado.`);
          setTradeStatus('idle');
          setActiveContractId(null);
          const profit = contract.profit;
          const result: Operation = {
            id: contract.contract_id,
            result: profit >= 0 ? 'win' : 'loss',
            profit: profit,
            timestamp: new Date(contract.sell_time * 1000).toISOString(),
            type: contract.contract_type,
            symbol: contract.underlying,
            amount: contract.buy_price,
            price: contract.entry_spot,
            status: contract.status,
          };
          logOperation(`Resultado: ${result.result.toUpperCase()} | Lucro: ${profit.toFixed(2)}`);
          setOperationState(prev => {
            const newOperations = [result, ...prev.operations];
            const totalWins = newOperations.filter(op => op.result === 'win').length;
            const newTotalProfit = prev.totalProfit + profit;
            const newWinRate = newOperations.length > 0 ? (totalWins / newOperations.length) * 100 : 0;
            const newConsecutiveLosses = result.result === 'win' ? 0 : prev.consecutiveLosses + 1;
            console.log(`[Aba ${tabId}] Atualizando operationState:`, { newOperations, newTotalProfit, newWinRate, newConsecutiveLosses });
            return {
              ...prev,
              operations: newOperations,
              totalProfit: newTotalProfit,
              winRate: newWinRate,
              consecutiveLosses: newConsecutiveLosses
            };
          });
          setTimeout(() => {
            if (operationState.isRunning && apiService.current?.isConnected()) {
              makeProposal();
            } else if (operationState.isRunning) {
              logOperation("API desconectada. Tentando reconectar...");
              apiService.current?.connect();
              setTimeout(() => makeProposal(), 2000);
            }
          }, 2000);
        }
        break;
      }
      case 'history': {
        logOperation(`Histórico de ticks recebido. Pronto para iniciar o ciclo de negociação.`);
        makeProposal();
        break;
      }
      case 'tick':
        break;
      default:
        break;
    }
  }, [logOperation, stopOperations, activeContractId, tradeStatus, operationState.isRunning, makeProposal, updateUserBalance, userDeriv?.token, tabId]);

  const handleWebSocketMessageRef = useRef(handleWebSocketMessage);
  useEffect(() => {
    handleWebSocketMessageRef.current = handleWebSocketMessage;
  }, [handleWebSocketMessage]);

  const handleApiError = useCallback((error: Event) => {
    logOperation(`Erro crítico de conexão com a API: ${(error as ErrorEvent).message || 'Erro desconhecido'}`);
    stopOperations();
  }, [logOperation, stopOperations]);

  const onApiAuthenticated = useCallback(() => {
    logOperation("API autenticada e pronta para receber comandos.");
    setIsApiReady(true);
  }, [logOperation]);

  useEffect(() => {
    if (!isApiReady || !operationState.isRunning || !apiService.current || !botConfig) {
      return;
    }
    logOperation("API pronta. Solicitando dados iniciais e subscrições...");
    apiService.current.sendMessage({
      ticks_history: botConfig.trade_options.symbol || 'R_100',
      end: "latest", count: 10, style: 'ticks',
    });
    apiService.current.sendMessage({
      ticks: botConfig.trade_options.symbol || 'R_100', subscribe: 1,
    });
    apiService.current.sendMessage({ balance: 1, subscribe: 1 });
  }, [isApiReady, operationState.isRunning, botConfig, logOperation]);

  useEffect(() => {
    if (!operationState.isRunning || !apiService.current) return;
    const checkConnection = setInterval(() => {
      if (!apiService.current?.isConnected()) {
        logOperation("WebSocket desconectado. Tentando reconectar...");
        apiService.current?.connect();
      }
    }, 5000);
    return () => clearInterval(checkConnection);
  }, [operationState.isRunning, logOperation]);

  useEffect(() => {
    if (botConfig) {
      extractPromptValues(botConfig);
    }
  }, [botConfig, extractPromptValues]);

  const startOperations = useCallback(async (bot: BotsDeriv) => {
    if (!userDeriv?.token) {
      logOperation("Erro fatal: Tentativa de iniciar bot sem token de autenticação.");
      return;
    }
    logOperation(`Iniciando configuração para o bot: ${bot.name}`);
    setOperationLogs([]);
    setBotConfig(bot.config);
    setOperationState({ isRunning: true, operations: [], totalProfit: 0, winRate: 0, consecutiveLosses: 0 });
    setTradeStatus('idle');
    setIsApiReady(false);
    apiService.current = new DerivApiService(
      userDeriv.token,
      (data) => handleWebSocketMessageRef.current(data),
      onApiAuthenticated,
      handleApiError
    );
    apiService.current.connect();
  }, [userDeriv, onApiAuthenticated, handleApiError, logOperation]);

  useEffect(() => {
    return () => {
      if (apiService.current) {
        logOperation("Componente desmontado. Desconectando...");
        stopOperations();
      }
    };
  }, [logOperation, stopOperations]);

  return {
    operationState,
    startOperations,
    stopOperations,
    operationLogs,
  };
};