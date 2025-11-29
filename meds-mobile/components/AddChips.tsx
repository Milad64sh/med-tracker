// src/components/AddChips.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
import { Link, type Href, type LinkProps } from "expo-router";


type ChipColor = "emerald" | "sky" | "violet";
type AddItem = {
  key: string;
  label: string;              // e.g. "➕ Add Client"
  href?: Href;              // expo-router path
  onPress?: () => void;       // optional handler instead of href
  color?: ChipColor;          // default: "emerald"
  accessibilityLabel?: string;
};

type Props = {
  items: AddItem[];
  className?: string;         // optional container classes
};

const palette: Record<ChipColor, { border: string; bg: string; text: string }> = {
  emerald: { border: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
  sky:     { border: "border-sky-400",     bg: "bg-sky-50",     text: "text-sky-700" },
  violet:  { border: "border-violet-400",  bg: "bg-violet-50",  text: "text-violet-700" },
};

export function AddChips({ items, className = "" }: Props) {
  return (
    <View className={`flex-row flex-wrap mt-3 ${className}`}>
      {items.map(({ key, label, href, onPress, color = "emerald", accessibilityLabel }) => {
        const c = palette[color];
        const chip = (
          <Pressable
            key={key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label}
            className={`px-3 py-2 mr-2 mb-2 rounded-full border ${c.border} ${c.bg} active:opacity-80 flex-row items-center`}
          >
            <Text className={`${c.text} font-medium`}>{label}</Text>
          </Pressable>
        );

        // Prefer Link when href provided (expo-router)
        return href ? (
          <Link key={key} href={href as LinkProps["href"]} asChild>
            {chip}
          </Link>
        ) : (
          chip
        );
      })}
    </View>
  );
}
