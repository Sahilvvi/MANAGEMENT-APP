import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { BarChart } from "@/components/BarChart";
import { CircularScore } from "@/components/CircularScore";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { useData } from "@/context/DataContext";
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

export default function ManagerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { managers, workers, tasks, issues } = useData();

  const manager = managers.find((m) => m.id === id);

  const teamTasks = useMemo(
    () => tasks.filter((t) => t.assignedBy === manager?.name || t.assignedBy === "Sunita Devi"),
    [tasks, manager?.name]
  );

  const teamWorkers = useMemo(
    () => workers.filter((w) => w.managerId === id),
    [workers, id]
  );

  const teamWorkerIds = useMemo(
    () => new Set(teamWorkers.map((w) => w.id)),
    [teamWorkers]
  );

  const managedTasks = useMemo(
    () => teamTasks.filter((t) => teamWorkerIds.has(t.assigneeId)),
    [teamTasks, teamWorkerIds]
  );

  const completionRate = useMemo(() => {
    const total = managedTasks.length || 1;
    const done = managedTasks.filter((t) => t.status === "completed").length;
    return Math.round((done / total) * 100);
  }, [managedTasks]);

  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const offset = i - 6;
      return {
        label: labelFor(offset),
        value: managedTasks.filter((t) => t.completedAt === isoDate(offset)).length,
      };
    });
  }, [managedTasks]);

  const oneDay = { start: startDate(1), rate: rateFor(managedTasks, 1) };
  const fifteenDay = { start: startDate(15), rate: rateFor(managedTasks, 15) };
  const thirtyDay = { start: startDate(30), rate: rateFor(managedTasks, 30) };

  const recentIssues = useMemo(
    () =>
      [...issues]
        .filter((i) => i.reportedBy === manager?.name)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [issues, manager?.name]
  );

  if (!manager) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.centerTitle, { color: colors.foreground }]}>Manager not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.backText, { color: colors.primaryForeground }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
        <Text style={[styles.backLabel, { color: colors.mutedForeground }]}>Managers</Text>
      </Pressable>

      <Animated.View entering={FadeInUp.duration(450)} style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
          <Feather name="briefcase" size={32} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.cardForeground }]}>{manager.name}</Text>
          <Text style={[styles.role, { color: colors.mutedForeground }]}>Lawn Manager</Text>
          <Text style={[styles.phone, { color: colors.mutedForeground }]}>{manager.phone}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Team performance" subtitle={`${teamWorkers.length} workers`} icon="users" />
        <View style={styles.grid}>
          <StatBox label="Tasks assigned" value={managedTasks.length} colors={colors} />
          <StatBox label="Completed" value={managedTasks.filter((t) => t.status === "completed").length} colors={colors} />
          <StatBox label="Pending" value={managedTasks.filter((t) => t.status === "pending").length} colors={colors} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Performance snapshot" icon="pie-chart" />
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <CircularScore score={oneDay.rate} size={90} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>1-day</Text>
          </View>
          <View style={styles.scoreBox}>
            <CircularScore score={fifteenDay.rate} size={90} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>15-day</Text>
          </View>
          <View style={styles.scoreBox}>
            <CircularScore score={thirtyDay.rate} size={90} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>30-day</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Completion trend" subtitle="Team tasks completed per day" icon="activity" />
        <BarChart data={trend.map((d) => ({ ...d, color: colors.primary }))} height={140} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Detailed report" subtitle="1 · 15 · 30 day summary" icon="file-text" />
        <View style={styles.reportGrid}>
          <ReportBox label="1 day" rate={oneDay.rate} count={managedTasks.filter((t) => t.completedAt && t.completedAt >= oneDay.start).length} colors={colors} />
          <ReportBox label="15 days" rate={fifteenDay.rate} count={managedTasks.filter((t) => t.completedAt && t.completedAt >= fifteenDay.start).length} colors={colors} />
          <ReportBox label="30 days" rate={thirtyDay.rate} count={managedTasks.filter((t) => t.completedAt && t.completedAt >= thirtyDay.start).length} colors={colors} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Recent issues reported" icon="alert-triangle" />
        {recentIssues.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No issues reported.</Text>
        ) : (
          recentIssues.map((issue) => (
            <View key={issue.id} style={[styles.issueItem, { borderColor: colors.border }]}>
              <View style={styles.issueTop}>
                <Text style={[styles.issueTitle, { color: colors.cardForeground }]}>{issue.title}</Text>
                <View style={[styles.issueBadge, { backgroundColor: issue.status === "open" ? colors.destructive + "15" : colors.success + "15" }]}>
                  <Text style={[styles.issueBadgeText, { color: issue.status === "open" ? colors.destructive : colors.success }]}>{issue.status}</Text>
                </View>
              </View>
              <Text style={[styles.issueMeta, { color: colors.mutedForeground }]}>
                {issue.date} · ₹{issue.cost}
              </Text>
              {issue.photo && <Image source={{ uri: issue.photo }} style={styles.issuePhoto} resizeMode="cover" />}
            </View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

function rateFor(tasks: ReturnType<typeof useData>["tasks"], days: number) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startStr = start.toISOString().split("T")[0];
  const filtered = tasks.filter((t) => t.dueDate >= startStr || t.createdAt >= startStr);
  const total = filtered.length || 1;
  const done = filtered.filter((t) => t.status === "completed").length;
  return Math.round((done / total) * 100);
}

function StatBox({ label, value, colors }: { label: string; value: number; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.statBox, { borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function ReportBox({
  label,
  rate,
  count,
  colors,
}: {
  label: string;
  rate: number;
  count: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.reportBox, { borderColor: colors.border }]}>
      <Text style={[styles.reportLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <ScoreBadge score={rate} size="lg" showLabel />
      <Text style={[styles.reportDetail, { color: colors.cardForeground }]}>{count} completed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  centerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  backLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  headerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  role: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  phone: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    flex: 1,
    minWidth: "28%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  scoreBox: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  scoreLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  reportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reportBox: {
    flex: 1,
    minWidth: "28%",
    borderWidth: 1,
    borderRadius: 14,
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
  reportDetail: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  empty: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 8,
  },
  issueItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  issueTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issueTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  issueMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  issueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  issueBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    textTransform: "capitalize",
  },
  issuePhoto: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginTop: 8,
  },
});
