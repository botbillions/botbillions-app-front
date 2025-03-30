import { BotsDeriv } from '@/models/deriv';
import Card from '../Card';
import { CardContainer } from '../Card/styles';

interface ISelectBotProps {
  bots: BotsDeriv[] | null;
  onSelectBot: (tabId: number, bot: BotsDeriv) => void;
  tabId: number;
}

const SelectBot = ({ bots, onSelectBot, tabId }: ISelectBotProps) => {
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
  )
}

export default SelectBot