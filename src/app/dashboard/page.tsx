"use client";

import Body from "@/components/Body";
import Card from "@/components/Card";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Inicio from "@/components/icons/Inicio";
import Loading from "@/components/Loading";
import Sidebar from "@/components/Sidebar";
import { MenuItemST } from "@/components/Sidebar/styles";
import { useSidebar } from "@/contexts/SidebarContext";
import { useUser } from "@/contexts/UserContext";
import { signOutAction } from "@/services/actions/supabase-actions";
import Link from "next/link";
import * as S from "./styles";

export default function Dashboard() {
  const { collapsed } = useSidebar();
  const { user, userDeriv, status } = useUser();

  return (
    <S.Wrapper>
      <Sidebar logout={async () => await signOutAction()}>
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
        {user && (
          <Body>
            <S.Introduction>
              <p>Olá, {user.user_metadata.name}</p>
            </S.Introduction>
            {userDeriv && <p>Conta Deriv vinculada: {userDeriv.email}</p>}
            <p style={{ margin: "3rem 0" }}>Ações principais</p>
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