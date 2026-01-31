import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Logique d'édition d'image via Gemini - UNIQUEMENT côté serveur.
 * La clé API n'est jamais exposée au client.
 */
export async function editImageServer(
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/png'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1] || base64Image,
            mimeType,
          },
        },
        {
          text: `Follow these instructions to edit the provided product photo: ${prompt}. Return ONLY the edited image.`,
        },
      ],
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No response generated from the model.");
  }

  const parts = response.candidates[0].content.parts;
  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error(
    "The model did not return an image: " + (parts[0]?.text || "Unknown error")
  );
}
