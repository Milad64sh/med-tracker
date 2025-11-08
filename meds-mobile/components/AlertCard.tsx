import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { AlertRow } from '../features/dashboard/types';

function statusColors(status: AlertRow['status']) {
  switch (status) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'low': return 'bg-amber-100 text-amber-800';
    case 'ok': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-neutral-100 text-neutral-800';
  }
}

export function AlertCard({ item, onPress }: { item: AlertRow; onPress?: () => void }) {
  const daysLabel = item.days_remaining == null ? '—' : `${item.days_remaining}d`;
  const badge = statusColors(item.status);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 mb-3"
      accessibilityRole="button"
      accessibilityLabel={`View ${item.medication} for ${item.client.name}, ${item.status}`}
    >
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${badge.split(' ')[0]}`}>
          <Text className="text-base">{daysLabel}</Text>
        </View>
        <View className="max-w-[70%]">
          <Text className="font-semibold" numberOfLines={1}>{item.medication}</Text>
          <Text className="text-neutral-700" numberOfLines={1}>
            {item.client.name} · {item.client.service?.name}
          </Text>
          <Text className="text-neutral-500 mt-1" numberOfLines={1}>
            Runout {item.runout_date ?? '—'} · Half {item.half_date ?? '—'}
          </Text>
        </View>
      </View>

      <View className={`px-2 py-1 rounded-full ${badge}`}>
        <Text className="text-xs">{item.status.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}
