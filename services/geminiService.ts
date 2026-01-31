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

  const text = await res.text();
  let data: { image?: string; error?: string };
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text || `Erreur serveur (${res.status})`);
  }
  if (!res.ok) {
    throw new Error(data?.error || text || `Erreur API (${res.status})`);
  }
  if (!data?.image) {
    throw new Error(data?.error || 'Réponse invalide du serveur');
  }
  return data.image;
};
