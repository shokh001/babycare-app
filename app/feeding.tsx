import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useBaby } from "@/hooks/useBaby";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function FeedingScreen() {
  const { currentBaby } = useBaby();
  const [type, setType] = useState<"breast" | "bottle" | "solid">("breast");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Web platform uchun vaqt formatlash
  const formatTimeForWeb = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Web platform uchun time picker (native dizaynga o'xshatilgan)
  const renderWebTimePicker = (
    value: Date,
    onChange: (date: Date) => void,
    id: string
  ) => {
    const [hours, minutes] = formatTimeForWeb(value).split(':');
    
    return (
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => {
          const input = document.getElementById(id) as HTMLInputElement;
          if (input) input.showPicker();
        }}
      >
        <ThemedText>{value.toLocaleTimeString("uz-UZ")}</ThemedText>
        <Ionicons name="time-outline" size={20} color="#FF6B6B" />
        <input
          id={id}
          type="time"
          value={formatTimeForWeb(value)}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':');
            const newDate = new Date(value);
            newDate.setHours(parseInt(hours, 10));
            newDate.setMinutes(parseInt(minutes, 10));
            onChange(newDate);
          }}
          style={{
            position: 'absolute',
            opacity: 0,
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            cursor: 'pointer',
          }}
        />
      </TouchableOpacity>
    );
  };

  const handleSave = async () => {
    if (!currentBaby) {
      Alert.alert("Xatolik", "Avval farzandingizni tanlang");
      return;
    }

    setLoading(true);
    try {
      const data = {
        babyId: currentBaby.id,
        type,
        amount: amount ? parseFloat(amount) : null,
        duration: duration ? parseInt(duration) : null,
        notes,
        time,
        createdAt: new Date(),
      };
      const docRef = await addDoc(collection(db, "feedings"), data);
      Alert.alert("Muvaffaqiyatli", "Ma'lumot saqlandi");
      router.back();
    } catch (error: any) {
      console.error('Error saving:', error);
      Alert.alert("Xatolik", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentBaby) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="sad-outline" size={50} color="#FF6B6B" />
        <ThemedText style={styles.emptyText}>
          Avval farzandingizni tanlang
        </ThemedText>
        <Button
          title="Farzandlarim"
          onPress={() => router.push("/(tabs)/baby")}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Ovqatlantirish
        </ThemedText>
        <ThemedText style={styles.babyName}>{currentBaby.name}</ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.label}>Turini tanlang</ThemedText>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "breast" && styles.typeButtonActive,
            ]}
            onPress={() => setType("breast")}
          >
            <Ionicons
              name="woman-outline"
              size={24}
              color={type === "breast" ? "#FF6B6B" : "#999"}
            />
            <ThemedText
              style={[
                styles.typeText,
                type === "breast" && styles.typeTextActive,
              ]}
            >
              Emizish
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "bottle" && styles.typeButtonActive,
            ]}
            onPress={() => setType("bottle")}
          >
            <Ionicons
              name="water-outline"
              size={24}
              color={type === "bottle" ? "#FF6B6B" : "#999"}
            />
            <ThemedText
              style={[
                styles.typeText,
                type === "bottle" && styles.typeTextActive,
              ]}
            >
              Sun'iy
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "solid" && styles.typeButtonActive,
            ]}
            onPress={() => setType("solid")}
          >
            <Ionicons
              name="restaurant-outline"
              size={24}
              color={type === "solid" ? "#FF6B6B" : "#999"}
            />
            <ThemedText
              style={[
                styles.typeText,
                type === "solid" && styles.typeTextActive,
              ]}
            >
              Qattiq ovqat
            </ThemedText>
          </TouchableOpacity>
        </View>

        {type === "bottle" && (
          <Input
            label="Miqdori (ml)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Masalan: 90"
          />
        )}

        {type === "solid" && (
          <Input
            label="Miqdori (gramm)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Masalan: 50"
          />
        )}

        {type === "breast" && (
          <Input
            label="Davomiyligi (daqiqa)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="Masalan: 15"
          />
        )}

        <ThemedText style={styles.label}>Vaqt</ThemedText>
        
        {Platform.OS === 'web' ? (
          renderWebTimePicker(time, setTime, "feeding-time")
        ) : (
          <TouchableOpacity
            style={styles.timePicker}
            onPress={() => setShowTimePicker(true)}
          >
            <ThemedText>{time.toLocaleTimeString("uz-UZ")}</ThemedText>
            <Ionicons name="time-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}

        {showTimePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}

        <Input
          label="Qo'shimcha ma'lumot"
          value={notes}
          onChangeText={setNotes}
          placeholder="Izoh..."
          multiline
        />

        <View style={styles.buttons}>
          <Button
            title="Bekor qilish"
            onPress={() => router.back()}
            style={styles.button}
            />
          <Button
            title="Saqlash"
            variant="secondary"
            onPress={handleSave}
            loading={loading}
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#FF6B6B",
  },
  headerTitle: {
    color: "#fff",
    marginBottom: 5,
  },
  babyName: {
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
    color: "#333",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  typeButtonActive: {
    backgroundColor: "#FFE5E5",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  typeText: {
    marginTop: 5,
    color: "#666",
    fontSize: 14,
  },
  typeTextActive: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  timePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});