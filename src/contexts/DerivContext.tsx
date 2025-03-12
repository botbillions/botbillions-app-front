"use client";

import { getBot, getBotList } from "@/services/actions/bot/supabase-actions";
import { BotsDeriv } from "@/utils/deriv";
import { createContext, useContext, useEffect, useState } from "react";

type DerivContextType = {
  botsDeriv: BotsDeriv[] | null;
  fetchBotsDeriv: () => Promise<void>;
  fetchBotDeriv: (id: string) => Promise<void>;
  botDeriv: BotsDeriv | null
};

const DerivContext = createContext<DerivContextType | undefined>(undefined);

export const DerivProvider = ({ children }: { children: React.ReactNode }) => {
  const [botsDeriv, setBotsDeriv] = useState<BotsDeriv[] | null>(null);
  const [botDeriv, setBotDeriv] = useState<BotsDeriv | null>(null);

  const fetchBotsDeriv = async () => {
    try {
      const bots = await getBotList();
      setBotsDeriv(bots);
    } catch (error) {
      console.error("Erro ao buscar botsDeriv:", error);
      setBotsDeriv(null);
    }
  };

  const fetchBotDeriv = async (id: string) => {
    try {
      const bot = await getBot(id);
      setBotDeriv(bot);
    } catch (error) {
      console.error("Erro ao buscar botsDeriv:", error);
      setBotDeriv(null);
    }
  }

  useEffect(() => {
    fetchBotsDeriv();
  }, []);

  return (
    <DerivContext.Provider value={{ botsDeriv, botDeriv, fetchBotsDeriv, fetchBotDeriv }}>
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