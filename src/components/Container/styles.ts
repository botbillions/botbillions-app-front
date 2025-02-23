"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.div`
    --sidebar-position: calc(25rem);
    --gutter: 1.6rem;

    width: 100%;

    left: var(--sidebar-position);
    
    ${({ theme }) => css`
    background-color: ${theme.colors.gray[900]};
    color: ${theme.colors.white};
  `}
`;
