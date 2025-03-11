"use client";

import { getBotList } from "@/services/actions/bot/supabase-actions";
import { BotsDeriv } from "@/utils/deriv";
import { createContext, useContext, useEffect, useState } from "react";

type DerivContextType = {
  botsDeriv: BotsDeriv[] | null;
  fetchBotsDeriv: () => Promise<void>;
};

const DerivContext = createContext<DerivContextType | undefined>(undefined);

export const DerivProvider = ({ children }: { children: React.ReactNode }) => {
  const [botsDeriv, setBotsDeriv] = useState<BotsDeriv[] | null>(null);

  const fetchBotsDeriv = async () => {
    try {
      const bots = await getBotList();
      setBotsDeriv(bots);
    } catch (error) {
      console.error("Erro ao buscar botsDeriv:", error);
      setBotsDeriv(null);
    }
  };

  useEffect(() => {
    fetchBotsDeriv();
  }, []);

  return (
    <DerivContext.Provider value={{ botsDeriv, fetchBotsDeriv }}>
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