import { ThemedText } from "@/components/ThemedText";
import { useBaby } from "@/hooks/useBaby";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Tip {
  id: string;
  title: string;
  content: string;
  category: "feeding" | "sleep" | "health" | "development" | "general";
  ageFrom: number;
  ageTo: number;
  image?: string;
  createdAt: any;
}

export default function TipsScreen() {
  const { currentBaby } = useBaby();
  const [tips, setTips] = useState<Tip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const tipsQuery = query(collection(db, "tips"));

    // Real-time listener
    const unsubscribe = onSnapshot(tipsQuery, (snapshot) => {

      if (snapshot.empty) {
        setTips([]);
      } else {
        const tipsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tip[];

        setTips(tipsData);
      }
      setLoading(false);
    }, (error) => {
      Alert.alert("Xatolik", "Maslahatlarni yuklashda muammo yuz berdi");
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const categories = [
    { id: "all", name: "Barchasi", icon: "apps-outline" },
    { id: "feeding", name: "Ovqatlanish", icon: "restaurant-outline" },
    { id: "sleep", name: "Uyqu", icon: "moon-outline" },
    { id: "health", name: "Sog'liq", icon: "medical-outline" },
    { id: "development", name: "Rivojlanish", icon: "trending-up-outline" },
    { id: "general", name: "Umumiy", icon: "bulb-outline" },
  ];

  // Filterlangan maslahatlar
  const getFilteredTips = () => {
    let filtered = tips;

    // Kategoriya bo'yicha filter (agar "all" bo'lmasa)
    if (selectedCategory !== "all") {
      filtered = filtered.filter((tip) => tip.category === selectedCategory);
    }

    // ✅ YOSH FILTRI BUTUNLAY O'CHIRILDI
    // Barcha maslahatlar yoshga qaramasdan ko'rinadi

    return filtered;
  };

  const getAgeRange = (tip: Tip | null) => {
    if (!tip) return "";
    if (tip.ageTo >= 120) return `${tip.ageFrom}+ yosh`;
    return `${tip.ageFrom}-${tip.ageTo} yosh`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "feeding":
        return "restaurant-outline";
      case "sleep":
        return "moon-outline";
      case "health":
        return "medical-outline";
      case "development":
        return "trending-up-outline";
      default:
        return "bulb-outline";
    }
  };

  const filteredTips = getFilteredTips();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>Yuklanmoqda...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerSubtitle}>
          Farzandingiz rivojlanishi uchun foydali ma'lumotlar
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
      >
        <View style={styles.categories}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? "#FF6B6B" : "#666"}
              />
              <ThemedText
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={styles.tipsList}>
        {filteredTips.length === 0 ? (
          <View style={styles.noTipsContainer}>
            <Ionicons
              name="information-circle-outline"
              size={50}
              color="#999"
            />
            <ThemedText style={styles.noTipsText}>
              {currentBaby
                ? `${currentBaby.name} yoshiga mos maslahatlar hozircha yo'q`
                : "Maslahatlar mavjud emas"}
            </ThemedText>
          </View>
        ) : (
          filteredTips.map((tip) => (
            <TouchableOpacity
              key={tip.id}
              style={styles.tipCard}
              onPress={() => {
                setSelectedTip(tip);
                setModalVisible(true);
              }}
            >
              <View style={styles.tipHeader}>
                <View style={styles.tipIconContainer}>
                  <Ionicons
                    name={getCategoryIcon(tip.category)}
                    size={24}
                    color="#FF6B6B"
                  />
                </View>
                <View style={styles.tipTitleContainer}>
                  <ThemedText type="subtitle">{tip.title}</ThemedText>
                  <ThemedText style={styles.tipAge}>
                    {getAgeRange(tip)}
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#999"
                />
              </View>
              <ThemedText style={styles.tipPreview} numberOfLines={2}>
                {tip.content}
              </ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedTip(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {selectedTip?.title || "Maslahat"}
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSelectedTip(null);
                }}
              >
                <Ionicons name="close-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedTip?.image && (
                <Image
                  source={{ uri: selectedTip.image }}
                  style={styles.tipImage}
                />
              )}

              <View style={styles.tipMeta}>
                <View style={styles.tipCategory}>
                  <Ionicons
                    name={getCategoryIcon(selectedTip?.category || "general")}
                    size={16}
                    color="#FF6B6B"
                  />
                  <ThemedText style={styles.tipMetaText}>
                    {categories.find((c) => c.id === selectedTip?.category)
                      ?.name || "Umumiy"}
                  </ThemedText>
                </View>
                <View style={styles.tipCategory}>
                  <Ionicons name="calendar-outline" size={16} color="#FF6B6B" />
                  <ThemedText style={styles.tipMetaText}>
                    {getAgeRange(selectedTip)}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.tipFullContent}>
                {selectedTip?.content}
              </ThemedText>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedTip(null);
                }}
              >
                <ThemedText style={styles.closeButtonText}>Yopish</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "#FF6B6B",
  },
  headerSubtitle: {
    color: "#fff",
    opacity: 0.9,
  },
  categoriesScroll: {
    flexGrow: 0,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categories: {
    flexDirection: "row",
    padding: 15,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    minHeight: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: "#FFE5E5",
    borderWidth: 2,
    borderColor: "#FF6B6B",
    paddingVertical: 6, // border bilan balandlikni saqlash
  },
  categoryText: {
    marginLeft: 5,
    fontWeight: "500",
    color: "#555"
  },
  categoryTextActive: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  tipsList: {
    padding: 20,
  },
  noTipsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  noTipsText: {
    textAlign: "center",
    color: "#999",
    marginTop: 10,
  },
  tipCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  tipTitleContainer: {
    flex: 1,
  },
  tipAge: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  tipPreview: {
    color: "#666",
    lineHeight: 20,
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
  tipImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  tipMeta: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tipCategory: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  tipMetaText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#666",
  },
  tipFullContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  closeButton: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});