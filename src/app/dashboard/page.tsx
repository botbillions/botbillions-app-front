"use client"

import * as S from "./styles";
import "react-toastify/dist/ReactToastify.css";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Configuracoes from "@/components/icons/Configuracoes";
import Empresas from "@/components/icons/Empresas";
import Historico from "@/components/icons/Historico";
import Inicio from "@/components/icons/Inicio";
import { MenuItemST } from "@/components/Sidebar/styles";
import { signOutAction } from "@/services/actions/auth-actions";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Dashboard() {
  const {collapsed} = useSidebar();
  return (
    <S.Wrapper>
      <Sidebar logout={async ()=> await signOutAction()}>
         <MenuItemST collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />} active> Início </MenuItemST>
      </Sidebar>
      <Container>
        <Header name="Dashboard">
        </Header>
      </Container>
    </S.Wrapper>
  );
}
