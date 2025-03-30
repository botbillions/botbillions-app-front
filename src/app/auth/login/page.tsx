"use client";

import BtnAction from "@/components/BtnAction";
import { Label } from "@/components/forms/label";
import { StyledForm, StyledInput, StyledTitle } from "@/components/forms/styles";
import { SubmitButton } from "@/components/forms/submit-button";
import { useLogin } from "@/hooks/useLogin";
import type { CreateNewFormData } from "@/models/form";
import { signInAction } from "@/services/actions/auth/supabase-actions";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as S from "./styles";

export default function Login() {
  const { handleSubmit, register, reset } = useLogin();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: signInAction,
    onSuccess: (data) => {
      if (data.success && data.redirect) {
        toast.success(data.message);
        setTimeout(() => router.push(data.redirect), 1000);
      } else {
        toast.error(data.message);
      }
      if (data.success) {
        reset();
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao fazer login");
    },
  });

  const createNewContact = (data: CreateNewFormData) => {
    mutate(data);
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
      <ToastContainer position="top-right" autoClose={3000} />
      <S.ContainerLogin>
        <StyledForm onSubmit={handleSubmit(createNewContact)}>
          <StyledTitle>Acesse sua conta</StyledTitle>
          <S.InputContainer>
            <Label htmlFor="email">Email</Label>
            <StyledInput
              id="email"
              placeholder="you@example.com"
              required
              type="email"
              {...register("email")}
            />
            <Label htmlFor="password">Senha</Label>
            <StyledInput
              type="password"
              id="password"
              placeholder="••••••••"
              required
              {...register("password")}
            />
            <SubmitButton
              pendingText="Entrando ..."
              isPending={isPending}
            >
              Entrar
            </SubmitButton>
          </S.InputContainer>
        </StyledForm>
      </S.ContainerLogin>
    </>
  );
}