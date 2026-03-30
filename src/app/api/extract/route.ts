import { NextRequest, NextResponse } from "next/server";
import { geminiModel, EXTRACTION_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const promptParts: any[] = [];

    // Add all files contents to the prompt parts for Gemini
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      promptParts.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type,
        },
      });
    }

    // Add the extraction prompt at the end
    promptParts.push({ text: EXTRACTION_PROMPT });

    const result = await geminiModel.generateContent(promptParts);

    const responseText = result.response.text();
    console.log("Gemini Raw Response (Gemma/Manual JSON):", responseText);

    // Robust JSON extraction for models without JSON mode
    let cleanJson = responseText.trim();
    
    // Extract the content within the first [ and the last ]
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    } else {
      // Fallback: remove markdown blocks if regex fails to find clear array
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
    }

    const data = JSON.parse(cleanJson);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error.message || "Falha ao extrair dados" }, { status: 500 });
  }
}
