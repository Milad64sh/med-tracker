
import React from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import {  Controller } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
type DobFieldProps = {
  control: any;
  errors: any;
};


export const DobField: React.FC<DobFieldProps> = ({ control, errors }) => {
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
            // store ISO for backend + Zod validation
            onChange(dayjs(date).format("YYYY-MM-DD"));
          }
        };

        return (
          <View className="mb-4">
            <Text className="mb-1 font-medium text-neutral-700">
              Date of Birth
            </Text>

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

            {!!errors.dob && (
              <Text className="text-red-600 text-sm mt-1">
                {String(errors.dob.message)}
              </Text>
            )}

            {showPicker && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                value={
                  value ? dayjs(value).toDate() : new Date(2000, 0, 1)
                }
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