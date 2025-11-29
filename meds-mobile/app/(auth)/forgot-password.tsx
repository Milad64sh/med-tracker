import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { fetcher } from "@/lib/api"; // ⬅️ changed from { api }
import { Link } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Missing email");
      return;
    }
    setSubmitting(true);
    try {
      await fetcher("/api/auth/forgot-password", {
        method: "POST",
        body: { email: email.trim() },
      });

      Alert.alert(
        "Check your email",
        "If that address is registered, a reset link has been sent."
      );
    } catch (e: any) {
      console.log("Forgot password error", e?.message || e);
      Alert.alert("Error", "Unable to send reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-neutral-50">
      <Text className="text-2xl font-semibold mb-6">Forgot password</Text>

      <Text className="mb-1 text-neutral-700">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="border border-neutral-300 rounded-lg px-3 py-2 mb-4 bg-white"
      />

      <Pressable
        onPress={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 rounded-lg py-3 items-center mb-3"
      >
        {submitting ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-white font-semibold">Send reset link</Text>
        )}
      </Pressable>

      <Link href="/(auth)/signin" asChild>
        <Pressable>
          <Text className="text-blue-600 text-center">Back to sign in</Text>
        </Pressable>
      </Link>
    </View>
  );
}
