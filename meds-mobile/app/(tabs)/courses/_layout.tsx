import { Stack } from "expo-router";

export default function ClientsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* /restock */}
      <Stack.Screen name="restock" />
    </Stack>
  );
}
