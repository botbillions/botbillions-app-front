"use client";

import Body from "@/components/Body";
import Card from "@/components/Card";
import { CardContainer } from "@/components/Card/styles";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Inicio from "@/components/icons/Inicio";
import Loading from "@/components/Loading";
import Sidebar from "@/components/Sidebar";
import { MenuItemST } from "@/components/Sidebar/styles";
import { useSidebar } from "@/contexts/SidebarContext";
import { useUser } from "@/contexts/UserContext";
import { signOutAction } from "@/services/actions/auth/supabase-actions";
import Link from "next/link";
import { useEffect } from "react";
import * as S from "./styles";

export default function Dashboard() {
  const { collapsed } = useSidebar();
  const { user, userDeriv, status, fetchUser } = useUser();

  useEffect(() => {
    if (status === "error" || !user) {
      fetchUser();
    }
  }, [status, user, fetchUser]);

  return (
    <S.Wrapper>
      <Sidebar logout={async () => {
        localStorage.clear();
        localStorage.setItem("tabs", JSON.stringify([{ id: 1, title: "Aba 1" }]));
        localStorage.setItem("selectedBots", JSON.stringify({}));
        await signOutAction()
      }}>
        <MenuItemST component={<Link href="/dashboard" />} collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />} active>
          Início
        </MenuItemST>
        <MenuItemST component={<Link href="/dashboard/operacao" />} collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />}>
          Operação
        </MenuItemST>
      </Sidebar>
      <Container>
        <Header name="Início" />
        {status === "loading" && <Loading message="Carregando dados" />}
        {status === "error" && <p>Erro ao carregar os dados do usuário</p>}
        {status === "success" && !user && <p>Nenhum usuário autenticado</p>}
        {user && (
          <Body>
            <S.Introduction>
              <p>Olá, {user.user_metadata.name || "Usuário"}</p>
            </S.Introduction>
            {userDeriv && <p>Conta Deriv vinculada: {userDeriv.email}</p>}
            <p style={{ margin: "3rem 0" }}>Ações principais</p>
            <CardContainer>
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
            </CardContainer>
          </Body>
        )}
      </Container>
    </S.Wrapper>
  );
}