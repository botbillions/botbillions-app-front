import * as S from "./styles";

interface BodyProps {
  children?: React.ReactNode;
}

const Body = ({ children }: BodyProps) => (
  <S.Wrapper>
    {children}
  </S.Wrapper>
);

export default Body;
