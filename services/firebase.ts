import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBo6GSd_h7BcHlp-KjkzOg4S5Lwd3SZUOs",
  authDomain: "babycarehelper.firebaseapp.com",
  projectId: "babycarehelper",
  storageBucket: "babycarehelper.firebasestorage.app",
  messagingSenderId: "725352087219",
  appId: "1:725352087219:web:15ed5e87f5bc63cd297ac6",
  measurementId: "G-7JKXE8X19P",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// storage eksport qilinmadi
