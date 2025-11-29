import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useClients, useDeleteClient } from "@/features/clients/queries";
import { ClientCard } from "@/components/clients/ClientCard";
import { formatUK } from "@/utils/formatUK";

export default function ClientsIndex() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useClients();
  const del = useDeleteClient();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenClientModal = (client: any) => {
    console.log("CLIENT OBJECT:", JSON.stringify(client, null, 2));
    setSelectedClient(client);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedClient(null);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-neutral-600">Loading clients…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-600 mb-3">Failed to load clients.</Text>
        <Pressable
          className="px-4 py-2 bg-neutral-800 rounded-xl"
          onPress={() => refetch()}
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const list = data ?? [];

  return (
    <View className="flex-1 bg-neutral-50 p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold">Clients</Text>
        <Pressable
          className="px-4 py-2 rounded-xl bg-emerald-500"
          onPress={() => router.push("/clients/newClient")}
        >
          <Text className="text-white font-semibold">Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <ClientCard
            item={item}
            onDelete={(id) => del.mutate(id)}
            onPress={() => handleOpenClientModal(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <Text className="text-neutral-600 mt-8 text-center">
            No clients yet.
          </Text>
        }
        refreshing={isLoading}
        onRefresh={refetch}
      />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-11/12 rounded-2xl bg-white p-4 max-h-[80%]">
            <Text className="text-lg font-semibold mb-2">
              {selectedClient?.initials ?? "Client details"}
            </Text>

            <Text className="text-sm text-neutral-700 mb-3">
              Medication courses:
            </Text>

{selectedClient?.courses?.length ? (
  <ScrollView className="mb-4">
    {selectedClient.courses.map((course: any) => (
      <View key={course.id} className="mb-3 p-3 rounded-xl bg-neutral-100">
        <Text className="font-semibold mb-1">
          {course.name}
          {course.strength ? ` ${course.strength}` : ""}
          {course.form ? ` (${course.form})` : ""}
        </Text>

        {!!course.dose_per_admin && (
          <Text className="text-sm text-neutral-700">
            Dose per admin: {course.dose_per_admin}
          </Text>
        )}

        {!!course.admins_per_day && (
          <Text className="text-sm text-neutral-700">
            Admins per day: {course.admins_per_day}
          </Text>
        )}

        {!!course.daily_use && (
          <Text className="text-sm text-neutral-700">
            Daily use: {course.daily_use}
          </Text>
        )}

        {!!course.start_date && (
          <Text className="text-sm text-neutral-700">
            Start: {formatUK(course.start_date)}
          </Text>
        )}

        {!!course.half_date && (
          <Text className="text-sm text-neutral-700">
            Half date: {formatUK(course.half_date)}
          </Text>
        )}

        {!!course.runout_date && (
          <Text className="text-sm text-neutral-700">
            Run out: {formatUK(course.runout_date)}
          </Text>
        )}

        {!!course.status && (
          <Text className="text-sm text-neutral-700">
            Status: {course.status}
          </Text>
        )}
      </View>
    ))}
  </ScrollView>
) : (
  <Text className="text-xs text-neutral-500 mb-4">
    No medication courses for this client.
  </Text>
)}


            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-neutral-200"
              >
                <Text className="text-neutral-800">Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
