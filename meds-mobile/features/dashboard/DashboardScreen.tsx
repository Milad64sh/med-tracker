// @/features/dashboard/DashboardScreen.tsx

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,

} from 'react-native';
import { useDashboard } from './queries';


export const DashboardScreen: React.FC = () => {
  const { data, isLoading, isError, error } = useDashboard();


  if (isLoading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Failed to load dashboard'}
        </Text>
      </View>
    );
  }

  const kpis = data?.kpis;

  return (
    <View style={styles.container}>
      {/* KPIs */}
      {kpis && (
        <>
          <Text style={styles.heading}>Overview</Text>

          <View style={styles.kpiRow}>
            <KpiCard label="Critical" value={kpis.critical} tone="critical" />
            <KpiCard label="Low" value={kpis.low} tone="low" />
            <KpiCard label="OK" value={kpis.ok} tone="ok" />
          </View>

          <View style={styles.kpiRow}>
            <KpiCard label="Pending orders" value={kpis.pendingOrders} tone="neutral" />
          </View>

          <View style={styles.singleKpi}>
            <Text style={styles.kpiTitle}>Next alert</Text>
            <Text style={styles.kpiValue}>
              {kpis.nextScheduleAt
                ? new Date(kpis.nextScheduleAt).toLocaleString()
                : 'None scheduled'}
            </Text>
          </View>
        </>
      )}

      {/* Top alerts */}
      <Text style={[styles.heading, { marginTop: 16 }]}>Top urgent courses</Text>

      {/* <FlatList
        data={alerts}
        keyExtractor={(item) => item.course_id.toString()}
        renderItem={({ item }) => (
          <AlertCard
            item={item}
            onEmailPress={(alert) => {
              console.log(
                "Dashboard: onEmailPress wrapper called for",
                alert.medication
              );
              handleEmailPress(alert);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No urgent courses right now 🎉</Text>
        }
      /> */}
    </View>
  );
};

const KpiCard: React.FC<{
  label: string;
  value: number | string;
  tone?: 'critical' | 'low' | 'ok' | 'neutral';
}> = ({ label, value, tone = 'neutral' }) => {
  const color =
    tone === 'critical'
      ? '#fecaca'
      : tone === 'low'
      ? '#fed7aa'
      : tone === 'ok'
      ? '#bbf7d0'
      : '#e5e7eb';

  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, backgroundColor: '#020617' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  errorText: { color: '#fca5a5' },
  heading: { color: '#e5e7eb', fontSize: 18, fontWeight: '600', marginBottom: 8 },

  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
  },
  kpiLabel: { color: '#9ca3af', fontSize: 12 },
  kpiValue: { marginTop: 4, fontSize: 18, fontWeight: '700', color: '#e5e7eb' },
  singleKpi: {
    marginTop: 4,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
  },
  kpiTitle: { color: '#9ca3af', fontSize: 12 },
  emptyText: { color: '#6b7280', fontSize: 13, marginTop: 8 },

  alertCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medicationText: { color: '#e5e7eb', fontSize: 15, fontWeight: '600' },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  clientText: { marginTop: 4, color: '#cbd5f5', fontSize: 13 },

  alertMetaRow: { flexDirection: 'row', marginTop: 2 },
  metaLabel: { color: '#9ca3af', fontSize: 12 },
  metaValue: { color: '#e5e7eb', fontSize: 12, fontWeight: '500' },
});
