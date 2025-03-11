"use server";

import { type FormDataProps } from "@/utils/";
import { cookiesHelper } from "@/utils/cookies";
import { createClient } from "@/utils/supabase/server";
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
  cookiesHelper.removeAll();
  return redirect("/");
};

export const signInAction = async (formData?: FormDataProps) => {
  const email = formData?.email as string;
  const password = formData?.password as string;
  const supabase = await createClient();

  // Fazer login e pegar os dados do usuário
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Tratamento de erros iniciais
  if (error) {
    const errorMessages = {
      'invalid_credentials': 'Credenciais inválidas',
      'email_not_confirmed': 'Email não confirmado',
      'user_not_found': 'Usuário não encontrado'
    };
    
    const errorMessage = errorMessages[error.code as keyof typeof errorMessages] || 
                        'Ocorreu um erro durante o login';
    
    return {
      success: false,
      message: errorMessage,
      error: error.code
    };
  }

  // Verificar se temos um usuário válido
  if (!user) {
    return {
      success: false,
      message: 'Usuário não encontrado',
      error: 'user_not_found'
    };
  }

  // Verificar se o email foi confirmado
  if (!user.email_confirmed_at) {
    return {
      success: false,
      message: 'Por favor, confirme seu email antes de fazer login',
      error: 'email_not_confirmed'
    };
  }

  return {
    success: true,
    redirect: '/dashboard',
    message: 'Login realizado com sucesso'
  };
};

export const signInAdminAction = async (formData?: FormDataProps) => {
  const email = formData?.email as string;
  const password = formData?.password as string;
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const errorMessages = {
      'invalid_credentials': 'Credenciais inválidas',
      'email_not_confirmed': 'Email não confirmado',
      'user_not_found': 'Usuário não encontrado'
    };
    
    const errorMessage = errorMessages[error.code as keyof typeof errorMessages] || 
                        'Ocorreu um erro durante o login';
    
    return {
      success: false,
      message: errorMessage,
      error: error.code
    };
  }

  if (!user) {
    return {
      success: false,
      message: 'Usuário não encontrado',
      error: 'user_not_found'
    };
  }

  const { data: admin, error: adminError } = await supabase
    .from('admin')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (adminError || !admin) {
    return {
      success: false,
      message: 'Este usuário não tem permissões de administrador',
      error: 'not_admin'
    };
  }

  return {
    success: true,
    redirect: '/admin',
    message: 'Login realizado com sucesso'
  };
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
