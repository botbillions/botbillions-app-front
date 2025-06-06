"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  height: 100%;
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
  & div {
    display: flex;
    justify-content: space-around;
    width: 100%;
    max-width: 40rem;
    margin: 2rem 0;
  }
`;

export const TabsContainer = styled.div`
  margin: 3rem 0;
`;

export const Tab = styled(Link)`
  margin: 0;
  ${({ theme }) => css`
    color: ${theme.colors.white};
    font-size: ${theme.font.sizes.regular};
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    &:hover {
      background-color: ${theme.colors.primary[800]};
    }
    &.active {
      background-color: ${theme.colors.primary[700]};
      border-bottom: 2px solid ${theme.colors.white};
    }
  `}
`;

export const StatusMessage = styled.p`
  justify-content: center;
  display: flex;
  align-items: center;
  min-height: calc(100vh - 7.2rem);
`;