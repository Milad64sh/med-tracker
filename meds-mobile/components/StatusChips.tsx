// src/components/StatusChips.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
import { Link } from "expo-router";

type Status = 'all' | 'critical' | 'low' | 'ok';
type Props = {
  value: Status;
  onChange: (v: Status) => void;
  showAddMedication?: boolean;
};

const labels: Status[] = ['all', 'critical', 'low', 'ok'];

export function StatusChips({ value, onChange, showAddMedication = false }: Props) {
  return (
    <View className="flex-row flex-wrap mt-3">
            {/* ➕ Add Medication chip */}
      {showAddMedication && (
        <Link
          href="/courses/newMed"
          asChild
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add medication"
            className="px-3 py-2 mr-2 mb-2 rounded-full border border-emerald-400 bg-emerald-50 active:opacity-80 flex-row items-center"
          >
            <Text className="text-emerald-700 font-medium">➕ Add Medication</Text>
          </Pressable>
        </Link>
      )}
      {labels.map((lab) => {
        const active = value === lab;
        return (
          <Pressable
            key={lab}
            onPress={() => onChange(lab)}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${lab}`}
            className={`px-3 py-2 mr-2 mb-2 rounded-full border ${
              active
                ? 'bg-neutral-900 border-neutral-900'
                : 'bg-white border-neutral-300'
            }`}
          >
            <Text className={`${active ? 'text-white' : 'text-neutral-800'}`}>
              {lab.charAt(0).toUpperCase() + lab.slice(1)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
