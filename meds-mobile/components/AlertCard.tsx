// @/components/AlertCard.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import type { AlertRow } from "../features/dashboard/types";
import { formatUK } from "@/utils/formatUK";

function statusColors(status: AlertRow["status"]) {
  switch (status) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "low":
      return "bg-amber-100 text-amber-800";
    case "ok":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-neutral-100 text-neutral-800";
  }
}

type AlertCardProps = {
  item: AlertRow;
  onPress?: () => void;
  onEmailPress?: (item: AlertRow) => void;  
};

export function AlertCard({ item, onPress, onEmailPress }: AlertCardProps) {
    console.log(
    "AlertCard mounted for",
    item.medication,
    "has onEmailPress?",
    !!onEmailPress
  );
  const daysLabel =
    item.days_remaining == null ? "—" : `${item.days_remaining}d`;

  const unitsLabel =
    typeof item.units_remaining === "number"
      ? `${item.units_remaining} tabs`
      : "—";

  const badge = statusColors(item.status);
  const [bgClass] = badge.split(" ");



  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 mb-3"
      accessibilityRole="button"
      accessibilityLabel={`View ${item.medication} for ${item.client.name}, ${item.status}`}
    >
      <View className="flex-row items-center">
        {/* Left circle */}
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${bgClass}`}
        >
          <Text className="text-base">{daysLabel}</Text>
        </View>

        {/* Middle */}
        <View className="max-w-[70%]">
          <Text className="font-semibold" numberOfLines={1}>
            {item.medication}
          </Text>

          <Text className="text-neutral-700" numberOfLines={1}>
            {item.client.name} · {item.client.service?.name}
          </Text>

          <Text className="text-neutral-500 mt-1" numberOfLines={1}>
            Runout {formatUK(item.runout_date) ?? "—"} · Half {formatUK(item.half_date) ?? "—"}
          </Text>

          <Text className="text-neutral-500 mt-0.5" numberOfLines={1}>
            Remaining: <Text className="font-semibold">{unitsLabel}</Text>
          </Text>
        </View>
      </View>

      {/* Right side */}
      <View className="items-end right-1">
        {/* Status pill */}
        <View className={`px-3 py-2 rounded-full ${badge} mb-2`}>
          <Text className="text-s">{item.status.toUpperCase()}</Text>
        </View>

        {/* Email button for LOW + CRITICAL */}
        {(item.status === "critical" || item.status === "low") && (
          <Pressable
            onPress={(event) => {
              console.log("AlertCard: Email GP button pressed for", item.medication);
              event.stopPropagation?.();
              onEmailPress?.(item);
            }}
            className="px-3 py-2 bg-blue-600 rounded-full"
          >
            <Text className="text-s text-white">Email GP</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
