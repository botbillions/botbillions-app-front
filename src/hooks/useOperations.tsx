import { useState, useEffect, useCallback } from 'react';
import { BotsDeriv, ConfigBotsDeriv, Operation, OperationState } from '@/models/deriv';
import { useDeriv } from '@/contexts/DerivContext';

export type { Operation } from '@/models/deriv';

export const useOperations = (tabId: number) => {
  const { ws } = useDeriv();

  const [operationState, setOperationState] = useState<OperationState>({
    isRunning: false,
    operations: [],
    totalProfit: 0,
    winRate: 0,
  });
  const [activeBot, setActiveBot] = useState<BotsDeriv | null>(null);
  const [botConfig, setBotConfig] = useState<ConfigBotsDeriv | null>(null);
  const [operationLogs, setOperationLogs] = useState<string[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [activeProposals, setActiveProposals] = useState<
    { id: string; contractType: string; purchaseReference: string; payout: number; tabId: number }[]
  >([]);
  const [isProposalError, setIsProposalError] = useState(false);
  const [tickHistory, setTickHistory] = useState<{ prices: number[]; times: number[] }>({
    prices: [],
    times: [],
  });
  const [latestTick, setLatestTick] = useState<{ quote: number; epoch: number } | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);

  const logOperation = useCallback((message: string) => {
    setOperationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] [Tab ${tabId}] ${message}`,
      ...prev.slice(0, 100),
    ]);
  }, [tabId]);

  const calculateStats = useCallback((operations: Operation[]) => {
    const completedOps = operations.filter((op) => op.status === 'completed');
    const totalProfit = completedOps.reduce((sum, op) => sum + (op.profit || 0), 0);
    const winningOps = completedOps.filter((op) => (op.profit || 0) > 0);
    const winRate = completedOps.length > 0 ? (winningOps.length / completedOps.length) * 100 : 0;
    return { totalProfit, winRate };
  }, []);

  const stopOperations = useCallback(() => {
    logOperation('Parando operações');
    setOperationState((prev) => ({ ...prev, isRunning: false }));
    setActiveBot(null);
    setBotConfig(null);
    setActiveProposals((prev) => prev.filter((p) => p.tabId !== tabId));
    setIsDataReady(false);
  }, [logOperation, tabId]);

  const checkLimits = useCallback(() => {
    if (!botConfig) return;
    const profitPrompt = botConfig.prompts.find((p) =>
      p.text.toLowerCase().includes('meta de ganho')
    );
    const lossPrompt = botConfig.prompts.find((p) =>
      p.text.toLowerCase().includes('limite de perda')
    );
    const profitLimit = profitPrompt?.value
      ? parseFloat(profitPrompt.value) * balance / 100
      : Infinity;
    const lossLimit = lossPrompt?.value
      ? parseFloat(lossPrompt.value) * balance / 100
      : -Infinity;

    if (
      operationState.totalProfit >= profitLimit ||
      operationState.totalProfit <= -lossLimit
    ) {
      logOperation(
        `Limite atingido: Lucro ${operationState.totalProfit.toFixed(2)} (Meta: ${profitLimit.toFixed(2)}, Perda: ${lossLimit.toFixed(2)})`
      );
      stopOperations();
    }
  }, [botConfig, balance, operationState.totalProfit, stopOperations, logOperation]);

  const handleContractUpdate = useCallback(
    (data: any) => {
      if (data.proposal_open_contract) {
        const contract = data.proposal_open_contract;
        setOperationState((prev) => {
          const updatedOperations = prev.operations.map((op) => {
            if (op.id === contract.contract_id) {
              const profit = contract.profit || 0;
              const newStatus: 'pending' | 'completed' | 'failed' = contract.is_sold
                ? 'completed'
                : contract.status === 'open' ? 'pending' : 'failed';
              return { ...op, status: newStatus, profit };
            }
            return op;
          });

          const stats = calculateStats(updatedOperations);
          return {
            ...prev,
            operations: updatedOperations,
            totalProfit: stats.totalProfit,
            winRate: stats.winRate,
          };
        });
        logOperation(
          `Contrato atualizado: ${contract.contract_id}, Status: ${contract.status}, Profit: ${contract.profit || 0}`
        );
      }
    },
    [calculateStats, logOperation]
  );

  const handleBuyConfirmation = useCallback(
    (data: any) => {
      if (data.buy) {
        const newOperation: Operation = {
          id: data.buy.contract_id || Date.now().toString(),
          type: data.buy.buy_price > 0 ? 'buy' : 'sell',
          symbol: data.buy.shortcode?.split('_')[1] || botConfig?.trade_options.symbol || 'UNKNOWN',
          amount: data.buy.buy_price || 0,
          price: data.buy.start_spot || 0,
          timestamp: new Date().toISOString(),
          status: 'pending',
        };
        setOperationState((prev) => ({
          ...prev,
          operations: [newOperation, ...prev.operations],
        }));
        logOperation(`Compra confirmada: ${JSON.stringify(newOperation)}`);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              proposal_open_contract: 1,
              contract_id: data.buy.contract_id,
              subscribe: 1,
              req_id: Date.now(),
            })
          );
        }
      }
    },
    [botConfig, ws, logOperation]
  );

  const handleProposal = useCallback(
    (data: any) => {
      logOperation(`Proposta recebida: ${JSON.stringify(data, null, 2)}`);
      if (!data.proposal || !data.proposal.id) {
        logOperation(`Proposta inválida: ${JSON.stringify(data, null, 2)}`);
        return;
      }

      setActiveProposals((prev) => [
        ...prev,
        {
          id: data.proposal.id,
          contractType: data.passthrough.contractType,
          purchaseReference: data.passthrough.purchaseReference,
          payout: data.proposal.payout || 0,
          tabId,
        },
      ]);

      const decideContract = (
        proposals: { id: string; contractType: string; payout: number; tabId: number }[]
      ) => {
        if (!proposals || proposals.length === 0) {
          logOperation('Nenhuma proposta disponível para seleção');
          return null;
        }

        const tabProposals = proposals.filter((p) => p.tabId === tabId);
        if (!tabProposals.length) {
          logOperation(`Nenhuma proposta para a aba ${tabId}`);
          return null;
        }

        if (tabProposals[0].contractType === 'DIGITOVER') {
          return tabProposals[0];
        }

        const lastPrice = latestTick?.quote || tickHistory.prices[tickHistory.prices.length - 1] || 0;
        const prevPrice = tickHistory.prices.length >= 2 
          ? tickHistory.prices[tickHistory.prices.length - 2] 
          : lastPrice;
        const isUptrend = lastPrice > prevPrice;
        const selectedType = isUptrend ? 'CALL' : 'PUT';
        
        return tabProposals.find((p) => p.contractType === selectedType) || tabProposals[0];
      };

      if (ws && ws.readyState === WebSocket.OPEN) {
        const sameRefProposals = activeProposals.filter(
          (p) => p.purchaseReference === data.passthrough.purchaseReference && p.tabId === tabId
        );
        const selectedProposal = decideContract([
          ...sameRefProposals,
          {
            id: data.proposal.id,
            contractType: data.passthrough.contractType,
            payout: data.proposal.payout || 0,
            tabId,
          },
        ]);

        if (!selectedProposal) {
          logOperation('Nenhuma proposta válida selecionada');
          return;
        }

        const buyRequest = {
          buy: selectedProposal.id,
          price: data.proposal.ask_price,
          req_id: Date.now(),
        };
        logOperation(`Comprando proposta: ${JSON.stringify(buyRequest)}`);
        ws.send(JSON.stringify(buyRequest));

        const otherProposals = activeProposals.filter(
          (p) => p.purchaseReference === data.passthrough.purchaseReference && p.id !== selectedProposal.id && p.tabId === tabId
        );
        otherProposals.forEach((p) => {
          ws.send(JSON.stringify({ forget: p.id, req_id: Date.now() }));
          logOperation(`Esquecendo proposta: ${p.id}`);
        });
        
        setActiveProposals((prev) =>
          prev.filter((p) => p.id === selectedProposal.id && p.tabId === tabId)
        );
      }
    },
    [ws, activeProposals, latestTick, tickHistory, logOperation, tabId]
  );

  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        logOperation(`WebSocket message: ${JSON.stringify(data, null, 2)}`);

        if (data.error) {
          logOperation(`Erro da API: ${data.error.message}, Detalhes: ${JSON.stringify(data.error, null, 2)}`);
          if (
            data.error.code === 'ContractBuyValidationError' ||
            data.error.code === 'InvalidContractProposal' ||
            data.error.code === 'ContractCreationFailure'
          ) {
            setIsProposalError(true);
            stopOperations();
          }
          return;
        }

        setIsProposalError(false);

        if (data.msg_type === 'proposal') {
          handleProposal(data);
        } else if (data.msg_type === 'buy') {
          handleBuyConfirmation(data);
        } else if (data.msg_type === 'proposal_open_contract') {
          handleContractUpdate(data);
        } else if (data.msg_type === 'balance') {
          setBalance(data.balance.balance);
          logOperation(`Saldo atualizado: ${data.balance.balance} ${data.balance.currency}`);
        } else if (data.msg_type === 'history') {
          setTickHistory({
            prices: data.history.prices || [],
            times: data.history.times || [],
          });
          setIsDataReady(true);
          logOperation(`Histórico de ticks recebido: ${data.history.prices?.length} ticks`);
        } else if (data.msg_type === 'tick') {
          setLatestTick({ quote: data.tick.quote, epoch: data.tick.epoch });
          setIsDataReady(true);
          logOperation(
            `Novo tick: ${data.tick.quote} @ ${new Date(data.tick.epoch * 1000).toLocaleTimeString()}`
          );
        } else if (data.msg_type === 'active_symbols') {
          logOperation(`Símbolos ativos recebidos: ${data.active_symbols.length} símbolos`);
        }
      } catch (error) {
        logOperation(`Erro ao processar mensagem WebSocket: ${error}`);
        setIsProposalError(true);
        stopOperations();
      }
    },
    [
      handleProposal,
      handleBuyConfirmation,
      handleContractUpdate,
      stopOperations,
      logOperation,
    ]
  );

  const makeProposal = useCallback(() => {
  if (!ws || ws.readyState !== WebSocket.OPEN || !botConfig || !isDataReady) {
    logOperation('WebSocket, botConfig ou dados não disponíveis para propor');
    return;
  }

  const amountPrompt = botConfig.prompts.find((p) =>
    p.text.toLowerCase().includes('entrada') ||
    p.text.toLowerCase().includes('valor') ||
    p.text.toLowerCase().includes('amount')
  );
  const durationPrompt = botConfig.prompts.find((p) =>
    p.text.toLowerCase().includes('duração') ||
    p.text.toLowerCase().includes('duration')
  );
  const barrierPrompt = botConfig.prompts.find((p) =>
    p.text.toLowerCase().includes('barrier') ||
    p.text.toLowerCase().includes('last digit') ||
    p.text.toLowerCase().includes('digito')
  );
  const contractTypePrompt = botConfig.prompts.find((p) =>
    p.text.toLowerCase().includes('contract type') ||
    p.text.toLowerCase().includes('tipo de contrato')
  );

  const amount = amountPrompt?.value ? parseFloat(amountPrompt.value) : 1;
  const duration = durationPrompt?.value
    ? parseInt(durationPrompt.value)
    : botConfig.trade_options.duration || 1;
  let barrier = barrierPrompt?.value ? parseInt(barrierPrompt.value) : null;
  const contractType = contractTypePrompt?.value || botConfig.trade_options.contractType || 'DIGITOVER';

  if (isNaN(amount) || amount < 0.35) {
    logOperation(`Valor de entrada inválido: ${amount}`);
    stopOperations();
    return;
  }
  if (isNaN(duration) || duration <= 0) {
    logOperation(`Duração inválida: ${duration}`);
    stopOperations();
    return;
  }
  if (contractType === 'DIGITOVER') {
    if (!barrier || isNaN(barrier) || barrier < 0 || barrier > 9) {
      const lastPrice = latestTick?.quote || tickHistory.prices[tickHistory.prices.length - 1] || 0;
      const lastDigitStr = lastPrice.toString().split('.').pop()?.slice(-1) || '0';
      barrier = parseInt(lastDigitStr, 10);
      if (isNaN(barrier) || barrier < 0 || barrier > 9) {
        barrier = Math.floor(Math.random() * 10);
      }
      logOperation(`Barreira calculada: ${barrier}`);
    }
  }

  const purchaseReference = `${Date.now()}.${Math.random() * 10000}.${tabId}`;
  const proposals = [];
  if (contractType === 'DIGITOVER') {
    proposals.push({
      proposal: 1,
      subscribe: 1,
      amount,
      basis: 'stake',
      contract_type: 'DIGITOVER',
      currency: botConfig.trade_options.currency || 'USD',
      duration,
      duration_unit: botConfig.trade_options.durationUnit || 't',
      symbol: botConfig.trade_options.symbol || 'R_100',
      barrier: barrier?.toString(),
      passthrough: { contractType: 'DIGITOVER', purchaseReference, tabId },
      req_id: Date.now(),
    });
  } else {
    proposals.push(
      {
        proposal: 1,
        subscribe: 1,
        amount,
        basis: 'stake',
        contract_type: 'CALL',
        currency: botConfig.trade_options.currency || 'USD',
        duration,
        duration_unit: botConfig.trade_options.durationUnit || 't',
        symbol: botConfig.trade_options.symbol || 'R_100',
        passthrough: { contractType: 'CALL', purchaseReference, tabId },
        req_id: Date.now(),
      },
      {
        proposal: 1,
        subscribe: 1,
        amount,
        basis: 'stake',
        contract_type: 'PUT',
        currency: botConfig.trade_options.currency || 'USD',
        duration,
        duration_unit: botConfig.trade_options.durationUnit || 't',
        symbol: botConfig.trade_options.symbol || 'R_100',
        passthrough: { contractType: 'PUT', purchaseReference, tabId },
        req_id: Date.now() + 1,
      }
    );
  }

  proposals.forEach((proposal) => {
    logOperation(`Enviando proposta: ${JSON.stringify(proposal, null, 2)}`);
    ws.send(JSON.stringify(proposal));
  });
  logOperation(
    `Proposta enviada - Entrada: ${amount}, Duração: ${duration}, Contract Type: ${contractType}${
      contractType === 'DIGITOVER' ? `, Barreira: ${barrier}` : ''
    }`
  );
}, [ws, botConfig, latestTick, tickHistory, isDataReady, logOperation, stopOperations, tabId]);

  const startOperations = async (bot: BotsDeriv) => {
    try {
      logOperation(`Iniciando operações para o bot: ${bot.name}`);
      setActiveBot(bot);
      setBotConfig(bot.config);
      setOperationState((prev) => ({
        ...prev,
        isRunning: true,
        operations: [],
        totalProfit: 0,
        winRate: 0,
      }));
    } catch (error) {
      logOperation(`Erro ao iniciar operações: ${error}`);
      setOperationState((prev) => ({ ...prev, isRunning: false }));
      stopOperations();
    }
  };

  useEffect(() => {
    if (!operationState.isRunning || !botConfig || !ws) {
      return;
    }

    const handleOpen = () => {
      logOperation('WebSocket conectado');
      ws.send(JSON.stringify({ balance: 1, subscribe: 1, req_id: Date.now() }));
      ws.send(JSON.stringify({ active_symbols: 'brief', req_id: Date.now() }));
      ws.send(
        JSON.stringify({
          ticks_history: botConfig.trade_options.symbol || 'R_100',
          end_time: 'latest',
          count: 1000,
          style: 'ticks',
          req_id: Date.now(),
        })
      );
      ws.send(
        JSON.stringify({
          ticks: botConfig.trade_options.symbol || 'R_100',
          subscribe: 1,
          req_id: Date.now(),
        })
      );
    };

    if (ws.readyState === WebSocket.OPEN) {
      handleOpen();
    } else {
      ws.addEventListener('open', handleOpen);
    }

    ws.addEventListener('message', handleWebSocketMessage);

    ws.addEventListener('error', (error) => {
      logOperation(`Erro no WebSocket: ${error}`);
      stopOperations();
    });

    ws.addEventListener('close', () => {
      logOperation('WebSocket fechado');
      stopOperations();
    });

    return () => {
      ws.removeEventListener('message', handleWebSocketMessage);
      ws.removeEventListener('open', handleOpen);
    };
  }, [operationState.isRunning, botConfig, ws, handleWebSocketMessage, logOperation, stopOperations]);

  useEffect(() => {
    if (ws && botConfig && operationState.isRunning && !isProposalError && isDataReady) {
      const interval = setInterval(() => {
        makeProposal();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ws, botConfig, operationState.isRunning, isProposalError, isDataReady, makeProposal]);

  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

  return {
    operationState,
    activeBot,
    botConfig,
    startOperations,
    stopOperations,
    operationLogs,
    balance,
    tickHistory,
    latestTick,
  };
};