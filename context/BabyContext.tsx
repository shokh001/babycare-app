import { auth, db } from "@/services/firebase";
// import {
//   addDoc,
//   collection,
//   doc,
//   onSnapshot,
//   query,
//   updateDoc,
//   where
// } from "firebase/firestore";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export interface Baby {
  id: string;
  name: string;
  birthDate: Date;
  gender: "male" | "female";
  weight?: number | null;
  height?: number | null;
  photo?: string | null;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BabyContextType {
  babies: Baby[];
  currentBaby: Baby | null;
  setCurrentBaby: (baby: Baby | null) => void;
  addBaby: (babyData: any) => Promise<boolean>;
  updateBaby: (babyId: string, data: any) => Promise<boolean>;
  deleteBaby: (babyId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const BabyContext = createContext<BabyContextType | undefined>(
  undefined,
);

export const BabyProvider = ({ children }: { children: React.ReactNode }) => {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auth holatini tekshirish
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        subscribeToBabies(user.uid);
      } else {
        setBabies([]);
        setCurrentBaby(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const subscribeToBabies = (userId: string) => {

    const q = query(collection(db, "babies"), where("userId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const babyData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            birthDate: data.birthDate?.toDate
              ? data.birthDate.toDate()
              : new Date(data.birthDate),
          } as Baby;
        });

        setBabies(babyData);

        if (!currentBaby && babyData.length > 0) {
          setCurrentBaby(babyData[0]);
        }

        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("❌ Error fetching babies:", error);
        setError(error.message);
        setLoading(false);
        Alert.alert(
          "Xatolik",
          "Ma'lumotlarni yuklashda xatolik: " + error.message,
        );
      },
    );

    return unsubscribe;
  };

  const addBaby = async (babyData: any): Promise<boolean> => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error("❌ No authenticated user");
        Alert.alert("Xatolik", "Iltimos, avval tizimga kiring");
        return false;
      }
      const newBaby = {
        ...babyData,
        userId: user.uid,
        birthDate: babyData.birthDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const babiesRef = collection(db, "babies");
      const docRef = await addDoc(babiesRef, newBaby);

      return true;
    } catch (error: any) {
      console.error("❌ Error adding baby:", {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack,
      });

      // Maxsus xatolik xabarlari
      if (error.code === "permission-denied") {
        Alert.alert(
          "Xatolik",
          "Firebase maʼlumotlar bazasiga ulanishda ruxsat yoʻq. Iltimos, Firebase konsolida Firestore qoidalarini tekshiring.",
        );
      } else if (error.code === "unauthenticated") {
        Alert.alert("Xatolik", "Iltimos, qaytadan tizimga kiring");
      } else {
        Alert.alert("Xatolik", `Kod: ${error.code}\nXabar: ${error.message}`);
      }

      return false;
    }
  };

  const updateBaby = async (babyId: string, data: any): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Xatolik", "Iltimos, avval tizimga kiring");
        return false;
      }

      await updateDoc(doc(db, "babies", babyId), {
        ...data,
        updatedAt: new Date(),
      });

      setError(null);
      return true;
    } catch (error: any) {
      console.error("❌ Error updating baby:", error);
      setError(error.message);
      Alert.alert("Xatolik", "Ma'lumotlarni yangilashda muammo yuz berdi");
      return false;
    }
  };

  const deleteBaby = async (babyId: string): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Xatolik", "Iltimos, avval tizimga kiring");
        return false;
      }

      const batch = writeBatch(db);

      // 1. Baby hujjati
      const babyRef = doc(db, "babies", babyId);
      batch.delete(babyRef);

      // 2. Feedings
      const feedingsSnap = await getDocs(query(collection(db, "feedings"), where("babyId", "==", babyId)));
      feedingsSnap.forEach(doc => batch.delete(doc.ref));

      // 3. Sleeps
      const sleepsSnap = await getDocs(query(collection(db, "sleeps"), where("babyId", "==", babyId)));
      sleepsSnap.forEach(doc => batch.delete(doc.ref));

      // 4. Diapers
      const diapersSnap = await getDocs(query(collection(db, "diapers"), where("babyId", "==", babyId)));
      diapersSnap.forEach(doc => batch.delete(doc.ref));

      // 5. Growths
      const growthsSnap = await getDocs(query(collection(db, "growths"), where("babyId", "==", babyId)));
      growthsSnap.forEach(doc => batch.delete(doc.ref));

      await batch.commit();

      // CurrentBaby ni yangilash
      if (currentBaby?.id === babyId) {
        const remainingBabies = babies.filter(b => b.id !== babyId);
        setCurrentBaby(remainingBabies.length > 0 ? remainingBabies[0] : null);
      }

      return true;
    } catch (error: any) {
      console.error("❌ deleteBaby xatolik:", error);
      Alert.alert("Xatolik", "Ma'lumotlarni o'chirishda muammo yuz berdi");
      return false;
    }
  };

  return (
    <BabyContext.Provider
      value={{
        babies,
        currentBaby,
        setCurrentBaby,
        addBaby,
        updateBaby,
        deleteBaby,
        loading,
        error,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
};
