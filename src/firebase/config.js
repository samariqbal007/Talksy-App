// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKZftJF-cdUmDFjnwJE2D8VUHrgGCLPSw",
  authDomain: "talksy-3c0ec.firebaseapp.com",
  projectId: "talksy-3c0ec",
  storageBucket: "talksy-3c0ec.appspot.com", // ✅ fix here: it should be .appspot.com not .app
  messagingSenderId: "602021232187",
  appId: "1:602021232187:web:c0d5d99386d494d5c0a61e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);         // For login/register
export const db = getFirestore(app);      // For storing user and chat data
export const storage = getStorage(app);   // For audio message files
