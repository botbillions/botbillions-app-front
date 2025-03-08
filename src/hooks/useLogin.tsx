"use client";

import { linkDerivAccount, userAuthenticated } from "@/services/actions/supabase-actions";
import { createNewFormSchema, type CreateNewFormData } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { useForm } from "react-hook-form";

type UserDeriv = {
  email: string;
};

export const useLogin = (urlSearch?: string) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateNewFormData>({
    resolver: zodResolver(createNewFormSchema),
  });
  const [user, setUser] = useState<User | null>(null);
  const [userDeriv, setUserDeriv] = useState<UserDeriv | null>(null);

  const fetchUser = async () => {
    try {
      const authenticatedUser = await userAuthenticated();
      setUser(authenticatedUser);
    } catch (err) {
      console.error("Erro ao buscar usuário autenticado:", err);
    }
  };

  const fetchUserDeriv = async () => {
    const derivCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("derivData="));
    const derivDataFromCookie = derivCookie ? JSON.parse(derivCookie.split("=")[1]) : null;

    if (derivDataFromCookie && derivDataFromCookie.email) {
      console.log("Dados da Deriv encontrados no cookie:", derivDataFromCookie);
      setUserDeriv({ email: derivDataFromCookie.email });
      return;
    }
    if (!urlSearch) {
      console.log("Nenhum urlSearch ou já buscado, abortando fetchUserDeriv");
      return;
    }

    const params = new URLSearchParams(urlSearch);
    const token = params.get("token1") || "";

    if (!token) {
      console.log("Nenhum token encontrado nos parâmetros");
      return;
    }

    console.log("Iniciando fetchUserDeriv com token:", token);
    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${process.env.NEXT_PUBLIC_DERIV_APPID}`);

    ws.onopen = () => {
      console.log("WebSocket conectado, enviando autorização...");
      ws.send(
        JSON.stringify({
          authorize: token,
          req_id: 1,
        })
      );
    };

    ws.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      console.log("Resposta da autorização:", response);

      if (response.error) {
      } else {
        const email = response.authorize?.email || "email não encontrado";
        setUserDeriv({ email });
        document.cookie = `derivData=${JSON.stringify({ email })}; path=/; max-age=${60 * 60 * 24}`; // 1 dia

        // Vincular no Supabase
        await linkDerivAccount(email);
      }
      ws.close();
    };

    ws.onerror = (err) => {
      console.error("Erro no WebSocket:", err);
      ws.close();
    };

    ws.onclose = () => {
      console.log("Conexão WebSocket fechada");
    };
  };

  return {
    register,
    handleSubmit,
    reset,
    errors,
    fetchUser,
    user,
    userDeriv,
    fetchUserDeriv,
  };
};