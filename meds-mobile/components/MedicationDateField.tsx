// components/MedicationDateField.tsx
import React from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Controller, Control, FieldErrors } from "react-hook-form";
import dayjs from "dayjs";

type MedicationDateFieldProps = {
  control: Control<any>;
  errors: FieldErrors<any>;
  name: string;    // e.g. "start_date"
  label: string;   // e.g. "Start Date"
  maximumDate?: Date;
  minimumDate?: Date;
};

export const MedicationDateField: React.FC<MedicationDateFieldProps> = ({
  control,
  errors,
  name,
  label,
  maximumDate,
  minimumDate,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        // store format: "YYYY-MM-DD"
        const display = value ? dayjs(value).format("DD/MM/YYYY") : "";

        const onPick = (_: any, date?: Date) => {
          // Android fires twice; iOS once
          if (Platform.OS === "android") setShowPicker(false);
          if (date) {
            // store ISO for backend + Zod validation
            onChange(dayjs(date).format("YYYY-MM-DD"));
          }
        };

        return (
          <View className="mb-4">
            <Text className="mb-1 font-medium text-neutral-700">{label}</Text>

            {/* Readonly input that opens the calendar */}
            <Pressable onPress={() => setShowPicker(true)}>
              <TextInput
                className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
                style={{ color: "#171717" }} // neutral-900
                value={display}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#6B7280" // neutral-500
                editable={false}
                pointerEvents="none"
              />
            </Pressable>

            {errors[name] && (
              <Text className="text-red-600 text-sm mt-1">
                {String(errors[name]?.message)}
              </Text>
            )}

            {showPicker && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                value={
                  value ? dayjs(value).toDate() : new Date()
                }
                onChange={onPick}

                maximumDate={maximumDate}
                minimumDate={minimumDate}
                themeVariant="light"
              />
            )}
          </View>
        );
      }}
    />
  );
};
