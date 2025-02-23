import { redirect } from "next/navigation";
import * as zod from "zod"
/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export const createNewFormSchema = zod.object({
  name: zod.string().min(1, { message: "Preencha o campo obrigatório*" }).trim().optional(),
  surname: zod.string().min(1, { message: "Preencha o campo obrigatório*" }).trim().optional(),
  email: zod.string().email({ message: "Email inválido*" }).trim().optional(),
  password: zod.string().min(6, { message: "Preencha o campo obrigatório*" }).trim(),
  phonenumber: zod.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, {
    message: "Número de telefone inválido*",
  }).trim().optional(),
});

export interface FormDataProps {
  name?: string;
  surname?:string;
  email?: string;
  password?: string;
  phonenumber?: string;
}


export type CreateNewFormData = zod.infer<typeof createNewFormSchema>;
