"use client";

import { createNewFormSchema, type CreateNewFormData } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

export const useLogin = () => {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard"
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateNewFormData>({
    resolver: zodResolver(createNewFormSchema),
  });

  return {
    register,
    handleSubmit,
    reset,
    errors,
    redirect
  };
};