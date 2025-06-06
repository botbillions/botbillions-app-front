// useTabs.tsx
import { useDeriv } from "@/contexts/DerivContext";
import { BotsDeriv, OperationState } from "@/models/deriv";
import { useEffect, useState } from "react";

type Tab = { id: number; title: string };

export const useTabs = () => {
  const { startOperation } = useDeriv();
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

  // Novo estado para rastrear operationState por tabId
  const [operationsByTab, setOperationsByTab] = useState<{ [tabId: number]: OperationState }>(() => {
    if (typeof window !== "undefined") {
      const savedOperations = localStorage.getItem("operationsByTab");
      return savedOperations ? JSON.parse(savedOperations) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
    localStorage.setItem("selectedBots", JSON.stringify(selectedBots));
    localStorage.setItem("operationsByTab", JSON.stringify(operationsByTab));
  }, [tabs, selectedBots, operationsByTab]);

  const addTab = () => {
    const newTabId = tabs.length + 1;
    const newTab = { id: newTabId, title: `Aba ${newTabId}` };
    setTabs((prev) => [...prev, newTab]);
    setSelectedBots((prev) => {
      const newSelected = { ...prev };
      delete newSelected[newTabId];
      return newSelected;
    });
    setOperationsByTab((prev) => {
      const newOperations = { ...prev };
      delete newOperations[newTabId];
      return newOperations;
    });
  };

  const removeTab = (tabId: number) => {
    if (tabId === 1) return;
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
    setSelectedBots((prev) => {
      const newSelected = { ...prev };
      delete newSelected[tabId];
      return newSelected;
    });
    setOperationsByTab((prev) => {
      const newOperations = { ...prev };
      delete newOperations[tabId];
      return newOperations;
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
    setOperationsByTab((prev) => {
      const newOperations = { ...prev };
      delete newOperations[tabId];
      return newOperations;
    });
  };

  const startSelectedBot = async (bot: BotsDeriv, tabId: number) => {
    console.log(bot);
    const welcomeMessage = bot.config.welcome_message;
    const prompts = bot.config.prompts;

    if (welcomeMessage) {
      window.alert(welcomeMessage);
    }

    for (let index = 0; index < prompts.length; index++) {
      const element = prompts[index];
      let prompt = null;

      while (prompt === null || prompt.trim() === "") {
        prompt = window.prompt(element.text);
        if (prompt === null) {
          console.log("Usuário cancelou o prompt.");
          return;
        }
        if (prompt.trim() === "") {
          window.alert("Por favor, insira um valor válido.");
        }
      }

      element.value = prompt;
      console.log(`Prompt ${element.text}: ${prompt}`);
    }

    setOperationsByTab((prev) => ({
      ...prev,
      [tabId]: {
        isRunning: true,
        operations: [],
        totalProfit: 0,
        winRate: 0,
      },
    }));

    await startOperation(bot.config, tabId);
  };

  return { tabs, selectedBots, operationsByTab, addTab, removeTab, selectBot, clearSelectedBot, startSelectedBot };
};