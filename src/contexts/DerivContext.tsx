// contexts/DerivContext.tsx
"use client";

import { usesDeriv } from "@/hooks/usesDeriv";
import { BotsDeriv, ConfigBotsDeriv, UserDeriv } from "@/models/deriv";
import { getBotList } from "@/services/actions/bot/supabase-actions";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type Status = "error" | "success" | "loading";

type DerivContextType = {
  botsDeriv: BotsDeriv[] | null;
  userDeriv: UserDeriv | null;
  status: Status;
  fetchBotsDeriv: () => Promise<void>;
  fetchUserDeriv: (token?: string) => Promise<void>;
  ws: WebSocket | null;
  startOperation: (configOperation: ConfigBotsDeriv, tabId: number) => Promise<void>;
};

const DerivContext = createContext<DerivContextType | undefined>(undefined);

export const DerivProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token1") || "";
  const [botsDeriv, setBotsDeriv] = useState<BotsDeriv[] | null>(null);
  const [userDeriv, setUserDeriv] = useState<UserDeriv | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [ws, setWs] = useState<WebSocket | null>(null);

  const getUserDerivFromCookie = (): UserDeriv | null => {
    if (typeof window === "undefined") return null;
    const derivCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("derivData="));
    if (derivCookie) {
      const derivData = JSON.parse(derivCookie.split("=")[1]);
      if (derivData && derivData.email) {
        return {
          email: derivData.email,
          balance: derivData.balance,
          loginid: derivData.loginid,
          account_type: derivData.account_type,
          currency: derivData.currency,
          token: derivData.token || token,
        };
      }
    }
    return null;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialUserDeriv = getUserDerivFromCookie();
    if (initialUserDeriv) {
      setUserDeriv(initialUserDeriv);
      setStatus("success");
    }

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      const newWs = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APPID}`);
      setWs(newWs);

      newWs.onopen = () => {
        console.log("WebSocket aberto");
        reconnectAttempts = 0;
      };

      newWs.onclose = () => {
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts++;
            console.log(`Tentativa de reconexão ${reconnectAttempts}/${maxReconnectAttempts}`);
            connect();
          }, Math.pow(2, reconnectAttempts) * 1000);
        } else {
          console.error("Máximo de tentativas de reconexão atingido");
          setStatus("error");
        }
      };

      newWs.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
      };
    };

    connect();
    return () => {
      ws?.close();
    };
  }, []);

  // Passar ws como parâmetro para usesDeriv
  const { addUserData, startOperation } = usesDeriv({ setStatus, setUserDeriv, token: userDeriv?.token || token, ws });

  const fetchBotsDeriv = async () => {
    try {
      const bots = await getBotList();
      setBotsDeriv(bots);
    } catch (error) {
      console.error("Erro ao buscar botsDeriv:", error);
      setBotsDeriv(null);
    }
  };

  const fetchUserDeriv = async (urlToken?: string) => {
    setStatus("loading");
    console.log("fetchUserDeriv - Token recebido:", urlToken || token);

    if (typeof window !== "undefined") {
      const derivDataFromCookie = getUserDerivFromCookie();
      if (derivDataFromCookie) {
        console.log("fetchUserDeriv - Carregando userDeriv de cookies:", derivDataFromCookie);
        setUserDeriv(derivDataFromCookie);
        setStatus("success");
        return;
      }
    }

    if (!urlToken && !token) {
      console.log("fetchUserDeriv - Nenhum token disponível");
      setStatus("success");
      return;
    }

    await addUserData();
  };

  useEffect(() => {
    fetchBotsDeriv();
    if (!userDeriv && token) {
      fetchUserDeriv(token);
    } else if (userDeriv) {
      setStatus("success");
    }
  }, [userDeriv, token]);

  return (
    <DerivContext.Provider value={{ botsDeriv, userDeriv, status, fetchBotsDeriv, fetchUserDeriv, ws, startOperation }}>
      {children}
    </DerivContext.Provider>
  );
};

export const useDeriv = () => {
  const context = useContext(DerivContext);
  if (!context) {
    throw new Error("useDeriv must be used within a DerivProvider");
  }
  return context;
};