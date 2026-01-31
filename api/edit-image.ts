import type { VercelRequest, VercelResponse } from '@vercel/node';
import { editImageServer } from '../services/geminiApiServer';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { image, prompt } = req.body || {};
  if (!image || !prompt) {
    res.status(400).json({ error: 'Missing image or prompt' });
    return;
  }

  try {
    const result = await editImageServer(image, prompt);
    res.status(200).json({ image: result });
  } catch (err: unknown) {
    console.error('Gemini API Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
