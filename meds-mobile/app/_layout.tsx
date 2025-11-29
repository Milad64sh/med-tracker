// app/_layout.tsx
import "./global.css";

import React, { useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Stack, Redirect, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "@/context/AuthContext";

export const unstable_settings = {
  anchor: "(tabs)", // this is fine
};

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
        <Text className="mt-2 text-neutral-600">Checking session…</Text>
      </View>
    );
  }

  const inAuthGroup = segments[0] === "(auth)";

  // Not logged in → force them into auth group
  if (!user && !inAuthGroup) {
    return <Redirect href="/(auth)/signin" />;
  }

  // Logged in but sitting in auth group → kick them to tabs
  if (user && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, just render the normal stack, expo-router handles screens
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
          },
        },
      })
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGuard />
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
