"use client";

import styled, { css } from "styled-components";

export const OperacaoContainer = styled.div`
  max-width: 114rem;
  margin: 2rem auto;
  width: 100%;
`;

export const HeaderAccount = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 3rem;
  margin: 2rem 0;
`;

export const BtnContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin: 2rem 0;
`;

export const OperacaoTitle = styled.h3`
  text-align: center;
    display: flex;
    width: 100%;
    max-width: 100%;
    align-items: center;
    justify-content: space-between;
  & hr{
    width: 100%;
    color: inherit;
    border: 0;
    border-top: 1px solid;
    opacity: .25;
    max-width: 35%;
  }  
`;