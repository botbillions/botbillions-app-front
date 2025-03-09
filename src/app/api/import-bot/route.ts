"use server";

import { createClient } from "@/utils/supabase/server"; // Verifique se o caminho está correto
import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

// Função para extrair variáveis do XML
async function extractBotParams(xmlContent: string) {
  const parsedXml = await parseStringPromise(xmlContent);
  const prompts: { [key: string]: string } = {};
  const blocks = parsedXml.xml.block || [];

  for (const block of blocks) {
    if (block.$?.type === "text_prompt_ext") {
      const varId = block.field?.find((f: any) => f.$.name === "VAR")?.$.id;
      const promptText = block.value?.[0]?.shadow?.[0]?.field?.[0]?._;
      if (varId && promptText) {
        prompts[varId] = promptText;
      }
    }
  }

  return {
    prompts,
    tradeOptions: {
      symbol:
        blocks.find((b: any) => b.$?.type === "trade")?.field?.find((f: any) => f.$.name === "SYMBOL_LIST")?._ || "R_10",
      contractType: "DIGITOVER",
      duration: 1,
      durationUnit: "t",
      currency: "USD",
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Inicializar o Supabase dentro da função POST
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const botName = formData.get("botName") as string;

    if (!file || !botName) {
      return NextResponse.json(
        { error: "Arquivo XML e nome do bot são obrigatórios" },
        { status: 400 }
      );
    }

    // Ler o conteúdo do arquivo XML
    const xmlContent = await file.text();
    const botConfig = await extractBotParams(xmlContent);

    // Salvar no Supabase
    const { error } = await supabase.from("bot_configs").insert({
      name: botName,
      xml_content: xmlContent, // Salva o XML bruto
      config: botConfig,       // Configuração parseada
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      return NextResponse.json({ error: "Erro ao salvar o bot" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Bot importado com sucesso" });
  } catch (error) {
    console.error("Erro ao importar bot:", error);
    return NextResponse.json({ error: "Erro ao importar o bot" }, { status: 500 });
  }
}