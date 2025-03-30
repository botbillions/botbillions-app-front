import { BotsDeriv } from '@/models/deriv';
import BtnAction from '../BtnAction';
import Robot from '../icons/Robot';

interface ISelectedBotProps {
  selectedBot: BotsDeriv;
  onClearSelectedBot: (tabId: number) => void;
  tabId: number;
}
const SelectedBot = ({ onClearSelectedBot, selectedBot, tabId }: ISelectedBotProps) => {
  return (
    <div style={{ margin: "2rem 0", textAlign: "center" }}>
      <h3>
        <span style={{ margin: "0 2rem" }}>
          <Robot />
        </span>
        {selectedBot.name}
      </h3>
      <BtnAction name="Inicie a inteligência" />
      <BtnAction
        name="Selecione outro Bot"
        onclickFn={() => onClearSelectedBot(tabId)}
      />
    </div>
  )
}

export default SelectedBot