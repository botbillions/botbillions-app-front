"use client"

import Body from "@/components/Body";
import Card from "@/components/Card";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Inicio from "@/components/icons/Inicio";
import Sidebar from "@/components/Sidebar";
import { MenuItemST } from "@/components/Sidebar/styles";
import { useSidebar } from "@/contexts/SidebarContext";
import { useLogin } from "@/hooks/useLogin";
import { signOutAction } from "@/services/actions/auth-actions";
import Link from "next/link";
import { useEffect } from "react";
import * as S from "./styles";

export default function Dashboard() {
  const { collapsed } = useSidebar();
  const { fecthUser, user } = useLogin();
  useEffect(() => {
    fecthUser()
  }, [])

  return (
    <S.Wrapper>
      <Sidebar logout={async () => await signOutAction()}>
        <MenuItemST collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />} active> Início </MenuItemST>
        <MenuItemST collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />} href="/dashboard/operacao"> Operacao </MenuItemST>
      </Sidebar>
      <Container>
        <Header name="Início">
        </Header>
        {user && (
          <Body>
            <S.Introduction>
              <p> Olá, {user.user_metadata.name}</p>
            </S.Introduction>
            <p style={{ marginBottom: "3rem" }}>Ações principais</p>
            <S.CardContainer>
              <Card>
                <Link href="/dashboard/operacao">
                  <img src="operacao-img.jpg" alt="" />
                  <p>Comece uma operação</p>
                </Link>
              </Card>
              <Card>
                <Link href={process.env.NEXT_PUBLIC_DERIV_CREATE || ""}>
                  <img src="deriv-criar-conta-img.jpg" alt="" />
                  <p>Criar conta na corretora</p>
                </Link>
              </Card>
            </S.CardContainer>
          </Body>
        )}
      </Container>
    </S.Wrapper>
  );
}
