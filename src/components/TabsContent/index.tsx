import { BotsDeriv, UserDeriv } from "@/models/deriv";
import SelectBot from "../SelectBot";
import SelectedBot from "../SelectedBot";

interface TabContentProps {
  tabId: number;
  activeTabId: number;
  selectedBot: BotsDeriv | null;
  bots: BotsDeriv[] | null;
  onSelectBot: (tabId: number, bot: BotsDeriv) => void;
  onClearSelectedBot: (tabId: number) => void;
  userDeriv: UserDeriv | null;
}

export const TabContent = ({
  tabId,
  activeTabId,
  selectedBot,
  bots,
  onSelectBot,
  onClearSelectedBot,
  userDeriv
}: TabContentProps) => {
  if (tabId !== activeTabId) return null;

  if (selectedBot) {
    return (
      <SelectedBot
        onClearSelectedBot={onClearSelectedBot}
        selectedBot={selectedBot}
        tabId={tabId}
        userDeriv={userDeriv}
      />
    );
  }

  return (
    <SelectBot
      bots={bots}
      onSelectBot={onSelectBot}
      tabId={tabId}
    />
  );
};