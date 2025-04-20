import { useDeriv } from "@/contexts/DerivContext";
import { BotsDeriv } from "@/models/deriv";
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

  const startSelectedBot = async (bot: BotsDeriv) => {
    console.log(bot);
    const welcomeMessage = bot.config.welcome_message;
    const prompts = bot.config.prompts;

    if (welcomeMessage) {
      window.alert(welcomeMessage); // Exibe a mensagem de boas-vindas uma vez
    }

    // Coleta os valores dos prompts
    for (let index = 0; index < prompts.length; index++) {
      const element = prompts[index];
      let prompt = null;

      // Loop até que a entrada seja válida (não vazia) ou o usuário cancele
      while (prompt === null || prompt.trim() === "") {
        prompt = window.prompt(element.text);
        if (prompt === null) {
          console.log("Usuário cancelou o prompt.");
          return; // Sai da função se o usuário cancelar
        }
        if (prompt.trim() === "") {
          window.alert("Por favor, insira um valor válido.");
        }
      }

      element.value = prompt; // Atualiza o valor do prompt
      console.log(`Prompt ${element.text}: ${prompt}`);
    }

    // Chama startOperation uma única vez com a configuração atualizada
    await startOperation(bot.config);
  };
  return { tabs, selectedBots, addTab, removeTab, selectBot, clearSelectedBot, startSelectedBot };
};