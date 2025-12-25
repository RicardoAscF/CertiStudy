import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ===== Elements
const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

const certSelect = document.getElementById("certSelect");
const showBtn = document.getElementById("showBtn");
const dashMsg = document.getElementById("dashMsg");

const certNameInput = document.getElementById("certNameInput");
const certIdInput = document.getElementById("certIdInput");
const saveCertBtn = document.getElementById("saveCertBtn");

// ===== Helpers
function showError(msg) {
  dashMsg.textContent = msg;
  dashMsg.style.display = "block";
}
function clearError() {
  dashMsg.style.display = "none";
  dashMsg.textContent = "";
}
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30);
}

// ===== Materialize init
document.addEventListener("DOMContentLoaded", () => {
  // Selects
  const selects = document.querySelectorAll("select");
  M.FormSelect.init(selects);

  // Modals
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals, { dismissible: true });
});

// ===== Auth guard + welcome
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }
  welcomeText.textContent = `Welcome, ${user.email}`;
});

// ===== Actions
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../index.html";
});

showBtn?.addEventListener("click", () => {
  clearError();
  const certId = certSelect.value;
  if (!certId) return showError("Selecciona una certificación.");

  // Próxima página (aún no existe): certification.html
  window.location.href = `./certification.html?certId=${encodeURIComponent(certId)}`;
});

// ===== Add certification (local only, for now)
saveCertBtn?.addEventListener("click", () => {
  clearError();

  const name = (certNameInput.value || "").trim();
  if (!name) return showError("Escribe el nombre de la certificación.");

  const id = (certIdInput.value || "").trim() || slugify(name);

  // Avoid duplicates
  const exists = [...certSelect.options].some((o) => o.value === id);
  if (exists) return showError("Ese ID ya existe. Usa otro.");

  const opt = document.createElement("option");
  opt.value = id;
  opt.textContent = name;
  certSelect.appendChild(opt);

  // Refresh Materialize select
  M.FormSelect.init(certSelect);
  certSelect.value = id;
  M.FormSelect.init(certSelect);

  // Clear inputs
  certNameInput.value = "";
  certIdInput.value = "";
});
