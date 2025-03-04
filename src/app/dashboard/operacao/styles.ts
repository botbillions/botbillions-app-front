"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
  `}
`;

export const Conect = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: center;
  & div{
    display: flex;
    justify-content: space-around;
    width: 100%;
    max-width: 40rem;
    margin: 2rem 0;
  }
`;