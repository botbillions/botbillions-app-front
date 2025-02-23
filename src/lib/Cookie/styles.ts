"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  padding: 3rem;
  opacity: 0.9;

  ${({ theme }) => css`
    color: ${theme.colors.white};
    background-color: ${theme.colors.primary[800]};
  `}
`;

export const CookieContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CookieText = styled.p`
  padding-inline: 1rem;

  ${({ theme }) => css`
    font-size: ${theme.font.sizes.small};
    font-weight: ${theme.font.weight.bold};
  `}
`;

export const CookieButton = styled.button`
  border-radius: 4px;
  padding: 0.5rem 1.6rem;

  ${({ theme }) => css`
    font-size: ${theme.font.sizes.small};
    color: ${theme.colors.primary[800]};
    background-color: ${theme.colors.white};

    &:hover {
      background-color: ${theme.colors.gray[100]};
    }
  `}
`;
