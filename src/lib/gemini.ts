import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemma-3-12b-it",
  generationConfig: {
    // responseMimeType: "application/json" removed as it's not supported by gemma models
  },
});

export const EXTRACTION_PROMPT = `
Extract the contact information from this image of a table. 

CRITICAL: Return ONLY a valid JSON array. Do not include markdown formatting or backticks like \`\`\`json. 
Do not include any preamble or introductory text. Output only the RAW JSON array.

Example structure:
[
  {"nome": "Ana Luiza", "paroquia": "PSPP", "ano": "2024", "circulo": "Amarelo", "telefone": "993421360"},
  ...
]

Return an empty array [] if no contacts are found.
`;

export async function extractContactsFromImage(imageBuffer: Buffer, mimeType: string) {
  const result = await geminiModel.generateContent([
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType,
      },
    },
    EXTRACTION_PROMPT,
  ]);

  const responseText = result.response.text();
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse Gemini response:", responseText);
    throw new Error("Invalid output from AI");
  }
}
