import * as S from './styles';

interface ILoadingProps {
  message: string;
}

const Loading = ({ message }: ILoadingProps) => {
  return (
    <S.SpinnerContainer>
      <p>{message}</p>
      <S.Spinner></S.Spinner>
    </S.SpinnerContainer>
  )
}

export default Loading