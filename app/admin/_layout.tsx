import { ThemedText } from "@/components/ThemedText";
import { useAdmin } from "@/hooks/useAdmin";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function AdminLayout() {
  const { isAdmin } = useAdmin();

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)');
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Ruxsat yo'q</ThemedText>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin panel',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }} 
      />
      <Stack.Screen 
        name="tips/index" 
        options={{ 
          title: 'Maslahatlar',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }} 
      />
      <Stack.Screen 
        name="tips/create" 
        options={{ 
          title: 'Yangi maslahat',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }} 
      />
      <Stack.Screen 
        name="tips/[id]" 
        options={{ 
          title: 'Maslahatni tahrirlash',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }} 
      />
      <Stack.Screen 
        name="users/index" 
        options={{ 
          title: 'Foydalanuvchilar',
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff'
        }} 
      />
    </Stack>
  );
}