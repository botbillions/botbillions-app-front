"use client";

import BtnAction from "@/components/BtnAction";
import { FormMessage } from "@/components/forms/form-message";
import { Label } from "@/components/forms/label";
import { StyledForm, StyledInput, StyledTitle } from "@/components/forms/styles";
import { SubmitButton } from "@/components/forms/submit-button";
import { useLogin } from "@/hooks/useLogin";
import { signUpAction } from "@/services/actions/supabase-actions";
import type { CreateNewFormData } from "@/utils/utils";
import { useMutation } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as S from "./styles";


export default function Create() {
  const { handleSubmit, register, reset } = useLogin();

  const { mutate, isPending } = useMutation({
    mutationFn: signUpAction,
  });

  const createNewContact = (data: CreateNewFormData) => {
    mutate(data, {
      onSuccess: () => reset(),
    });
  };
  return (
    <>
      <BtnAction
        icon={true}
        src="/return-icon.svg"
        name="Voltar"
        link="/"
        style={{ top: "0", left: "0", marginTop: "2rem", marginLeft: "2rem", position: "fixed", maxHeight: "2rem", width: "fit-content" }}
      />
      <ToastContainer />
      <S.ContainerLogin>
        <StyledForm onSubmit={handleSubmit(createNewContact)}>
          <StyledTitle>Crie sua conta</StyledTitle>
          <S.InputContainer>
            <Label htmlFor="name">Nome</Label>
            <StyledInput id="name" placeholder="Seu nome completo" required type="text"
              {...register("name")}
            />
            <Label htmlFor="surname">Como gostaria de ser chamado?</Label>
            <StyledInput id="surname" placeholder="Ex: Bob" required type="text"
              {...register("surname")}
            />
            <Label htmlFor="email">Email</Label>
            <StyledInput id="email" placeholder="you@example.com" required type="email"
              {...register("email")}
            />
            <Label htmlFor="password">Senha</Label>
            <StyledInput type="password" id="password" placeholder="••••••••" required
              {...register("password")}
            />
            <SubmitButton pendingText="Criando ..." isPending={isPending} >Criar</SubmitButton>
            <FormMessage />
          </S.InputContainer>
        </StyledForm>
      </S.ContainerLogin>
    </>
  );
}
