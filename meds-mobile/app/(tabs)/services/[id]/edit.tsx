// app/services/[id]/edit.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetcher } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Service name is required"),
});
type FormData = z.infer<typeof schema>;
type ShowServiceResponse = { data: { id: number; name: string } };

export default function EditService() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const sid = Array.isArray(id) ? id[0] : id; // normalize
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" }, // start empty; we’ll reset() after fetch
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!sid) return;
        const res = await fetcher<ShowServiceResponse>(`/api/services/${sid}`);
        // 🚀 This fills the inputs with existing values
        reset({ name: res.data?.name ?? "" });
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load service");
      } finally {
        setLoading(false);
      }
    })();
  }, [sid, reset]);

  const onSubmit = async (form: FormData) => {
    await fetcher(`/api/services/${sid}`, {
      method: "PUT",
      body: { name: form.name.trim() },
    });
    Alert.alert("Updated", "Service updated successfully");
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-neutral-600">Loading…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Edit Service</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value, onBlur } }) => (
          <View className="mb-4">
            <Text className="mb-1 font-medium">Service Name</Text>
            <TextInput
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
              style={{ color: "#171717" }}
              value={value}                 // will show “45 Culver Lane”
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., 45 Culver Lane"
              returnKeyType="done"
            />
            {!!errors.name && (
              <Text className="text-red-600 mt-1">{errors.name.message}</Text>
            )}
          </View>
        )}
      />

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className={`mt-2 py-3 rounded-xl ${isSubmitting ? "bg-neutral-300" : "bg-emerald-600"}`}
      >
        <Text className="text-center text-white text-lg font-semibold">
          {isSubmitting ? "Saving…" : "Save"}
        </Text>
      </Pressable>
    </View>
  );
}
