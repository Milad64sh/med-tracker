import React from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
} from "react-native";
import { Link, type Href } from "expo-router";
import { formatUK } from "@/utils/formatUK";

import type { Client } from "@/features/dashboard/types";

type ClientCardProps = {
  item: Client;
  onDelete: (id: number) => void;
  onPress?: () => void; // 🔹 NEW: callback for opening modal
};

export function ClientCard({ item, onDelete, onPress }: ClientCardProps) {
  const editHref: Href = {
    pathname: "/clients/[id]/edit",
    params: { id: String(item.id) },
  };

  return (
    // 🔹 Make the whole card tappable
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-neutral-200"
    >
      <Text className="text-lg font-semibold mb-1">
        {item.initials ?? "—"}
      </Text>

      <View className="mb-3">
        <Text className="text-neutral-700">
          DOB: <Text className="font-medium">{formatUK(item.dob) ?? "—"}</Text>
        </Text>
        <Text className="text-neutral-700">
          Service:{" "}
          <Text className="font-medium">
            {item.service?.name ?? "—"}
          </Text>
        </Text>
      </View>

      <View className="flex-row gap-3">
        {/* EDIT button */}
        <Link href={editHref} asChild>
          <Pressable
            // prevent opening the modal when pressing Edit
            onPress={(e) => e.stopPropagation()}
            className="px-4 py-2 rounded-xl bg-sky-500"
          >
            <Text className="text-white font-medium">Edit</Text>
          </Pressable>
        </Link>

        {/* DELETE button */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation(); // prevent modal
            Alert.alert(
              "Delete client",
              `Are you sure you want to delete “${
                item.initials ?? "this client"
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
          className="px-4 py-2 rounded-xl bg-red-500"
        >
          <Text className="text-white font-medium">Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
