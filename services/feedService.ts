import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';

export interface FeedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: number;
}

let lastDoc: QueryDocumentSnapshot | null = null;

function docToImage(doc: QueryDocumentSnapshot): FeedImage {
  const d = doc.data();
  const createdAt = d.createdAt?.toMillis?.() ?? Date.now();
  return {
    id: doc.id,
    imageUrl: d.imageUrl ?? '',
    prompt: d.prompt ?? '',
    createdAt,
  };
}

export async function fetchFeedImages(count: number = 20, reset = false): Promise<FeedImage[]> {
  if (reset) lastDoc = null;

  const db = getFirebaseFirestore();
  const coll = collection(db, 'generated_images');

  let q = query(
    coll,
    orderBy('createdAt', 'desc'),
    limit(count)
  );

  if (lastDoc) {
    q = query(
      coll,
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(count)
    );
  }

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  return snapshot.docs.map(docToImage);
}

export function subscribeToFeedImages(
  count: number,
  onUpdate: (images: FeedImage[]) => void
): () => void {
  const db = getFirebaseFirestore();
  const coll = collection(db, 'generated_images');
  const q = query(
    coll,
    orderBy('createdAt', 'desc'),
    limit(count)
  );

  return onSnapshot(q, (snapshot) => {
    const images = snapshot.docs.map(docToImage);
    onUpdate(images);
  });
}

export function resetFeedCursor() {
  lastDoc = null;
}
