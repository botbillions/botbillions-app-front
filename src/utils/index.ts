import { redirect } from "next/navigation";
import { parseStringPromise } from "xml2js";
import * as zod from "zod";
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

export async function extractBotParams(xmlContent: string) {
  const parsedXml = await parseStringPromise(xmlContent);
  console.log("Parsed XML (partial):", JSON.stringify(parsedXml.xml.block.slice(0, 2), null, 2));
  const prompts: { id: string; text: string }[] = [];
  let welcomeMessage: string | null = null;
  const blocks = parsedXml.xml.block || [];

  const traverseBlocks = (blockArray: any[]) => {
    if (!Array.isArray(blockArray)) return;

    for (const block of blockArray) {
      if (block.$?.type === "variables_set") {
        const varId = block.field?.find((f: any) => f.$.name === "VAR")?.$.id;
        const promptBlock = block.value?.[0]?.block?.[0];

        if (promptBlock?.$?.type === "text_prompt_ext") {
          const promptText =
            promptBlock.value?.[0]?.block?.[0]?.field?.[0]?._ ||
            promptBlock.value?.[0]?.shadow?.[0]?.field?.[0]?._;
          if (varId && promptText) {
            console.log("Prompt extracted:", { varId, promptText });
            prompts.push({ id: varId, text: promptText });
          }
        }
      }

      if (!welcomeMessage && (block.$?.type === "text_print" || block.$?.type === "text_join")) {
        const textField =
          block.value?.[0]?.shadow?.[0]?.field?.[0]?._ ||
          block.value?.[0]?.block?.[0]?.field?.[0]?._;
        if (textField) {
          console.log("Found potential welcome message:", textField);
          welcomeMessage = textField;
        }
      }

      if (block.value) traverseBlocks(block.value.flatMap((v: any) => v.block || []));
      if (block.statement) traverseBlocks(block.statement.flatMap((s: any) => s.block || []));
      if (block.next) traverseBlocks(block.next.flatMap((n: any) => n.block || []));
    }
  };

  traverseBlocks(blocks);

  console.log("Preview - Prompts:", prompts);
  console.log("Preview - Welcome message:", welcomeMessage);

  return {
    preview: {
      prompts,
      welcomeMessage,
    },
    tradeOptions: {
      symbol: blocks.find((b: any) => b.$?.type === "trade")?.field?.find((f: any) => f.$.name === "SYMBOL_LIST")?._ || "R_10",
      contractType: "DIGITOVER",
      duration: 1,
      durationUnit: "t",
      currency: "USD",
    },
    xmlContent, 
  };
}