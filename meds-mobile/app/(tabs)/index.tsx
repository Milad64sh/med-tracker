import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useDashboard } from '@/features/dashboard/queries';
import { KpiTile } from '@/components/KpiTile';
import { StatusChips } from '@/components/StatusChips';
import { AlertCard } from '@/components/AlertCard';


type StatusFilter = 'all' | 'critical' | 'low' | 'ok';



export default function HomeScreen() {
  const { data, isLoading, isFetching, refetch } = useDashboard();
  const [status, setStatus] = useState<StatusFilter>('all');

  const alerts = useMemo(() => {
    const rows = data?.topAlerts ?? [];
    if (status === 'all') return rows;
    return rows.filter(r => r.status === status);
  }, [data, status]);

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <View className="px-4 pt-5 pb-3">
        <Text className="text-2xl font-bold">Medication Dashboard</Text>
        <Text className="text-neutral-600 mt-1">What needs attention today</Text>
      </View>

      {/* KPIs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        <KpiTile
          label="Critical (Less than 2 days)"
          value={data?.kpis.critical ?? (isLoading ? '—' : 0)}
          intent="critical"
          onPress={() => setStatus('critical')}
        />
        <KpiTile
          label="Low (3 to 7 days)"
          value={data?.kpis.low ?? (isLoading ? '—' : 0)}
          intent="low"
          onPress={() => setStatus('low')}
        />
        <KpiTile
          label="OK (More than 8 days)"
          value={data?.kpis.ok ?? (isLoading ? '—' : 0)}
          intent="ok"
          onPress={() => setStatus('ok')}
        />
        <KpiTile
          label="Pending Orders"
          value={data?.kpis.pendingOrders ?? (isLoading ? '—' : 0)}
        />
      </ScrollView>

      {/* Next schedule */}
      <View className="px-4 mt-3">
        <Text className="text-neutral-700">
          Next notification: {data?.kpis.nextScheduleAt ? new Date(data.kpis.nextScheduleAt).toLocaleString() : '—'}
        </Text>
      </View>

      {/* Filters */}
      <View className="px-4">
        <StatusChips value={status} onChange={setStatus} showAddMedication />

      </View>

      {/* Alerts list */}
      <View className="px-4 mt-4">
        <Text className="text-lg font-semibold mb-2">Urgent Alerts</Text>

        <FlatList
          data={alerts}
          keyExtractor={(it) => String(it.course_id)}
          renderItem={({ item }) => (
            <AlertCard
              item={item}
              onPress={() => {
                // navigate to details later
                // router.push(`/client/${item.client.id}`) or navigation.navigate(...)
              }}
            />
          )}
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-neutral-600">
                {isLoading ? 'Loading…' : 'No alerts for this filter 🎉'}
              </Text>
            </View>
          }
          scrollEnabled={false} 
        />

      </View>
    </ScrollView>
  );
}
