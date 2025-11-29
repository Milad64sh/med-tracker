import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCourse } from "@/features/courses/queries";
import { useClients } from "@/features/clients/queries";
import type { Client } from "@/features/dashboard/types";
import { MedicationDateField } from "@/components/MedicationDateField";
import { Select } from "@/components/NewMedScreen";
import { fetcher } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Medication name required"),
  strength: z.string().optional(),
  form: z.string().optional(),
  dose_per_admin: z.coerce.number().min(0.001, "Dose per admin required"),
  admins_per_day: z.coerce.number().min(0.001, "Admins per day required"),
  daily_use: z.coerce.number().min(0.001, "Daily use required"),
  pack_size: z.coerce.number().min(1, "Pack size must be at least 1"),
  packs_on_hand: z.coerce.number().min(0),
  loose_units: z.coerce.number().optional(),
  opening_units: z.coerce.number().min(0, "Opening units required"),
  start_date: z.string().min(1, "Start date required"), // stored as "YYYY-MM-DD"
});
type FormData = z.infer<typeof schema>;

export default function EditCourseScreen() {
  const router = useRouter();

  // id may be missing if this screen is hit incorrectly
  const { id } = useLocalSearchParams<{ id?: string }>();
  const courseId = id ? Number(id) : NaN;

  // If there's no id at all, redirect back to meds list
  useEffect(() => {
    if (!id) {
      router.replace("/meds");
    }
  }, [id, router]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      strength: "",
      form: "",
      dose_per_admin: undefined,
      admins_per_day: undefined,
      daily_use: undefined,
      pack_size: undefined,
      packs_on_hand: undefined,
      loose_units: undefined,
      opening_units: undefined,
      start_date: "",
    },
  });

  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useCourse(Number.isFinite(courseId) ? courseId : undefined);

  const {
    data: clients = [],
    isLoading: loadingClients,
    isError: clientsError,
    error: clientsErrorObj,
  } = useClients();

  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    undefined
  );

  // Build client dropdown options
  const clientOptions = React.useMemo(() => {
    return clients.map((c: Client) => {
      const initials = c.initials || "(no initials)";
      const dob =
        c.dob && typeof c.dob === "string" ? c.dob.slice(0, 10) : "Unknown DOB";
      const serviceName = c.service?.name || "No Service";
      const label = `${initials} (${dob}, ${serviceName})`;
      return { label, value: String(c.id) };
    });
  }, [clients]);

  // Prefill form once course data arrives
  useEffect(() => {
    if (!course) return;

    // If your API response nests data (e.g. course.data), adjust here:
    const c = (course as any)?.data ?? course;

    reset({
      name: c.name ?? "",
      strength: c.strength ?? "",
      form: c.form ?? "",
      dose_per_admin:
        c.dose_per_admin !== null && c.dose_per_admin !== undefined
          ? Number(c.dose_per_admin)
          : undefined,
      admins_per_day:
        c.admins_per_day !== null && c.admins_per_day !== undefined
          ? Number(c.admins_per_day)
          : undefined,
      daily_use:
        c.daily_use !== null && c.daily_use !== undefined
          ? Number(c.daily_use)
          : undefined,
      pack_size:
        c.pack_size !== null && c.pack_size !== undefined
          ? Number(c.pack_size)
          : undefined,
      packs_on_hand:
        c.packs_on_hand !== null && c.packs_on_hand !== undefined
          ? Number(c.packs_on_hand)
          : undefined,
      loose_units:
        c.loose_units !== null && c.loose_units !== undefined
          ? Number(c.loose_units)
          : undefined,
      opening_units:
        c.opening_units !== null && c.opening_units !== undefined
          ? Number(c.opening_units)
          : undefined,
      start_date: c.start_date ?? "",
    });

    setSelectedClientId(String(c.client_id));
  }, [course, reset]);


  // 1) If there's no id at all, we're already redirecting: render nothing
  if (!id) {
    return null;
  }

  // 2) If id is present but not a valid number, show a clear error
  if (!Number.isFinite(courseId)) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-600">
          Invalid course id in route. (Missing or not a number)
        </Text>
      </View>
    );
  }

  // 3) Normal loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-neutral-600">Loading medication…</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-600 mb-3">
          Failed to load medication details.
        </Text>
        <Pressable
          className="px-4 py-2 bg-neutral-800 rounded-xl"
          onPress={() => refetch()}
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const onSubmit = async (data: FormData) => {
    const idNum = Number(selectedClientId);
    if (!idNum) {
      Alert.alert("Select Client", "Please select a client");
      return;
    }

    if (!Number.isFinite(courseId)) {
      Alert.alert("Error", "Invalid course id; cannot save.");
      return;
    }

    try {
      await fetcher(`/api/courses/${courseId}`, {
        method: "PATCH",
        body: { ...data, client_id: idNum },
      });

      Alert.alert("Success", "Medication updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      console.error("Update course error", e);
      Alert.alert(
        "Error",
        e?.message || "Failed to update medication. Please try again."
      );
    }
  };

  const Input = ({
    name,
    label,
    keyboardType = "default",
  }: {
    name: keyof FormData;
    label: string;
    keyboardType?: any;
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View className="mb-4">
          <Text className="mb-1 font-medium text-neutral-700">{label}</Text>
          <TextInput
            className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
            onBlur={onBlur}
            onChangeText={onChange}
            value={String(value ?? "")}
            keyboardType={keyboardType}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          {!!errors[name] && (
            <Text className="text-red-600 text-sm mt-1">
              {errors[name]?.message as string}
            </Text>
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
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
        >
          <Text className="text-2xl font-bold mb-4">Edit Medication</Text>

          {/* Client dropdown */}
          <View className="mb-4">
            <Select
              label="Client"
              options={clientOptions}
              value={selectedClientId}
              onChange={setSelectedClientId}
              placeholder={loadingClients ? "Loading clients…" : "Select client…"}
              disabled={
                loadingClients || clientsError || clientOptions.length === 0
              }
            />

            {loadingClients && (
              <Text className="text-neutral-500 mt-1">Fetching clients…</Text>
            )}

            {clientsError && (
              <Text className="text-red-600 mt-1">
                Failed to load clients: {clientsErrorObj?.message}
              </Text>
            )}

            {!loadingClients && !clientsError && clientOptions.length === 0 && (
              <Text className="text-neutral-500 mt-1">No clients found.</Text>
            )}
          </View>

          {/* Medication fields */}
          <Input name="name" label="Medication Name" />
          <Input name="strength" label="Strength" />
          <Input name="form" label="Form" />
          <Input
            name="dose_per_admin"
            label="Dose per Admin"
            keyboardType="numeric"
          />
          <Input
            name="admins_per_day"
            label="Admins per Day"
            keyboardType="numeric"
          />
          <Input name="daily_use" label="Daily Use" keyboardType="numeric" />
          <Input name="pack_size" label="Pack Size" keyboardType="numeric" />
          <Input
            name="packs_on_hand"
            label="Packs on Hand"
            keyboardType="numeric"
          />
          <Input
            name="loose_units"
            label="Loose Units"
            keyboardType="numeric"
          />
          <Input
            name="opening_units"
            label="Opening Units"
            keyboardType="numeric"
          />

          {/* Start date with UK display + ISO storage */}
          <MedicationDateField
            control={control}
            errors={errors}
            name="start_date"
            label="Start Date"
          />

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={`mt-2 mb-10 py-3 rounded-xl ${
              isSubmitting ? "bg-neutral-300" : "bg-emerald-500"
            }`}
          >
            <Text className="text-center text-white text-lg font-semibold">
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
