import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tasks, workers, issues } = useData();

  useEffect(() => {
    if (user?.role === "manager") {
      router.replace("/workers");
    }
  }, [user]);

  const lawnTasks = tasks.filter((t) => t.business === "lawn");
  const completed = lawnTasks.filter((t) => t.status === "completed").length;
  const pending = lawnTasks.filter((t) => t.status === "pending").length;
  const openIssues = issues.filter((i) => i.business === "lawn" && i.status === "open").length;

  const stats = useMemo(
    () => [
      { label: "Workers", value: workers.length, icon: "users" as const, color: colors.gold },
      { label: "Total tasks", value: lawnTasks.length, icon: "check-square" as const, color: colors.primary },
      { label: "Completed", value: completed, icon: "check-circle" as const, color: colors.success },
      { label: "Pending", value: pending, icon: "clock" as const, color: colors.gold },
      { label: "Open issues", value: openIssues, icon: "alert-circle" as const, color: colors.destructive },
      { label: "Completion", value: `${lawnTasks.length ? Math.round((completed / lawnTasks.length) * 100) : 0}%`, icon: "pie-chart" as const, color: colors.primary },
    ],
    [workers.length, lawnTasks.length, completed, pending, openIssues, colors]
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Overview</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Welcome, {user?.name ?? "Admin"}
      </Text>

      <View style={styles.grid}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: `${stat.color}15` }]}>
              <Feather name={stat.icon} size={22} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.cardForeground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    paddingBottom: 32,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 4,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
});
