// hooks/usesDeriv.tsx
import { useCallback } from 'react';
import { ConfigBotsDeriv, UserDeriv } from '@/models/deriv';

export const usesDeriv = ({ setStatus, setUserDeriv, token, ws }: {
  setStatus: (status: 'error' | 'success' | 'loading') => void;
  setUserDeriv: (user: UserDeriv | null) => void;
  token: string;
  ws: WebSocket | null;
}) => {
  const addUserData = useCallback(async () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket não está aberto para autenticação');
      setStatus('error');
      return;
    }

    ws.send(JSON.stringify({
      authorize: token,
      req_id: 1,
    }));
  }, [ws, token, setStatus]);

  const startOperation = useCallback(async (config: ConfigBotsDeriv, tabId: number) => {
    console.log('startOperation - Configuração do bot:', config);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket não está aberto');
      setStatus('error');
      return;
    }

    // Autenticação
    console.log('startOperation - Enviando authorize com token:', token);
    ws.send(JSON.stringify({
      authorize: token,
      req_id: 1,
    }));

    // Aguardar resposta de autorização
    const waitForAuthorize = new Promise<void>((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        console.log(`startOperation - Resposta [req_id: ${data.req_id}]:`, data);
        if (data.msg_type === 'authorize') {
          if (data.error) {
            console.error('Erro de autorização:', data.error.message);
            setStatus('error');
            reject(data.error);
          } else {
            setUserDeriv({
              email: data.authorize.email,
              balance: data.authorize.balance,
              loginid: data.authorize.loginid,
              account_type: data.authorize.account_type,
              currency: data.authorize.currency,
              token,
            });
            setStatus('success');
            resolve();
          }
          ws.removeEventListener('message', onMessage);
        }
      };
      ws.addEventListener('message', onMessage);
    });

    try {
      await waitForAuthorize;

      // Enviar requisições iniciais
      ws.send(JSON.stringify({ active_symbols: 'brief', req_id: 2 }));
      ws.send(JSON.stringify({
        ticks_history: config.trade_options.symbol || 'R_100',
        end_time: 'latest',
        count: 1000,
        style: 'ticks',
        req_id: 3,
      }));
      ws.send(JSON.stringify({
        candles: config.trade_options.symbol || 'R_100',
        count: 200,
        granularity: 60,
        req_id: 4,
      }));
      ws.send(JSON.stringify({ balance: 1, subscribe: 1, req_id: 5 }));
      ws.send(JSON.stringify({
        ticks: config.trade_options.symbol || 'R_100',
        subscribe: 1,
        req_id: 6,
      }));
    } catch (error) {
      console.error('Erro em startOperation:', error);
      setStatus('error');
    }
  }, [ws, token, setUserDeriv, setStatus]);

  return { addUserData, startOperation };
};