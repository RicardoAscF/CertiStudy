// scripts/firebase.js
// Firebase v9+ (modular) via CDN - SIN npm

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// 1) Pega aquí tu config EXACTO como te lo da Firebase Console

const firebaseConfig = {

    apiKey: "AIzaSyDmK6Y1MyESG30urh-DG1mYXyDfImUn4_4",

    authDomain: "certistudy-4328e.firebaseapp.com",

    projectId: "certistudy-4328e",

    storageBucket: "certistudy-4328e.firebasestorage.app",

    messagingSenderId: "4134711304",

    appId: "1:4134711304:web:9f124cfd00b8ffff7121bd"

  };



// 2) Init
const app = initializeApp(firebaseConfig);

// 3) Exporta Auth para usarlo en login.js / dashboard.js
export const auth = getAuth(app);
export default app;