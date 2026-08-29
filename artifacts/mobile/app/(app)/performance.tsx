import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { BarChart } from "@/components/BarChart";
import { CircularScore } from "@/components/CircularScore";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/context/AuthContext";
import { useData, type Task } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function labelFor(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3);
}

function startDate(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split("T")[0];
}

function statsFor(tasks: Task[], days: number) {
  const start = startDate(days);
  const today = isoDate(0);
  const periodTasks = tasks.filter(
    (t) => (t.dueDate >= start && t.dueDate <= today) || (t.createdAt >= start && t.createdAt <= today)
  );
  const completed = periodTasks.filter((t) => t.status === "completed");
  const withPhoto = completed.filter((t) => t.completionPhoto).length;
  const total = periodTasks.length || 1;
  return {
    completed: completed.length,
    total: periodTasks.length,
    rate: Math.round((completed.length / total) * 100),
    withPhoto,
  };
}

export default function PerformanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tasks } = useData();

  const myTasks = useMemo(() => tasks.filter((t) => t.assigneeId === user?.id), [tasks, user]);
  const completed = myTasks.filter((t) => t.status === "completed").length;
  const pending = myTasks.filter((t) => t.status === "pending").length;
  const total = myTasks.length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  const oneDay = statsFor(myTasks, 1);
  const fifteenDay = statsFor(myTasks, 15);
  const thirtyDay = statsFor(myTasks, 30);

  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const offset = i - 6;
      return {
        label: labelFor(offset),
        value: myTasks.filter((t) => t.completedAt === isoDate(offset)).length,
      };
    });
  }, [myTasks]);

  const recentCompleted = useMemo(
    () =>
      [...myTasks]
        .filter((t) => t.status === "completed" && t.completedAt)
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
        .slice(0, 5),
    [myTasks]
  );

  const getRating = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: colors.success };
    if (score >= 75) return { label: "Good", color: colors.warning };
    if (score >= 60) return { label: "Average", color: colors.gold };
    return { label: "Needs focus", color: colors.destructive };
  };
  const rating = getRating(rate);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 20 },
      ]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Performance</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Track your work, consistency and proof over time
      </Text>

      <Animated.View entering={FadeInUp.duration(500)} style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.heroLeft}>
          <CircularScore score={rate} size={130} showLabel />
        </View>
        <View style={styles.heroRight}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.success }]}>{completed}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Done</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.gold }]}>{pending}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pending</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{total}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).duration(500)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Rating" subtitle="Based on completion and photo proof" icon="star" />
        <View style={[styles.ratingBadge, { backgroundColor: rating.color + "15", borderColor: rating.color + "40" }]}>
          <Text style={[styles.ratingText, { color: rating.color }]}>{rating.label}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Last 7 days" subtitle="Tasks completed per day" icon="activity" />
        <BarChart data={trend.map((d) => ({ ...d, color: [colors.gold, colors.goldLight] as [string, string] }))} height={140} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(500)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Detailed report" subtitle="1 · 15 · 30 day summary" icon="file-text" />
        <View style={styles.reportGrid}>
          <ReportBox label="1 day" stats={oneDay} colors={colors} />
          <ReportBox label="15 days" stats={fifteenDay} colors={colors} />
          <ReportBox label="30 days" stats={thirtyDay} colors={colors} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(500)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Recent completed work" subtitle="With photo proof" icon="camera" />
        {recentCompleted.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No completed tasks yet.</Text>
        ) : (
          recentCompleted.map((task) => (
            <View key={task.id} style={[styles.historyItem, { borderColor: colors.border }]}>
              <View style={styles.historyText}>
                <Text style={[styles.historyTitle, { color: colors.cardForeground }]}>{task.title}</Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>Completed {task.completedAt}</Text>
              </View>
              {task.completionPhoto ? (
                <Image source={{ uri: task.completionPhoto }} style={styles.historyPhoto} resizeMode="cover" />
              ) : (
                <View style={[styles.noPhoto, { backgroundColor: colors.muted }]}>
                  <Feather name="camera-off" size={16} color={colors.mutedForeground} />
                </View>
              )}
            </View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

function ReportBox({
  label,
  stats,
  colors,
}: {
  label: string;
  stats: { completed: number; total: number; rate: number; withPhoto: number };
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.reportBox, { borderColor: colors.border }]}>
      <Text style={[styles.reportLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.reportRate, { color: colors.gold }]}>{stats.rate}%</Text>
      <Text style={[styles.reportDetail, { color: colors.cardForeground }]}>
        {stats.completed}/{stats.total} done
      </Text>
      <Text style={[styles.reportSub, { color: colors.mutedForeground }]}>{stats.withPhoto} with photo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 4,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroLeft: {
    flex: 1,
    alignItems: "center",
  },
  heroRight: {
    flex: 1.2,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 36,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  ratingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  ratingText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  reportGrid: {
    flexDirection: "row",
    gap: 10,
  },
  reportBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  reportLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reportRate: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  reportDetail: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  reportSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  empty: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyText: {
    flex: 1,
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
  historyPhoto: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  noPhoto: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
