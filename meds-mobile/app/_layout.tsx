import './global.css';

import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
    const [queryClient] = useState(
    () =>
      new QueryClient({
        // OPTIONAL: a safe default queryFn to avoid this error globally
        defaultOptions: {
          queries: {
            retry: 0,
            // comment this back in if you want a real default:
            // queryFn: async ({ queryKey }) => {
            //   const path = Array.isArray(queryKey) ? String(queryKey[0]) : String(queryKey);
            //   const res = await fetch(`http://YOUR-LAN-IP:8080/api/${path}`);
            //   if (!res.ok) throw new Error('Network error');
            //   const json = await res.json();
            //   return json.data ?? json;
            // },
          },
        },
      })
  );


  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerTitle: 'Meds Tracker' }} />
        <StatusBar style="auto" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
