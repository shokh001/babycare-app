import { ThemedView } from "@/components/ThemedView";
import { StyleSheet, ViewProps } from "react-native";

interface Props extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export function Card({ children, style, ...props }: Props) {
  return (
    <ThemedView style={[styles.card, style]} {...props}>
      {children}
    </ThemedView>
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
});
