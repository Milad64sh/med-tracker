// app/(tabs)/account/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

type EditingField = "name" | "email" | "memberSince" | null;

export default function AccountScreen() {
  const { user, loading, updateProfile } = useAuth();

  // All hooks at top
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [draftValue, setDraftValue] = useState("");
  const [saving, setSaving] = useState(false);

  const memberSinceFromUser = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "—";


  const [localName, setLocalName] = useState(user?.name ?? "");
  const [localEmail, setLocalEmail] = useState(user?.email ?? "");
  const [localMemberSince, setLocalMemberSince] = useState(memberSinceFromUser);

  // Sync local values when user changes (e.g. after refresh or update)
  useEffect(() => {
    if (user) {
      setLocalName(user.name);
      setLocalEmail(user.email);
      setLocalMemberSince(
        user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "—"
      );
    }
  }, [user?.id, user?.name, user?.email, user?.created_at]);

  const startEditing = (field: EditingField) => {
    setEditingField(field);
    if (field === "name") setDraftValue(localName);
    if (field === "email") setDraftValue(localEmail);
    if (field === "memberSince") setDraftValue(localMemberSince);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue("");
  };

  const saveEditing = async () => {
    if (!editingField) return;
    const trimmed = draftValue.trim();

    // Nothing entered, just cancel
    if (!trimmed) {
      cancelEditing();
      return;
    }

    try {
      setSaving(true);

      if (editingField === "name" || editingField === "email") {
        const payload: any = {};
        payload[editingField] = trimmed;

        const updated = await updateProfile(payload);

        // Update local display from server response
        setLocalName(updated.name);
        setLocalEmail(updated.email);
        setLocalMemberSince(
          updated.created_at
            ? new Date(updated.created_at).toLocaleDateString()
            : "—"
        );
      } else if (editingField === "memberSince") {
        // UI-only, not persisted to backend
        setLocalMemberSince(trimmed);
      }

      setEditingField(null);
      setDraftValue("");
    } catch (e: any) {
      console.log("Failed to update profile", e);
      Alert.alert(
        "Update failed",
        e?.message || "Could not save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (
    label: string,
    value: string,
    field: EditingField,
    iconName: "person.crop.circle" | "paperplane.fill" | "house.fill"
  ) => {
    const isEditing = editingField === field;

    return (
      <View className="py-3 border-b border-neutral-100">
        <View className="flex-row items-center justify-between">
          {/* Label + icon */}
          <View className="flex-row items-center">
            <IconSymbol name={iconName} size={20} color="#9ca3af" />
            <Text className="ml-2 text-sm text-neutral-700">{label}</Text>
          </View>

          {/* Edit / Save / Cancel */}
          {!isEditing ? (
            <Pressable
              onPress={() => startEditing(field)}
              className="px-2 py-1 rounded-full border border-neutral-300"
            >
              <Text className="text-xs text-neutral-700">Edit</Text>
            </Pressable>
          ) : (
            <View className="flex-row items-center">
              <Pressable
                onPress={saveEditing}
                disabled={saving}
                className="px-2 py-1 rounded-full bg-blue-600 mr-2 opacity-100"
                style={saving ? { opacity: 0.7 } : undefined}
              >
                <Text className="text-xs text-white">
                  {saving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
              <Pressable
                onPress={cancelEditing}
                disabled={saving}
                className="px-2 py-1 rounded-full border border-neutral-300"
              >
                <Text className="text-xs text-neutral-700">Cancel</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Value / Input */}
        <View className="mt-2">
          {isEditing ? (
            <TextInput
              value={draftValue}
              onChangeText={setDraftValue}
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 bg-white"
              autoCapitalize={field === "email" ? "none" : "sentences"}
              keyboardType={field === "email" ? "email-address" : "default"}
            />
          ) : (
            <Text className="text-sm text-neutral-500">{value}</Text>
          )}
        </View>
      </View>
    );
  };

  // Early returns after hooks
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator />
        <Text className="mt-2 text-neutral-600">Loading profile…</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 px-4">
        <Text className="text-base text-neutral-700 text-center">
          No user loaded. Please sign in again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50 px-4 pt-4">
      {/* Avatar + name */}
      <View className="items-center mb-6">
        <View className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center">
          <Text className="text-2xl font-semibold text-white">
            {getInitials(localName)}
          </Text>
        </View>

        <Text className="mt-3 text-xl font-semibold text-neutral-900">
          {localName}
        </Text>
        <Text className="mt-1 text-sm text-neutral-500">{localEmail}</Text>
      </View>

      {/* Account details card (no User ID) */}
      <View className="bg-white rounded-2xl px-4 py-3 border border-neutral-200 mb-4">
        <Text className="text-sm font-semibold text-neutral-700 mb-3">
          Account details
        </Text>

        {renderRow("Name", localName, "name", "person.crop.circle")}
        {renderRow("Email", localEmail, "email", "paperplane.fill")}
        {renderRow(
          "Member since",
          localMemberSince,
          "memberSince",
          "house.fill"
        )}
      </View>
    </ScrollView>
  );
}
