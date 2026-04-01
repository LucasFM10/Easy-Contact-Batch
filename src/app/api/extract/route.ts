import { NextRequest, NextResponse } from "next/server";
import { geminiModel, EXTRACTION_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const allContacts: any[] = [];

    // Extract contacts from each file sequentially to avoid ignoring images
    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const promptParts = [
          {
            inlineData: {
              data: buffer.toString("base64"),
              mimeType: file.type,
            },
          },
          { text: EXTRACTION_PROMPT }
        ];

        const result = await geminiModel.generateContent(promptParts);
        const responseText = result.response.text();
        console.log(`Gemini Raw Response for ${file.name}:`, responseText);

        // Robust JSON extraction for models without JSON mode
        let cleanJson = responseText.trim();
        const jsonMatch = cleanJson.match(/\[[\s\S]*\]/);
        
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
        if (Array.isArray(data)) {
          allContacts.push(...data);
        }
      } catch (fileError) {
        console.error(`Extraction error for file ${file.name}:`, fileError);
        // Continue processing other files even if one fails
      }
    }

    return NextResponse.json(allContacts);
  } catch (error: any) {
    console.error("General API error:", error);
    return NextResponse.json({ error: error.message || "Falha ao extrair dados" }, { status: 500 });
  }
}
