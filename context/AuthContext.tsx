import { auth } from "@/services/firebase";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Xatolik", error.message);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      Alert.alert("Muvaffaqiyatli", "Ro'yxatdan o'tdingiz");
      return true;
    } catch (error: any) {
      console.error("Register error:", error);
      Alert.alert("Xatolik", error.message);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // Router orqali login sahifasiga o'tish
      setTimeout(() => {
        router.replace("/auth/login");
      }, 100);
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert("Xatolik", "Chiqishda muammo yuz berdi: " + error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
