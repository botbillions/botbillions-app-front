// @/components/SelectedBot.tsx
// RESPONSABILIDADE: Ser o "maestro". Orquestrar a configuração (via useTabs) e o início da operação (via useOperations).

import { useOperations } from '@/hooks/useOperations';
import { useTabs } from '@/hooks/useTabs';
import { BotsDeriv, UserDeriv } from '@/models/deriv';
// O seu componente OperationStatus pode ser usado aqui para mostrar os dados
// import OperationStatus from './OperationStatus'; 
import * as S from "./styles"; // Supondo que você tenha estilos

interface ISelectedBotProps {
  userDeriv: UserDeriv | null;
  selectedBot: BotsDeriv;
  onClearSelectedBot: (tabId: number) => void;
  tabId: number;
}

const SelectedBot = ({ userDeriv, selectedBot, onClearSelectedBot, tabId }: ISelectedBotProps) => {
  // Hook para gerir a configuração via prompts
  const { getBotWithUserConfig } = useTabs();

  // Hook para gerir a operação de API (cada SelectedBot tem o seu)
  const { operationState, startOperations, stopOperations, operationLogs } = useOperations(tabId);

  const handleStartBot = async () => {
    // 1. Obter a configuração do usuário através dos prompts
    const configuredBot = await getBotWithUserConfig(selectedBot);

    // 2. Se a configuração foi bem-sucedida, iniciar a operação de API
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

  // Se o bot não estiver a correr, mostra o botão para iniciar.
  if (!operationState.isRunning) {
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

        <S.BtnContainer>
          <S.ActionButton className="primary" onClick={handleStartBot}>
            Iniciar Inteligência
          </S.ActionButton>
          <S.ActionButton className="secondary" onClick={() => onClearSelectedBot(tabId)}>
            Selecionar outro Bot
          </S.ActionButton>
        </S.BtnContainer>
      </S.OperacaoContainer>
    );
  }

  // Se o bot estiver a correr, mostra o painel de status.
  // Você pode usar o seu componente OperationStatus aqui, passando os dados do hook useOperations.
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
    </S.OperacaoContainer>
  );
};

export default SelectedBot;
