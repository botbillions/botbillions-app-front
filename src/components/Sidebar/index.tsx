"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import React from "react";
import { Menu } from "react-pro-sidebar";
import CloseMenu from "../icons/CloseMenu";
import Desconectar from "../icons/Desconectar";
import OpenMenu from "../icons/OpenMenu";
import * as S from "./styles";

interface ISidebarProps {
  logout: any
  linkLogo?: string;
  children: React.ReactNode;
}

const Sidebar = ({ logout, children }: ISidebarProps) => {
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
            <button style={{ background: "none" }} onClick={toggleCollapsed}>
              <CloseMenu />
            </button>
          </>
        )}
      </S.MenuHeader>

      <S.MenuBody>
        <Menu>
          <S.MenuItemST
            collapsed={collapsed ? "collapsed" : undefined}
            href={process.env.NEXT_PUBLIC_DERIV_CREATE}
            className="link_out"
            style={{ marginBottom: "2rem" }}
          >
            Criar conta na corretora
          </S.MenuItemST>
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
