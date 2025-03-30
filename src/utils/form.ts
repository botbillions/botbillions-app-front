import * as zod from "zod";

export const createNewFormSchema = zod.object({
  name: zod.string().min(1, { message: "Preencha o campo obrigatório*" }).trim().optional(),
  surname: zod.string().min(1, { message: "Preencha o campo obrigatório*" }).trim().optional(),
  email: zod.string().email({ message: "Email inválido*" }).trim().optional(),
  password: zod.string().min(6, { message: "Preencha o campo obrigatório*" }).trim(),
  phonenumber: zod.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, {
    message: "Número de telefone inválido*",
  }).trim().optional(),
});