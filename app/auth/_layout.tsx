import { AuthProvider } from "@/context/AuthContext";
import { BabyProvider } from "@/context/BabyContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BabyProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="feeding"
                options={{
                  title: "Ovqatlantirish",
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="sleep"
                options={{
                  title: "Uyqu",
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="diaper"
                options={{
                  title: "Taglik",
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="growth"
                options={{
                  title: "O'sish",
                  presentation: "card",
                }}
              />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
        </BabyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
