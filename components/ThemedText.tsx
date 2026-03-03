import Colors from "@/constants/Colors";
import { StyleSheet, Text, TextProps, useColorScheme } from "react-native";

interface Props extends TextProps {
  type?: "default" | "title" | "subtitle" | "link";
  style?: any;
}

export function ThemedText({ style, type = "default", ...props }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const getStyle = () => {
    switch (type) {
      case "title":
        return styles.title;
      case "subtitle":
        return styles.subtitle;
      case "link":
        return [styles.link, { color: colors.tint }];
      default:
        return styles.default;
    }
  };

  return (
    <Text style={[getStyle(), { color: colors.text }, style]} {...props} />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
