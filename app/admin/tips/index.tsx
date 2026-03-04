import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  ageFrom: number;
  ageTo: number;
  image?: string;
}

export default function TipsAdmin() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [tipToDelete, setTipToDelete] = useState<Tip | null>(null);

  useEffect(() => {
    const q = query(collection(db, "tips"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tip[];
      setTips(tipsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleDelete = (tip: Tip) => {
    setTipToDelete(tip);
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (!tipToDelete) return;

    try {
      await deleteDoc(doc(db, "tips", tipToDelete.id));
      Alert.alert("Muvaffaqiyatli", "Maslahat o'chirildi");
    } catch (error: any) {
      Alert.alert("Xatolik", error.message);
    } finally {
      setDeleteModalVisible(false);
      setTipToDelete(null);
    }
  };

  const getCategoryName = (cat: string) => {
    const categories: Record<string, string> = {
      feeding: 'Ovqatlanish',
      sleep: 'Uyqu',
      health: 'Sog\'liq',
      development: 'Rivojlanish',
      general: 'Umumiy'
    };
    return categories[cat] || cat;
  };

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
        <ThemedText type="title">Maslahatlar</ThemedText>
        <Link href="/admin/tips/create" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <ThemedText type="subtitle" style={{ marginBottom: 15 }}>
              Maslahatni o‘chirish
            </ThemedText>
            <ThemedText style={{ marginBottom: 20 }}>
              {tipToDelete?.title} ni o‘chirmoqchimisiz?
            </ThemedText>
            <View style={styles.confirmButtons}>
              <Button
                title="Bekor qilish"
                variant="secondary"
                onPress={() => {
                  setDeleteModalVisible(false);
                  setTipToDelete(null);
                }}
                style={{ flex: 1, marginRight: 10 }}
              />
              <Button
                title="O‘chirish"
                onPress={executeDelete}
                style={{ flex: 1, backgroundColor: '#FF4444' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.list}>
        {tips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bulb-outline" size={50} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              Hozircha maslahatlar yo'q
            </ThemedText>
          </View>
        ) : (
          tips.map(tip => (
            <View key={tip.id} style={styles.tipCard}>
              <TouchableOpacity 
                style={styles.tipContent}
                onPress={() => router.push(`/admin/tips/${tip.id}`)}
              >
                <View style={styles.tipHeader}>
                  <ThemedText type="subtitle">{tip.title}</ThemedText>
                  <View style={styles.categoryBadge}>
                    <ThemedText style={styles.categoryText}>
                      {getCategoryName(tip.category)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.tipPreview} numberOfLines={2}>
                  {tip.content}
                </ThemedText>
                <ThemedText style={styles.tipAge}>
                  {tip.ageFrom}-{tip.ageTo} oylik
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDelete(tip)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
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
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipContent: {
    flex: 1,
    padding: 15,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  tipPreview: {
    color: '#666',
    marginBottom: 5,
  },
  tipAge: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
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
});