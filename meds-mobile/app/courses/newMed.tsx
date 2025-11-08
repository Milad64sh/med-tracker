import React from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetcher } from "@/lib/api";
import { useClients } from "@/features/clients/queries";
import { router } from "expo-router";
import { Select } from "@/components/NewMedScreen";
import type { Client } from "@/features/dashboard/types";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";


const schema = z.object({
  name: z.string().min(1, "Medication name required"),
  strength: z.string().optional(),
  form: z.string().optional(),
  dose_per_admin: z.coerce.number().optional(),
  admins_per_day: z.coerce.number().optional(),
  daily_use: z.coerce.number().min(0),
  pack_size: z.coerce.number(),
  packs_on_hand: z.coerce.number(),
  loose_units: z.coerce.number().optional(),
  opening_units: z.coerce.number().optional(),
  start_date: z.string().min(1, "Start date required"),
});
type FormData = z.infer<typeof schema>;

export default function NewMedScreen() {
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const { data: clients = [], isLoading: loadingClients, isError, error } = useClients();

  const clientOptions = React.useMemo(() => {
    return clients.map((c: Client) => {
      const initials = c.initials || "(no initials)";
      const dob = (c.dob && typeof c.dob === "string") ? c.dob.slice(0, 10) : "Unknown DOB";
      const serviceName = c.service?.name || "No Service";
      const label = `${initials} (${dob}, ${serviceName})`;
      return { label, value: String(c.id) };
    });
  }, [clients]);

  const [selectedClientId, setSelectedClientId] = React.useState<string | undefined>(undefined);

  const onSubmit = async (data: FormData) => {
    const idNum = Number(selectedClientId);
    if (!idNum) {
      Alert.alert("Select Client", "Please select a client first");
      return;
    }
    await fetcher("/api/courses", { method: "POST", body: { ...data, client_id: idNum } });
    Alert.alert("Success", "Medication added successfully");
    reset();
    router.back();
  };

  const Input = ({
    name,
    label,
    keyboardType = "default",
  }: { name: keyof FormData; label: string; keyboardType?: any }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View className="mb-4">
          <Text className="mb-1 font-medium text-neutral-700">{label}</Text>
          <TextInput
            className="border border-neutral-300 rounded-lg px-3 py-2"
            onBlur={onBlur}
            onChangeText={onChange}
            value={String(value ?? "")}
            keyboardType={keyboardType}
            // Helps navigation between fields so you don't have to dismiss keyboard
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
        keyboardVerticalOffset={Platform.select({
          ios: 0,           // if you have a header, put its height here
          android: 0,
        })}
      >
        <ScrollView
          className="flex-1 px-5"
          contentInsetAdjustmentBehavior="always"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <Text className="text-2xl font-bold mb-4">Add Medication</Text>

          {/* Select client dropdown */}
          <View className="mb-4">
            <Select
              label="Client"
              options={clientOptions}
              value={selectedClientId}
              onChange={setSelectedClientId}
              placeholder={loadingClients ? "Loading clients…" : "Select client…"}
              disabled={loadingClients || isError || clientOptions.length === 0}
            />

            {loadingClients && (
              <Text className="text-neutral-500 mt-1">Fetching clients…</Text>
            )}

            {isError && (
              <Text className="text-red-600 mt-1">Failed to load clients: {error?.message}</Text>
            )}

            {!loadingClients && !isError && clientOptions.length === 0 && (
              <Text className="text-neutral-500 mt-1">No clients found.</Text>
            )}

            {!!selectedClientId && (
              <Text className="text-xs text-neutral-500">Selected: {selectedClientId}</Text>
            )}
          </View>

          {/* Medication fields */}
          <Input name="name" label="Medication Name" />
          <Input name="strength" label="Strength" />
          <Input name="form" label="Form" />
          <Input name="dose_per_admin" label="Dose per Admin" keyboardType="numeric" />
          <Input name="admins_per_day" label="Admins per Day" keyboardType="numeric" />
          <Input name="daily_use" label="Daily Use" keyboardType="numeric" />
          <Input name="pack_size" label="Pack Size" keyboardType="numeric" />
          <Input name="packs_on_hand" label="Packs on Hand" keyboardType="numeric" />
          <Input name="loose_units" label="Loose Units" keyboardType="numeric" />
          <Input name="opening_units" label="Opening Units" keyboardType="numeric" />
          <Input name="start_date" label="Start Date (YYYY-MM-DD)" />

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
