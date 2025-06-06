"use client";

import Body from "@/components/Body";
import BtnAction from "@/components/BtnAction";
import Container from "@/components/Container";
import Loading from "@/components/Loading";
import Header from "@/components/Header";
import Inicio from "@/components/icons/Inicio";
import Sidebar from "@/components/Sidebar";
import { MenuItemST } from "@/components/Sidebar/styles";
import { Tabs } from "@/components/Tabs";
import { TabContent } from "@/components/TabsContent";
import { useDeriv } from "@/contexts/DerivContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useUser } from "@/contexts/UserContext";
import { useTabs } from "@/hooks/useTabs";
import { signOutAction } from "@/services/actions/auth/supabase-actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as S from "./styles";

const Operacao = () => {
  const { collapsed } = useSidebar();
  const { user } = useUser();
  const { botsDeriv, userDeriv, status } = useDeriv();
  const searchParams = useSearchParams();
  const { tabs, selectedBots, addTab, removeTab, selectBot, clearSelectedBot } = useTabs();

  const activeTabId = parseInt(searchParams.get("tab") || "1", 10);

  return (
    <S.Wrapper>
      <Sidebar
        logout={async () => {
          localStorage.clear();
          localStorage.setItem("tabs", JSON.stringify([{ id: 1, title: "Aba 1" }]));
          localStorage.setItem("selectedBots", JSON.stringify({}));
          await signOutAction();
        }}
      >
        <MenuItemST
          component={<Link href="/dashboard" />}
          collapsed={collapsed ? "collapsed" : undefined}
          icon={<Inicio />}
        >
          Início
        </MenuItemST>
        <MenuItemST
          component={<Link href="/dashboard/operacao" />}
          collapsed={collapsed ? "collapsed" : undefined}
          icon={<Inicio />}
          active
        >
          Operação
        </MenuItemST>
      </Sidebar>
      <Container>
        <Header name="Operação" />
        <Body>
          {status === "loading" ? (
            <Loading message="Carregando dados" />
          ) : user && userDeriv && botsDeriv ? (
            <Tabs tabs={tabs} activeTabId={activeTabId} onAddTab={addTab} onRemoveTab={removeTab}>
              {tabs?.map((tab) => (
                <div
                  key={tab.id}
                  className={`tab-pane ${activeTabId === tab.id ? "active show" : "d-none"}`}
                >
                  <TabContent
                    key={tab.id}
                    tabId={tab.id}
                    activeTabId={activeTabId}
                    selectedBot={selectedBots[tab.id] || null}
                    bots={botsDeriv}
                    onSelectBot={selectBot}
                    onClearSelectedBot={clearSelectedBot}
                    userDeriv={userDeriv}
                  />
                </div>
              ))}
            </Tabs>
          ) : (
            <S.Conect>
              <p>Você precisa conectar-se ou criar uma conta na corretora para negociar com ela</p>
              <div>
                <BtnAction name="Conectar" link={process.env.NEXT_PUBLIC_DERIV_LOGIN} />
                <BtnAction name="Criar conta" link={process.env.NEXT_PUBLIC_DERIV_CREATE} />
              </div>
              <p style={{ maxWidth: "35rem", textAlign: "center" }}>
                * Observação: Se esta for sua primeira conexão, verifique a opção "autorizar" quando a
                corretora exibir opções de permissão.
              </p>
            </S.Conect>
          )}
        </Body>
      </Container>
    </S.Wrapper>
  );
};

export default Operacao;