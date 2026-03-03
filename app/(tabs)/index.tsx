import { BabyCard } from "@/components/baby/BabyCard";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useBaby } from "@/hooks/useBaby";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Activity {
  id: string;
  type: "feeding" | "sleep" | "diaper" | "growth";
  description: string;
  time: any;
  babyId: string;
}

export default function HomeScreen() {
  const { babies, currentBaby, setCurrentBaby } = useBaby();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Har bir kolleksiya ma'lumotlarini alohida saqlash
  const [feedings, setFeedings] = useState<Activity[]>([]);
  const [sleeps, setSleeps] = useState<Activity[]>([]);
  const [diapers, setDiapers] = useState<Activity[]>([]);
  const [growths, setGrowths] = useState<Activity[]>([]);

  const getActivityDescription = useCallback((type: string, data: any): string => {
    switch (type) {
      case "feeding":
        if (data.type === "breast")
          return `🤱 Emizish: ${data.duration || 0} daqiqa`;
        if (data.type === "bottle")
          return `🍼 Sun'iy ovqat: ${data.amount || 0} ml`;
        if (data.type === "solid") 
          return `🥣 Qattiq ovqat: ${data.amount || 0} g`;
        return "🍼 Ovqatlantirish";

      case "sleep":
        const hours = Math.floor(data.duration / 60);
        const minutes = data.duration % 60;
        return `😴 Uyqu: ${hours} soat ${minutes} daqiqa`;

      case "diaper":
        if (data.type === "wet") return "💧 Ho'l taglik";
        if (data.type === "dirty") return "💩 Katta taglik";
        if (data.type === "both") return "💧💩 Ho'l va katta taglik";
        return "🧻 Taglik almashtirish";

      case "growth":
        return `📈 O'sish: ${data.weight} kg, ${data.height} sm`;

      default:
        return "📝 Faoliyat";
    }
  }, []);

  // Barcha kolleksiyalarni birlashtirib, saralash
  const mergeActivities = useCallback(() => {
   
    const all = [...feedings, ...sleeps, ...diapers, ...growths];
    
    if (all.length === 0) {
      setRecentActivities([]);
      setLoading(false);
      return;
    }
    
    const sorted = all.sort((a, b) => {
      const timeA = a.time?.toDate ? a.time.toDate() : new Date(a.time);
      const timeB = b.time?.toDate ? b.time.toDate() : new Date(b.time);
      return timeB.getTime() - timeA.getTime();
    });
    
    setRecentActivities(sorted.slice(0, 10));
    setLoading(false);
  }, [feedings, sleeps, diapers, growths]);

  useEffect(() => {
    if (!currentBaby) {
      setRecentActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Reset states
    setFeedings([]);
    setSleeps([]);
    setDiapers([]);
    setGrowths([]);

    // Feedings
    const feedingsQuery = query(
      collection(db, "feedings"),
      where("babyId", "==", currentBaby.id),
      orderBy("time", "desc"),
      limit(20)
    );

    const unsubFeed = onSnapshot(feedingsQuery, (snapshot) => {
      if (snapshot.empty) {
      } else {
        snapshot.docs.forEach(doc => {
        });
      }
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "feeding",
          description: getActivityDescription("feeding", data),
          time: data.time,
          babyId: data.babyId,
        } as Activity;
      });
      setFeedings(items);
    }, (error) => {
      console.error("❌ Feedings error:", error);
    });

    // Sleeps
    const sleepsQuery = query(
      collection(db, "sleeps"),
      where("babyId", "==", currentBaby.id),
      orderBy("startTime", "desc"),
      limit(20)
    );

    const unsubSleep = onSnapshot(sleepsQuery, (snapshot) => {
      if (snapshot.empty) {
      } else {
        snapshot.docs.forEach(doc => {
        });
      }
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "sleep",
          description: getActivityDescription("sleep", data),
          time: data.startTime,
          babyId: data.babyId,
        } as Activity;
      });
      setSleeps(items);
    }, (error) => {
      console.error("❌ Sleeps error:", error);
    });

    // Diapers
    const diapersQuery = query(
      collection(db, "diapers"),
      where("babyId", "==", currentBaby.id),
      orderBy("time", "desc"),
      limit(20)
    );

    const unsubDiaper = onSnapshot(diapersQuery, (snapshot) => {
      if (snapshot.empty) {
      } else {
        snapshot.docs.forEach(doc => {
        });
      }
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "diaper",
          description: getActivityDescription("diaper", data),
          time: data.time,
          babyId: data.babyId,
        } as Activity;
      });
      setDiapers(items);
    }, (error) => {
      console.error("❌ Diapers error:", error);
    });

    // Growths
    const growthsQuery = query(
      collection(db, "growths"),
      where("babyId", "==", currentBaby.id),
      orderBy("date", "desc"),
      limit(20)
    );

    const unsubGrowth = onSnapshot(growthsQuery, (snapshot) => {
      if (snapshot.empty) {
      } else {
        snapshot.docs.forEach(doc => {
        });
      }
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "growth",
          description: getActivityDescription("growth", data),
          time: data.date,
          babyId: data.babyId,
        } as Activity;
      });
      setGrowths(items);
    }, (error) => {
      console.error("❌ Growths error:", error);
    });

    return () => {
      unsubFeed();
      unsubSleep();
      unsubDiaper();
      unsubGrowth();
    };
  }, [currentBaby, getActivityDescription]);

  // Har safar kolleksiyalar o'zgarganda birlashtir
  useEffect(() => {
    mergeActivities();
  }, [feedings, sleeps, diapers, growths, mergeActivities]);

  const onRefresh = () => {
    setRefreshing(true);
    // Hech narsa qilish shart emas, onSnapshot avtomatik yangilanadi
    setTimeout(() => setRefreshing(false), 500);
  };

  if (babies.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="happy-outline" size={80} color="#FF6B6B" />
        <ThemedText type="title" style={styles.emptyTitle}>
          Farzandingiz haqida ma'lumot yo'q
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Iltimos, avval farzandingiz profilini yarating
        </ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/baby")}
        >
          <ThemedText style={styles.addButtonText}>Profil yaratish</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.welcomeSection}>
        <ThemedText type="title" style={styles.welcomeText}>
          Salom, {user?.email?.split("@")[0] || "Foydalanuvchi"}!
        </ThemedText>
        {currentBaby && (
          <ThemedText type="subtitle" style={styles.babyName}>
            {currentBaby.name} 👶
          </ThemedText>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle">Farzandlaringiz</ThemedText>
          {babies.map((baby) => (
            <BabyCard
              key={baby.id}
              baby={baby}
              selected={currentBaby?.id === baby.id}
              onPress={() => setCurrentBaby(baby)}
            />
          ))}
        </View>

        <View style={styles.quickActions}>
          <ThemedText type="subtitle">Tezkor amallar</ThemedText>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FFE5E5" }]}
              onPress={() => router.push("/feeding")}
            >
              <Ionicons name="restaurant-outline" size={30} color="#FF6B6B" />
              <ThemedText>Ovqat</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#E5F2FF" }]}
              onPress={() => router.push("/sleep")}
            >
              <Ionicons name="moon-outline" size={30} color="#4ECDC4" />
              <ThemedText>Uyqu</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#E5FFE5" }]}
              onPress={() => router.push("/diaper")}
            >
              <Ionicons name="water-outline" size={30} color="#96CEB4" />
              <ThemedText>Taglik</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FFF0E5" }]}
              onPress={() => router.push("/growth")}
            >
              <Ionicons name="stats-chart-outline" size={30} color="#FFA07A" />
              <ThemedText>O'sish</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ThemedText>Yuklanmoqda...</ThemedText>
          </View>
        ) : recentActivities.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="subtitle">Oxirgi faoliyatlar</ThemedText>
            {recentActivities.map((item) => (
              <View key={`${item.type}-${item.id}`} style={styles.activityItem}>
                <Ionicons
                  name={
                    item.type === "feeding"
                      ? "restaurant-outline"
                      : item.type === "sleep"
                        ? "moon-outline"
                        : item.type === "diaper"
                          ? "water-outline"
                          : "stats-chart-outline"
                  }
                  size={24}
                  color="#FF6B6B"
                />
                <View style={styles.activityInfo}>
                  <ThemedText>{item.description}</ThemedText>
                  <ThemedText style={styles.activityTime}>
                    {item.time?.toDate
                      ? new Date(item.time.toDate()).toLocaleString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })
                      : new Date(item.time).toLocaleString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noActivitiesContainer}>
            <Ionicons name="time-outline" size={50} color="#ccc" />
            <ThemedText style={styles.noActivitiesText}>
              Hozircha hech qanday faoliyat yo'q
            </ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  welcomeSection: {
    backgroundColor: "#FF6B6B",
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
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
  section: {
    marginBottom: 25,
  },
  quickActions: {
    marginBottom: 25,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  noActivitiesContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  noActivitiesText: {
    color: "#999",
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
});