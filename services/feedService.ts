import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  type DocumentSnapshot,
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

export async function fetchFeedImages(count: number = 20): Promise<FeedImage[]> {
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

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    const createdAt = d.createdAt?.toMillis?.() ?? Date.now();
    return {
      id: doc.id,
      imageUrl: d.imageUrl ?? '',
      prompt: d.prompt ?? '',
      createdAt,
    };
  });
}

export function resetFeedCursor() {
  lastDoc = null;
}
