import { ThemedText } from "@/components/ThemedText";
import { BabyCard } from "@/components/baby/BabyCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useBaby } from "@/hooks/useBaby";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function BabyScreen() {
  const {
    babies,
    currentBaby,
    setCurrentBaby,
    addBaby,
    updateBaby,
    deleteBaby,
    loading,
  } = useBaby();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBaby, setEditingBaby] = useState<any>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [babyToDelete, setBabyToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!user) {
      Alert.alert("Xatolik", "Iltimos, avval tizimga kiring");
      setTimeout(() => {
        if (isMounted) {
          router.replace("/auth/login");
        }
      }, 100);
    }
  }, [user, isMounted]);

  const resetForm = () => {
    setName("");
    setBirthDate(new Date());
    setGender("male");
    setWeight("");
    setHeight("");
    setNotes("");
    setEditingBaby(null);
  };

  const openEditModal = (baby: any) => {
    setEditingBaby(baby);
    setName(baby.name);
    setBirthDate(new Date(baby.birthDate));
    setGender(baby.gender);
    setWeight(baby.weight?.toString() || "");
    setHeight(baby.height?.toString() || "");
    setNotes(baby.notes || "");
    setModalVisible(true);
  };

  const handleSaveBaby = async () => {
    if (!name.trim()) {
      Alert.alert("Xatolik", "Farzandingiz ismini kiriting");
      return;
    }

    setSaving(true);
    try {
      const babyData = {
        name: name.trim(),
        birthDate,
        gender,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        notes: notes.trim(),
      };

      let success = false;

      if (editingBaby) {
        success = await updateBaby(editingBaby.id, babyData);
        if (success) {
          Alert.alert("Muvaffaqiyatli", "Ma'lumotlar yangilandi");
        }
      } else {
        success = await addBaby(babyData);
        if (success) {
          Alert.alert("Muvaffaqiyatli", "Farzandingiz qo'shildi");
        }
      }

      if (success) {
        setModalVisible(false);
        resetForm();
      }
    } catch (error: any) {
      console.error("❌ Error in handleSaveBaby:", error);
      Alert.alert(
        "Xatolik",
        error.message || "Ma'lumot saqlashda muammo yuz berdi",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (babyId: string, babyName: string) => {
    setBabyToDelete({ id: babyId, name: babyName });
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (!babyToDelete) return;

    try {
      setSaving(true);
      const success = await deleteBaby(babyToDelete.id);

      if (success) {
        Alert.alert("Muvaffaqiyatli", `${babyToDelete.name} o'chirildi`);
      } else {
        Alert.alert("Xatolik", "O'chirish amalga oshmadi");
      }
    } catch (error: any) {
      Alert.alert("Xatolik", error.message || "O'chirishda muammo yuz berdi");
    } finally {
      setSaving(false);
      setDeleteModalVisible(false);
      setBabyToDelete(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>Yuklanmoqda...</ThemedText>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>Tizimga o'tilmoqda...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.subtitle}>
            {babies.length} ta farzand ro'yxatga olingan
          </ThemedText>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModalContent}>
              <ThemedText type="subtitle" style={{ marginBottom: 15 }}>
                Farzandingizni o‘chirish
              </ThemedText>
              <ThemedText style={{ marginBottom: 20 }}>
                {babyToDelete?.name} ni ro‘yxatdan o‘chirmoqchimisiz?
              </ThemedText>
              <View style={styles.confirmButtons}>
                <Button
                  title="Bekor qilish"
                  variant="outline"
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setBabyToDelete(null);
                  }}
                  style={{ flex: 1, marginRight: 10 }}
                />
                <Button
                  title="O‘chirish"
                  onPress={executeDelete}
                  loading={saving}
                  style={{ flex: 1, backgroundColor: '#FF4444' }}
                />
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.babiesList}>
          {babies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="happy-outline" size={60} color="#FF6B6B" />
              <ThemedText style={styles.emptyText}>
                Hozircha farzand qo'shilmagan
              </ThemedText>
            </View>
          ) : (
            babies.map((baby) => (
              <BabyCard
                key={baby.id}
                baby={baby}
                selected={currentBaby?.id === baby.id}
                onPress={() => setCurrentBaby(baby)}
                onEdit={() => openEditModal(baby)}
                onDelete={() => handleDelete(baby.id, baby.name)}
              />
            ))
          )}
        </View>

        <Button
          title="+ Yangi farzand qo'shish"
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
          style={styles.addButton}
        />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {editingBaby
                  ? `${editingBaby.name} - tahrirlash`
                  : "Yangi farzand qo'shish"}
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Ionicons name="close-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Farzandingiz ismi *"
                value={name}
                onChangeText={setName}
                placeholder="Masalan: Muhammadali"
              />

              <ThemedText style={styles.label}>Tug'ilgan sana</ThemedText>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText>{birthDate.toLocaleDateString("uz-UZ")}</ThemedText>
                <Ionicons name="calendar-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setBirthDate(selectedDate);
                  }}
                  maximumDate={new Date()}
                />
              )}

              <ThemedText style={styles.label}>Jinsi</ThemedText>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "male" && styles.genderSelected,
                  ]}
                  onPress={() => setGender("male")}
                >
                  <Ionicons
                    name="male"
                    size={24}
                    color={gender === "male" ? "#4ECDC4" : "#999"}
                  />
                  <ThemedText
                    style={gender === "male" ? styles.genderTextSelected : {}}
                  >
                    O'g'il
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "female" && styles.genderSelected,
                  ]}
                  onPress={() => setGender("female")}
                >
                  <Ionicons
                    name="female"
                    size={24}
                    color={gender === "female" ? "#FF6B6B" : "#999"}
                  />
                  <ThemedText
                    style={gender === "female" ? styles.genderTextSelected : {}}
                  >
                    Qiz
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Vazni (kg)"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="0.0"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Bo'yi (sm)"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    placeholder="0.0"
                  />
                </View>
              </View>

              <Input
                label="Qo'shimcha ma'lumot"
                value={notes}
                onChangeText={setNotes}
                placeholder="Allergiya, maxsus holatlar..."
                multiline
              />

              <View style={styles.modalButtons}>
                <Button
                  title="Bekor qilish"
                  variant="outline"
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  style={styles.modalButton}
                />
                <Button
                  title="Saqlash"
                  onPress={handleSaveBaby}
                  loading={saving}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignSelf: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: "#FF6B6B",
  },
  headerTitle: {
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    color: "#fff",
    opacity: 0.9,
  },
  babiesList: {
    padding: 20,
    minHeight: 200,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#999",
    marginTop: 10,
  },
  addButton: {
    margin: 20,
    marginTop: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  genderSelected: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF0F0",
  },
  genderTextSelected: {
    color: "#FF6B6B",
    fontWeight: "bold",
    marginLeft: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});