import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { db } from "@/services/firebase";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const categories = [
  { id: 'feeding', name: 'Ovqatlanish' },
  { id: 'sleep', name: 'Uyqu' },
  { id: 'health', name: "Sog'liq" },
  { id: 'development', name: 'Rivojlanish' },
  { id: 'general', name: 'Umumiy' },
];

export default function CreateTip() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !content || !ageFrom || !ageTo) {
      Alert.alert('Xatolik', 'Barcha maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'tips'), {
        title,
        content,
        category,
        ageFrom: parseInt(ageFrom),
        ageTo: parseInt(ageTo),
        image: image || null,
        createdAt: new Date(),
      });

      Alert.alert('Muvaffaqiyatli', 'Maslahat qo\'shildi');
      router.back();
    } catch (error) {
      Alert.alert('Xatolik', 'Saqlashda muammo yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Input
          label="Sarlavha *"
          value={title}
          onChangeText={setTitle}
          placeholder="Maslahat sarlavhasi"
        />

        <Input
          label="Matn *"
          value={content}
          onChangeText={setContent}
          placeholder="Maslahat matni"
          multiline
        />

        <ThemedText style={styles.label}>Kategoriya *</ThemedText>
        <View style={styles.categoryContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                category === cat.id && styles.categoryButtonActive
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <ThemedText style={category === cat.id && styles.categoryTextActive}>
                {cat.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Input
              label="Yosh dan *"
              value={ageFrom}
              onChangeText={setAgeFrom}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View style={styles.halfWidth}>
            <Input
              label="Yosh gacha *"
              value={ageTo}
              onChangeText={setAgeTo}
              keyboardType="numeric"
              placeholder="120"
            />
          </View>
        </View>

        <Input
          label="Rasm URL (ixtiyoriy)"
          value={image}
          onChangeText={setImage}
          placeholder="https://example.com/image.jpg"
        />

        <View style={styles.buttons}>
          <Button
            title="Bekor qilish"
            onPress={() => router.back()}
            style={styles.button}
          />
          <Button
            variant="secondary"
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
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  categoryTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});