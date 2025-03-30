import { BotsDeriv } from "@/models/deriv";
import { useEffect, useState } from "react";

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
    localStorage.setItem("selectedBots", JSON.stringify(selectedBots));
  }, [tabs, selectedBots]);

  const addTab = () => {
    const newTabId = tabs.length + 1;
    const newTab = { id: newTabId, title: `Aba ${newTabId}` };
    setTabs((prev) => [...prev, newTab]);
    setSelectedBots((prev) => {
      const newSelected = { ...prev };
      delete newSelected[newTabId]; // Garante que a nova aba comece sem bot
      return newSelected;
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
      delete newSelected[tabId]; // Remove o bot selecionado apenas dessa aba
      return newSelected;
    });
  };

  return { tabs, selectedBots, addTab, removeTab, selectBot, clearSelectedBot };
};