// src/lib/firebase.ts
// Firebase initialization for Vite (use VITE_FIREBASE_... env vars).
// If you prefer CRA, replace import.meta.env with process.env.REACT_APP_...

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
} = import.meta.env as unknown as Record<string, string>;

export const isFirebaseConfigured = Boolean(VITE_FIREBASE_PROJECT_ID);

let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: VITE_FIREBASE_API_KEY,
    authDomain: VITE_FIREBASE_AUTH_DOMAIN,
    projectId: VITE_FIREBASE_PROJECT_ID,
    storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: VITE_FIREBASE_APP_ID,
  };

  firebaseApp = initializeApp(firebaseConfig);
  dbInstance = getFirestore(firebaseApp);
  authInstance = getAuth(firebaseApp);
}

export const db = dbInstance;
export const auth = authInstance;
