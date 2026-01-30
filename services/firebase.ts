import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.storageBucket;
    if (!hasConfig) {
      throw new Error('Firebase config missing. Add VITE_FIREBASE_* vars in .env.local and Vercel.');
    }
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseStorage() {
  return getStorage(getApp());
}

export function getFirebaseFirestore() {
  return getFirestore(getApp());
}
