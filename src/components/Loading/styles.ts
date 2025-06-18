import styled, { css, keyframes } from "styled-components";


export const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height:100%;
  max-height: calc(100% - 7.2rem);
  & p{
    ${({ theme }) => css`
      font-size: ${theme.font.sizes.large};
    `}
  }
`;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);
  
  border-top: 2px solid grey;
  border-right: 2px solid grey;
  border-bottom: 2px solid grey;
  border-left: 4px solid black;
  background: transparent;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  margin-left: 1rem;
`;