// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { NavBar } from "@/components/Navbar";

export default function TabLayout() {
  return (
    <SafeAreaView
      className="flex-1 bg-neutral-50"
      edges={["top", "left", "right"]}
    >
      {/* Top navbar – visible on ALL tabs (and nested screens under them) */}
      <NavBar />

      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarActiveTintColor: "#000000",
            tabBarInactiveTintColor: "#9ca3af",
          }}
        >
          {/* HOME TAB */}
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="house.fill" color={color} />
              ),
            }}
          />

          {/* CLIENTS TAB */}
          <Tabs.Screen
            name="clients"
            options={{
              title: "Clients",
              tabBarIcon: ({ color }) => (
                <IconSymbol name="person.2.fill" size={28} color={color} />
              ),
            }}
          />

          {/* SERVICES TAB */}
          <Tabs.Screen
            name="services"
            options={{
              title: "Services",
              tabBarIcon: ({ color }) => (
                <IconSymbol name="building.2.fill" size={28} color={color} />
              ),
            }}
          />

          {/* MEDS TAB */}
          <Tabs.Screen
            name="meds"
            options={{
              title: "Meds",
              tabBarIcon: ({ color }) => (
                <IconSymbol name="pills.fill" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="account"
            options={{
              href: null, 
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: null, 
            }}
          />
          <Tabs.Screen
            name="courses"
            options={{
              href: null, 
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
