// scripts/certification.js
import { auth, db } from "./firebase.js";
import { toastSuccess, toastError, toastWarn, toastInfo } from "./toast.js";

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, addDoc, getDocs, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let uid = null;
let certId = null;

let currentChapterId = null;
let currentChapterRef = null;

function qs(id){ return document.getElementById(id); }

function initMaterialize(){
  // sidenav
  const sidenavElems = document.querySelectorAll(".sidenav");
  M.Sidenav.init(sidenavElems);
}

function getCertIdFromUrl(){
  const params = new URLSearchParams(window.location.search);
  return params.get("certId");
}

async function ensureCertExists(){
  const certRef = doc(db, "users", uid, "certs", certId);
  const snap = await getDoc(certRef);

  if (!snap.exists()){
    // Si alguien abrió manualmente un certId que no existe, lo creamos mínimo.
    await setDoc(certRef, {
      name: certId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    toastInfo("Certificación creada automáticamente (stub).");
  }

  return certRef;
}

function renderCertHeader(certData){
  const name = certData?.name || certId || "Certificación";
  qs("certTitle").textContent = name;
  qs("certTitleMini").textContent = name;
  qs("certTitleSidenav").textContent = name;

  const coverUrl = certData?.coverUrl || "";
  const img = qs("certCoverImg");
  const ph = qs("certCoverPlaceholder");

  if (coverUrl){
    img.src = coverUrl;
    img.style.display = "block";
    ph.style.display = "none";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
    ph.style.display = "flex";
  }
}

function chapterLabel(i, title){
  return `${i}. ${title || "Capítulo"}`;
}

function setCurrentChapterUI(enabled){
  qs("chapterTitleInput").disabled = !enabled;
  qs("saveChapterTitleBtn").disabled = !enabled;
  qs("addSubchapterBtn").disabled = !enabled;

  qs("subchaptersEmpty").style.display = enabled ? "none" : "block";
}

async function loadChapters(){
  const chaptersCol = collection(db, "users", uid, "certs", certId, "chapters");
  const qy = query(chaptersCol, orderBy("order", "asc"));
  const snaps = await getDocs(qy);

  const list = qs("chaptersList");
  list.innerHTML = "";

  const chapters = [];
  snaps.forEach((d) => chapters.push({ id: d.id, ...d.data() }));

  if (chapters.length === 0){
    qs("currentChapterChip").textContent = "Sin capítulos";
    setCurrentChapterUI(false);
    return [];
  }

  chapters.forEach((ch, idx) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#!";
    a.textContent = chapterLabel(idx+1, ch.title);

    a.addEventListener("click", async () => {
      await selectChapter(ch.id);
      const inst = M.Sidenav.getInstance(qs("chaptersSidenav"));
      inst?.close();
    });

    li.appendChild(a);
    list.appendChild(li);
  });

  // auto-select first if none selected
  if (!currentChapterId){
    await selectChapter(chapters[0].id);
  } else {
    // keep selection
    await selectChapter(currentChapterId);
  }

  return chapters;
}

async function selectChapter(chapterId){
  currentChapterId = chapterId;
  currentChapterRef = doc(db, "users", uid, "certs", certId, "chapters", chapterId);

  // highlight in sidenav
  const links = qs("chaptersList").querySelectorAll("a");
  links.forEach(a => a.classList.remove("cs-active"));
  // best-effort: highlight by matching chapterId via closure not available, skip

  const snap = await getDoc(currentChapterRef);
  const data = snap.data() || {};

  qs("chapterTitleInput").value = data.title || "";
  M.updateTextFields();

  qs("currentChapterChip").textContent = data.title ? data.title : "Capítulo";
  setCurrentChapterUI(true);

  await loadSubchapters();
}

async function getNextOrder(colRef){
  const qy = query(colRef, orderBy("order", "desc"), limit(1));
  const snaps = await getDocs(qy);
  if (snaps.empty) return 1;
  const last = snaps.docs[0].data();
  return (last.order || 0) + 1;
}

async function addChapter(){
  const chaptersCol = collection(db, "users", uid, "certs", certId, "chapters");
  const nextOrder = await getNextOrder(chaptersCol);
  const title = `Capítulo ${nextOrder}`;

  const docRef = await addDoc(chaptersCol, {
    title,
    order: nextOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  toastSuccess("Capítulo creado ✅");
  currentChapterId = docRef.id;
  await loadChapters();
}

async function saveChapterTitle(){
  if (!currentChapterRef) return;

  const title = qs("chapterTitleInput").value.trim();
  if (!title){
    toastWarn("Ponle nombre al capítulo.");
    return;
  }

  try{
    await updateDoc(currentChapterRef, {
      title,
      updatedAt: serverTimestamp()
    });
    qs("currentChapterChip").textContent = title;
    toastSuccess("Capítulo actualizado ✅");
    await loadChapters();
  } catch (e){
    console.error(e);
    toastError("No se pudo guardar el capítulo.");
  }
}

async function loadSubchapters(){
  if (!currentChapterId) return;

  const subCol = collection(db, "users", uid, "certs", certId, "chapters", currentChapterId, "subchapters");
  const qy = query(subCol, orderBy("order", "asc"));
  const snaps = await getDocs(qy);

  const ul = qs("subchaptersList");
  ul.innerHTML = "";

  const subchapters = [];
  snaps.forEach(d => subchapters.push({ id: d.id, ...d.data() }));

  if (subchapters.length === 0){
    ul.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "cs-empty";
    empty.textContent = "Aún no hay subcapítulos. Crea el primero.";
    ul.appendChild(empty);
    return;
  }

  subchapters.forEach((s, idx) => {
    const li = document.createElement("li");

    const row = document.createElement("div");
    row.className = "cs-subchapter-row";

    const left = document.createElement("div");
    left.className = "cs-subchapter-title";
    left.textContent = `${idx+1}. ${s.title || "Subcapítulo"}`;

    left.addEventListener("click", () => {
      toastInfo("Abrir cuaderno (pendiente).");
    });

    const actions = document.createElement("div");
    actions.className = "cs-subchapter-actions";

    const btnSection = document.createElement("a");
    btnSection.className = "btn-small cs-btn-secondary";
    btnSection.textContent = "+ Sección";
    btnSection.addEventListener("click", (e) => {
      e.stopPropagation();
      toastInfo("Agregar sección (próximamente).");
    });

    const btnQuiz = document.createElement("a");
    btnQuiz.className = "btn-small cs-btn-primary";
    btnQuiz.textContent = "+ Quiz";
    btnQuiz.addEventListener("click", (e) => {
      e.stopPropagation();
      toastInfo("Agregar quiz (próximamente).");
    });

    actions.appendChild(btnSection);
    actions.appendChild(btnQuiz);

    row.appendChild(left);
    row.appendChild(actions);

    li.appendChild(row);
    ul.appendChild(li);
  });
}

async function addSubchapter(){
  if (!currentChapterId){
    toastWarn("Primero crea/selecciona un capítulo.");
    return;
  }

  const subCol = collection(db, "users", uid, "certs", certId, "chapters", currentChapterId, "subchapters");
  const nextOrder = await getNextOrder(subCol);
  const title = `Subcapítulo ${nextOrder}`;

  try{
    await addDoc(subCol, {
      title,
      order: nextOrder,
      content: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    toastSuccess("Subcapítulo creado ✅");
    await loadSubchapters();
  } catch (e){
    console.error(e);
    toastError("No se pudo crear el subcapítulo.");
  }
}

async function editCover(){
  const url = prompt("Pega una URL de imagen (https://...):");
  if (url === null) return; // cancel
  const clean = url.trim();

  try{
    const certRef = doc(db, "users", uid, "certs", certId);
    await setDoc(certRef, { coverUrl: clean, updatedAt: serverTimestamp() }, { merge: true });
    toastSuccess("Imagen actualizada ✅");

    const snap = await getDoc(certRef);
    renderCertHeader(snap.data());
  } catch (e){
    console.error(e);
    toastError("No se pudo actualizar la imagen.");
  }
}

function wireUI(){
  qs("logoutBtn").addEventListener("click", async () => {
    try{
      await signOut(auth);
      toastInfo("Sesión cerrada.");
      window.location.href = "../index.html";
    } catch (e){
      console.error(e);
      toastError("No se pudo cerrar sesión.");
    }
  });

  qs("backToDashboardBtn").addEventListener("click", () => {
    window.location.href = "./dashboard.html";
  });

  qs("addChapterBtn").addEventListener("click", addChapter);
  qs("addChapterBtnTop").addEventListener("click", addChapter);

  qs("addSubchapterBtn").addEventListener("click", addSubchapter);
  qs("saveChapterTitleBtn").addEventListener("click", saveChapterTitle);

  qs("editCoverBtn").addEventListener("click", editCover);
}

document.addEventListener("DOMContentLoaded", () => {
  initMaterialize();
  wireUI();

  onAuthStateChanged(auth, async (user) => {
    if (!user){
      window.location.href = "../index.html";
      return;
    }

    uid = user.uid;
    certId = getCertIdFromUrl();

    if (!certId){
      toastWarn("Falta certId en la URL.");
      window.location.href = "./dashboard.html";
      return;
    }

    try{
      const certRef = await ensureCertExists();
      const certSnap = await getDoc(certRef);
      renderCertHeader(certSnap.data());

      await loadChapters();
    } catch (e){
      console.error(e);
      toastError("No se pudo cargar la certificación.");
    }
  });
});
