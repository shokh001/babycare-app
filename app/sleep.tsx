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

export default function SleepScreen() {
  const { currentBaby } = useBaby();
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [quality, setQuality] = useState<"good" | "normal" | "bad">("normal");
  const [notes, setNotes] = useState("");
  
  // Mobile uchun alohida state'lar (sana va vaqt)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const calculateDuration = () => {
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    return durationMinutes > 0 ? durationMinutes : 0;
  };

  const handleSave = async () => {
    if (!currentBaby) {
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
      const sleepData = {
        babyId: currentBaby.id,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        quality: quality,
        notes: notes || "",
        createdAt: new Date(),
      };
      
      await addDoc(collection(db, "sleeps"), sleepData);
      Alert.alert("Muvaffaqiyatli", "Uyqu ma'lumoti saqlandi");
      router.back();
    } catch (error: any) {
      console.error("❌ Error saving sleep:", error);
      let errorMessage = error.message;
      if (error.code === "permission-denied") {
        errorMessage = "Sizda ma'lumot saqlash uchun ruxsat yo'q";
      } else if (error.code === "unauthenticated") {
        errorMessage = "Iltimos, qaytadan tizimga kiring";
      }
      Alert.alert("Xatolik", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Web platform uchun vaqt formatlash (faqat vaqt uchun)
  const formatTimeForWeb = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Web platform uchun sana formatlash
  const formatDateForWeb = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Web platform uchun vaqt picker
  const renderWebTimePicker = (
    value: Date,
    onChange: (date: Date) => void,
    id: string
  ) => {
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

  // Web platform uchun sana picker
  const renderWebDatePicker = (
    value: Date,
    onChange: (date: Date) => void,
    id: string
  ) => {
    return (
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => {
          const input = document.getElementById(id) as HTMLInputElement;
          if (input) input.showPicker();
        }}
      >
        <ThemedText>{value.toLocaleDateString("uz-UZ")}</ThemedText>
        <Ionicons name="calendar-outline" size={20} color="#FF6B6B" />
        <input
          id={id}
          type="date"
          value={formatDateForWeb(value)}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
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
          Uyqu kuzatish
        </ThemedText>
        <ThemedText style={styles.babyName}>{currentBaby.name}</ThemedText>
      </View>

      <View style={styles.content}>
        {/* Uyqu sifati */}
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
              name="happy-outline"
              size={24}
              color={quality === "good" ? "#4CAF50" : "#999"}
            />
            <ThemedText
              style={[
                styles.qualityText,
                quality === "good" && styles.qualityTextActive,
              ]}
            >
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
              name="remove-outline"
              size={24}
              color={quality === "normal" ? "#FFC107" : "#999"}
            />
            <ThemedText
              style={[
                styles.qualityText,
                quality === "normal" && styles.qualityTextActive,
              ]}
            >
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
              name="sad-outline"
              size={24}
              color={quality === "bad" ? "#F44336" : "#999"}
            />
            <ThemedText
              style={[
                styles.qualityText,
                quality === "bad" && styles.qualityTextActive,
              ]}
            >
              Yomon
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Boshlanish vaqti */}
        <ThemedText style={styles.label}>Boshlanish vaqti</ThemedText>
        {Platform.OS === 'web' ? (
          <>
            <ThemedText style={styles.subLabel}>Sana</ThemedText>
            {renderWebDatePicker(startTime, (date) => {
              const newDate = new Date(startTime);
              newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setStartTime(newDate);
            }, "start-date")}
            
            <ThemedText style={styles.subLabel}>Vaqt</ThemedText>
            {renderWebTimePicker(startTime, (time) => {
              const newDate = new Date(startTime);
              newDate.setHours(time.getHours(), time.getMinutes());
              setStartTime(newDate);
            }, "start-time")}
          </>
        ) : (
          <>
            {/* Mobile uchun sana tanlash */}
            <TouchableOpacity
              style={styles.timePicker}
              onPress={() => setShowStartDatePicker(true)}
            >
              <ThemedText>{startTime.toLocaleDateString("uz-UZ")}</ThemedText>
              <Ionicons name="calendar-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startTime}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    const newDate = new Date(startTime);
                    newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    setStartTime(newDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            {/* Mobile uchun vaqt tanlash */}
            <TouchableOpacity
              style={styles.timePicker}
              onPress={() => setShowStartTimePicker(true)}
            >
              <ThemedText>{startTime.toLocaleTimeString("uz-UZ")}</ThemedText>
              <Ionicons name="time-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(event, selectedTime) => {
                  setShowStartTimePicker(false);
                  if (selectedTime) {
                    const newDate = new Date(startTime);
                    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                    setStartTime(newDate);
                  }
                }}
              />
            )}
          </>
        )}

        {/* Tugash vaqti */}
        <ThemedText style={styles.label}>Tugash vaqti</ThemedText>
        {Platform.OS === 'web' ? (
          <>
            <ThemedText style={styles.subLabel}>Sana</ThemedText>
            {renderWebDatePicker(endTime, (date) => {
              const newDate = new Date(endTime);
              newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setEndTime(newDate);
            }, "end-date")}
            
            <ThemedText style={styles.subLabel}>Vaqt</ThemedText>
            {renderWebTimePicker(endTime, (time) => {
              const newDate = new Date(endTime);
              newDate.setHours(time.getHours(), time.getMinutes());
              setEndTime(newDate);
            }, "end-time")}
          </>
        ) : (
          <>
            {/* Mobile uchun sana tanlash */}
            <TouchableOpacity
              style={styles.timePicker}
              onPress={() => setShowEndDatePicker(true)}
            >
              <ThemedText>{endTime.toLocaleDateString("uz-UZ")}</ThemedText>
              <Ionicons name="calendar-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endTime}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) {
                    const newDate = new Date(endTime);
                    newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    setEndTime(newDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            {/* Mobile uchun vaqt tanlash */}
            <TouchableOpacity
              style={styles.timePicker}
              onPress={() => setShowEndTimePicker(true)}
            >
              <ThemedText>{endTime.toLocaleTimeString("uz-UZ")}</ThemedText>
              <Ionicons name="time-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(false);
                  if (selectedTime) {
                    const newDate = new Date(endTime);
                    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                    setEndTime(newDate);
                  }
                }}
              />
            )}
          </>
        )}

        {/* Davomiylik */}
        <View style={styles.durationContainer}>
          <ThemedText type="subtitle" style={styles.durationText}>
            Davomiyligi: {calculateDuration()} daqiqa
          </ThemedText>
          <ThemedText style={styles.durationHint}>
            {Math.floor(calculateDuration() / 60)} soat {calculateDuration() % 60} daqiqa
          </ThemedText>
        </View>

        {/* Qo'shimcha ma'lumot */}
        <Input
          label="Qo'shimcha ma'lumot"
          value={notes}
          onChangeText={setNotes}
          placeholder="Izoh..."
          multiline
        />

        {/* Tugmalar */}
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
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    marginTop: 5,
    color: "#666",
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
  qualityText: {
    marginTop: 5,
    color: "#666",
    fontSize: 14,
  },
  qualityTextActive: {
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
  durationContainer: {
    alignItems: "center",
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  durationText: {
    color: "#333",
  },
  durationHint: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
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