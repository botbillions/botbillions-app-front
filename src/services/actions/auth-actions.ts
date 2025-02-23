
"use server"

import { type FormDataProps } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";




export const userAuthenticated = async () =>{
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user;
}

export const signOutAction = async() =>{
  const supabase = await createClient();

  await supabase.auth.signOut();
  return redirect("/");
}

export const signInAction = async (formData?: FormDataProps) => {
  const email = formData?.email as string;
  const password = formData?.password as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });



  if (error) {
    let errorMessage = error.code === "invalid_credentials" ? "Credenciais inválidas" : "Email não confirmado";
    return { success: false, message: errorMessage };
  }

  return redirect("/dashboard");
};

export const signUpAction = async (formData?: FormDataProps) => {  
  const supabase = await createClient();

  const email = formData?.email as string;
  const password = formData?.password as string;
  const name = formData?.name as string;
  const surname = formData?.surname as string 

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options:{
      data:{
        full_name: name,
        name: surname
      }
    }
  });

  if (error) {
    console.error("Credencial não criada:", error.message);
    return { success: false, message:error.message};
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