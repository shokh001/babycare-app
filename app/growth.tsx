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

export default function GrowthScreen() {
  const { currentBaby } = useBaby();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCircumference, setHeadCircumference] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Web platform uchun sana formatlash
  const formatDateForWeb = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Web platform uchun date picker (native dizaynga o'xshatilgan)
  const renderWebDatePicker = (
    value: Date,
    onChange: (date: Date) => void,
    id: string
  ) => {
    return (
      <TouchableOpacity
        style={styles.datePicker}
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
          max={formatDateForWeb(new Date())}
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

    if (!weight || !height) {
      Alert.alert("Xatolik", "Vazn va bo'y maydonlarini to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const data = {
        babyId: currentBaby.id,
        weight: parseFloat(weight),
        height: parseFloat(height),
        headCircumference: headCircumference
          ? parseFloat(headCircumference)
          : null,
        notes,
        date,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, "growths"), data);

      Alert.alert("Muvaffaqiyatli", "Ma'lumot saqlandi");
      router.back();
    } catch (error: any) {
      console.error("Error saving growth:", error);
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
          O'sish kuzatish
        </ThemedText>
        <ThemedText style={styles.babyName}>{currentBaby.name}</ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.label}>Sana</ThemedText>
        
        {Platform.OS === 'web' ? (
          renderWebDatePicker(date, setDate, "growth-date")
        ) : (
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText>{date.toLocaleDateString("uz-UZ")}</ThemedText>
            <Ionicons name="calendar-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}

        {showDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
            maximumDate={new Date()}
          />
        )}

        <Input
          label="Vazn (kg) *"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="Masalan: 5.2"
        />

        <Input
          label="Bo'y (sm) *"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="Masalan: 60"
        />

        <Input
          label="Bosh aylanasi (sm)"
          value={headCircumference}
          onChangeText={setHeadCircumference}
          keyboardType="numeric"
          placeholder="Masalan: 40"
        />

        <Input
          label="Qo'shimcha ma'lumot"
          value={notes}
          onChangeText={setNotes}
          placeholder="Izoh..."
          multiline
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#FF6B6B" />
          <ThemedText style={styles.infoText}>
            Muntazam o'lchash farzandingiz rivojlanishini kuzatishga yordam beradi
          </ThemedText>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Bekor qilish"
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
          />
          <Button
            title="Saqlash"
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
  datePicker: {
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
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#666",
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