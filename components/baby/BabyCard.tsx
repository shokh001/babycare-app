import Colors from "@/constants/Colors";
import { Baby } from "@/context/BabyContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  baby: Baby;
  selected?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BabyCard({ baby, selected, onPress, onEdit, onDelete }: Props) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(baby.photo || null);

  useEffect(() => {
    // Baby o'zgarganda rasmni qayta yuklash
    setImageUri(baby.photo || null);
    setImageError(false);
  }, [baby.photo]);

  const ageInMonths = Math.floor(
    (Date.now() - new Date(baby.birthDate).getTime()) /
    (1000 * 60 * 60 * 24 * 30),
  );

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const isValidImageUri = imageUri &&
    (imageUri.startsWith('http') ||
      imageUri.startsWith('file://') ||
      imageUri.startsWith('data:image') ||
      imageUri.startsWith('blob:')); // ✅ web uchun blob URL

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Rasm qismi */}
        <View style={styles.imageContainer}>
          {isValidImageUri && !imageError ? (
            <>
              {imageLoading && (
                <View style={[styles.photoPlaceholder, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#FF6B6B" />
                </View>
              )}
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.photo,
                  imageLoading && styles.imageLoading,
                ]}
                onLoad={handleImageLoad}
                onError={handleImageError}
                resizeMode="cover"
              />
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons
                name={baby.gender === "male" ? "male" : "female"}
                size={30}
                color={
                  baby.gender === "male"
                    ? Colors.light.secondary
                    : Colors.light.primary
                }
              />
              {imageError && (
                <Text style={styles.errorText}>!</Text>
              )}
            </View>
          )}
        </View>

        {/* Ma'lumot qismi */}
        <View style={styles.info}>
          <Text style={styles.name}>{baby.name}</Text>
          <Text style={styles.age}>{ageInMonths} oylik</Text>
          {(baby.weight || baby.height) && (
            <Text style={styles.measurements}>
              {baby.weight ? `${baby.weight} kg` : ""}
              {baby.weight && baby.height ? " • " : ""}
              {baby.height ? `${baby.height} sm` : ""}
            </Text>
          )}
        </View>

        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.light.success}
          />
        )}
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons
                name="pencil-outline"
                size={20}
                color={Colors.light.primary}
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={Colors.light.danger}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  imageLoading: {
    opacity: 0.5,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  loadingContainer: {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  errorText: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF4444",
    color: "#fff",
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    overflow: "hidden",
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  age: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  measurements: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
});