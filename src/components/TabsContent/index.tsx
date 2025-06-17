import { useTabs } from "@/hooks/useTabs";
import { BotsDeriv, UserDeriv } from "@/models/deriv";
import SelectBot from "../SelectBot";
import SelectedBot from "../SelectedBot";

interface TabContentProps {
  tabId: number;
  activeTabId: number;
  bots: BotsDeriv[] | null;
  userDeriv: UserDeriv | null;
}

export const TabContent = ({
  tabId,
  activeTabId,
  bots,
  userDeriv,
}: TabContentProps) => {
  if (tabId !== activeTabId) return null;

  const { selectedBots, selectBot, clearSelectedBot } = useTabs();
  const selectedBot = selectedBots[tabId] || null;

  console.log('[TabContent] Rendering for tabId:', tabId, 'selectedBot:', selectedBot);

  if (selectedBot) {
    return (
      <SelectedBot
        selectedBot={selectedBot}
        onClearSelectedBot={clearSelectedBot}
        tabId={tabId}
        userDeriv={userDeriv}
      />
    );
  }

  return (
    <SelectBot
      bots={bots}
      onSelectBot={selectBot}
      tabId={tabId}
    />
  );
};