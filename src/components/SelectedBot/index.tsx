// components/SelectedBot.tsx
import { useTabs } from '@/hooks/useTabs';
import { useOperations } from '@/hooks/useOperations';
import { useEffect, useState } from 'react';
import * as S from "./styles";

interface BotsDeriv {
  id: string;
  name: string;
  config: any;
}

interface UserDeriv {
  account_type?: string;
  loginid?: string;
  currency?: string;
  balance?: number;
  token?: string;
}

interface ISelectedBotProps {
  userDeriv: UserDeriv | null;
  selectedBot: BotsDeriv;
  onClearSelectedBot: (tabId: number) => void;
  bot: BotsDeriv;
  tabId: number;
}

const SelectedBot = ({ onClearSelectedBot, bot, selectedBot, tabId, userDeriv }: ISelectedBotProps) => {
  const { startSelectedBot, operationsByTab } = useTabs();
  const { startOperations, stopOperations, operationState: opState } = useOperations(tabId);
  const operationState = operationsByTab[tabId] || opState || {
    isRunning: false,
    operations: [],
    totalProfit: 0,
    winRate: 0,
  };
  const [botStarted, setBotStarted] = useState(operationState.isRunning);

  useEffect(() => {
    setBotStarted(operationState.isRunning);
  }, [operationState.isRunning]);

  const handleStartBot = async () => {
    try {
      await startSelectedBot(bot, tabId); // Chama startOperation em useTabs
      await startOperations(bot); // Chama startOperations em useOperations
      setBotStarted(true);
      console.log('Bot iniciado com sucesso:', bot.name);
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
    }
  };

  const handleStopBot = () => {
    stopOperations();
    setBotStarted(false);
    console.log('Bot parado');
  };

  return (
    <S.OperacaoContainer>
      <S.HeaderAccount>
        <div>
          <p>Conta {userDeriv?.account_type}</p>
          <p>{userDeriv?.loginid} - {userDeriv?.currency}</p>
        </div>
        <div>
          <p>Saldo</p>
          <p>{userDeriv?.balance} {userDeriv?.currency}</p>
        </div>
      </S.HeaderAccount>
      
      <S.OperacaoTitle>
        <hr />
        <span>🤖</span>
        {selectedBot.name}
        <hr />
      </S.OperacaoTitle>

      {!botStarted ? (
        <S.BtnContainer>
          <S.ActionButton className="primary" onClick={handleStartBot}>
            Inicie a inteligência
          </S.ActionButton>
          <S.ActionButton className="secondary" onClick={() => onClearSelectedBot(tabId)}>
            Selecione outro Bot
          </S.ActionButton>
        </S.BtnContainer>
      ) : (
        <>
          <S.StatusContainer>
            <S.StatusHeader>
              <div>
                <h3>{bot.name}</h3>
                <span className={operationState.isRunning ? 'active' : 'inactive'}>
                  {operationState.isRunning ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </S.StatusHeader>
            
            <S.StatsGrid>
              <S.StatCard>
                <div className="label">Lucro Total</div>
                <div className={`value ${operationState.totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                  ${operationState.totalProfit.toFixed(2)}
                </div>
              </S.StatCard>
              <S.StatCard>
                <div className="label">Taxa de Acerto</div>
                <div className="value">{operationState.winRate.toFixed(1)}%</div>
              </S.StatCard>
              <S.StatCard>
                <div className="label">Operações</div>
                <div className="value">{operationState.operations.length}</div>
              </S.StatCard>
            </S.StatsGrid>

            <S.OperationsSection>
              <h4>Últimas Operações</h4>
              {operationState.operations.length === 0 ? (
                <S.NoOperationsMessage>Nenhuma operação realizada ainda</S.NoOperationsMessage>
              ) : (
                <S.OperationsList>
                  {operationState.operations.slice(0, 5).map((operation) => (
                    <S.OperationItem key={operation.id}>
                      <S.OperationLeft>
                        <span className={`direction ${operation.type}`}>
                          {operation.type === 'buy' ? '↗' : '↘'}
                        </span>
                        <span className="symbol">{operation.symbol}</span>
                        <span className={`status ${operation.status}`}>
                          {operation.status}
                        </span>
                      </S.OperationLeft>
                      <S.OperationRight>
                        <div className="amount">${operation.amount}</div>
                        {operation.profit !== undefined && (
                          <div className={`profit ${operation.profit >= 0 ? 'positive' : 'negative'}`}>
                            {operation.profit >= 0 ? '+' : ''}${operation.profit.toFixed(2)}
                          </div>
                        )}
                      </S.OperationRight>
                    </S.OperationItem>
                  ))}
                </S.OperationsList>
              )}
            </S.OperationsSection>
          </S.StatusContainer>

          <S.BtnContainer style={{ marginTop: '20px' }}>
            <S.ActionButton className="danger" onClick={handleStopBot}>
              Parar Bot
            </S.ActionButton>
            <S.ActionButton 
              className="secondary" 
              onClick={() => {
                setBotStarted(false);
                onClearSelectedBot(tabId);
              }}
            >
              Selecione outro Bot
            </S.ActionButton>
          </S.BtnContainer>
        </>
      )}
    </S.OperacaoContainer>
  );
};

export default SelectedBot;