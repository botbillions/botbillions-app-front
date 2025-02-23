import * as S from "./styles";

interface HeaderProps {
  name: string
  children?: React.ReactNode;
}

const Header = ({name,children}: HeaderProps) => (
  <S.Wrapper>
    <S.Title>{name}</S.Title>
    {children}
  </S.Wrapper>
);

export default Header;
