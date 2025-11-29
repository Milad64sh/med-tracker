import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      // Auth provider + root layout will handle navigation
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      Alert.alert("Sign in failed", "Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-2xl font-semibold mb-6">Sign in</Text>

          <Text className="mb-1 text-neutral-700">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="border border-neutral-300 rounded-lg px-3 py-2 mb-4 bg-white"
          />

          <Text className="mb-1 text-neutral-700">Password</Text>
          <View className="border border-neutral-300 rounded-lg flex-row items-center mb-4 bg-white px-3">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 py-2"
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <IconSymbol
                name={showPassword ? "eye": "eye.slash"}
                size={22}
                color="#999999" // neutral-700-ish; optional, remove if you want default
              />
            </Pressable>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 rounded-lg py-3 items-center mb-3"
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-white font-semibold">Sign in</Text>
            )}
          </Pressable>

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable>
              <Text className="text-blue-600 text-center mb-4">
                Forgot password?
              </Text>
            </Pressable>
          </Link>

          <View className="flex-row justify-center mt-2 mb-4">
            <Text className="text-neutral-700 mr-1">No account?</Text>
            <Link href="/signup" asChild>
              <Pressable>
                <Text className="text-blue-600">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
