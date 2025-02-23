"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.div`
    --gutter: 1.6rem;

    width: 100%;

    padding-inline: var(--gutter);
    min-height: 7.2rem;
    display: flex;
    justify-content: space-between;
    margin-inline: auto;
    
    ${({ theme }) => css`
      background-color: ${theme.colors.primary[900]};
  `}
`;

export const Title = styled.div`
  ${({ theme }) => css`
      font-size: ${theme.font.sizes.xlarge};
      align-self: center;
      font-weight: ${theme.font.weight.bold};
      color: ${theme.colors.gray[100]};
  `}
`;