import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = {
  label: string;
  value: number | string;
  onPress?: () => void;
  intent?: 'default' | 'critical' | 'low' | 'ok';
};

const intentStyles: Record<NonNullable<Props['intent']>, string> = {
  default: 'bg-neutral-100',
  critical: 'bg-red-100',
  low: 'bg-amber-100',
  ok: 'bg-emerald-100',
};

export function KpiTile({ label, value, onPress, intent = 'default' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
      className={`rounded-xl p-4 mr-3 min-w-[120px] ${intentStyles[intent]} active:opacity-80`}
    >
      <Text className="text-2xl font-semibold">{String(value)}</Text>
      <Text className="text-neutral-700 mt-1">{label}</Text>
    </Pressable>
  );
}
