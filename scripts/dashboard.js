// scripts/dashboard.js
import { auth, db } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const certSelect = document.getElementById("certSelect");
  const certNameInput = document.getElementById("certNameInput");
  const certIdInput = document.getElementById("certIdInput");
  const addCertBtn = document.getElementById("addCertBtn");
  const userEmail = document.getElementById("userEmail");

  let currentUser = null;

  function normalizeId(input) {
    return (input || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-\_\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/\-+/g, "-");
  }

  function renderSelect(certifications) {
    certSelect.length = 1; // deja placeholder
    certifications.forEach((cert) => {
      const opt = document.createElement("option");
      opt.value = cert.id;
      opt.textContent = cert.name;
      certSelect.appendChild(opt);
    });
    M.FormSelect.init(certSelect);
  }

  async function upsertUserProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    const baseData = {
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      lastLoginAt: serverTimestamp(),
    };

    if (!snap.exists()) {
      await setDoc(userRef, { ...baseData, createdAt: serverTimestamp() });
    } else {
      await setDoc(userRef, baseData, { merge: true });
    }
  }

  async function loadCerts(user) {
    const certsRef = collection(db, "users", user.uid, "certs");
    const q = query(certsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const certs = [];
    snap.forEach((d) => {
      const data = d.data();
      certs.push({
        id: d.id,
        name: data.name || d.id,
        provider: data.provider || "",
        status: data.status || "",
      });
    });

    renderSelect(certs);
  }

  async function saveCert(user, certId, certName) {
    const safeId = normalizeId(certId) || normalizeId(certName);
    if (!safeId) throw new Error("ID inválido");

    const certRef = doc(db, "users", user.uid, "certs", safeId);

    await setDoc(
      certRef,
      {
        name: certName,
        provider: "custom",
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return safeId;
  }

  // ✅ PROTEGER DASHBOARD + AUTO-CREAR users/{uid} + CARGAR certs
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../index.html";
      return;
    }

    currentUser = user;
    userEmail.textContent = `Welcome, ${user.email}`;

    try {
      await upsertUserProfile(user); // 🔥 crea/actualiza users/{uid}
      await loadCerts(user);         // 🔥 carga certs del usuario
      console.log("✅ Firestore listo: perfil + certs");
    } catch (err) {
      console.error("❌ Firestore error:", err);
      alert("Firestore: no se pudo sincronizar tu perfil o cargar certificaciones. Revisa consola.");
    }
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

  // ✅ GUARDAR cert en Firestore + recargar select
  addCertBtn.addEventListener("click", async () => {
    const name = certNameInput.value.trim();
    if (!name) return;

    if (!currentUser) {
      alert("No hay sesión activa.");
      return;
    }

    const id = certIdInput.value.trim();

    try {
      await saveCert(currentUser, id, name);
      await loadCerts(currentUser);

      certNameInput.value = "";
      certIdInput.value = "";
    } catch (err) {
      console.error("Error guardando cert:", err);
      alert("No se pudo guardar la certificación. Revisa consola.");
    }
  });
});