// /pages/api/save-bot.ts

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. ADICIONADO 'strategy' À DESESTRUTURAÇÃO
    const { botName, prompts, welcomeMessage, tradeOptions, strategy, xmlContent } = await req.json();

    if (!botName || !prompts || !tradeOptions || !xmlContent) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 2. ADICIONADO 'strategy' AO OBJETO DE CONFIGURAÇÃO
    const config = {
      prompts,
      welcome_message: welcomeMessage,
      trade_options: tradeOptions,
      strategy, // <-- AQUI
    };

    const { data, error } = await supabase.from("bot-configs").insert({
      name: botName,
      xml_content: xmlContent,
      config, 
    }).select(); // .select() é bom para retornar o dado inserido

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Erro ao salvar no Supabase" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] }, { status: 200 });
  } catch (error) {
    console.error("Error saving bot:", error);
    return NextResponse.json({ error: "Erro interno ao salvar o bot" }, { status: 500 });
  }
}