import BtnAction from "@/components/BtnAction";
import Card from "@/components/Card";
import { CardContainer } from "@/components/Card/styles";
import Robot from "@/components/icons/Robot";
import { BotsDeriv } from "@/utils/deriv";

interface TabContentProps {
  tabId: number;
  activeTabId: number;
  selectedBot: BotsDeriv | null;
  bots: BotsDeriv[] | null;
  onSelectBot: (tabId: number, bot: BotsDeriv) => void;
}

export const TabContent = ({ tabId, activeTabId, selectedBot, bots, onSelectBot }: TabContentProps) => {
  if (tabId !== activeTabId) return null;

  if (selectedBot) {
    return (
      <div style={{ margin: "2rem 0", textAlign: "center" }}>
        <h3>
          <span style={{ margin: "0 2rem" }}>
            <Robot />
          </span>
          {selectedBot.name}
        </h3>
        <BtnAction name="Inicie a inteligência" />
      </div>
    );
  }

  return (
    <>
      <h3>Selecione um Bot para continuar</h3>
      <CardContainer style={{ margin: "2rem 0" }}>
        {bots?.map((bot) => (
          <Card key={bot.id} id={bot.id}>
            <div
              onClick={() => onSelectBot(tabId, bot)}
              style={{ cursor: "pointer" }}
            >
              <img src="/operacao-img.jpg" alt={bot.name} />
              <p>{bot.name}</p>
            </div>
          </Card>
        ))}
      </CardContainer>
    </>
  );
};