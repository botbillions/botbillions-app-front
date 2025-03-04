"use client"

import Body from "@/components/Body";
import BtnAction from "@/components/BtnAction";
import * as S from "./styles";

export default function Home() {

  return (
    <S.Wrapper>
      <S.ContainerHome>
        <Body>
          <S.CardBtnBox>
            <BtnAction name="Entrar" alt="entrar na conta de usuário da empresa" link="/auth/login" outlined="outlined" />
            <BtnAction name="Criar conta" alt="criar conta de usuário de empresa" link="/auth/create" />
          </S.CardBtnBox>
        </Body>
      </S.ContainerHome>
    </S.Wrapper>
  );
}
