// components/Navbar.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link, usePathname } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";

export function NavBar() {
  const { user, signOut } = useAuth();

  const pathname = usePathname();


  const ICON_SIZE = 28;
  const ACTIVE_COLOR = "#000000";   // same as tabBarActiveTintColor
  const INACTIVE_COLOR = "#9ca3af"; // same as tabBarInactiveTintColor

  const NAV_BG = "#f8fafc";

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.log("Sign out error: ", e);
    }
  };

  return (
    <View
      style={{
        backgroundColor: NAV_BG,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      className="flex-row items-center justify-between px-4 py-3"
    >
      {/* Left side: Logo + name */}
      <View className="flex-row items-center">
        <Text className="text-base font-semibold text-neutral-900">
          Med Tracker
        </Text>
        {user?.name ? (
          <Text className="ml-2 text-xs text-neutral-500">
            · {user.name}
          </Text>
        ) : null}
      </View>

      {/* Right side: Icons */}
      <View className="flex-row items-center gap-x-4">
        {/* Account */}
        <Link href="/account" asChild>
        <Pressable>
            <IconSymbol
            name="person.crop.circle"
            size={ICON_SIZE}
            color={
                pathname.startsWith("/account")
                ? ACTIVE_COLOR
                : INACTIVE_COLOR
            }
            />
        </Pressable>
        </Link>


        {/* Settings */}
        <Link href="/settings" asChild>
          <Pressable>
            <IconSymbol
              name="gearshape"
              size={ICON_SIZE}
              color={
                pathname.startsWith("/settings")
                  ? ACTIVE_COLOR
                  : INACTIVE_COLOR
              }
            />
          </Pressable>
        </Link>

        {/* Logout (never "active") */}
        <Pressable onPress={handleSignOut}>
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={ICON_SIZE}
            color={INACTIVE_COLOR}
          />
        </Pressable>
      </View>
    </View>
  );
}
