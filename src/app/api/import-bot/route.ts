import { extractBotParams } from "@/utils/";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const xmlContent = await file.text();
    const botParams = await extractBotParams(xmlContent);

    return NextResponse.json({
      success: true,
      preview: botParams.preview,
      tradeOptions: botParams.tradeOptions,
      xmlContent: botParams.xmlContent, 
    });
  } catch (error) {
    console.error("Error importing bot:", error);
    return NextResponse.json({ error: "Failed to import bot" }, { status: 500 });
  }
}