import { ThemedText } from "@/components/ThemedText";
import { useBaby } from "@/hooks/useBaby";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

interface Stats {
  feedingCount: number;
  sleepAvg: number;
  diaperCount: number;
  weightProgress: { date: string; weight: number }[];
  heightProgress: { date: string; height: number }[];
  sleepPattern: { date: string; hours: number }[];
}

export default function StatisticsScreen() {
  const { currentBaby } = useBaby();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [stats, setStats] = useState<Stats>({
    feedingCount: 0,
    sleepAvg: 0,
    diaperCount: 0,
    weightProgress: [],
    heightProgress: [],
    sleepPattern: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBaby) {
      loadStats();
    }
  }, [currentBaby, timeRange]);

  const loadStats = async () => {
    if (!currentBaby) return;
    setLoading(true);

    try {
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Ovqatlanish statistikasi
      const feedingQuery = query(
        collection(db, "feedings"),
        where("babyId", "==", currentBaby.id),
        where("time", ">=", startDate),
        orderBy("time", "desc"),
      );
      const feedingSnapshot = await getDocs(feedingQuery);
      const feedingCount = feedingSnapshot.size;

      // Uyqu statistikasi
      const sleepQuery = query(
        collection(db, "sleeps"),
        where("babyId", "==", currentBaby.id),
        where("startTime", ">=", startDate),
        orderBy("startTime", "desc"),
      );
      const sleepSnapshot = await getDocs(sleepQuery);
      let totalSleep = 0;
      const sleepPattern: { date: string; hours: number }[] = [];

      sleepSnapshot.forEach((doc) => {
        const data = doc.data();
        const duration = data.duration || 0;
        totalSleep += duration;

        const date = data.startTime.toDate().toLocaleDateString("uz-UZ");
        const existing = sleepPattern.find((d) => d.date === date);
        if (existing) {
          existing.hours += duration / 60;
        } else {
          sleepPattern.push({
            date,
            hours: duration / 60,
          });
        }
      });

      const sleepAvg =
        sleepSnapshot.size > 0 ? totalSleep / sleepSnapshot.size : 0;

      // Taglik statistikasi
      const diaperQuery = query(
        collection(db, "diapers"),
        where("babyId", "==", currentBaby.id),
        where("time", ">=", startDate),
        orderBy("time", "desc"),
      );
      const diaperSnapshot = await getDocs(diaperQuery);
      const diaperCount = diaperSnapshot.size;

      // O'sish statistikasi
      const growthQuery = query(
        collection(db, "growths"),
        where("babyId", "==", currentBaby.id),
        orderBy("date", "asc"),
      );
      const growthSnapshot = await getDocs(growthQuery);
      const weightProgress: { date: string; weight: number }[] = [];
      const heightProgress: { date: string; height: number }[] = [];

      growthSnapshot.forEach((doc) => {
        const data = doc.data();
        weightProgress.push({
          date: data.date.toDate().toLocaleDateString("uz-UZ"),
          weight: data.weight,
        });
        heightProgress.push({
          date: data.date.toDate().toLocaleDateString("uz-UZ"),
          height: data.height,
        });
      });
      setStats({
        feedingCount,
        sleepAvg,
        diaperCount,
        weightProgress,
        heightProgress,
        sleepPattern: sleepPattern.slice(-7), // Oxirgi 7 kun
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentBaby) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="stats-chart" size={80} color="#FF6B6B" />
        <ThemedText type="title" style={styles.emptyTitle}>
          Statistika mavjud emas
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Avval farzandingiz profilini yarating va ma'lumotlarni kiriting
        </ThemedText>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width - 40;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          {currentBaby.name} - Statistika
        </ThemedText>

        <View style={styles.timeRangeSelector}>
          <TouchableOpacity
            style={[
              styles.rangeButton,
              timeRange === "week" && styles.rangeButtonActive,
            ]}
            onPress={() => setTimeRange("week")}
          >
            <ThemedText
              style={timeRange === "week" ? styles.rangeTextActive : {}}
            >
              Hafta
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rangeButton,
              timeRange === "month" && styles.rangeButtonActive,
            ]}
            onPress={() => setTimeRange("month")}
          >
            <ThemedText
              style={timeRange === "month" ? styles.rangeTextActive : {}}
            >
              Oy
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rangeButton,
              timeRange === "year" && styles.rangeButtonActive,
            ]}
            onPress={() => setTimeRange("year")}
          >
            <ThemedText
              style={timeRange === "year" ? styles.rangeTextActive : {}}
            >
              Yil
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="fast-food" size={30} color="#FF6B6B" />
          <ThemedText type="title">{stats.feedingCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Ovqatlanish</ThemedText>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="moon" size={30} color="#4ECDC4" />
          <ThemedText type="title">{Math.round(stats.sleepAvg)} min</ThemedText>
          <ThemedText style={styles.statLabel}>(o'rtacha uyqu)</ThemedText>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="water" size={30} color="#96CEB4" />
          <ThemedText type="title">{stats.diaperCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Taglik</ThemedText>
        </View>
      </View>

      {stats.sleepPattern.length > 0 && (
        <View style={styles.chartContainer}>
          <ThemedText type="subtitle">Uyqu rejimi (soat)</ThemedText>
          <BarChart
            data={{
              labels: stats.sleepPattern.map((d) => d.date.slice(0, 5)),
              datasets: [{ data: stats.sleepPattern.map((d) => d.hours) }],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" soat"
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              // propsForLabels: { fontSize: 10 },
              // propsForVerticalLabels: { fontSize: 10 },
              // barPercentage: 0.7,
              // fillShadowGradient: "#FF6B6B",
              // fillShadowGradientOpacity: 1,
            }}
            style={styles.chart}
          />
        </View>
      )}

      {stats.weightProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ThemedText type="subtitle">Vazn o'sishi (kg)</ThemedText>
          <LineChart
            data={{
              labels: stats.weightProgress.map((d) => d.date.slice(0, 5)),
              datasets: [{ data: stats.weightProgress.map((d) => d.weight) }],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForLabels: { fontSize: 10 },
              propsForVerticalLabels: { fontSize: 10 },
              fillShadowGradient: "#4CAF50",
              fillShadowGradientOpacity: 0.3,
            }}
            style={styles.chart}
          />
        </View>
      )}

      {stats.heightProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ThemedText type="subtitle">Bo'y o'sishi (sm)</ThemedText>
          <LineChart
            data={{
              labels: stats.heightProgress.map((d) => d.date.slice(0, 5)),
              datasets: [{ data: stats.heightProgress.map((d) => d.height) }],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" sm"
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForLabels: { fontSize: 10 },
              propsForVerticalLabels: { fontSize: 10 },
              fillShadowGradient: "#2196F3",
              fillShadowGradientOpacity: 0.3,
            }}
            style={styles.chart}
          />
        </View>
      )}
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
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
  },
  header: {
    padding: 20,
    backgroundColor: "#FF6B6B",
  },
  headerTitle: {
    color: "#fff",
    marginBottom: 15,
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 5,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  rangeButtonActive: {
    backgroundColor: "#fff",
  },
  rangeTextActive: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
  },
  statCard: {
    width: "30%",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  chartContainer: {
    padding: 20,
    paddingTop: 0,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});