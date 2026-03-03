import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();

  // Agar user allaqachon login qilgan bo'lsa, tabs ga o'tish
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleRegister = async () => {
    // Validatsiya
    if (!name.trim()) {
      Alert.alert("Xatolik", "Ismingizni kiriting");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Xatolik", "Email manzilingizni kiriting");
      return;
    }

    if (!password) {
      Alert.alert("Xatolik", "Parolni kiriting");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Xatolik", "Parollar mos kelmadi");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Xatolik", "Parol kamida 6 belgidan iborat bo'lishi kerak");
      return;
    }

    // Email formatini tekshirish
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Xatolik", "Noto'g'ri email format");
      return;
    }

    setLoading(true);
    try {
      const success = await register(email, password, name.trim());

      if (success) {
        // Register muvaffaqiyatli - AuthContext avtomatik tabs ga o'tkazadi
        console.log("Register successful, redirecting...");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      Alert.alert(
        "Xatolik",
        error.message || "Ro'yxatdan o'tishda xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Ionicons name="heart-outline" size={60} color="#FF6B6B" />
          <ThemedText type="title" style={styles.title}>
            Ro'yxatdan o'tish
          </ThemedText>

          <View style={styles.form}>
            <Input
              label="Ismingiz"
              value={name}
              onChangeText={setName}
              placeholder="Ismingizni kiriting"
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Email manzilingiz"
              keyboardType="email-address"
            />

            <Input
              label="Parol"
              value={password}
              onChangeText={setPassword}
              placeholder="Parol (kamida 6 belgi)"
              secureTextEntry
            />

            <Input
              label="Parolni tasdiqlang"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Parolni qayta kiriting"
              secureTextEntry
            />

            <Button
              title="Ro'yxatdan o'tish"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>
                Hisobingiz bormi?
              </ThemedText>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <ThemedText style={styles.loginLink}>Kirish</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    marginTop: 20,
    marginBottom: 30,
    color: "#FF6B6B",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  registerButton: {
    marginBottom: 20,
    backgroundColor: "#FF6B6B",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#666",
    marginRight: 5,
  },
  loginLink: {
    color: "#FF6B6B",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
