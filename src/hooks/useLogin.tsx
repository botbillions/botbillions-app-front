"use client";

import { useForm } from "react-hook-form";
import { createNewFormSchema, type CreateNewFormData, type FormDataProps } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { userAuthenticated } from "@/services/actions/auth-actions";

export const useLogin = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateNewFormData>({
    resolver: zodResolver(createNewFormSchema),
  });

  //const userInfo = await userAuthenticated();

  return {
    register,
    handleSubmit,
    reset,
    errors
  };
};
