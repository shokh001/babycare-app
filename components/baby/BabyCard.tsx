import Colors from "@/constants/Colors";
import { Baby } from "@/context/BabyContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  baby: Baby;
  selected?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BabyCard({ baby, selected, onPress, onEdit, onDelete }: Props) {
  const ageInMonths = Math.floor(
    (Date.now() - new Date(baby.birthDate).getTime()) /
    (1000 * 60 * 60 * 24 * 30),
  );

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={baby.gender === "male" ? "male" : "female"}
            size={40}
            color={baby.gender === "male" ? Colors.light.secondary : Colors.light.primary}
          />
        </View>

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
          <Ionicons name="checkmark-circle" size={24} color={Colors.light.success} />
        )}
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="pencil-outline" size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color={Colors.light.danger} />
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
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
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