"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

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