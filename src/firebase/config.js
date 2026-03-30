// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChiw1qvpURPBgoME_9JXgjq85ZJ0_9hnU",
  authDomain: "angela-ventas-web.firebaseapp.com",
  projectId: "angela-ventas-web",
  storageBucket: "angela-ventas-web.firebasestorage.app",
  messagingSenderId: "587513011992",
  appId: "1:587513011992:web:8c5347149a280dafaa486d"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos la base de datos y el storage para usarlos en el resto de la web
export const db = getFirestore(app);
export const storage = getStorage(app);