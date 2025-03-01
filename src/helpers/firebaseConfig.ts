// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: import.meta.env.Tanstack_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.Tanstack_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.Tanstack_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.Tanstack_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.Tanstack_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.Tanstack_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.Tanstack_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(firebase_app);
export const db = getFirestore(firebase_app);
