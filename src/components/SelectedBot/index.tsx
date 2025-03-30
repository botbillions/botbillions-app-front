import { BotsDeriv, type UserDeriv } from '@/models/deriv';
import BtnAction from '../BtnAction';
import Robot from '../icons/Robot';
import * as S from "./styles";


interface ISelectedBotProps {
  userDeriv: UserDeriv | null;
  selectedBot: BotsDeriv;
  onClearSelectedBot: (tabId: number) => void;
  tabId: number;
}
const SelectedBot = ({ onClearSelectedBot, selectedBot, tabId , userDeriv}: ISelectedBotProps) => {
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
        <BtnAction name="Inicie a inteligência" />
        <BtnAction
          name="Selecione outro Bot"
          onclickFn={() => onClearSelectedBot(tabId)}
        />
      </S.BtnContainer>
    </S.OperacaoContainer>
  )
}

export default SelectedBot