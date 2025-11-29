import React from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";

import { fetcher } from "@/lib/api";
import { Select } from "@/components/NewMedScreen";
import { useServices } from "@/features/services/queries";

dayjs.locale("en-gb");

// Schema now includes optional gp_email.
// Empty string is allowed = "no email".
const schema = z.object({
  initials: z.string().min(1, "Initials required"),
  dob: z
    .string()
    .min(1, "Date of birth required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"), // we store YYYY-MM-DD in form state
  gp_email: z
    .string()
    .email("Invalid GP email")
    .or(z.literal(""))
    .optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewClientScreen() {
  const insets = useSafeAreaInsets();

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
      gp_email: "",
    },
  });

  const { data: services = [], isLoading: loadingServices, isError, error } = useServices();

  const serviceOptions = React.useMemo(
    () => services.map((s) => ({ label: s.name, value: String(s.id) })),
    [services]
  );

  const [selectedServiceId, setSelectedServiceId] = React.useState<string | undefined>(undefined);
  const [serviceTouched, setServiceTouched] = React.useState(false);

  // ------- DOB Field (calendar) -------

  const DobField = () => {
    const [showPicker, setShowPicker] = React.useState(false);

    return (
      <Controller
        control={control}
        name="dob"
        render={({ field: { onChange, value } }) => {
          // value stored as "YYYY-MM-DD"
          const display = value ? dayjs(value).format("DD/MM/YYYY") : "";

          const onPick = (_: any, date?: Date) => {
            // Android fires twice; iOS once
            if (Platform.OS === "android") setShowPicker(false);
            if (date) {
              onChange(dayjs(date).format("YYYY-MM-DD")); // store ISO for backend
            }
          };

          return (
            <View className="mb-4">
              <Text className="mb-1 font-medium text-neutral-700">Date of Birth</Text>

              {/* Readonly input that opens the calendar */}
              <Pressable onPress={() => setShowPicker(true)}>
                <TextInput
                  className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
                  // force visible text color
                  style={{ color: "#171717" }} // neutral-900
                  value={display}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#6B7280" // neutral-500
                  editable={false}
                  pointerEvents="none"
                />
              </Pressable>

              {!!errors.dob && (
                <Text className="text-red-600 text-sm mt-1">{String(errors.dob.message)}</Text>
              )}

              {showPicker && (
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "calendar"}
                  value={value ? dayjs(value).toDate() : new Date(2000, 0, 1)}
                  maximumDate={new Date()}
                  onChange={onPick}
                  themeVariant="light"
                />
              )}
            </View>
          );
        }}
      />
    );
  };

  // -----------------------------------

  const Input = ({
    name,
    label,
    keyboardType = "default",
    placeholder,
  }: {
    name: keyof FormData;
    label: string;
    keyboardType?: any;
    placeholder?: string;
  }) => (
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
            placeholder={placeholder}
            returnKeyType="next"
            blurOnSubmit={false}
            autoCapitalize={name === "initials" ? "characters" : "none"}
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

  const onSubmit = async (form: FormData) => {
    const serviceIdNum = Number(selectedServiceId);
    if (!serviceIdNum) {
      setServiceTouched(true);
      Alert.alert("Select Service", "Please select a service");
      return;
    }

    const gpEmail = form.gp_email?.trim() || null;

    const payload = {
      initials: form.initials.trim(),
      dob: form.dob, // already ISO (YYYY-MM-DD)
      gp_email: gpEmail,
      service_id: serviceIdNum,
    };

    await fetcher("/api/clients", { method: "POST", body: payload });
    Alert.alert("Success", "Client created successfully");
    reset();
    setSelectedServiceId(undefined);
    router.back();
  };

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
          <Text className="text-2xl font-bold mb-4">Add Client</Text>

          {/* Service selection */}
          <View className="mb-4">
            <Select
              label="Service"
              options={serviceOptions}
              value={selectedServiceId}
              onChange={(v) => {
                setSelectedServiceId(v);
                if (!serviceTouched) setServiceTouched(true);
              }}
              placeholder={loadingServices ? "Loading services…" : "Select service…"}
              disabled={loadingServices || isError || serviceOptions.length === 0}
            />
            {loadingServices && <Text className="text-neutral-500 mt-1">Fetching services…</Text>}
            {isError && (
              <Text className="text-red-600 mt-1">Failed to load services: {error?.message}</Text>
            )}
            {!loadingServices && !isError && serviceOptions.length === 0 && (
              <Text className="text-neutral-500 mt-1">No services found.</Text>
            )}
            {serviceTouched && !selectedServiceId && (
              <Text className="text-red-600 text-sm mt-1">Please select a service</Text>
            )}
            {!!selectedServiceId && (
              <Text className="text-xs text-neutral-500 mt-1">
                Selected ID: {selectedServiceId}
              </Text>
            )}
          </View>

          {/* Client fields */}
          <Input name="initials" label="Initials" placeholder="e.g., JS" />
          <DobField />

          {/* GP Email (optional) */}
          <Input
            name="gp_email"
            label="GP Email (optional)"
            placeholder="e.g., gp@example.com"
            keyboardType="email-address"
          />

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={`mt-2 mb-10 py-3 rounded-xl ${
              isSubmitting ? "bg-neutral-300" : "bg-emerald-500"
            }`}
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
