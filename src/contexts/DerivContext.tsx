"use client";

import { BotsDeriv, UserDeriv } from "@/models/deriv";
import { usesDeriv } from "@/hooks/usesDeriv";
import { getBotList } from "@/services/actions/bot/supabase-actions";
import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "error" | "success" | "loading";

type DerivContextType = {
  botsDeriv: BotsDeriv[] | null;
  userDeriv: UserDeriv | null;
  status: Status;
  fetchBotsDeriv: () => Promise<void>;
  fetchUserDeriv: (token?: string) => Promise<void>;
};

const DerivContext = createContext<DerivContextType | undefined>(undefined);

export const DerivProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.toString();
  const params = new URLSearchParams(urlSearch);
  const token = params.get("token1") || "";

  const [botsDeriv, setBotsDeriv] = useState<BotsDeriv[] | null>(null);
  const [userDeriv, setUserDeriv] = useState<UserDeriv | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const { addUserData } = usesDeriv({setStatus,setUserDeriv,token});

  const fetchBotsDeriv = async () => {
    try {
      const bots = await getBotList();
      setBotsDeriv(bots);
    } catch (error) {
      console.error("Erro ao buscar botsDeriv:", error);
      setBotsDeriv(null);
    }
  };

  const fetchUserDeriv = async (urlSearchParam?: string) => {
    setStatus("loading");

    const derivCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("derivData="));
    const derivDataFromCookie = derivCookie ? JSON.parse(derivCookie.split("=")[1]) : null;

    if (derivDataFromCookie && derivDataFromCookie.email) {
      setUserDeriv({
        email: derivDataFromCookie.email,
        balance: derivDataFromCookie.balance,
        loginid: derivDataFromCookie.loginid,
        account_type: derivDataFromCookie.account_type, // Já vem como "virtual" ou "real"
        currency: derivDataFromCookie.currency,
      });
      setStatus("success");
      return;
    }
    if (!urlSearchParam && !urlSearch) {
      setStatus("success");
      return;
    }

    if (!token) {
      setStatus("success");
      return;
    }

    await addUserData();
  };

  useEffect(() => {
    fetchBotsDeriv();
    if(!userDeriv){
      fetchUserDeriv(); 
    }
  }, [userDeriv]);

  return (
    <DerivContext.Provider value={{ botsDeriv, userDeriv, status, fetchBotsDeriv, fetchUserDeriv }}>
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