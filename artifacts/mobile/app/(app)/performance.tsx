import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircularScore } from "@/components/CircularScore";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function PerformanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tasks } = useData();

  const myTasks = useMemo(() => tasks.filter((t) => t.assigneeId === user?.id), [tasks, user]);
  const completed = myTasks.filter((t) => t.status === "completed").length;
  const pending = myTasks.filter((t) => t.status === "pending").length;
  const rate = myTasks.length ? Math.round((completed / myTasks.length) * 100) : 0;

  const recentCompleted = myTasks
    .filter((t) => t.status === "completed" && t.completedAt)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, 5);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Performance</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Track your work over time
      </Text>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CircularScore score={rate} size={120} />
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
            Completion rate
          </Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.success }]}>{completed}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Done</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.gold }]}>{pending}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pending</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Recently completed
      </Text>

      {recentCompleted.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          No completed tasks yet.
        </Text>
      ) : (
        recentCompleted.map((task) => (
          <View
            key={task.id}
            style={[styles.historyItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="check-circle" size={20} color={colors.success} />
            <View style={styles.historyText}>
              <Text style={[styles.historyTitle, { color: colors.cardForeground }]}>
                {task.title}
              </Text>
              <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                Completed {task.completedAt}
              </Text>
            </View>
          </View>
        ))
      )}
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
    fontSize: 15,
    marginTop: 4,
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  scoreLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  statsCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  stat: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5EA",
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    marginBottom: 12,
  },
  empty: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  historyText: {
    gap: 2,
  },
  historyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  historyDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
