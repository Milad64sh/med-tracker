import React from "react";
import { Modal, View, Text, Pressable, FlatList } from "react-native";

type Option = { label: string; value: string };

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
}: {
  label: string;
  options: Option[];
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <View className="mb-4">
      <Text className="mb-1 font-medium text-neutral-700">{label}</Text>

      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`border rounded-lg px-3 py-3 ${disabled ? "border-neutral-200 bg-neutral-50" : "border-neutral-300 bg-white"}`}
      >
        <Text className={selectedLabel ? "text-neutral-900" : "text-neutral-400"}>
          {selectedLabel || placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)}>
          <View className="mt-auto bg-white rounded-t-2xl p-4 max-h-[70%]">
            <Text className="text-base font-semibold mb-3">{label}</Text>
            <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
                <Pressable
                onPress={() => { onChange(item.value); setOpen(false); }}
                className="px-3 py-3 active:bg-neutral-100 rounded-lg"
                >
                <Text className="text-neutral-900">{item.label}</Text>
                </Pressable>
            )}
            ItemSeparatorComponent={() => <View className="h-[1px] bg-neutral-200" />}
            />

            <Pressable onPress={() => setOpen(false)} className="mt-3 py-3 rounded-xl bg-neutral-200">
              <Text className="text-center font-medium">Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
