"use client";

import BtnAction from "@/components/BtnAction";
import { FormMessage } from "@/components/forms/form-message";
import { Label } from "@/components/forms/label";
import { StyledForm, StyledInput, StyledTitle } from "@/components/forms/styles";
import { SubmitButton } from "@/components/forms/submit-button";
import { useLogin } from "@/hooks/useLogin";
import { signInAdminAction } from "@/services/actions/auth/supabase-actions";
import type { CreateNewFormData } from "@/utils/utils";
import { useMutation } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as S from "./styles";


export default function Login() {
  const { handleSubmit, register, reset } = useLogin();
  const { mutate, isPending } = useMutation({
    mutationFn: signInAdminAction,
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
          <StyledTitle>Acesse sua conta</StyledTitle>
          <S.InputContainer>
            <Label htmlFor="email">Email</Label>
            <StyledInput id="email" placeholder="you@example.com" required type="email"
              {...register("email")}
            />
            <Label htmlFor="password">Senha</Label>
            <StyledInput type="password" id="password" placeholder="••••••••" required
              {...register("password")}
            />
            <SubmitButton pendingText="Entrando ..." isPending={isPending}>Entrar</SubmitButton>
            <FormMessage />
          </S.InputContainer>
        </StyledForm>
      </S.ContainerLogin>
    </>
  );
}
