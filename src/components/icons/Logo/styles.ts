"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

export const Wrapper = styled(Link)`
  ${({ theme }) => css`
    color: ${theme.colors.white};
  `}
`;
