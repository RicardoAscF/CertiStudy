// scripts/dashboard.js
import { auth, db } from "./firebase.js";
import { toastSuccess, toastError, toastInfo, toastWarn } from "./toast.js";
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

    // Si no hay certs, dejamos el placeholder y listo
    if (!certifications || certifications.length === 0) {
      M.FormSelect.init(certSelect);
      return;
    }

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
      toastInfo("Perfil creado ✅", { icon: "person_add" });
    } else {
      await setDoc(userRef, baseData, { merge: true });
      // Nota: evitamos toast en cada login para no molestar.
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

    if (certs.length === 0) {
      toastWarn("Aún no tienes certificaciones. Agrega la primera 👇", { icon: "info" });
    }
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
      await upsertUserProfile(user);
      await loadCerts(user);
      console.log("✅ Firestore listo: perfil + certs");
    } catch (err) {
      console.error("❌ Firestore error:", err);
      toastError("Firestore: no se pudo cargar tu perfil/certs.", { icon: "error" });
    }
  });

  // ✅ LOGOUT
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      toastInfo("Sesión cerrada", { icon: "logout" });
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 250);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      toastError("No se pudo cerrar sesión.", { icon: "error" });
    }
  });

  // ✅ GUARDAR cert en Firestore + recargar select
  addCertBtn.addEventListener("click", async () => {
    const name = certNameInput.value.trim();
    const id = certIdInput.value.trim();

    if (!name) {
      toastWarn("Escribe el nombre de la certificación.", { icon: "edit" });
      certNameInput.focus();
      return;
    }

    if (!currentUser) {
      toastError("No hay sesión activa.", { icon: "lock" });
      return;
    }

    try {
      const savedId = await saveCert(currentUser, id, name);
      await loadCerts(currentUser);

      certNameInput.value = "";
      certIdInput.value = "";

      toastSuccess(`Certificación guardada: ${savedId.toUpperCase()}`, { icon: "check_circle" });
    } catch (err) {
      console.error("Error guardando cert:", err);
      toastError("No se pudo guardar la certificación.", { icon: "error" });
    }
  });
});