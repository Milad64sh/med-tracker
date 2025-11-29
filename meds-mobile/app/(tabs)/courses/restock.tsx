import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { fetcher } from "@/lib/api";
import { Select } from "@/components/NewMedScreen";
import { MedicationCard } from "@/components/meds/MedicationCard";
import type { MedicationCourse } from "@/features/courses/types";
import type { Client } from "@/features/dashboard/types";

type CourseWithRelations = MedicationCourse & {
  client?: Client | null;
};

export default function RestockScreen() {
  const [courses, setCourses] = useState<CourseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // ID of the currently selected course (from Select)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // Show/hide the restock form under the card
  const [showForm, setShowForm] = useState(false);

  // Restock form fields
  const [packSize, setPackSize] = useState("");
  const [packsOnHand, setPacksOnHand] = useState("");
  const [looseUnits, setLooseUnits] = useState("");
  const [openingUnits, setOpeningUnits] = useState("");
  const [saving, setSaving] = useState(false);

  // 1) Load courses from backend
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetcher<any>("/api/courses");
        console.log(
          "RESTOCK /api/courses response:",
          JSON.stringify(res, null, 2)
        );

        let rows: CourseWithRelations[] = [];

        if (Array.isArray(res)) {
          rows = res;
        } else if (Array.isArray(res.data)) {
          rows = res.data;
        } else if (Array.isArray(res.data?.data)) {
          rows = res.data.data;
        }

        setCourses(rows);
      } catch (e: any) {
        console.warn("Failed to load courses", e?.message);
        Alert.alert("Error", "Failed to load medications");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) The selected course object
  const selectedCourse = useMemo(() => {
    if (!selectedId) return null;
    return courses.find((c) => String(c.id) === selectedId) ?? null;
  }, [selectedId, courses]);

  // 3) When user selects a course from dropdown
  const handleSelectCourse = (value?: string) => {
    setSelectedId(value);
    setShowForm(false); // hide form until user taps "Restock" again

    const course = courses.find((c) => String(c.id) === value);
    if (!course) return;

    setPackSize(course.pack_size != null ? String(course.pack_size) : "");
    setPacksOnHand(
      course.packs_on_hand != null ? String(course.packs_on_hand) : ""
    );
    setLooseUnits(
      course.loose_units != null ? String(course.loose_units) : ""
    );
    setOpeningUnits(
      course.opening_units != null ? String(course.opening_units) : ""
    );
  };

  // Helper: parse numeric input, return undefined if empty
const parseNumberOrUndefined = (val: string): number | undefined =>
  val.trim() === "" ? undefined : Number(val);


  // 4) Handle restock save
const handleSaveRestock = async () => {
  if (!selectedCourse) return;

  const id = selectedCourse.id;

  const payload: Partial<
    Pick<
      MedicationCourse,
      "pack_size" | "packs_on_hand" | "loose_units" | "opening_units"
    >
  > = {
    pack_size: parseNumberOrUndefined(packSize),
    packs_on_hand: parseNumberOrUndefined(packsOnHand),
    loose_units: parseNumberOrUndefined(looseUnits),
    opening_units: parseNumberOrUndefined(openingUnits),
  };

  const invalid = Object.values(payload).some((v) => {
    if (v === undefined || v === null) return false;
    return Number.isNaN(v) || v < 0;
  });

  if (invalid) {
    Alert.alert("Invalid input", "Please enter only non-negative numbers.");
    return;
  }

  try {
    setSaving(true);

    await fetcher(`/api/courses/${id}/restock`, {
      method: "PATCH",
      body: payload,
    });

    Alert.alert("Restocked", "Medication stock updated successfully.");

    // 🔹 update local list
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? ({ ...c, ...payload } as CourseWithRelations) : c
      )
    );

    // 🔹 close the restock panel + optionally clear fields
    setShowForm(false);
    // optional: if you want to clear the form fields too:
    // setPackSize("");
    // setPacksOnHand("");
    // setLooseUnits("");
    // setOpeningUnits("");
  } catch (e: any) {
    console.warn("Failed to restock", e?.message);
    Alert.alert("Error", e?.message || "Failed to restock medication");
  } finally {
    setSaving(false);
  }
};



  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
        <Text className="mt-2 text-neutral-600">Loading medications…</Text>
      </View>
    );
  }

  // Options for Select dropdown
  const options = courses.map((c) => ({
    label: c.name ?? `Course #${c.id}`,
    value: String(c.id),
  }));

  return (
    <ScrollView className="flex-1 bg-white">
      <Text className="text-2xl font-bold px-4 pt-4 mb-4">
        Restock Medication
      </Text>

      {/* Medication select dropdown */}
      <View className="px-4 mb-4">
        <Select
          label="Medication"
          options={options}
          value={selectedId}
          onChange={handleSelectCourse}
          placeholder={
            courses.length === 0
              ? "No medications found"
              : "Select a medication…"
          }
          disabled={courses.length === 0}
        />
      </View>

      {/* Selected medication card */}
      {selectedCourse ? (
        <View className="px-4">
          <MedicationCard
            item={selectedCourse}
            onDelete={() => {}}
            // do not allow delete from restock screen
            disableDelete
            showRestockButton
            onRestockPress={() => setShowForm((prev) => !prev)}
          />
        </View>
      ) : (
        <View className="px-4">
          <Text className="text-neutral-600">
            Select a medication above to view details and restock.
          </Text>
        </View>
      )}

      {/* Restock form, only visible when user tapped "Restock" button */}
      {selectedCourse && showForm && (
        <View className="px-4 mt-2 pb-6">
          <Text className="text-lg font-semibold mb-2">
            Update stock for {selectedCourse.name ?? `Course #${selectedCourse.id}`}
          </Text>

          {/* Pack size */}
          <View className="mb-3">
            <Text className="mb-1 text-neutral-700">Pack size</Text>
            <TextInput
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              value={packSize}
              onChangeText={setPackSize}
              placeholder="e.g. 28"
            />
          </View>

          {/* Packs on hand */}
          <View className="mb-3">
            <Text className="mb-1 text-neutral-700">Packs on hand</Text>
            <TextInput
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              value={packsOnHand}
              onChangeText={setPacksOnHand}
              placeholder="e.g. 2"
            />
          </View>

          {/* Loose units */}
          <View className="mb-3">
            <Text className="mb-1 text-neutral-700">Loose units</Text>
            <TextInput
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              value={looseUnits}
              onChangeText={setLooseUnits}
              placeholder="e.g. 4"
            />
          </View>

          {/* Opening units */}
          <View className="mb-3">
            <Text className="mb-1 text-neutral-700">Opening units (total)</Text>
            <TextInput
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              value={openingUnits}
              onChangeText={setOpeningUnits}
              placeholder="Optional – if you use it"
            />
          </View>

          <Pressable
            disabled={saving}
            onPress={handleSaveRestock}
            className={`mt-2 py-3 rounded-xl ${
              saving ? "bg-neutral-300" : "bg-emerald-600"
            }`}
          >
            <Text className="text-center text-white text-lg font-semibold">
              {saving ? "Saving…" : "Save restock"}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
