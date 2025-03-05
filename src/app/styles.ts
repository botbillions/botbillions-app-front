"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
  `}
`;

export const RedirectContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-end;
`;

export const CardBtnBox = styled.div`
  display: flex;
  gap: 3rem;
  margin-right: 3rem;
  max-width: 35rem;
  width: 100%;
  height: 100%;
`;