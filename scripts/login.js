// scripts/login.js
import { auth } from "./firebase.js";
import { toastSuccess, toastError } from "./toast.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const loader = document.getElementById("miniLoader");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");
const submitBtn = form.querySelector('button[type="submit"]');

function resetUI() {
  errorMsg.style.display = "none";
  successMsg.style.display = "none";
}

function setLoading(isLoading) {
  loader.style.display = isLoading ? "block" : "none";
  submitBtn.disabled = isLoading;
}

function humanizeFirebaseError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Email inválido.";
    case "auth/user-not-found":
      return "No existe un usuario con ese email.";
    case "auth/wrong-password":
      return "Contraseña incorrecta.";
    case "auth/invalid-credential":
      return "Credenciales inválidas.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta más tarde.";
    default:
      return "No se pudo iniciar sesión. Intenta de nuevo.";
  }
}

// Si ya está logueado, lo mandamos directo al dashboard
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "./pages/dashboard.html";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  resetUI();
  setLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);

    setLoading(false);
    successMsg.style.display = "block";

    // ✅ Toast de prueba (login correcto)
    toastSuccess("Login successful ✅", { icon: "check_circle" });

    setTimeout(() => {
      window.location.href = "./pages/dashboard.html";
    }, 600);
  } catch (err) {
    setLoading(false);
    const msg = humanizeFirebaseError(err?.code);
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
    // (Opcional) Toast para error de login
    toastError(msg, { icon: "error" });
  }
});