import React from "react";
import { View, Text,  Pressable, Alert } from "react-native";

// import type { Service } from "@/features/services/types";
import { Link,  type Href } from "expo-router";

type Props = {
  item: any;
  onDelete: (id: number) => void;
  onPress?: () => void;
};

export function ServiceCard({ item, onDelete, onPress }: Props) {

    const editHref: Href = {
  pathname: "/services/[id]/edit",
  params: { id: String(item.id) },
};
  return (
        <Pressable
          onPress={onPress}
        >
          <View className="bg-white rounded-2xl p-4 mb-3 border border-neutral-200">
            <Text className="text-lg font-semibold mb-2">{item.name}</Text>
            <View className="flex-row gap-3">
              <Link
                href={editHref}
                asChild
              >
                <Pressable className="px-4 py-2 rounded-xl bg-sky-500">
                  <Text className="text-white font-medium">Edit</Text>
                </Pressable>
              </Link>
              <Pressable
                className="px-4 py-2 rounded-xl bg-red-500"
                onPress={() => {
                  Alert.alert(
                    "Delete service",
                    `Are you sure you want to delete “${item.name}”?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
                    ]
                  );
                }}
              >
                <Text className="text-white font-medium">Delete</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
  );
}