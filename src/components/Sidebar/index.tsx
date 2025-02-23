"use client";

import React from "react";
import Logo from "../icons/Logo";
import * as S from "./styles";
import { Menu } from "react-pro-sidebar";
import Desconectar from "../icons/Desconectar";
import CloseMenu from "../icons/CloseMenu";
import OpenMenu from "../icons/OpenMenu";
import { useSidebar } from "@/contexts/SidebarContext";

interface ISidebarProps{
  logout: any
  linkLogo?:string;
  children: React.ReactNode;
}

const Sidebar = ({logout,linkLogo,children}:ISidebarProps) => {
  const { collapsed, toggleCollapsed } = useSidebar();


  return (
    <S.Wrapper breakPoint="md" collapsed={collapsed ? "collapsed" : undefined}>
      <S.MenuHeader>
        {collapsed ? (
          <button style={{ background: "none" }} onClick={toggleCollapsed}>
            <OpenMenu />
          </button>
        ) : (
          <>
            <Logo link={linkLogo} />
            <button style={{ background: "none" }} onClick={toggleCollapsed}>
              <CloseMenu />
            </button>
          </>
        )}
      </S.MenuHeader>

      <S.MenuBody>
        <Menu>
          {children}
        </Menu>
      </S.MenuBody>

      <S.MenuFooter>
        <Menu>
          <S.MenuItemST
            collapsed={collapsed ? "collapsed" : undefined}
            icon={<Desconectar />}
            onClick={logout}
          >
            Desconectar
          </S.MenuItemST>
        </Menu>
      </S.MenuFooter>
    </S.Wrapper>
  );
};

export default Sidebar;
