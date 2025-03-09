"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
  `}
`;

export const Introduction = styled.div`
  margin: 2rem 0;
`;

export const CardContainer = styled.div`
  display: grid;
  column-gap: 1rem;
  grid-template-columns:repeat(4,1fr) ;
`;