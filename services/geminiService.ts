
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const editImage = async (base64Image: string, prompt: string, mimeType: string = 'image/png'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: mimeType,
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

    throw new Error("The model did not return an image. It might have returned text instead: " + (parts[0]?.text || "Unknown error"));
  } catch (error) {
    console.error("Gemini Image Editing Error:", error);
    throw error;
  }
};
