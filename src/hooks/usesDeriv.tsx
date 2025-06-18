"use client";

import type { ConfigBotsDeriv, UserDeriv } from "@/models/deriv";
import { useCallback } from "react";
import { linkDerivAccount } from "../services/actions/auth/supabase-actions";

const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APPID}`);

type Status = "error" | "success" | "loading";

interface IUsesDerivProps {
  token?: string;
  setStatus: (status: 'error' | 'success' | 'loading') => void;
  setUserDeriv: (user: UserDeriv | null) => void;
}

export const usesDeriv = ({ token, setStatus, setUserDeriv }: IUsesDerivProps) => {
  let reqId = 1;

  const addUserData = async () => {
    if (!setStatus || !setUserDeriv || !ws) {
      console.log("addUserData - Erro: Falta setStatus, setUserDeriv ou ws", { setStatus, setUserDeriv, ws });
      return;
    }

    if (!token) {
      console.log("addUserData - Erro: Token vazio");
      setStatus("error");
      return;
    }
    console.log("token recebido", token)
    setStatus("loading");
    console.log("addUserData - Iniciando autenticação com token:", token);

    if (ws.readyState === WebSocket.OPEN) {
      console.log("addUserData - WebSocket aberto, enviando authorize");
      ws.send(
        JSON.stringify({
          authorize: token,
          req_id: reqId++,
        })
      );
    } else {
      ws.onopen = () => {
        console.log("addUserData - WebSocket aberto, enviando authorize");
        ws.send(
          JSON.stringify({
            authorize: token,
            req_id: reqId++,
          })
        );
      };
    }

    ws.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      console.log("addUserData - Resposta completa da API:", response);

      if (response.error) {
        console.error("addUserData - Erro da API:", response.error.message);
        setStatus("error");
        return;
      }

      if (response.msg_type === "authorize") {
        const email = response.authorize?.email || "email não encontrado";
        const balance = response.authorize?.balance?.toString() || "balance não encontrado";
        const loginid = response.authorize?.loginid || "loginid não encontrado";
        const account_type: "Virtual" | "Real" = response.authorize?.is_virtual === 1 ? "Virtual" : "Real";
        const currency = response.authorize?.currency;

        const derivData: UserDeriv = { email, balance, loginid, account_type, currency, token };
        console.log("addUserData - Salvando userDeriv:", derivData);
        setUserDeriv(derivData);
        document.cookie = `derivData=${JSON.stringify(derivData)}; path=/; max-age=${60 * 60 * 24}`;
        await linkDerivAccount(email);
        setStatus("success");
      }
    };

    ws.onerror = (error) => {
      console.error("addUserData - Erro no WebSocket:", error);
      setStatus("error");
    };
  };

  const startOperation = useCallback(async (config: ConfigBotsDeriv, tabId: number) => {
    console.log('startOperation - Configuração do bot:', config);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket não está aberto para startOperation');
      setStatus('error');
      return;
    }

    try {
      await addUserData();
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
      console.log('startOperation - Requisições iniciais enviadas');
    } catch (error) {
      console.error('Erro em startOperation:', error);
      setStatus('error');
    }
  }, [ws, token, setUserDeriv, setStatus, addUserData]);

  return {
    addUserData,
    startOperation,
  };
};