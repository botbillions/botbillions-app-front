"use client"

import * as S from "./styles";
import BtnAction from "@/components/BtnAction";

export default function Home() {

  return (
    <S.Wrapper>
    <S.ContainerHome>
      <S.Body>
        <S.CardBtnBox>
              <BtnAction name="Entrar" alt="entrar na conta de usuário da empresa" link="/auth/login" outlined="outlined" />
              <BtnAction name="Criar conta" alt="criar conta de usuário de empresa" link="/auth/create" />
          </S.CardBtnBox>
      </S.Body>
    </S.ContainerHome>
  </S.Wrapper>
  );
}
