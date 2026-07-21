/**
 * Firebase client SDK setup. These NEXT_PUBLIC_FIREBASE_* values are
 * public identifiers (not secrets) — Firebase's actual access control is
 * enforced server-side via Security Rules / the backend's ID-token
 * verification, not by hiding this config. Safe to bake into the client
 * bundle and to commit to a public repo.
 *
 * Get these values from Firebase Console → Project Settings → General →
 * "Your apps" → Web app (or add one if you haven't yet).
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initializing Firebase Auth touches `window`/browser APIs indirectly and
// throws immediately on an invalid/missing API key — which is exactly the
// case during `next build`'s server-side prerender pass, where no real
// .env is present. Deferring both initializeApp and getAuth until a
// browser actually calls getFirebaseAuth() keeps the build green without
// needing real Firebase credentials at build time.
let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!cachedApp) {
    cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available in the browser.');
  }
  if (!cachedAuth) {
    cachedAuth = getAuth(getFirebaseApp());
  }
  return cachedAuth;
}
