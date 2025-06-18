import * as S from './styles';

interface ICardProps {
  children: React.ReactNode;
  id?: string;
}

const Card = ({ children, id }: ICardProps) => {
  return (
    <S.Wrapper id={id}>
      {children}
    </S.Wrapper>
  )
}

export default Card