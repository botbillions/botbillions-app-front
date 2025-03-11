// /api/save-bot.ts
import { createClient } from "@/utils/supabase/server"; // Verifique se o caminho está correto
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { botName, prompts, welcomeMessage, tradeOptions, xmlContent } = await req.json();

    if (!botName || !prompts || !tradeOptions || !xmlContent) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const config = {
      prompts,
      welcome_message: welcomeMessage,
      trade_options: tradeOptions,
    };

    const { data, error } = await supabase.from("bot-configs").insert({
      name: botName,
      xml_content: xmlContent, // Salva o XML como texto
      config, // Salva prompts, welcome_message e trade_options como JSONB
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Erro ao salvar no Supabase" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error saving bot:", error);
    return NextResponse.json({ error: "Erro interno ao salvar o bot" }, { status: 500 });
  }
}