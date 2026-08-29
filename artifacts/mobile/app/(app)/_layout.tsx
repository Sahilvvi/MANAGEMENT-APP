import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type AppTab = {
  name: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  roles: UserRole[];
};

const APP_TABS: AppTab[] = [
  { name: "index", title: "Overview", icon: "home", roles: ["owner"] },
  { name: "workers", title: "Workers", icon: "users", roles: ["owner", "manager"] },
  { name: "managers", title: "Managers", icon: "briefcase", roles: ["owner"] },
  { name: "tasks", title: "Tasks", icon: "check-square", roles: ["owner", "manager", "employee"] },
  { name: "performance", title: "Performance", icon: "bar-chart-2", roles: ["employee"] },
  { name: "profile", title: "Profile", icon: "user", roles: ["employee"] },
  { name: "issues", title: "Issues", icon: "alert-circle", roles: ["owner", "manager"] },
  { name: "settings", title: "Settings", icon: "settings", roles: ["owner", "manager", "employee"] },
];

const INITIAL_ROUTE: Record<UserRole, string> = {
  owner: "index",
  manager: "workers",
  employee: "tasks",
  general_manager: "index",
  accountant: "index",
  premium_customer: "index",
  walking_customer: "index",
};

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.primary }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const visibleNames = new Set(
    APP_TABS.filter((t) => t.roles.includes(user.role)).map((t) => t.name)
  );

  return (
    <Tabs
      initialRouteName={INITIAL_ROUTE[user.role] ?? "index"}
      screenOptions={{
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingBottom: isWeb ? 8 : insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          minHeight: isWeb ? 60 : 70,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      {APP_TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            href: visibleNames.has(tab.name) ? undefined : null,
            tabBarIcon: ({ color, size }) => (
              <Feather name={tab.icon} size={size ?? 22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
