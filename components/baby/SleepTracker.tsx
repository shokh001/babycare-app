import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  babyId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function SleepTracker({ babyId, onSave, onCancel }: Props) {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [quality, setQuality] = useState<"good" | "normal" | "bad">("normal");
  const [notes, setNotes] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateDuration = () => {
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    return durationMinutes > 0 ? durationMinutes : 0;
  };

  const handleSave = async () => {
    if (!babyId) {
      Alert.alert("Xatolik", "Avval farzandingizni tanlang");
      return;
    }

    const duration = calculateDuration();
    if (duration <= 0) {
      Alert.alert(
        "Xatolik",
        "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak",
      );
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "sleeps"), {
        babyId,
        startTime,
        endTime,
        duration,
        quality,
        notes,
        createdAt: new Date(),
      });

      Alert.alert("Muvaffaqiyatli", "Ma'lumot saqlandi");
      if (onSave) onSave();
    } catch (error: any) {
      Alert.alert("Xatolik", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.label}>Uyqu sifati</ThemedText>
      <View style={styles.qualitySelector}>
        <TouchableOpacity
          style={[
            styles.qualityButton,
            quality === "good" && styles.qualityButtonActive,
          ]}
          onPress={() => setQuality("good")}
        >
          <Ionicons
            name="happy"
            size={24}
            color={quality === "good" ? "#4CAF50" : "#999"}
          />
          <ThemedText style={quality === "good" && styles.qualityTextActive}>
            Yaxshi
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.qualityButton,
            quality === "normal" && styles.qualityButtonActive,
          ]}
          onPress={() => setQuality("normal")}
        >
          <Ionicons
            name="ellipsis-horizontal-outline"
            size={24}
            color={quality === "normal" ? "#FFC107" : "#999"}
          />
          <ThemedText style={quality === "normal" && styles.qualityTextActive}>
            O'rtacha
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.qualityButton,
            quality === "bad" && styles.qualityButtonActive,
          ]}
          onPress={() => setQuality("bad")}
        >
          <Ionicons
            name="sad"
            size={24}
            color={quality === "bad" ? "#F44336" : "#999"}
          />
          <ThemedText style={quality === "bad" && styles.qualityTextActive}>
            Yomon
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.label}>Boshlanish vaqti</ThemedText>
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowStartPicker(true)}
      >
        <ThemedText>{startTime.toLocaleString("uz-UZ")}</ThemedText>
        <Ionicons name="time" size={20} color="#FF6B6B" />
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="datetime"
          onChange={(event, selectedTime) => {
            setShowStartPicker(false);
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      <ThemedText style={styles.label}>Tugash vaqti</ThemedText>
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowEndPicker(true)}
      >
        <ThemedText>{endTime.toLocaleString("uz-UZ")}</ThemedText>
        <Ionicons name="time" size={20} color="#FF6B6B" />
      </TouchableOpacity>

      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="datetime"
          onChange={(event, selectedTime) => {
            setShowEndPicker(false);
            if (selectedTime) setEndTime(selectedTime);
          }}
        />
      )}

      <View style={styles.durationContainer}>
        <ThemedText type="subtitle">
          Davomiyligi: {calculateDuration()} daqiqa
        </ThemedText>
      </View>

      <Input
        label="Qo'shimcha ma'lumot"
        value={notes}
        onChangeText={setNotes}
        placeholder="Izoh..."
        multiline
      />

      <View style={styles.buttons}>
        {onCancel && (
          <Button
            title="Bekor qilish"
            variant="outline"
            onPress={onCancel}
            style={styles.button}
          />
        )}
        <Button
          title="Saqlash"
          onPress={handleSave}
          loading={loading}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  qualitySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  qualityButton: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  qualityButtonActive: {
    backgroundColor: "#FFE5E5",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  qualityTextActive: {
    color: "#FF6B6B",
    fontWeight: "bold",
    marginTop: 5,
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
  },
  durationContainer: {
    alignItems: "center",
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
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
