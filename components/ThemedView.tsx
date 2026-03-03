import Colors from "@/constants/Colors";
import { useColorScheme, View, ViewProps } from "react-native";

interface Props extends ViewProps {
  style?: any;
  children?: React.ReactNode;
}

export function ThemedView({ style, children, ...props }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={[{ backgroundColor: colors.background }, style]} {...props}>
      {children}
    </View>
  );
}
