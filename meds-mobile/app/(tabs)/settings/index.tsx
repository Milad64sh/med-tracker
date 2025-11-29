// app/settings/index.tsx

import React, { useState } from "react";
import { View, Text, ScrollView, Switch, Pressable, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
// import { IconSymbol } from "@/components/ui/icon-symbol";

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <ScrollView className="flex-1 bg-neutral-50 px-4 pt-4">
      <Text className="text-xl font-semibold text-neutral-900 mb-6">
        Settings
      </Text>

      {/* Preferences Card */}
      <View className="bg-white rounded-2xl px-4 py-3 border border-neutral-200 mb-4">
        <Text className="text-sm font-semibold text-neutral-700 mb-3">
          Preferences
        </Text>

        {/* Notifications */}
        <View className="flex-row justify-between items-center py-3 border-b border-neutral-100">
          <Text className="text-sm text-neutral-700">Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {/* Dark mode toggle */}
        <View className="flex-row justify-between items-center py-3">
          <Text className="text-sm text-neutral-700">Dark mode</Text>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </View>
      </View>

      {/* Account actions */}
      <View className="bg-white rounded-2xl px-4 py-3 border border-neutral-200 mb-4">
        <Text className="text-sm font-semibold text-neutral-700 mb-3">
          Account
        </Text>

        {/* Change password */}
        <Pressable
          className="py-3 border-b border-neutral-100"
          onPress={() => Alert.alert("Coming soon", "Password change coming later")}
        >
          <Text className="text-sm text-blue-600">Change password</Text>
        </Pressable>

        {/* Sign out */}
        <Pressable
          className="py-3"
          onPress={() => signOut()}
        >
          <Text className="text-sm text-red-600">Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
