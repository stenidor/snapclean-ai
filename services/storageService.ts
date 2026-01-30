import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseStorage } from './firebase';
import { getFirebaseFirestore } from './firebase';

export interface SavedImageMeta {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: number;
}

function base64ToBlob(dataUrl: string, mimeType: string = 'image/png'): Blob {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  if (!base64) throw new Error('Invalid base64 image data');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export async function uploadGeneratedImage(
  base64Image: string,
  prompt: string
): Promise<SavedImageMeta> {
  const storage = getFirebaseStorage();
  const db = getFirebaseFirestore();
  const ext = base64Image.startsWith('data:image/') 
    ? (base64Image.match(/data:image\/(\w+)/)?.[1] || 'png') 
    : 'png';
  const mimeType = `image/${ext}`;
  const blob = base64ToBlob(base64Image, mimeType);
  const filename = `generated/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const storageRef = ref(storage, filename);

  await uploadBytes(storageRef, blob, { contentType: mimeType });
  const imageUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(db, 'generated_images'), {
    imageUrl,
    prompt,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    imageUrl,
    prompt,
    createdAt: Date.now(),
  };
}
