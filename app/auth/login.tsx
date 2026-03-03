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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  // Debug: user o'zgarishini kuzatish
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Xatolik", "Email va parolni kiriting");
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);

      if (success) {
        console.log(
          "✅ Login screen: login successful, waiting for redirect...",
        );
      } else {
        console.log("❌ Login screen: login failed");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("❌ Login screen error:", error);
      Alert.alert("Xatolik", error.message || "Kirishda xatolik yuz berdi");
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
          <Ionicons name="happy-outline" size={80} color="#FF6B6B" />
          <ThemedText type="title" style={styles.title}>
            BabyCare Helper
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Farzandingiz parvarishida yordamchi
          </ThemedText>

          <View style={styles.form}>
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
              placeholder="Parolingiz"
              secureTextEntry
            />

            <Button
              title="Kirish"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.registerContainer}>
              <ThemedText style={styles.registerText}>
                Hisobingiz yo'qmi?
              </ThemedText>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <ThemedText style={styles.registerLink}>
                    Ro'yxatdan o'tish
                  </ThemedText>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
    color: "#FF6B6B",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  loginButton: {
    marginBottom: 20,
    backgroundColor: "#FF6B6B",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  registerText: {
    color: "#666",
    marginRight: 5,
  },
  registerLink: {
    color: "#FF6B6B",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
