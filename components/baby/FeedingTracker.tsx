import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  babyId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function FeedingTracker({ babyId, onSave, onCancel }: Props) {
  const [type, setType] = useState<"breast" | "bottle" | "solid">("breast");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!babyId) {
      Alert.alert("Xatolik", "Avval farzandingizni tanlang");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "feedings"), {
        babyId,
        type,
        amount: amount ? parseFloat(amount) : null,
        duration: duration ? parseInt(duration) : null,
        notes,
        time,
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
            name="woman"
            size={24}
            color={type === "breast" ? "#FF6B6B" : "#999"}
          />
          <ThemedText style={type === "breast" && styles.typeTextActive}>
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
            name="water"
            size={24}
            color={type === "bottle" ? "#FF6B6B" : "#999"}
          />
          <ThemedText style={type === "bottle" && styles.typeTextActive}>
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
            name="restaurant"
            size={24}
            color={type === "solid" ? "#FF6B6B" : "#999"}
          />
          <ThemedText style={type === "solid" && styles.typeTextActive}>
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
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowTimePicker(true)}
      >
        <ThemedText>{time.toLocaleTimeString("uz-UZ")}</ThemedText>
        <Ionicons name="time" size={20} color="#FF6B6B" />
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
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
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
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
  typeTextActive: {
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
