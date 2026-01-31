export const editImage = async (
  base64Image: string,
  prompt: string,
  _mimeType?: string
): Promise<string> => {
  const res = await fetch('/api/edit-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, prompt }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return data.image;
};
