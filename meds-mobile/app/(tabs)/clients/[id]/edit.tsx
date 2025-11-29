import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";
import { DobField } from "@/components/DobField";
import { Select } from "@/components/NewMedScreen";

const schema = z.object({
  initials: z.string().min(1, "Initials are required"),
  dob: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Use YYYY-MM-DD format"
    ),
  service_id: z.number().int().optional(),
  gp_email: z
    .union([z.string().email("Invalid GP email"), z.literal("")])
    .optional(),
});

type FormData = z.infer<typeof schema>;

// Matches your ClientResource shape including gp_email
type ShowClientResponse = {
  data: {
    id: number;
    initials: string;
    dob: string | null; // 'YYYY-MM-DD' or null
    gp_email: string | null;
    service: { id: number | null; name?: string | null } | null;
  };
};

type ServiceRow = { id: number; name: string };

export default function EditClient() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const cid = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      initials: "",
      dob: "",
      service_id: undefined,
      gp_email: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [svcLoading, setSvcLoading] = useState(true);

  const svcOptions = services.map((s) => ({
    label: s.name,
    value: String(s.id),
  }));

  // Load services for the dropdown
  useEffect(() => {
    (async () => {
      try {
        setSvcLoading(true);
        const sres = await fetcher<ServiceRow[]>("/api/services/lookup");
        console.log("services =>", sres);
        setServices(sres);
      } catch (e: any) {
        console.warn("Failed to load services:", e?.message);
        setServices([]);
      } finally {
        setSvcLoading(false);
      }
    })();
  }, []);

  // Load current client and prefill
  useEffect(() => {
    (async () => {
      try {
        if (!cid) return;
        const res = await fetcher<ShowClientResponse>(`/api/clients/${cid}`);
        reset({
          initials: res.data?.initials ?? "",
          dob: res.data?.dob ?? "",
          service_id: res.data?.service?.id ?? undefined,
          gp_email: res.data?.gp_email ?? "",
        });
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load client");
      } finally {
        setLoading(false);
      }
    })();
  }, [cid, reset]);

  const onSubmit = async (form: FormData) => {
    try {
      const gpEmail = form.gp_email?.trim() || null;

      await fetcher(`/api/clients/${cid}`, {
        method: "PUT",
        body: {
          initials: form.initials.trim(),
          dob: form.dob || null,
          service_id: form.service_id ?? null,
          gp_email: gpEmail,
        },
      });

      // If your clients list query key is different, adjust this
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      Alert.alert("Updated", "Client updated successfully");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update client");
    }
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
      <Text className="text-2xl font-bold mb-4">Edit Client</Text>

      {/* Initials */}
      <Controller
        control={control}
        name="initials"
        render={({ field: { onChange, value, onBlur } }) => (
          <View className="mb-4">
            <Text className="mb-1 font-medium">Initials</Text>
            <TextInput
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
              style={{ color: "#171717" }}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., JS"
              autoCapitalize="characters"
              returnKeyType="done"
            />
            {!!errors.initials && (
              <Text className="text-red-600 mt-1">{errors.initials.message}</Text>
            )}
          </View>
        )}
      />

      {/* GP Email */}
      <Controller
        control={control}
        name="gp_email"
        render={({ field: { onChange, value, onBlur } }) => (
          <View className="mb-4">
            <Text className="mb-1 font-medium">GP Email (optional)</Text>
            <TextInput
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
              style={{ color: "#171717" }}
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., gp@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!errors.gp_email && (
              <Text className="text-red-600 mt-1">{errors.gp_email.message}</Text>
            )}
          </View>
        )}
      />

      {/* DOB */}
      <DobField control={control} errors={errors} />

      {/* Service */}
      <Controller
        control={control}
        name="service_id"
        render={({ field: { onChange, value } }) => (
          <View className="mb-6">
            {svcLoading ? (
              <View className="border border-neutral-300 rounded-lg px-3 py-2 bg-white flex-row items-center">
                <ActivityIndicator />
                <Text className="ml-2 text-neutral-600">Loading services…</Text>
              </View>
            ) : (
              <Select
                label="Service (optional)"
                options={svcOptions}
                value={value != null ? String(value) : undefined}
                onChange={(v) => {
                  onChange(v ? Number(v) : undefined);
                }}
                placeholder="— Select a service —"
              />
            )}

            {!!errors.service_id && (
              <Text className="text-red-600 mt-1">
                {errors.service_id.message}
              </Text>
            )}
          </View>
        )}
      />

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className={`mt-2 py-3 rounded-xl ${
          isSubmitting ? "bg-neutral-300" : "bg-emerald-600"
        }`}
      >
        <Text className="text-center text-white text-lg font-semibold">
          {isSubmitting ? "Saving…" : "Save"}
        </Text>
      </Pressable>
    </View>
  );
}
