import { BlurView } from "expo-blur";
import { Tabs, Redirect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";

type TabDef = {
  name: string;
  title: string;
  sfIcon: string;
  sfSelected: string;
  featherIcon: keyof typeof Feather.glyphMap;
  roles: string[];
};

const ALL_TABS: TabDef[] = [
  {
    name: "index",
    title: "Dashboard",
    sfIcon: "house",
    sfSelected: "house.fill",
    featherIcon: "home",
    roles: ["owner", "general_manager", "manager", "accountant", "premium_customer", "walking_customer"],
  },
  {
    name: "checkin",
    title: "Check-In",
    sfIcon: "checkmark.circle",
    sfSelected: "checkmark.circle.fill",
    featherIcon: "check-circle",
    roles: ["employee"],
  },
  {
    name: "tasks",
    title: "Tasks",
    sfIcon: "checklist",
    sfSelected: "checklist",
    featherIcon: "check-square",
    roles: ["owner", "general_manager", "manager", "employee"],
  },
  {
    name: "finance",
    title: "Finance",
    sfIcon: "chart.bar.fill",
    sfSelected: "chart.bar.fill",
    featherIcon: "bar-chart-2",
    roles: ["owner", "general_manager", "accountant"],
  },
  {
    name: "team",
    title: "Team",
    sfIcon: "person.2",
    sfSelected: "person.2.fill",
    featherIcon: "users",
    roles: ["owner", "general_manager", "manager"],
  },
  {
    name: "assets",
    title: "Assets",
    sfIcon: "cube",
    sfSelected: "cube.fill",
    featherIcon: "box",
    roles: ["owner", "general_manager", "manager"],
  },
  {
    name: "ai",
    title: "AI",
    sfIcon: "sparkles",
    sfSelected: "sparkles",
    featherIcon: "cpu",
    roles: ["owner", "general_manager"],
  },
  {
    name: "settings",
    title: "Settings",
    sfIcon: "gearshape",
    sfSelected: "gearshape.fill",
    featherIcon: "settings",
    roles: ["owner", "general_manager", "manager", "employee", "accountant", "premium_customer", "walking_customer"],
  },
];

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const { tasks } = useData();
  const colors = useColors();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const visibleNames = new Set(
    ALL_TABS.filter((t) => t.roles.includes(user.role)).map((t) => t.name)
  );

  const overdueTasks = tasks.filter(
    (t) => t.status === "overdue" &&
      (user.role === "owner" || user.role === "general_manager" || t.assigneeId === user.id)
  ).length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 60 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint={isDark ? "dark" : "extraLight"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          marginBottom: isWeb ? 0 : 2,
        },
      }}
    >
      {ALL_TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            href: visibleNames.has(tab.name) ? undefined : null,
            tabBarBadge:
              tab.name === "tasks" && overdueTasks > 0 ? overdueTasks : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.destructive,
              fontSize: 9,
              minWidth: 16,
              height: 16,
              lineHeight: 16,
            },
            tabBarIcon: ({ color, size }) =>
              isIOS ? (
                <SymbolView
                  name={tab.sfIcon as any}
                  tintColor={color}
                  size={size ?? 22}
                />
              ) : (
                <Feather name={tab.featherIcon} size={22} color={color} />
              ),
          }}
        />
      ))}
    </Tabs>
  );
}
