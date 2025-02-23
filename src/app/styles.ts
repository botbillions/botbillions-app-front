"use client";

import BtnAction from "@/components/BtnAction";
import Container from "@/components/Container";
import styled,{css} from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
  `}
`;

export const ContainerHome = styled(Container)`
  display: flex;
  flex-direction: column;
`;


export const Body = styled.div`
    width: 100%;

    display: flex;
    margin-inline: auto;
    flex:1;
    align-items: center;
    max-height: 100vh;
    height: 100%;
    flex-direction: column;
    padding-top: 5.6rem;
`;

export const PageTitle = styled.h1`
  margin-top: 3.5rem;
   ${({ theme }) => css`
      font-size: ${theme.font.sizes.xlarge};
      color: ${theme.colors.gray[200]};
  `}
`;

export const PageText = styled.p`
  margin-top: 1.2rem;
   ${({ theme }) => css`
      font-size: ${theme.font.sizes.regular};
      color: ${theme.colors.gray[200]};
  `}
`;

export const RedirectPageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin-top: 6rem;
`;

export const CardBoxToPage = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.colors.gray[100]};
  `}
  padding:2.4rem;
  max-width:45rem;
  border-radius: .8rem;
  display:flex;
  flex-direction:column;
  text-align:center;
`;

export const CardTitleToPage = styled.h2`
  ${({ theme }) => css`
    font-size: ${theme.font.sizes.large};
    color: ${theme.colors.gray[900]};
    padding-bottom: 1.2rem;
  `}
`;

export const CardTextToPage = styled.p`
  ${({ theme }) => css`
    font-size: ${theme.font.sizes.regular};
    color: ${theme.colors.gray[700]};
  `}
  margin-bottom:2rem;
`;

export const CardBtnBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
`;