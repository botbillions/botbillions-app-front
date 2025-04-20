import { useTabs } from '@/hooks/useTabs';
import { BotsDeriv, type UserDeriv } from '@/models/deriv';
import BtnAction from '../BtnAction';
import Robot from '../icons/Robot';
import * as S from "./styles";


interface ISelectedBotProps {
  userDeriv: UserDeriv | null;
  selectedBot: BotsDeriv;
  onClearSelectedBot: (tabId: number) => void;
  bot: BotsDeriv;
  tabId: number;
}
const SelectedBot = ({ onClearSelectedBot, bot, selectedBot, tabId, userDeriv }: ISelectedBotProps) => {
  const { startSelectedBot } = useTabs();
  return (
    <S.OperacaoContainer>
      <S.HeaderAccount>
        <div>
          <p>Conta {userDeriv?.account_type}</p>
          <p>{userDeriv?.loginid} - {userDeriv?.currency}</p>
        </div>
        <div>
          <p>Saldo</p>
          {userDeriv?.balance} {userDeriv?.currency}
        </div>
      </S.HeaderAccount>
      <S.OperacaoTitle>
        <hr />
        <span>
          <Robot />
        </span>
        {selectedBot.name}
        <hr />
      </S.OperacaoTitle>
      <S.BtnContainer>
        <BtnAction
          name="Inicie a inteligência"
          onclickFn={() => startSelectedBot(bot)}
        />
        <BtnAction
          name="Selecione outro Bot"
          onclickFn={() => onClearSelectedBot(tabId)}
        />
      </S.BtnContainer>
    </S.OperacaoContainer>
  )
}

export default SelectedBot