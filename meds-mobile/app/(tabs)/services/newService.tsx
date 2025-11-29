import React from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { fetcher } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Service name is required"),
  // opened_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Invalid date").optional(), // enable if backend supports it
});
type FormData = z.infer<typeof schema>;

export default function NewServiceScreen() {
  const insets = useSafeAreaInsets();
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (form: FormData) => {
    // Send only fields your backend accepts today:
    const payload: any = { name: form.name.trim() };
    // if you add opened_at later: payload.opened_at = form.opened_at;

    await fetcher("/api/services", { method: "POST", body: payload });
    Alert.alert("Success", "Service created successfully");
    reset();
    router.back();
  };

  const Input = ({
    name,
    label,
    placeholder,
  }: { name: keyof FormData; label: string; placeholder?: string }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View className="mb-4">
          <Text className="mb-1 font-medium text-neutral-700">{label}</Text>
          <TextInput
            className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
            style={{ color: "#171717" }}
            onBlur={onBlur}
            onChangeText={onChange}
            value={String(value ?? "")}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            returnKeyType="done"
          />
          {!!errors[name] && (
            <Text className="text-red-600 text-sm mt-1">{String(errors[name]?.message)}</Text>
          )}
        </View>
      )}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <ScrollView
          className="flex-1 px-5"
          contentInsetAdjustmentBehavior="always"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <Text className="text-2xl font-bold mb-4">Add Service</Text>

          <Input name="name" label="Service Name" placeholder="e.g., 45 Culver Lane" />

          {/* If you add a date field later, drop the calendar here (see section 2) */}

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={`mt-2 mb-10 py-3 rounded-xl ${isSubmitting ? "bg-neutral-300" : "bg-emerald-500"}`}
          >
            <Text className="text-center text-white text-lg font-semibold">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
