"use client";

import BtnAction from "@/components/BtnAction";
import styled,{css} from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
  `}
`;

export const LogoutMsg = styled.h4`
  ${({ theme }) => css`
    color: ${theme.colors.white};
    font-size: ${theme.font.sizes.xlarge};
  `}
`;

export const ContainerLogin = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  width: 100%;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
  `}
`;

export const SubText = styled.p`
  font-size: ${({ theme }) => theme.font.sizes.small};
  color: ${({ theme }) => theme.colors.gray[400]};
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
  
  & > input {
    margin-bottom: 0.75rem;
  }
`;
