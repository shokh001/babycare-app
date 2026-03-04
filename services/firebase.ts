import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// Firebase konfiguratsiyasi (o'zingizning ma'lumotlaringizni yozing)
const firebaseConfig = {
  apiKey: "AIzaSyBo6GSd_h7BcHlp-KjkzOg4S5Lwd3SZUOs",
  authDomain: "babycarehelper.firebaseapp.com",
  projectId: "babycarehelper",
  storageBucket: "babycarehelper.firebasestorage.app",
  messagingSenderId: "725352087219",
  appId: "1:725352087219:web:15ed5e87f5bc63cd297ac6",
  measurementId: "G-7JKXE8X19P",
};
// Firebase ni ishga tushirish
const app = initializeApp(firebaseConfig);

// Servislarni eksport qilish
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app);

// Debug uchun auth holatini tekshirish
console.log("Firebase initialized:", app.name);
console.log("Auth instance:", auth ? "OK" : "Error");
