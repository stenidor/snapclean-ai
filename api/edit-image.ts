import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const MODEL_NAME = 'gemini-2.5-flash-image';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { image, prompt } = req.body || {};
  if (!image || !prompt) {
    res.status(400).json({ error: 'Missing image or prompt' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.split(',')[1] || image;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          },
          {
            text: `Follow these instructions to edit the provided product photo: ${prompt}. Return ONLY the edited image.`,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      res.status(500).json({ error: 'No response from the model' });
      return;
    }

    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        const result = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        res.status(200).json({ image: result });
        return;
      }
    }
    res.status(500).json({ error: 'Model did not return an image' });
  } catch (err: unknown) {
    console.error('Gemini API Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
