"use client";

import { MenuItem, Sidebar } from "react-pro-sidebar";
import styled, { css } from "styled-components";

export const Wrapper = styled(Sidebar)<{ collapsed: string | undefined }>`
  --gutter: 1.6rem;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  max-width: 24rem;
  padding-inline: var(--gutter);
  padding-top: 2rem;

  & .ps-sidebar-container {
    display: contents;
  }

  ${({ theme }) => css`
    background-color: ${theme.colors.primary[900]};
    border-right: 1px solid ${theme.colors.gray[600]} !important;
  `}
`;

export const MenuHeader = styled.div`
  flex-shrink: 0;
  padding-bottom: 1rem;
  //padding-left: 1.6rem;
  display: flex;
  justify-content: center;
`;

export const MenuBody = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 1.2rem;
  & nav{
    overflow-x: hidden;
  }
`;

export const MenuFooter = styled.div`
  flex-shrink: 0;
  padding-bottom: 1.2rem;
`;

export const MenuItemST = styled(MenuItem)<{ collapsed: string | undefined; active?: boolean; link_out?:boolean} >`
  ${({ theme, collapsed,active, link_out }) => css`
    color: ${theme.colors.white};

    a {
      & span {
        justify-content: start;
      }
      padding-left: 15px!important;
      margin: 1rem 0;
    }

    a:hover {
      background-color: ${collapsed ? "transparent" : `${theme.colors.primary[500]}`} !important;
      border-radius: 0.8rem;
    }

    ${active &&
      css`
        background-color: ${theme.colors.primary[500]} !important;
        border-radius: 0.8rem;
      `}
    &.link_out{
      background-color: ${theme.colors.secondary[500]} !important;
      border-radius: 0.8rem;
    }
  `}
`;
