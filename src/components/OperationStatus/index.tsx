import { useOperations, Operation } from '@/hooks/useOperations';
import { BotsDeriv } from '@/models/deriv';
import { Play, Square, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import * as S from './styles';

interface OperationStatusProps {
  bot: BotsDeriv;
}

const OperationStatus = ({ bot }: OperationStatusProps) => {
  const { operationState, activeBot, startOperations, stopOperations } = useOperations();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  const getOperationIcon = (operation: Operation) => {
    if (operation.type === 'buy') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (status: Operation['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <S.Container>
      <S.Header>
        <S.BotInfo>
          <h3>{bot.name}</h3>
          <span className={operationState.isRunning ? 'text-green-500' : 'text-gray-500'}>
            {operationState.isRunning ? 'Ativo' : 'Inativo'}
          </span>
        </S.BotInfo>
        
        <S.Controls>
          {!operationState.isRunning ? (
            <S.StartButton onClick={() => startOperations(bot)}>
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </S.StartButton>
          ) : (
            <S.StopButton onClick={stopOperations}>
              <Square className="w-4 h-4 mr-2" />
              Parar
            </S.StopButton>
          )}
        </S.Controls>
      </S.Header>

      <S.Stats>
        <S.StatCard>
          <DollarSign className="w-5 h-5 text-blue-500" />
          <div>
            <span>Lucro Total</span>
            <strong className={operationState.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
              {formatCurrency(operationState.totalProfit)}
            </strong>
          </div>
        </S.StatCard>

        <S.StatCard>
          <Percent className="w-5 h-5 text-purple-500" />
          <div>
            <span>Taxa de Acerto</span>
            <strong>{operationState.winRate.toFixed(1)}%</strong>
          </div>
        </S.StatCard>

        <S.StatCard>
          <span className="text-lg font-bold">📊</span>
          <div>
            <span>Operações</span>
            <strong>{operationState.operations.length}</strong>
          </div>
        </S.StatCard>
      </S.Stats>

      <S.OperationsList>
        <h4>Histórico de Operações</h4>
        {operationState.operations.length === 0 ? (
          <S.EmptyState>
            <p>Nenhuma operação realizada ainda</p>
          </S.EmptyState>
        ) : (
          <S.Operations>
            {operationState.operations.slice(0, 10).map((operation) => (
              <S.OperationItem key={operation.id}>
                <div className="flex items-center gap-2">
                  {getOperationIcon(operation)}
                  <span className="font-medium">{operation.symbol}</span>
                  <span className={`text-sm ${getStatusColor(operation.status)}`}>
                    {operation.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{formatTime(operation.timestamp)}</div>
                  <div className="font-medium">
                    {formatCurrency(operation.amount)}
                  </div>
                  {operation.profit !== undefined && (
                    <div className={`text-sm ${operation.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {operation.profit >= 0 ? '+' : ''}{formatCurrency(operation.profit)}
                    </div>
                  )}
                </div>
              </S.OperationItem>
            ))}
          </S.Operations>
        )}
      </S.OperationsList>
    </S.Container>
  );
};

export default OperationStatus;