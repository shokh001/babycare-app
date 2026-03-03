import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        <ThemedText type="title" style={styles.title}>
          Amal bajarildi!
        </ThemedText>
        <ThemedText style={styles.message}>
          Ma'lumot muvaffaqiyatli saqlandi
        </ThemedText>

        <Link href="/(tabs)" asChild dismissTo>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>
              Bosh sahifaga qaytish
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
