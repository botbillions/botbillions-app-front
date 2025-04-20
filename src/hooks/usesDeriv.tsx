"use client";

import type { ConfigBotsDeriv, UserDeriv } from "@/models/deriv";
import { type Dispatch, type SetStateAction } from "react";
import { linkDerivAccount } from "../services/actions/auth/supabase-actions";

const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APPID}`);

type Status = "error" | "success" | "loading";

interface IUsesDerivProps {
  token?: string;
  setStatus?: Dispatch<SetStateAction<Status>>;
  setUserDeriv?: Dispatch<SetStateAction<UserDeriv | null>>;
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

  const startOperation = async (configOperation: ConfigBotsDeriv) => {

    console.log("startOperation - Configuração do bot:", configOperation);
    const welcomeMessage = configOperation.welcome_message;
    const prompts = configOperation.prompts || [];

    if (welcomeMessage) {
      window.alert(welcomeMessage);
    }

    let symbol: string = prompts.find(p => p.key === "symbol")?.value || configOperation.trade_options?.symbol || "R_100";
    let proposalId: string | null = null;
    let contractId: number | null = null;

    const sendAuthorize = () => {
      console.log("startOperation - Enviando authorize com token:", token);
      ws.send(
        JSON.stringify({
          authorize: token,
          req_id: reqId++,
        })
      );
    };

    if (ws.readyState !== WebSocket.OPEN) {
      ws.onopen = () => {
        console.log("startOperation - WebSocket aberto, enviando authorize");
        sendAuthorize();
      };
    } else {
      sendAuthorize();
    }

    ws.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      console.log(`startOperation - Resposta [req_id: ${response.req_id}]:`, response);

      if (response.error) {
        console.error(`startOperation - Erro da API: ${response.error.message}`);
        ws.close();
        return;
      }

      switch (response.msg_type) {
        case "authorize":
          ws.send(
            JSON.stringify({
              active_symbols: "brief",
              req_id: reqId++,
            })
          );
          break;

        case "active_symbols":
          const isSymbolAvailable = response.active_symbols.some(
            (s: any) => s.symbol === symbol && s.exchange_is_open === 1
          );
          if (!isSymbolAvailable) {
            console.error(`startOperation - Símbolo ${symbol} não disponível.`);
            ws.close();
            return;
          }

          ws.send(
            JSON.stringify({
              ticks_history: symbol,
              subscribe: 1,
              end: "latest",
              count: 200,
              style: "ticks",
              req_id: reqId++,
            })
          );

          ws.send(
            JSON.stringify({
              ticks_history: symbol,
              subscribe: 1,
              end: "latest",
              count: 200,
              granularity: 60,
              style: "candles",
              req_id: reqId++,
            })
          );

          ws.send(
            JSON.stringify({
              balance: 1,
              subscribe: 1,
              req_id: reqId++,
            })
          );
          break;

        case "history":
        case "candles":
          const contractType = prompts.find(p => p.key === "contractType")?.value || configOperation.trade_options?.contractType || "CALL";
          const amount = parseFloat(prompts.find(p => p.key === "amount")?.value || "1.0");
          ws.send(
            JSON.stringify({
              proposal: 1,
              subscribe: 1,
              duration_unit: configOperation.trade_options?.durationUnit || "t",
              basis: "stake",
              currency: configOperation.trade_options?.currency || "USD",
              symbol,
              duration: configOperation.trade_options?.duration || 1,
              amount: amount.toFixed(2),
              contract_type: contractType,
              passthrough: {
                contractType,
                purchaseReference: `bot-${Date.now()}`,
              },
              req_id: reqId++,
            })
          );
          break;

        case "proposal":
          proposalId = response.proposal.id;
          ws.send(
            JSON.stringify({
              buy: proposalId,
              price: parseFloat(response.proposal.ask_price),
              req_id: reqId++,
            })
          );
          break;

        case "buy":
          contractId = response.buy.contract_id;
          ws.send(
            JSON.stringify({
              proposal_open_contract: 1,
              subscribe: 1,
              contract_id: contractId,
              req_id: reqId++,
            })
          );
          break;

        case "proposal_open_contract":
          console.log(`startOperation - Contrato ${contractId}:`, response.proposal_open_contract);
          if (response.proposal_open_contract.is_sold) {
            console.log(`startOperation - Contrato finalizado. Lucro/Perda: ${response.proposal_open_contract.profit}`);
            ws.send(
              JSON.stringify({
                forget_all: ["ticks", "candles", "balance", "proposal", "proposal_open_contract"],
                req_id: reqId++,
              })
            );
            ws.close();
          }
          break;

        case "balance":
          console.log(`startOperation - Saldo atual: ${response.balance.balance} ${response.balance.currency}`);
          break;
      }
    }
  };

  return {
    addUserData,
    startOperation,
  };
};