"use server";

import { createClient } from "@/utils/supabase/server";
import { type FormDataProps } from "@/utils/utils";
import { redirect } from "next/navigation";

export const userAuthenticated = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const signInAction = async (formData?: FormDataProps) => {
  const email = formData?.email as string;
  const password = formData?.password as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage =
      error.code === "invalid_credentials" ? "Credenciais inválidas" : "Email não confirmado";
    return { success: false, message: errorMessage };
  }

  return redirect("/dashboard");
};

export const signInAdminAction = async (formData?: FormDataProps) => {
  const email = formData?.email as string;
  const password = formData?.password as string;
  const supabase = await createClient();

  const { data:{user},error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage =
      error.code === "invalid_credentials" ? "Credenciais inválidas" : "Email não confirmado";
    return { success: false, message: errorMessage };
  }
  if(user){
    const {data:admin} = await supabase.from('admin').select('user_id').eq('user_id',user.id).single();
    console.log(admin)
    return redirect("/admin");
  }

};

export const signUpAction = async (formData?: FormDataProps) => {
  const supabase = await createClient();

  const email = formData?.email as string;
  const password = formData?.password as string;
  const name = formData?.name as string;
  const surname = formData?.surname as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        name: surname,
      },
    },
  });

  if (error) {
    console.error("Credencial não criada:", error.message);
    return { success: false, message: error.message };
  }

  return redirect("/auth/login");
};

export const updateAction = async (formData?: FormDataProps) => {
  const supabase = await createClient();

  const email = formData?.email as string;
  const password = formData?.password as string;
  const name = formData?.name as string;
  const surname = formData?.surname as string;

  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session) {
    console.error("Usuário não atualizado: Sessão ausente!");
    return { success: false, message: "Sessão ausente! Faça login novamente." };
  }

  const { data, error } = await supabase.auth.updateUser({
    email,
    password,
    data: {
      full_name: name,
      name: surname,
    },
  });

  if (error) {
    console.error("Usuário não atualizado:", error.message);
    return { success: false, message: error.message };
  }

  if (data.user) {
    await signOutAction();
    return redirect("/");
  }
};

export const linkDerivAccount = async (emailDeriv: string) => {
  const supabase = await createClient();

  // Obter o usuário autenticado
  const user = await userAuthenticated();
  if (!user) {
    console.error("Usuário não autenticado ao tentar vincular conta Deriv");
    return { success: false, message: "Usuário não autenticado" };
  }


  const { error } = await supabase.from("deriv-vinculo").insert({
    email_deriv: emailDeriv,
    user_plataforma: user.id
  });

  if (error) {
    console.error("Erro ao vincular conta Deriv no Supabase:", error.message);
    return { success: false, message: error.message };
  }

  console.log("Conta Deriv vinculada com sucesso:", { emailDeriv, user_plataforma: user.id });
  return { success: true, message: "Conta Deriv vinculada com sucesso" };
};