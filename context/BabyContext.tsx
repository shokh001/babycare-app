import { auth, db } from "@/services/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import React, { createContext, useEffect, useRef, useState } from "react";
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

export const BabyContext = createContext<BabyContextType | undefined>(undefined);

export const BabyProvider = ({ children }: { children: React.ReactNode }) => {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Listener'ni saqlash uchun ref
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Auth holatini kuzatish
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      // Avvalgi listener'ni to'xtatish
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      if (user) {
        // Foydalanuvchi tizimga kirgan – ma'lumotlarni yuklash
        subscribeToBabies(user.uid);
      } else {
        // Foydalanuvchi tizimdan chiqqan – state'ni tozalash
        setBabies([]);
        setCurrentBaby(null);
        setLoading(false);
        setError(null);
      }
    });

    // Cleanup: auth listener va snapshot listener
    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const subscribeToBabies = (userId: string) => {
    setLoading(true);
    
    const q = query(collection(db, "babies"), where("userId", "==", userId));

    // Listener'ni saqlash
    unsubscribeRef.current = onSnapshot(
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
        // Faqat foydalanuvchi hali tizimda bo'lsa xatolikni ko'rsatish
        if (auth.currentUser) {
          console.error("❌ Error fetching babies:", error);
          setError(error.message);
          Alert.alert(
            "Xatolik",
            "Ma'lumotlarni yuklashda xatolik: " + error.message,
          );
        }
        setLoading(false);
      }
    );
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
      await addDoc(babiesRef, newBaby);
      return true;
    } catch (error: any) {
      console.error("❌ Error adding baby:", error);
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
      return true;
    } catch (error: any) {
      console.error("❌ Error updating baby:", error);
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