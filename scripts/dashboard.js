// scripts/dashboard.js
import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const certSelect = document.getElementById("certSelect");
  const certNameInput = document.getElementById("certNameInput");
  const certIdInput = document.getElementById("certIdInput");
  const addCertBtn = document.getElementById("addCertBtn");
  const userEmail = document.getElementById("userEmail");

  // ✅ PROTEGER DASHBOARD: si NO hay usuario, fuera
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../index.html";
      return;
    }
    // (opcional) mostrar email real
    userEmail.textContent = `Welcome, ${user.email}`;
  });

  // ✅ LOGOUT
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "../index.html";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      alert("No se pudo cerrar sesión. Revisa la consola.");
    }
  });

  // --- tu lógica actual de certificaciones ---
  const certifications = [
    { id: "az900", name: "Azure AZ-900" },
    { id: "fiori", name: "SAP Fiori" }
  ];

  function renderSelect() {
    certSelect.length = 1;
    certifications.forEach((cert) => {
      const opt = document.createElement("option");
      opt.value = cert.id;
      opt.textContent = cert.name;
      certSelect.appendChild(opt);
    });

    // Materialize init
    M.FormSelect.init(certSelect);
  }

  renderSelect();

  addCertBtn.addEventListener("click", () => {
    const name = certNameInput.value.trim();
    if (!name) return;

    const id = certIdInput.value.trim() || name.toLowerCase().replace(/\s+/g, "-");
    certifications.push({ id, name });

    renderSelect();
    certNameInput.value = "";
    certIdInput.value = "";
  });
});
