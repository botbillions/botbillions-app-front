"use client";

import styled, { css } from "styled-components";
import Link from "next/link";


export const Wrapper = styled(Link)<{ outlined: string | undefined, fitContent:string | undefined }>`
    --gutter: 1.6rem;

    max-width: 18rem;
    min-height: 4rem;
    height: 100%;

    align-self: center;

    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: 0.8rem;
    
    border-radius: 0.8rem;

    ${({ theme , outlined,fitContent}) => css`
      width:${!fitContent ? "100%" : "fit-content"};
      color: ${outlined ? theme.colors.primary[900] : theme.colors.gray[25]};
      background-color: ${outlined ? theme.colors.gray[100] : theme.colors.secondary[500]};
      outline:${!outlined ? "none" :`1px solid ${theme.colors.primary[900]}`};
      border:${!outlined ? "none" :`1px solid ${theme.colors.primary[900]}`};
      &:hover{
        transition:.2s;
        color: ${outlined ? theme.colors.primary[50] : theme.colors.gray[25]};
        background-color: ${outlined ? theme.colors.primary[700] : theme.colors.secondary[500]};
      }
    `}
`;

export const ButtonIcon = styled.img`
  width: 1.6rem;
  height: 1.6rem;
  margin-right: 0.9rem;
`;

export const ButtonText = styled.p`
  ${({ theme }) => css`
      font-size: ${theme.font.sizes.regular};
      font-weight: ${theme.font.weight.medium};
  `}
`;