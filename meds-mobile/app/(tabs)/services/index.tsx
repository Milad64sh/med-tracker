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
import { useServices, useDeleteService } from "@/features/services/queries";
import { ServiceCard } from "@/components/service/ServiceCard";
import { useRouter } from "expo-router";
// If you want UK date formatting for DOB:
import { formatUK } from "@/utils/formatUK";

export default function ServicesIndex() {
  const { data, isLoading, error, refetch } = useServices();
  const del = useDeleteService();
  const router = useRouter();

  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenServiceModal = (service: any) => {
    console.log("SERVICE OBJECT:", JSON.stringify(service, null, 2));
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-neutral-600">Loading services…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-600 mb-3">Failed to load services.</Text>
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
        <Text className="text-2xl font-bold">Services</Text>
        <Pressable
          className="px-4 py-2 rounded-xl bg-emerald-500"
          onPress={() => router.push("/services/newService")}
        >
          <Text className="text-white font-semibold">Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <ServiceCard
            item={item}
            onDelete={(id) => del.mutate(id)}
            onPress={() => handleOpenServiceModal(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <Text className="text-neutral-600 mt-8 text-center">
            No services yet.
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
              {selectedService?.name ?? "Service details"}
            </Text>

            <Text className="text-sm text-neutral-700 mb-3">
              Clients on this service:
            </Text>

            {selectedService?.clients?.length ? (
              <ScrollView className="mb-4">
                {selectedService.clients.map((client: any) => (
                  <View
                    key={client.id}
                    className="mb-3 p-3 rounded-xl bg-neutral-100"
                  >
                    <Text className="font-semibold mb-1">
                      {client.initials ?? "Unknown initials"}
                    </Text>

                    {!!client.dob && (
                      <Text className="text-sm text-neutral-700">
                        DOB: {formatUK(client.dob)}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text className="text-xs text-neutral-500 mb-4">
                No clients assigned to this service.
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
