'use client'

import Body from "@/components/Body";
import BtnAction from "@/components/BtnAction";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Inicio from "@/components/icons/Inicio";
import Sidebar from "@/components/Sidebar";
import { MenuItemST } from "@/components/Sidebar/styles";
import { useDeriv } from "@/contexts/DerivContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useUser } from "@/contexts/UserContext";
import { signOutAction } from "@/services/actions/auth/supabase-actions";
import Link from "next/link";
import * as S from "./styles";

const Operacao = () => {
  const { collapsed } = useSidebar();
  const { user, userDeriv } = useUser();
  const { botsDeriv } = useDeriv();

  return (
    <S.Wrapper>
      <Sidebar logout={async () => await signOutAction()}>
        <MenuItemST component={<Link href="/dashboard" />} collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />}> Início </MenuItemST>
        <MenuItemST component={<Link href="/dashboard/operacao" />} collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />} active> Operação </MenuItemST>
      </Sidebar>
      <Container>
        <Header name="Operação">
        </Header>
        <Body>
          {(user && userDeriv && botsDeriv) ? (
            botsDeriv.map(bot => (
              <div id={bot.id}>
                <p>{bot.name}</p>
              </div>
            ))
          ) : (
            <S.Conect>
              <p>Você precisa conectar-se ou criar uma conta na corretora para negociar com ela</p>
              <div>
                <BtnAction name="Conectar" link={process.env.NEXT_PUBLIC_DERIV_LOGIN} />
                <BtnAction name="Criar conta" link={process.env.NEXT_PUBLIC_DERIV_CREATE} />
              </div>
              <p style={{ maxWidth: "35rem", textAlign: "center" }}>* Observação: Se esta for sua primeira conexão, verifique a opção "autorizar" quando a corretora exibir opções de permissão.</p>
            </S.Conect>
          )}
        </Body>
      </Container>
    </S.Wrapper>
  )
}

export default Operacao