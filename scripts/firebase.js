// scripts/firebase.js
// Firebase v9+ (modular) via CDN - SIN npm

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Config EXACTO como te lo da Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDmK6Y1MyESG30urh-DG1mYXyDfImUn4_4",
  authDomain: "certistudy-4328e.firebaseapp.com",
  projectId: "certistudy-4328e",
  storageBucket: "certistudy-4328e.firebasestorage.app",
  messagingSenderId: "4134711304",
  appId: "1:4134711304:web:9f124cfd00b8ffff7121bd",
};

// Init
export const app = initializeApp(firebaseConfig);

// Auth + Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;