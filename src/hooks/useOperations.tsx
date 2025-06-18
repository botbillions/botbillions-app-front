import { useDeriv } from '@/contexts/DerivContext';
import { BotsDeriv, ConfigBotsDeriv, Operation } from '@/models/deriv';
import { DerivApiService } from '@/services/DerivApiService';
import { useCallback, useEffect, useRef, useState } from 'react';

// Estado para controle interno dos parâmetros do bot
interface BotControlState {
  initialStake: number;
  nextStake: number;
  takeProfit: number | null;
  stopLoss: number | null;
  barrier: string;
  consecutiveLossLimit: number | null; // Limite de perdas consecutivas
}

// Estado para a UI
interface OperationState {
  isRunning: boolean;
  operations: Operation[];
  totalProfit: number;
  winRate: number;
  consecutiveLosses: number; // Rastrear perdas consecutivas
}

export const useOperations = (tabId: number) => {
  const { userDeriv, updateUserBalance } = useDeriv();
  const apiService = useRef<DerivApiService | null>(null);

  // Armazena a configuração do bot atual
  const botConfigRef = useRef<ConfigBotsDeriv | null>(null);

  // Estado para a UI
  const [operationState, setOperationState] = useState<OperationState>({
    isRunning: false,
    operations: [],
    totalProfit: 0,
    winRate: 0,
    consecutiveLosses: 0,
  });

  // Estado para os parâmetros de controle do bot
  const controlState = useRef<BotControlState | null>(null);

  const [operationLogs, setOperationLogs] = useState<string[]>([]);
  const [isApiReady, setIsApiReady] = useState(false);

  // Ref para o handler de mensagens
  const messageHandlerRef = useRef<(data: any) => void>(() => { });

  const logOperation = useCallback(
    (message: string) => {
      const log = `[${new Date().toLocaleTimeString()}] [Aba ${tabId}] ${message}`;
      console.log(log);
      setOperationLogs((prev) => [log, ...prev.slice(0, 99)]);
    },
    [tabId]
  );

  const stopOperations = useCallback(
    (reason: string) => {
      logOperation(`Parando operações: ${reason}`);
      if (apiService.current) {
        apiService.current.removeMessageHandler(messageHandlerRef.current);
        apiService.current.disconnect();
        apiService.current = null;
      }
      setOperationState((prev) => ({ ...prev, isRunning: false }));
      setIsApiReady(false);
    },
    [logOperation]
  );

  const handleContractResult = useCallback(
    (contractResult: any) => {
      const profit = parseFloat(contractResult.profit);
      const isWin = profit >= 0;

      logOperation(`Resultado: ${isWin ? 'GANHOU' : 'PERDEU'}. Lucro: $${profit.toFixed(2)}`);

      if (!controlState.current) {
        stopOperations('Erro crítico: Estado de controle do bot não encontrado.');
        return;
      }

      const currentBotConfig = botConfigRef.current;
      let newNextStake = controlState.current.initialStake;

      if (!isWin && currentBotConfig?.strategy?.type === 'martingale') {
        newNextStake = controlState.current.nextStake * currentBotConfig.strategy.multiplier;
        logOperation(`Martingale: Próxima entrada será $${newNextStake.toFixed(2)}.`);
      }

      controlState.current.nextStake = newNextStake;

      setOperationState((prev) => {
        const newTotalProfit = prev.totalProfit + profit;
        const newConsecutiveLosses = isWin ? 0 : prev.consecutiveLosses + 1;
        const newOperations: Operation[] = [
          ...prev.operations,
          {
            id: contractResult.contract_id,
            result: isWin ? 'win' : 'loss',
            profit,
            stake: parseFloat(contractResult.buy_price),
            timestamp: new Date().toISOString(),
          },
        ];
        const winRate = (newOperations.filter((op) => op.result === 'win').length / newOperations.length) * 100;

        logOperation(
          `Atualizando estado: Operações=${newOperations.length}, Lucro Total=$${newTotalProfit.toFixed(
            2
          )}, Taxa de Acerto=${winRate.toFixed(2)}%, Perdas Consecutivas=${newConsecutiveLosses}`
        );

        if (controlState.current?.takeProfit && newTotalProfit >= controlState.current.takeProfit) {
          stopOperations('Meta de lucro atingida');
        } else if (controlState.current?.stopLoss && newTotalProfit <= -controlState.current.stopLoss) {
          stopOperations('Limite de perda atingido');
        } else if (
          controlState.current?.consecutiveLossLimit &&
          newConsecutiveLosses >= controlState.current.consecutiveLossLimit
        ) {
          stopOperations('Limite de perdas consecutivas atingido');
        }

        return {
          ...prev,
          operations: newOperations,
          totalProfit: newTotalProfit,
          winRate,
          consecutiveLosses: newConsecutiveLosses,
        };
      });

      // Solicitar atualização do saldo após a operação
      apiService.current?.sendMessage({ balance: 1 });
    },
    [logOperation, stopOperations]
  );

  const requestProposal = useCallback(() => {
    if (!apiService.current?.isConnected() || !controlState.current || !operationState.isRunning) {
      logOperation(
        `Não foi possível solicitar proposta: API=${apiService.current?.isConnected() ? 'conectada' : 'desconectada'
        }, ControlState=${controlState.current ? 'presente' : 'ausente'}, isRunning=${operationState.isRunning}`
      );
      return;
    }

    const config = botConfigRef.current;
    if (!config) return;

    logOperation(
      `Solicitando proposta com stake de $${controlState.current.nextStake.toFixed(2)}. Contract Type: ${config.trade_options.contractType
      }`
    );

    const validDigitContracts = ['DIGITMATCH', 'DIGITDIFFER', 'DIGITOVER', 'DIGITUNDER'];
    const isDigitContract = validDigitContracts.includes(config.trade_options.contractType);

    const proposalRequest = {
      proposal: 1,
      amount: controlState.current.nextStake.toFixed(2),
      basis: 'stake',
      contract_type: config.trade_options.contractType,
      currency: config.trade_options.currency,
      duration: config.trade_options.duration,
      duration_unit: config.trade_options.durationUnit,
      symbol: config.trade_options.symbol,
      ...(isDigitContract && { barrier: controlState.current.barrier }),
    };

    apiService.current.sendMessage(proposalRequest);
  }, [logOperation, operationState.isRunning]);

  useEffect(() => {
    messageHandlerRef.current = (data: any) => {
      if (data.error) {
        logOperation(`ERRO: ${data.error.message} (Código: ${data.error.code})`);
        if (['InvalidToken', 'AuthorizationRequired'].includes(data.error.code)) {
          stopOperations(`Erro crítico: ${data.error.message}`);
        }
        return;
      }
      switch (data.msg_type) {
        case 'balance':
          logOperation(`Saldo atualizado: $${data.balance.balance}`);
          updateUserBalance?.(data.balance.balance);
          break;
        case 'proposal':
          logOperation(`Proposta recebida. Comprando com stake de $${data.proposal.display_value}...`);
          apiService.current?.sendMessage({ buy: data.proposal.id, price: 10000 });
          break;
        case 'buy':
          if (data.buy?.buy_price) {
            logOperation(`Contrato ${data.buy.contract_id} comprado.`);
            apiService.current?.sendMessage({
              proposal_open_contract: 1,
              contract_id: data.buy.contract_id,
              subscribe: 1,
            });
          }
          break;
        case 'proposal_open_contract':
          if (data.proposal_open_contract?.is_sold) {
            handleContractResult(data.proposal_open_contract);
          }
          break;
      }
    };
  }, [logOperation, stopOperations, updateUserBalance, handleContractResult]);

  const startOperations = useCallback(
    async (bot: BotsDeriv) => {
      if (!userDeriv?.token) {
        setOperationLogs([`[${new Date().toLocaleTimeString()}] [ERRO] Token do usuário não encontrado.`]);
        return;
      }

      setOperationState({ isRunning: true, operations: [], totalProfit: 0, winRate: 0, consecutiveLosses: 0 });
      const initialLog = `[${new Date().toLocaleTimeString()}] [Aba ${tabId}] Iniciando Bot: ${bot.name}`;
      setOperationLogs([initialLog]);

      botConfigRef.current = bot.config;
      logOperation(`Configuração do Bot: ${JSON.stringify(bot.config.trade_options)}`);

      const findValue = (keys: string[]) => {
        const prompt = bot.config.prompts.find((p) => keys.some((key) => p.text.toLowerCase().includes(key)));
        return prompt?.value;
      };

      // >>>>> ALTERAÇÃO PRINCIPAL AQUI <<<<<

      const initialBalance = userDeriv?.balance || 0;

      // VERIFICAÇÃO CRÍTICA: Se o saldo não for válido, ABORTA a operação.
      if (initialBalance <= 0) {
        const reason = 'ERRO CRÍTICO: Saldo da conta é zero ou indisponível. Operações abortadas.';
        logOperation(reason);
        // Usa a função `stopOperations` para redefinir o estado e garantir a parada completa.
        stopOperations(reason);
        return; // Interrompe completamente a execução da função `startOperations`.
      }

      // Se o código chegou até aqui, o saldo é válido e podemos continuar.
      logOperation(`Saldo inicial obtido do contexto: $${initialBalance}.`);

      const initialStake = parseFloat(findValue(['valor de entrada']) || '1');
      const takeProfitValue = parseFloat(findValue(['meta de lucro']) || '0');
      const stopLossValue = parseFloat(
        findValue(['limite de perda', 'limite de perdas', 'limite de perca', 'limite de percas']) || '0'
      );
      const consecutiveLossLimitValue = parseFloat(findValue(['perdas seguidas', 'stop loss']) || '7');
      const barrierValue = findValue(['barrier']) || '3';

      const defaultTakeProfit = initialBalance * 0.01;

      controlState.current = {
        initialStake,
        nextStake: initialStake,
        takeProfit: takeProfitValue > 0 ? takeProfitValue : defaultTakeProfit,
        stopLoss: stopLossValue > 0 ? stopLossValue : null,
        barrier: barrierValue,
        consecutiveLossLimit: consecutiveLossLimitValue > 0 ? consecutiveLossLimitValue : null,
      };

      logOperation(
        `Parâmetros configurados: Stake Inicial=$${initialStake.toFixed(2)}, Take Profit=${controlState.current.takeProfit?.toFixed(2) || 'null'
        }, Stop Loss=${controlState.current.stopLoss?.toFixed(2) || 'null'}, Limite de Perdas Consecutivas=${controlState.current.consecutiveLossLimit || 'null'
        }`
      );

      const validContractTypes = ['CALL', 'PUT', 'DIGITMATCH', 'DIGITDIFFER', 'DIGITOVER', 'DIGITUNDER'];
      if (!validContractTypes.includes(bot.config.trade_options.contractType)) {
        logOperation(`ERRO: Contract Type inválido: ${bot.config.trade_options.contractType}`);
        stopOperations('Contract Type inválido');
        return;
      }

      apiService.current = new DerivApiService(
        userDeriv.token,
        () => {
          logOperation('API Autenticada com sucesso.');
          setIsApiReady(true);
          apiService.current?.sendMessage({ balance: 1, subscribe: 1 });
        },
        (e) => stopOperations(`Erro de API: ${e.type}`)
      );
      apiService.current.addMessageHandler(messageHandlerRef.current);
      apiService.current.connect();
    },
    [userDeriv, tabId, logOperation, stopOperations]
  );

  useEffect(() => {
    if (!operationState.isRunning || !isApiReady) {
      logOperation('Ciclo de operação pausado: Bot não está rodando ou API não está pronta.');
      return;
    }

    logOperation(`Agendando nova proposta. Operações atuais: ${operationState.operations.length}`);
    const timer = setTimeout(() => {
      if (apiService.current?.isConnected()) {
        requestProposal();
      } else {
        logOperation('WebSocket não conectado. Não foi possível solicitar proposta.');
      }
    }, operationState.operations.length === 0 ? 100 : 2000);

    return () => clearTimeout(timer);
  }, [operationState.isRunning, operationState.operations, isApiReady, requestProposal]);

  // Limpeza ao desmontar o componente
  useEffect(() => {
    return () => {
      if (apiService.current) {
        stopOperations('Componente desmontado.');
      }
    };
  }, [stopOperations]);

  return { operationState, startOperations, stopOperations, operationLogs };
};