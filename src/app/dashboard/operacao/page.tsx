'use client'

import Body from "@/components/Body";
import BtnAction from "@/components/BtnAction";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Inicio from "@/components/icons/Inicio";
import Sidebar from "@/components/Sidebar";
import { MenuItemST } from "@/components/Sidebar/styles";
import { useSidebar } from "@/contexts/SidebarContext";
import { useLogin } from "@/hooks/useLogin";
import { signOutAction } from "@/services/actions/auth-actions";
import { useEffect } from "react";
import * as S from "./styles";

const Operaco = () => {
  const { collapsed } = useSidebar();
  const { fecthUser, user, userDeriv } = useLogin();
  useEffect(() => {
    fecthUser()
  }, [])
  return (
    <S.Wrapper>
      <Sidebar logout={async () => await signOutAction()}>
        <MenuItemST collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />} href="/dashboard"> Início </MenuItemST>
        <MenuItemST collapsed={collapsed ? "collapsed" : undefined} icon={<Inicio />} active> Operacao </MenuItemST>
      </Sidebar>
      <Container>
        <Header name="Operação">
        </Header>
        <Body>
          {(user && userDeriv) ? (
            <>logado</>
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

export default Operaco