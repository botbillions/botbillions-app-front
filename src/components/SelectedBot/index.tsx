import { useOperations } from '@/hooks/useOperations';
import { useTabs } from '@/hooks/useTabs';
import { BotsDeriv, UserDeriv } from '@/models/deriv';
import { useEffect } from 'react';
import * as S from "./styles";

interface ISelectedBotProps {
  userDeriv: UserDeriv | null;
  selectedBot: BotsDeriv;
  onClearSelectedBot: (tabId: number) => void;
  tabId: number;
}

const SelectedBot = ({ userDeriv, selectedBot, onClearSelectedBot, tabId }: ISelectedBotProps) => {
  const { getBotWithUserConfig } = useTabs();
  const { operationState, startOperations, stopOperations, operationLogs } = useOperations(tabId);

  const handleStartBot = async () => {
    const configuredBot = await getBotWithUserConfig(selectedBot);
    if (configuredBot) {
      console.log(`[Aba ${tabId}] Configuração recebida. Iniciando operações...`, configuredBot);
      await startOperations(configuredBot);
    } else {
      console.log(`[Aba ${tabId}] Início do bot cancelado pelo usuário.`);
    }
  };

  const handleStopBot = () => {
    console.log(`[Aba ${tabId}] Parando bot.`);
    stopOperations();
  };

  useEffect(() => {
    console.log(`[Aba ${tabId}] Renderizando com operationState:`, operationState);
  }, [operationState, tabId]);

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
        <span>🤖</span>
        {selectedBot.name}
      </S.OperacaoTitle>

      {operationState.isRunning ? (
        <S.StatusContainer>
          <h3>Status da Operação (Aba {tabId})</h3>
          <p>Bot: {selectedBot.name}</p>
          <p>Status: <span className={operationState.isRunning ? 'active' : 'inactive'}>
            {operationState.isRunning ? 'Ativo' : 'Inativo'}
          </span></p>
          <p>Lucro Total: ${operationState.totalProfit.toFixed(2)}</p>
          <p>Taxa de Acerto: {operationState.winRate.toFixed(1)}%</p>
          <p>Operações: {operationState.operations.length}</p>

          <h4>Logs:</h4>
          <pre style={{ height: '200px', overflowY: 'scroll', background: '#222', padding: '10px', borderRadius: '5px' }}>
            {operationLogs.join('\n')}
          </pre>

          <S.BtnContainer style={{ marginTop: '20px' }}>
            <S.ActionButton className="danger" onClick={handleStopBot}>
              Parar Bot
            </S.ActionButton>
          </S.BtnContainer>
        </S.StatusContainer>
      ) : (
        <S.BtnContainer>
          <S.ActionButton className="primary" onClick={handleStartBot}>
            Iniciar Inteligência
          </S.ActionButton>
          <S.ActionButton className="secondary" onClick={() => onClearSelectedBot(tabId)}>
            Selecionar outro Bot
          </S.ActionButton>
          <S.StatusContainer>
            <h4>Resultados Anteriores (Aba {tabId}):</h4>
            <p>Lucro Total: ${operationState.totalProfit.toFixed(2)}</p>
            <p>Taxa de Acerto: {operationState.winRate.toFixed(1)}%</p>
            <p>Operações: {operationState.operations.length}</p>
          </S.StatusContainer>
        </S.BtnContainer>
      )}
    </S.OperacaoContainer>
  );
};

export default SelectedBot;