import { Stack } from "expo-router";

export default function ClientIdLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit" />
    </Stack>
  );
}
