import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { useCourses, useDeleteCourse } from "@/features/courses/queries";
import { useClients } from "@/features/clients/queries";
import type { Client } from "@/features/dashboard/types";
import { MedicationCourse } from "@/features/courses/types";
import { MedicationCard } from "@/components/meds/MedicationCard";
import { IconSymbol } from "@/components/ui/icon-symbol";

type CourseWithRelations = MedicationCourse & {
  client?: Client | null;
};

// Small chip component for the filter
const ClientFilterChip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`px-3 py-1.5 rounded-full border mr-2 mb-2 ${
      selected ? "bg-emerald-500 border-emerald-500" : "bg-white border-neutral-300"
    }`}
  >
    <Text className={selected ? "text-white font-medium" : "text-neutral-800"}>
      {label}
    </Text>
  </Pressable>
);

export default function CoursesIndex() {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useCourses();
  const del = useDeleteCourse();


  const {
    data: clientsData,
    isLoading: loadingClients,
    error: clientsError,
  } = useClients();

  const [clientFilter, setClientFilter] = React.useState<"all" | number>("all");
  const [filterOpen, setFilterOpen] = React.useState(false);

  React.useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-neutral-600">Loading medications…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-600 mb-3">Failed to load medications.</Text>
        <Pressable
          className="px-4 py-2 bg-neutral-800 rounded-xl"
          onPress={() => refetch()}
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const raw = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const list: CourseWithRelations[] = raw as CourseWithRelations[];

  // ✅ Build client options from the clients table
  const clientsRaw = Array.isArray(clientsData)
    ? clientsData
    : (clientsData as any)?.data ?? [];

  const clientOptions: Client[] = clientsRaw as Client[];

  // (Optional) If you wanted ONLY clients who have meds, you could filter with a Set here.

  // Apply filter to meds list
  const filteredList =
    clientFilter === "all"
      ? list
      : list.filter((it) => {
          const cid =
            typeof it.client_id === "string"
              ? Number(it.client_id)
              : it.client_id;
          return cid === clientFilter;
        });

  return (
    <View className="flex-1 bg-neutral-50 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold">Medications</Text>
        <Pressable
          className="px-4 py-2 rounded-xl bg-emerald-500"
          onPress={() => router.push("/meds/newMed")}
        >
          <Text className="text-white font-semibold">Add</Text>
        </Pressable>
      </View>

      {/* Client Filter as animated dropdown */}
      <View className="mb-4 border-b border-neutral-300">
        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext({
              duration: 200,
              update: {
                type: LayoutAnimation.Types.easeInEaseOut,
              },
              delete: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
              },
            });
            setFilterOpen((prev) => !prev);
          }}
          className="flex-row items-center justify-between mb-1 pb-1"
        >
          <View className="flex-row items-center justify-center border border-neutral-300 rounded-full p-2">
            <Text className="font-medium mr-1 leading-none">
              Filter by client
            </Text>
            <IconSymbol
              name={filterOpen ? "chevron.up" : "chevron.down"}
              size={14}
              color="#000000"
              style={{ top: 1 }}
            />
          </View>
        </Pressable>

        {filterOpen && (
          <View className="flex-row flex-wrap mt-2">
            <ClientFilterChip
              label="All clients"
              selected={clientFilter === "all"}
              onPress={() => setClientFilter("all")}
            />

            {/* ✅ Now using all clients from table, so new clients appear */}
            {clientOptions.map((c) => (
              <ClientFilterChip
                key={c.id}
                label={c.initials ?? `Client #${c.id}`}
                selected={clientFilter === c.id}
                onPress={() => setClientFilter(c.id)}
              />
            ))}

            {loadingClients && (
              <Text className="text-neutral-500 mt-2">
                Loading clients…
              </Text>
            )}
            {clientsError && (
              <Text className="text-red-600 mt-2">
                Failed to load clients.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <MedicationCard item={item} onDelete={(id) => del.mutate(id)} />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <Text className="text-neutral-600 mt-8 text-center">
            {clientFilter === "all"
              ? "No medications yet."
              : "No medications for this client."}
          </Text>
        }
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </View>
  );
}
