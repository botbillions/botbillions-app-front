import { extractBotParams } from '@/utils/bot';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const botName = formData.get('botName') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!botName) {
      return NextResponse.json({ error: 'Nome do bot não fornecido.' }, { status: 400 });
    }

    const xmlContent = await file.text();
    const botParams = await extractBotParams(xmlContent);

    return NextResponse.json({
      success: true,
      preview: botParams.preview,
      tradeOptions: botParams.tradeOptions,
      strategy: botParams.strategy,
      xmlContent,
    });
  } catch (error) {
    console.error('Erro ao importar bot:', error);
    return NextResponse.json({ error: 'Falha ao importar bot.' }, { status: 500 });
  }
}