"use client";

import styled,{css} from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
  `}
`;