import { useDeriv } from '@/contexts/DerivContext';
import { BotsDeriv, ConfigBotsDeriv, OperationState } from '@/models/deriv';
import { DerivApiService } from '@/services/DerivApiService';
import { useCallback, useEffect, useRef, useState } from 'react';

// Extensão do OperationState para incluir lógica de estratégia
export interface ExtendedOperationState extends OperationState {
  consecutiveLosses: number;
  nextStake: number; // Valor da próxima entrada
}

export const useOperations = (tabId: number) => {
  const apiService = useRef<DerivApiService | null>(null);
  const { userDeriv, updateUserBalance } = useDeriv();

  const [botConfig, setBotConfig] = useState<ConfigBotsDeriv | null>(null);
  const [operationLogs, setOperationLogs] = useState<string[]>([]);
  const [isApiReady, setIsApiReady] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'trading'>('idle');

  const [operationState, setOperationState] = useState<ExtendedOperationState>({
    isRunning: false,
    operations: [],
    totalProfit: 0,
    winRate: 0,
    consecutiveLosses: 0,
    nextStake: 1,
  });

  const logOperation = useCallback((message: string) => {
    const logMessage = `[${new Date().toLocaleTimeString()}] [Aba ${tabId}] ${message}`;
    console.log(logMessage);
    setOperationLogs((prev) => [logMessage, ...prev.slice(0, 100)]);
  }, [tabId]);

  const stopOperations = useCallback((reason?: string) => {
    logOperation(`Parando operações${reason ? `: ${reason}` : ''}.`);
    apiService.current?.disconnect();
    apiService.current = null;
    setOperationState((prev) => ({ ...prev, isRunning: false }));
    setTradeStatus('idle');
    setIsApiReady(false);
  }, [logOperation]);

  // --- Lógica de Negociação ---
  const makeProposalAndBuy = useCallback(() => {
    if (tradeStatus !== 'trading' || !apiService.current || !botConfig) return;

    logOperation(`Preparando para comprar contrato com entrada de $${operationState.nextStake.toFixed(2)}.`);

    const proposalRequest = {
      proposal: 1,
      amount: operationState.nextStake,
      basis: 'stake',
      contract_type: botConfig.trade_options.type,
      currency: 'USD',
      duration: botConfig.trade_options.duration,
      duration_unit: botConfig.trade_options.durationUnit,
      symbol: botConfig.trade_options.symbol,
    };

    const buyContract = (proposalId: string) => {
      apiService.current?.sendMessage({
        buy: proposalId,
        price: 10000, // Preço grande para garantir execução (para propostas de 'stake')
      });
    };

    const messageHandler = (data: any) => {
      if (data.msg_type === 'proposal' && data.proposal) {
        logOperation(`Proposta ${data.proposal.id} recebida. Comprando...`);
        buyContract(data.proposal.id);
      } else if (data.msg_type === 'buy') {
        logOperation(`Contrato ${data.buy.contract_id} comprado.`);
      } else if (data.msg_type === 'proposal_open_contract' && data.proposal_open_contract.is_sold) {
        handleContractClosed(data.proposal_open_contract, messageHandler);
      } else if (data.error) {
        logOperation(`Erro na proposta/compra: ${data.error.message}`);
        setTimeout(makeProposalAndBuy, 5000); // Tenta novamente após um erro
      }
    };

    apiService.current.addTemporaryMessageHandler(messageHandler);
    apiService.current.sendMessage(proposalRequest);

  }, [botConfig, logOperation, tradeStatus, operationState.nextStake]);

  const handleContractClosed = (contractResult: any, temporaryHandler: (data: any) => void) => {
    apiService.current?.removeMessageHandler(temporaryHandler);
    const profit = contractResult.profit;
    const isWin = profit >= 0;

    logOperation(`Contrato fechado. Resultado: ${isWin ? 'GANHOU' : 'PERDEU'}. Lucro: $${profit.toFixed(2)}`);

    setOperationState((prev: any) => {
      const initialStake = parseFloat(botConfig?.prompts.find(p => p.key === 'initial_stake')?.value || '1');
      let newNextStake = initialStake;
      let newConsecutiveLosses = prev.consecutiveLosses;

      if (isWin) {
        newConsecutiveLosses = 0;
        // Lógica Soros poderia ser adicionada aqui
      } else { // Loss
        newConsecutiveLosses += 1;
        if (botConfig?.strategy?.type === 'martingale') {
          newNextStake = prev.nextStake * (botConfig.strategy.multiplier || 2);
          logOperation(`Martingale ativado. Próxima entrada: $${newNextStake.toFixed(2)}`);
        }
      }

      const newTotalProfit = prev.totalProfit + profit;
      const newOperations = [...prev.operations, { id: contractResult.contract_id, result: isWin ? 'win' : 'loss', profit, /* ...outros dados */ }];
      const newWinRate = (newOperations.filter(op => op.result === 'win').length / newOperations.length) * 100;

      return { ...prev, totalProfit: newTotalProfit, operations: newOperations, winRate: newWinRate, consecutiveLosses: newConsecutiveLosses, nextStake: newNextStake };
    });

    // Agenda a próxima operação
    setTimeout(makeProposalAndBuy, 2000);
  };

  // --- Inicialização e Efeitos ---
  const startOperations = useCallback(async (bot: BotsDeriv) => {
    if (!userDeriv?.token) {
      logOperation("Erro fatal: Token de autenticação não encontrado.");
      return;
    }

    const initialStake = parseFloat(bot.config.prompts.find(p => p.key === 'initial_stake')?.value || '1');

    logOperation(`Iniciando bot: ${bot.name} com entrada inicial de $${initialStake.toFixed(2)}`);
    setBotConfig(bot.config);
    setOperationState({
      isRunning: true, operations: [], totalProfit: 0, winRate: 0,
      consecutiveLosses: 0, nextStake: initialStake
    });
    setOperationLogs([]);

    apiService.current = new DerivApiService(userDeriv.token, () => { }, () => setIsApiReady(true));
    apiService.current.connect();
  }, [userDeriv, logOperation]);

  useEffect(() => {
    if (isApiReady && operationState.isRunning) {
      logOperation("API pronta. Iniciando ciclo de negociação.");
      setTradeStatus('trading');
      makeProposalAndBuy();
    }
  }, [isApiReady, operationState.isRunning, makeProposalAndBuy]);

  return { operationState, startOperations, stopOperations, operationLogs };
};