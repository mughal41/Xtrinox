import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDco5Vq5DvjBlK8acvejIqQXHOUGD5PsNw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'xtrinox-dfd69.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'xtrinox-dfd69',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'xtrinox-dfd69.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '368764116011',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:368764116011:web:799f62ee1572cb982d9e6e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-3KX8BDF487',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
