// @/hooks/useTabs.tsx
// RESPONSABILIDADE: Gerir abas, seleção de bots e os prompts de configuração.
// NENHUMA LÓGICA DE API AQUI.

import { BotsDeriv } from "@/models/deriv";
import { useCallback, useEffect, useState } from "react";

type Tab = { id: number; title: string };

export const useTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    if (typeof window !== "undefined") {
      const savedTabs = localStorage.getItem("tabs");
      return savedTabs ? JSON.parse(savedTabs) : [{ id: 1, title: "Aba 1" }];
    }
    return [{ id: 1, title: "Aba 1" }];
  });

  const [selectedBots, setSelectedBots] = useState<{ [tabId: number]: BotsDeriv | null }>(() => {
    if (typeof window !== "undefined") {
      const savedSelectedBots = localStorage.getItem("selectedBots");
      return savedSelectedBots ? JSON.parse(savedSelectedBots) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem("selectedBots", JSON.stringify(selectedBots));
  }, [selectedBots]);

  const addTab = () => {
    const newTabId = (tabs[tabs.length - 1]?.id || 0) + 1;
    const newTab = { id: newTabId, title: `Aba ${newTabId}` };
    setTabs((prev) => [...prev, newTab]);
  };

  const removeTab = (tabId: number) => {
    if (tabs.length <= 1) return; // Não remover a última aba
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
    setSelectedBots((prev) => {
      const newSelected = { ...prev };
      delete newSelected[tabId];
      return newSelected;
    });
  };

  const selectBot = (tabId: number, bot: BotsDeriv) => {
    setSelectedBots((prev) => ({
      ...prev,
      [tabId]: bot,
    }));
  };

  const clearSelectedBot = (tabId: number) => {
    setSelectedBots((prev) => {
      const newSelected = { ...prev };
      delete newSelected[tabId];
      return newSelected;
    });
  };

  /**
   * Mostra os prompts ao usuário para configurar o bot.
   * Retorna o bot com a configuração preenchida ou null se o usuário cancelar.
   */
  const getBotWithUserConfig = useCallback(async (bot: BotsDeriv): Promise<BotsDeriv | null> => {
    // Cria uma cópia profunda para não modificar o objeto original
    const configuredBot = JSON.parse(JSON.stringify(bot));

    const { welcome_message, prompts } = configuredBot.config;

    if (welcome_message) {
      // Idealmente, use um modal em vez de window.alert
      alert(welcome_message);
    }

    for (const promptConfig of prompts) {
      let userInput = null;
      while (userInput === null || userInput.trim() === "") {
        userInput = prompt(promptConfig.text); // Use window.prompt ou um modal customizado
        if (userInput === null) {
          console.log("Usuário cancelou a configuração do bot.");
          return null; // Retorna null se o usuário cancelar
        }
        if (userInput.trim() === "") {
          alert("Por favor, insira um valor válido.");
        }
      }
      promptConfig.value = userInput;
    }

    return configuredBot;
  }, []);

  return { tabs, selectedBots, addTab, removeTab, selectBot, clearSelectedBot, getBotWithUserConfig };
};
