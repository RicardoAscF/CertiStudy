// scripts/dashboard.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  welcomeText.textContent = `Welcome, ${user.email}`;
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../index.html";
});
    