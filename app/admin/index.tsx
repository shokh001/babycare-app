import { ThemedText } from "@/components/ThemedText";
import { useAdmin } from "@/hooks/useAdmin";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function AdminDashboard() {
  const { user } = useAdmin();

  const menuItems = [
    {
      title: 'Maslahatlar',
      icon: 'bulb-outline',
      href: '/admin/tips',
      color: '#FF6B6B',
      description: 'Maslahatlarni boshqarish (qo\'shish, tahrirlash, o\'chirish)'
    },
    {
      title: 'Foydalanuvchilar',
      icon: 'people-outline',
      href: '/admin/users',
      color: '#4ECDC4',
      description: 'Foydalanuvchilar ro\'yxati va statistikasi'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark-outline" size={60} color="#FF6B6B" />
        <ThemedText type="title" style={styles.welcome}>
          Admin panel
        </ThemedText>
        <ThemedText style={styles.email}>{user?.email}</ThemedText>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <Link href={item.href as any} key={index} asChild>
            <TouchableOpacity style={styles.menuCard}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={30} color={item.color} />
              </View>
              <ThemedText type="subtitle" style={styles.menuTitle}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.menuDescription}>
                {item.description}
              </ThemedText>
            </TouchableOpacity>
          </Link>
        ))}
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
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  welcome: {
    marginTop: 10,
    color: '#FF6B6B',
  },
  email: {
    color: '#666',
    marginTop: 5,
  },
  menuGrid: {
    padding: 20,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuTitle: {
    marginBottom: 5,
  },
  menuDescription: {
    color: '#666',
    fontSize: 14,
  },
});