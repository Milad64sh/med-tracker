import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ScrollView, Alert } from 'react-native';
import { useDashboard } from '@/features/dashboard/queries';
import { KpiTile } from '@/components/KpiTile';
import { StatusChips } from '@/components/StatusChips';
import { AddChips } from '@/components/AddChips';
import { AlertCard } from '@/components/AlertCard';
import { AlertRow } from '@/features/dashboard/types';
import { fetcher } from '@/lib/api';
import type { Href } from "expo-router";



type StatusFilter = 'all' | 'critical' | 'low' | 'ok';



export default function HomeScreen() {

  const { data, isLoading, isFetching, refetch } = useDashboard();
  const [status, setStatus] = useState<StatusFilter>('all');

  const alerts = useMemo(() => {
    const rows = data?.topAlerts ?? [];
    if (status === 'all') return rows;
    return rows.filter(r => r.status === status);
  }, [data, status]);


    const handleEmailPress = async (item: AlertRow) => {
      console.log("Alert item client:", item.client);
      const gpEmail = item.client.gp_email;
  
      if (!gpEmail) {
        Alert.alert(
          "No GP email",
          "No GP email is set for this client. Please update their details first."
        );
        return;
      }
  
      try {
        await fetcher("/api/alerts/email-gp", {
          method: "POST",
          body: {
            gp_email: gpEmail,
            client_name: item.client.name,
            service_name: item.client.service?.name ?? null,
            medication: item.medication,
            status: item.status,
            units_remaining: item.units_remaining,
            half_date: item.half_date,
            runout_date: item.runout_date,
          },
        });
  
        Alert.alert("Email sent", "The medical practice has been notified.");
      } catch (e: any) {
        console.log("Email GP error", e);
        Alert.alert(
          "Failed to send",
          e?.message || "Could not send email. Please try again."
        );
      }
      return null;
    };

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <View className="px-4 pt-5 pb-3">
        <Text className="text-2xl font-bold">Medication Dashboard</Text>

      </View>
      {/* Quick Actions Section */}
      <View className="px-2 mt-6">
        <Text className="text-lg font-semibold mb-2">Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <AddChips
            items={[
              {
                key: "add-med",
                label: "➕ Restock Medication",
                href: "/courses/restock" as Href,
                color: "emerald",
              },
              {
                key: "add-client",
                label: "➕ Add Client",
                href: "/clients/newClient" as Href,
                color: "sky",
              },
              {
                key: "add-service",
                label: "➕ Add Service",
                href: "/services/newService" as Href,
                color: "violet",
              },
            ]}
          />
        </ScrollView>
      </View>

      {/* KPIs */}
      <View className='px-2 mt-6'>
        <Text className="text-lg font-semibold mb-2">What needs attention today</Text>
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
      </View>

      {/* Next schedule */}
      <View className="px-4 mt-3">
        <Text className="text-neutral-700">
          Next notification: {data?.kpis.nextScheduleAt ? new Date(data.kpis.nextScheduleAt).toLocaleString() : '—'}
        </Text>
      </View>


      {/* Filters */}
      <View className="px-4">
        <StatusChips value={status} onChange={setStatus} />

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
              onEmailPress={handleEmailPress}
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
