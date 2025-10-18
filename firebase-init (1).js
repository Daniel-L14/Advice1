// Módulo para inicializar Firebase y exponer utilidades en window
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Exponer funciones en window para que app.jsx las use
window.initializeApp = initializeApp;
window.getAuth = getAuth;
window.signInAnonymously = signInAnonymously;
window.signInWithCustomToken = signInWithCustomToken;
window.getFirestore = getFirestore;
window.doc = doc;
window.onSnapshot = onSnapshot;
window.setDoc = setDoc;
