import { ThemedText } from "@/components/ThemedText";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

interface UserStats {
  uid: string;
  email: string;
  babiesCount: number;
  feedingsCount: number;
  sleepsCount: number;
  diapersCount: number;
  growthsCount: number;
  lastActive?: Date;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // 1. Barcha bolalarni olish
      const babiesSnapshot = await getDocs(collection(db, "babies"));
      
      // 2. Foydalanuvchilar bo‘yicha guruhlash
      const userMap = new Map<string, UserStats>();

      for (const babyDoc of babiesSnapshot.docs) {
        const babyData = babyDoc.data();
        const uid = babyData.userId;
        
        if (!userMap.has(uid)) {
          // 3. Foydalanuvchi emailini olish (agar saqlangan bo‘lsa)
          // Firestore'da users kolleksiyasi bo‘lmasa, email noma'lum
          userMap.set(uid, {
            uid,
            email: uid, // vaqtincha
            babiesCount: 0,
            feedingsCount: 0,
            sleepsCount: 0,
            diapersCount: 0,
            growthsCount: 0,
          });
        }

        const userStats = userMap.get(uid)!;
        userStats.babiesCount++;

        // 4. Har bir kolleksiyadagi ma'lumotlarni hisoblash
        const feedingsSnap = await getDocs(query(
          collection(db, "feedings"), 
          where("babyId", "==", babyDoc.id)
        ));
        userStats.feedingsCount += feedingsSnap.size;

        const sleepsSnap = await getDocs(query(
          collection(db, "sleeps"), 
          where("babyId", "==", babyDoc.id)
        ));
        userStats.sleepsCount += sleepsSnap.size;

        const diapersSnap = await getDocs(query(
          collection(db, "diapers"), 
          where("babyId", "==", babyDoc.id)
        ));
        userStats.diapersCount += diapersSnap.size;

        const growthsSnap = await getDocs(query(
          collection(db, "growths"), 
          where("babyId", "==", babyDoc.id)
        ));
        userStats.growthsCount += growthsSnap.size;
      }

      setUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Xatolik", "Foydalanuvchilarni yuklashda muammo yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>Yuklanmoqda...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Foydalanuvchilar</ThemedText>
        <ThemedText style={styles.total}>
          Jami: {users.length} ta foydalanuvchi
        </ThemedText>
      </View>

      <View style={styles.list}>
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              Hozircha foydalanuvchilar yo'q
            </ThemedText>
          </View>
        ) : (
          users.map((user, index) => (
            <View key={user.uid} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userIcon}>
                  <Ionicons name="person-circle-outline" size={40} color="#FF6B6B" />
                </View>
                <View style={styles.userInfo}>
                  <ThemedText type="subtitle">
                    {user.email.length > 20 
                      ? user.email.substring(0, 20) + '...' 
                      : user.email}
                  </ThemedText>
                  <ThemedText style={styles.userId}>
                    ID: {user.uid.substring(0, 8)}...
                  </ThemedText>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="person-outline" size={20} color="#FF6B6B" />
                  <ThemedText style={styles.statNumber}>{user.babiesCount}</ThemedText>
                  <ThemedText style={styles.statLabel}>Bola</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="restaurant-outline" size={20} color="#4ECDC4" />
                  <ThemedText style={styles.statNumber}>{user.feedingsCount}</ThemedText>
                  <ThemedText style={styles.statLabel}>Ovqat</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="moon-outline" size={20} color="#96CEB4" />
                  <ThemedText style={styles.statNumber}>{user.sleepsCount}</ThemedText>
                  <ThemedText style={styles.statLabel}>Uyqu</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="water-outline" size={20} color="#FFB347" />
                  <ThemedText style={styles.statNumber}>{user.diapersCount}</ThemedText>
                  <ThemedText style={styles.statLabel}>Taglik</ThemedText>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="stats-chart-outline" size={20} color="#2196F3" />
                  <ThemedText style={styles.statNumber}>{user.growthsCount}</ThemedText>
                  <ThemedText style={styles.statLabel}>O'sish</ThemedText>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  total: {
    color: '#666',
    marginTop: 5,
  },
  list: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userIcon: {
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});