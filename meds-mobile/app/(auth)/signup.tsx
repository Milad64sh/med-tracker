import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { fetcher } from "@/lib/api";
import { Link, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- PASSWORD RULES VALIDATION ----
  const rules = useMemo(() => {
    return {
      length: password.length >= 12,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const allRulesPassed = Object.values(rules).every(Boolean);

  const handleSubmit = async () => {
    if (!name || !email || !password || !passwordConfirm) {
      Alert.alert("Missing fields", "All fields are required.");
      return;
    }

    if (!allRulesPassed) {
      Alert.alert("Weak password", "Please meet all password requirements.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Invalid password", "Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await fetcher("/api/auth/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
        },
      });

      Alert.alert(
        "Account created",
        "Your account has been created. Please sign in.",
        [{ text: "OK", onPress: () => router.push("/signin") }]
      );
    } catch (e: any) {
      console.log("Sign up error:", e?.details || e);
      const message =
        e?.details?.message ||
        "Unable to create account. Check your details and try again.";
      Alert.alert("Sign up failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  const Rule = ({ ok, label }: { ok: boolean; label: string }) => (
    <View className="flex-row items-center mb-1">
      <IconSymbol
        name={ok ? "checkmark.circle.fill" : "xmark.circle.fill"}
        size={18}
        color={ok ? "#22c55e" : "#d1d5db"}
      />
      <Text className={`ml-2 ${ok ? "text-emerald-600" : "text-neutral-600"}`}>
        {label}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-6">
          <Text className="text-2xl font-semibold mb-6">Create an account</Text>

          {/* FULL NAME */}
          <Text className="mb-1 text-neutral-700">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            className="border border-neutral-300 rounded-lg px-3 py-2 mb-4 bg-white"
          />

          {/* EMAIL */}
          <Text className="mb-1 text-neutral-700">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="border border-neutral-300 rounded-lg px-3 py-2 mb-4 bg-white"
          />

          {/* PASSWORD */}
          <Text className="mb-1 text-neutral-700">Password</Text>
          <View className="border border-neutral-300 rounded-lg flex-row items-center mb-2 bg-white px-3">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 py-2"
            />
            <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
              <IconSymbol name={showPassword ? "eye.slash" : "eye"} size={22} color="#4b5563" />
            </Pressable>
          </View>

          {/* PASSWORD RULES DISPLAY */}
          <View className="mb-4 pl-1">
            <Rule ok={rules.length} label="At least 12 characters" />
            <Rule ok={rules.upper} label="Contains an uppercase letter (A–Z)" />
            <Rule ok={rules.lower} label="Contains a lowercase letter (a–z)" />
            <Rule ok={rules.number} label="Contains a number (0–9)" />
            <Rule ok={rules.special} label="Contains a special character (!@#$%^&*)" />
          </View>

          {/* CONFIRM PASSWORD */}
          <Text className="mb-1 text-neutral-700">Confirm Password</Text>
          <View className="border border-neutral-300 rounded-lg flex-row items-center mb-6 bg-white px-3">
            <TextInput
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry={!showPasswordConfirm}
              className="flex-1 py-2"
            />
            <Pressable onPress={() => setShowPasswordConfirm((prev) => !prev)} hitSlop={8}>
              <IconSymbol name={showPasswordConfirm ? "eye.slash" : "eye"} size={22} color="#4b5563" />
            </Pressable>
          </View>

          {/* SUBMIT BUTTON */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`rounded-lg py-3 items-center mb-3 ${
              allRulesPassed && !submitting ? "bg-emerald-600" : "bg-neutral-300"
            }`}
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-white font-semibold">Sign Up</Text>
            )}
          </Pressable>

          {/* LINK TO SIGN IN */}
          <View className="flex-row justify-center mt-2 mb-4">
            <Text className="text-neutral-700 mr-1">Already have an account?</Text>
            <Link href="/signin" asChild>
              <Pressable>
                <Text className="text-blue-600">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
