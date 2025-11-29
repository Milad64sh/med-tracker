import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Link, type Href } from "expo-router";

import type { Client } from "@/features/dashboard/types";
import { MedicationCourse } from "@/features/courses/types";

type CourseWithRelations = MedicationCourse & {
  client?: Client | null;
};

type MedicationCardProps = {
  item: CourseWithRelations;
  onDelete: (id: number) => void;

  // NEW optional props
  disableDelete?: boolean;
  showRestockButton?: boolean;
  onRestockPress?: () => void;
};

export function MedicationCard({
  item,
  onDelete,
  disableDelete = false,
  showRestockButton = false,
  onRestockPress,
}: MedicationCardProps) {
  const editHref: Href = {
    pathname: "/meds/[id]/edit",
    params: { id: String(item.id) },
  };

  const clientInitials = item.client?.initials ?? "—";
  const serviceName = item.client?.service?.name ?? "—";

  const dose =
    item.dose_per_admin && item.admins_per_day
      ? `${item.dose_per_admin} units • ${item.admins_per_day}x/day`
      : "—";

  const packSize = item.pack_size ?? 0;
  const packsOnHand = item.packs_on_hand ?? 0;
  const looseUnits = item.loose_units ?? 0;
  const totalUnits = packSize * packsOnHand + looseUnits;

  const quantityLabel =
    totalUnits > 0
      ? `${totalUnits} units (packs: ${packsOnHand}, loose: ${looseUnits})`
      : "—";

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-neutral-200">
      {/* Title */}
      <Text className="text-lg font-semibold mb-1">
        {item.name || "Unnamed medication"}
      </Text>

      {/* Details */}
      <View className="mb-3">
        <Text className="text-neutral-700">
          Client: <Text className="font-medium">{clientInitials}</Text>
        </Text>
        <Text className="text-neutral-700">
          Service: <Text className="font-medium">{serviceName}</Text>
        </Text>
        <Text className="text-neutral-700">
          Dose: <Text className="font-medium">{dose}</Text>
        </Text>
        <Text className="text-neutral-700">
          Quantity: <Text className="font-medium">{quantityLabel}</Text>
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3 flex-wrap">
        {/* Edit button */}
        <Link href={editHref} asChild>
          <Pressable className="px-4 py-2 rounded-xl bg-sky-500">
            <Text className="text-white font-medium">Edit</Text>
          </Pressable>
        </Link>

        {/* Optional Restock button */}
        {showRestockButton && (
          <Pressable
            className="px-4 py-2 rounded-xl bg-emerald-500"
            onPress={onRestockPress}
          >
            <Text className="text-white font-medium">Restock</Text>
          </Pressable>
        )}

        {/* Delete button (optional) */}
        {!disableDelete && (
          <Pressable
            className="px-4 py-2 rounded-xl bg-red-500"
            onPress={() => {
              Alert.alert(
                "Delete medication",
                `Are you sure you want to delete “${
                  item.name ?? "this medication"
                }”?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete(item.id),
                  },
                ]
              );
            }}
          >
            <Text className="text-white font-medium">Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
