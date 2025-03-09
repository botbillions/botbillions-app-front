"use client";

import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  --gutter: 1.6rem;
  display: flex;
  flex-direction: column;
  align-items:center;
  padding: var(--gutter);
  position: relative;
  height: 30rem;
  max-width: 20rem!important;
  width: 100%;
  border-radius: .8rem;
  ${({ theme }) => css`
    background-color: ${theme.colors.gray[900]};
    border: 1px solid ${theme.colors.white};
    color: ${theme.colors.white};
    & p{
      position: absolute;
      bottom: 0;
      color: ${theme.colors.white};
      background: #98a2b3b5;
      font-weight: ${theme.font.weight.medium};
      font-size: ${theme.font.sizes.xlarge};
      width: 100%;
      left: 0;
      text-align: center;
      border-radius: 0 0 .8rem .8rem;
      padding: 2rem;
    }
  `}
  & img{
    position:absolute;
    border-radius:.8rem;
    top:0;
    left:0;
    width:100%;
    height:100%;
    object-fit:cover;
  }
`;
