"use client";

import { userAuthenticated } from "@/services/actions/auth-actions";
import { createNewFormSchema, type CreateNewFormData } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useLogin = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateNewFormData>({
    resolver: zodResolver(createNewFormSchema),
  });
  const [user, setUser] = useState<User | null>();
  const [userDeriv, setUserDeriv] = useState<UserDeriv | null>();
  const fecthUser = async () => {
    setUser(await userAuthenticated());
  }

  return {
    register,
    handleSubmit,
    reset,
    errors,
    fecthUser,
    user,
    userDeriv
  };
};
