// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Thay thế bằng cấu hình Firebase của bạn
// Lấy từ Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyBHZqS0-sdTfSQtfo1hoe2vh6FZbWI0_uo",
    authDomain: "saveplus-5074f.firebaseapp.com",
    projectId: "saveplus-5074f",
    storageBucket: "saveplus-5074f.firebasestorage.app",
    messagingSenderId: "439476038551",
    appId: "1:439476038551:web:c74d38485fb8e852cb72d2",
    measurementId: "G-JLQGFCP0G6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
