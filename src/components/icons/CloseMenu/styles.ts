"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.a`
  ${({ theme }) => css`
    color: ${theme.colors.white};
  `}
`;
