// app/(tabs)/clients/_layout.tsx
import { Stack } from "expo-router";

export default function ClientsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* /clients */}
      <Stack.Screen name="index" />

      {/* /clients/newClient */}
      <Stack.Screen name="newClient" />

      {/* /clients/[id]/edit (via its own layout below) */}
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
