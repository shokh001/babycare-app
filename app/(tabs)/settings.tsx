import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from "@/hooks/useAuth";
import { useBaby } from "@/hooks/useBaby";
import { auth } from '@/services/firebase'; // auth importini qo‘shing
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system/legacy';
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  Alert,
  Linking,
  Modal, Platform, ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View
} from 'react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { babies, deleteBaby } = useBaby()
  const [notifications, setNotifications] = useState(true);
  const { isAdmin } = useAdmin(); // qo‘shing

  // Yangi state lar
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Logout funksiyasi (modalni ochadi)
  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
  };

  // Haqiqiy logout (modal tasdiqlagandan keyin)
  const executeLogout = async () => {
    try {
      await logout();
      setLogoutModalVisible(false);
      // Navigatsiya AuthContext da qilingan, lekin ishonch uchun:
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout xatoligi:", error);
      Alert.alert("Xatolik", "Chiqishda muammo yuz berdi");
    }
  };


  const exportData = async () => {
    try {
      // Ma'lumotlarni tayyorlash
      const data = {
        user: { email: user?.email, uid: user?.uid },
        babies: babies.map(baby => ({
          ...baby,
          birthDate: baby.birthDate?.toDate ? baby.birthDate.toDate().toISOString() : baby.birthDate,
          createdAt: baby.createdAt?.toDate ? baby.createdAt.toDate().toISOString() : baby.createdAt,
          updatedAt: baby.updatedAt?.toDate ? baby.updatedAt.toDate().toISOString() : baby.updatedAt,
        })),
        exportDate: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(data, null, 2);

      if (Platform.OS === 'web') {
        // WEB: faylni brauzer orqali yuklab olish
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `babycare_export_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert("Muvaffaqiyatli", "Ma'lumotlar eksport qilindi (yuklab olish boshlandi)");
      } else {
        // NATIVE (Android/iOS): fayl tizimiga saqlash va ulashish
        const fileName = FileSystem.documentDirectory + "babycare_export_" + Date.now() + ".json";
        await FileSystem.writeAsStringAsync(fileName, jsonString, { encoding: 'utf8' });
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(fileName, {
            mimeType: "application/json",
            dialogTitle: "Ma'lumotlarni ulashish",
          });
        } else {
          Alert.alert("Ma'lumotlar", `Fayl saqlandi: ${fileName}`);
        }
      }
    } catch (error: any) {
      console.error("❌ Export error:", error);
      Alert.alert("Xatolik", error.message || "Noma'lum xatolik");
    }
  };

  const clearAllData = () => {

    // Web uchun window.confirm ishlatamiz
    if (Platform.OS === 'web') {
      if (window.confirm("Barcha ma'lumotlarni tozalash. Bu amalni qaytarib bo'lmaydi. Davom etasizmi?")) {
        executeClearAll();
      }
    } else {
      Alert.alert(
        "Barcha ma'lumotlarni tozalash",
        "Bu amal barcha bolalar va ularga tegishli barcha ma'lumotlarni butunlay o'chiradi. Bu amalni qaytarib bo'lmaydi. Davom etasizmi?",
        [
          { text: "Bekor qilish", style: "cancel" },
          {
            text: "Tozalash",
            onPress: executeClearAll,
            style: "destructive",
          },
        ],
      );
    }
  };

  const executeClearAll = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Foydalanuvchi tizimga kirmagan");

      for (const baby of babies) {
        const result = await deleteBaby(baby.id);
      }

      await AsyncStorage.clear();
      Alert.alert("Muvaffaqiyatli", "Barcha ma'lumotlar o'chirildi");
    } catch (error: any) {
      console.error("❌ Clear data error:", error);
      Alert.alert("Xatolik", error.message || "Ma'lumotlarni tozalashda muammo yuz berdi");
    }
  };

  const sendFeedback = () => {
    Linking.openURL(
      "mailto:support@babycare.uz?subject=Feedback&body=Ilova haqida fikr bildirish",
    );
  };

  const rateApp = () => {
    Linking.openURL(
      "https://play.google.com/store/apps/details?id=com.babycare.helper",
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://babycare.uz/privacy");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <ThemedText type="subtitle" style={{ marginBottom: 15 }}>
              Chiqish
            </ThemedText>
            <ThemedText style={{ marginBottom: 20 }}>
              Haqiqatan ham hisobingizdan chiqmoqchimisiz?
            </ThemedText>
            <View style={styles.confirmButtons}>
              <Button
                title="Bekor qilish"
                variant="secondary"
                onPress={() => setLogoutModalVisible(false)}
                style={{ flex: 1, marginRight: 10 }}
                />
              <Button
                title="Chiqish"
                onPress={executeLogout}
                style={{ flex: 1, backgroundColor: '#FF4444' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Profil
        </ThemedText>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle-outline" size={40} color="#FF6B6B" />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText type="subtitle">
              {user?.email?.split("@")[0] || "Foydalanuvchi"}
            </ThemedText>
            <ThemedText style={styles.profileEmail}>{user?.email}</ThemedText>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin' as any)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield-outline" size={24} color="#FF6B6B" />
              <ThemedText style={styles.settingText}>
                Admin panel
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ilova sozlamalari
        </ThemedText>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={24} color="#FF6B6B" />
            <ThemedText style={styles.settingText}>Bildirishnomalar</ThemedText>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#ddd", true: "#FF6B6B" }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ma'lumotlar
        </ThemedText>

        <TouchableOpacity style={styles.menuItem} onPress={exportData}>
          <View style={styles.settingLeft}>
            <Ionicons name="download-outline" size={24} color="#FF6B6B" />
            <ThemedText style={styles.settingText}>
              Ma'lumotlarni eksport qilish
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={clearAllData}>
          <View style={styles.settingLeft}>
            <Ionicons name="trash-outline" size={24} color="#FF4444" />
            <ThemedText style={[styles.settingText, { color: "#FF4444" }]}>
              Barcha ma'lumotlarni tozalash
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ilova haqida
        </ThemedText>

        <TouchableOpacity style={styles.menuItem} onPress={sendFeedback}>
          <View style={styles.settingLeft}>
            <Ionicons name="chatbubble-outline" size={24} color="#FF6B6B" />
            <ThemedText style={styles.settingText}>Fikr bildirish</ThemedText>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={rateApp}>
          <View style={styles.settingLeft}>
            <Ionicons name="star-outline" size={24} color="#FF6B6B" />
            <ThemedText style={styles.settingText}>Ilovani baholash</ThemedText>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={openPrivacyPolicy}>
          <View style={styles.settingLeft}>
            <Ionicons name="document-text-outline" size={24} color="#FF6B6B" />
            <ThemedText style={styles.settingText}>
              Maxfiylik siyosati
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.versionInfo}>
          <ThemedText style={styles.versionText}>Versiya 1.0.0</ThemedText>
        </View>
      </View>

      {/* Logout tugmasi */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogoutPress}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <ThemedText style={styles.logoutText}>Chiqish</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  header: {
    padding: 20,
    backgroundColor: "#FF6B6B",
  },
  headerTitle: {
    color: "#fff",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    marginBottom: 15,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    color: "#666",
    marginTop: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 15,
    fontSize: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  versionInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  versionText: {
    color: "#999",
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4444",
    margin: 20,
    padding: 15,
    borderRadius: 12,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});
