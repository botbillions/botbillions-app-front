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
      console.log('[useTabs] Initializing selectedBots from localStorage:', savedSelectedBots);
      return savedSelectedBots ? JSON.parse(savedSelectedBots) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    // Evita salvar {} se selectedBots já contém dados no localStorage
    const currentLocalStorage = localStorage.getItem("selectedBots");
    if (Object.keys(selectedBots).length > 0 || !currentLocalStorage) {
      console.log('[useTabs] Saving selectedBots to localStorage:', selectedBots);
      localStorage.setItem("selectedBots", JSON.stringify(selectedBots));
    } else {
      console.log('[useTabs] Skipped saving empty selectedBots, current localStorage:', currentLocalStorage);
    }
  }, [selectedBots]);

  const addTab = () => {
    const newTabId = (tabs[tabs.length - 1]?.id || 0) + 1;
    const newTab = { id: newTabId, title: `Aba ${newTabId}` };
    setTabs((prev) => [...prev, newTab]);
  };

  const removeTab = (tabId: number) => {
    console.log('[useTabs] Removing tabId:', tabId);
    if (tabs.length <= 1) return; // Não remover a última aba
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
    setSelectedBots((prev) => {
      const newSelected = { ...prev };
      delete newSelected[tabId];
      console.log('[useTabs] Cleared selectedBot for tabId:', tabId, 'new selectedBots:', newSelected);
      return newSelected;
    });
  };

  const selectBot = (tabId: number, bot: BotsDeriv) => {
    console.log('[useTabs] Selecting bot for tabId:', tabId, 'Bot:', bot);
    setSelectedBots((prev) => {
      const newSelected = { ...prev, [tabId]: bot };
      console.log('[useTabs] Updated selectedBots:', newSelected);
      return newSelected;
    });
  };

  const clearSelectedBot = (tabId: number) => {
    console.log('[useTabs] Clearing bot for tabId:', tabId, new Error().stack);
    setSelectedBots((prev) => {
      const newSelected = { ...prev };
      delete newSelected[tabId];
      console.log('[useTabs] Cleared selectedBot for tabId:', tabId, 'new selectedBots:', newSelected);
      return newSelected;
    });
  };

  const getBotWithUserConfig = useCallback(async (bot: BotsDeriv): Promise<BotsDeriv | null> => {
    console.log('[useTabs] Configuring bot:', bot);
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