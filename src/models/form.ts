
import { createNewFormSchema } from "@/utils/form";
import * as zod from "zod";

export interface FormDataProps {
  name?: string;
  surname?:string;
  email?: string;
  password?: string;
  phonenumber?: string;
}


export type CreateNewFormData = zod.infer<typeof createNewFormSchema>;
