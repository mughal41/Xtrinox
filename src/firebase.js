// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/*
 * Replace these placeholder values with your Firebase project credentials.
 * This app expects Firebase Auth and Cloud Firestore to be enabled.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDco5Vq5DvjBlK8acvejIqQXHOUGD5PsNw",
  authDomain: "xtrinox-dfd69.firebaseapp.com",
  projectId: "xtrinox-dfd69",
  storageBucket: "xtrinox-dfd69.firebasestorage.app",
  messagingSenderId: "368764116011",
  appId: "1:368764116011:web:799f62ee1572cb982d9e6e",
  measurementId: "G-3KX8BDF487"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);