import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";

// Read config from environment variables. Use NEXT_PUBLIC_* for client-side.
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    process.env.FIREBASE_DATABASE_URL,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

export const firebaseClientConfig = firebaseConfig;

// Guard initialization (avoid multiple inits during HMR)
// Ensure the Firebase *client* is only initialized in the browser
// (prevents prerender/SSR attempts to initialize the client and
// therefore avoids needing NEXT_PUBLIC_* during build-time).
let app: any = null;
if (typeof window !== "undefined") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (e) {
    // If initialization fails in the browser, log and continue with null
    // so server-side code is not affected.
    // eslint-disable-next-line no-console
    console.error("[firebase] client initialization error:", e);
    app = null;
  }
}

export const auth = typeof window !== "undefined" && app ? getAuth(app) : null;

// Force local persistence so a browser reload keeps the session (Firebase will
// auto-refresh the ID token in the background). This is lightweight and only
// runs client-side.
if (auth) {
  // Intentionally ignore the returned promise; if it fails we just log.
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn("[firebase] persistence setup failed", err);
  });
}
export const db =
  typeof window !== "undefined" && app ? getFirestore(app) : null;
export const functions =
  typeof window !== "undefined" && app ? getFunctions(app) : null;
export const messaging =
  typeof window !== "undefined" && app ? getMessaging(app) : null;
