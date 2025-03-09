import * as S from './styles';

interface ICardProps {
  children: React.ReactNode;
}

const Card = ({ children }: ICardProps) => {
  return (
    <S.Wrapper>
      {children}
    </S.Wrapper>
  )
}

export default Card