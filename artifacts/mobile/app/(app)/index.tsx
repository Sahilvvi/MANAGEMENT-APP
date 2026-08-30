import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { BarChart } from "@/components/BarChart";
import { MetricCard } from "@/components/MetricCard";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { SparklineChart } from "@/components/SparklineChart";
import { useAuth } from "@/context/AuthContext";
import { useData, type Worker } from "@/context/DataContext";
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

export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tasks, workers, issues } = useData();

  useEffect(() => {
    if (user?.role === "employee") {
      router.replace("/tasks");
    } else if (user?.role === "manager") {
      router.replace("/workers");
    }
  }, [user]);

  const lawnTasks = tasks.filter((t) => t.business === "lawn");
  const completed = lawnTasks.filter((t) => t.status === "completed").length;
  const pending = lawnTasks.filter((t) => t.status === "pending").length;
  const inProgress = lawnTasks.filter((t) => t.status === "in_progress").length;
  const overdue = lawnTasks.filter((t) => t.status === "overdue").length;
  const completionRate = lawnTasks.length ? Math.round((completed / lawnTasks.length) * 100) : 0;

  const openIssues = issues.filter((i) => i.business === "lawn" && i.status === "open");
  const issueCost = openIssues.reduce((sum, i) => sum + i.cost, 0);

  const workerStats = useMemo(() => {
    return workers.map((worker) => {
      const workerTasks = lawnTasks.filter((t) => t.assigneeId === worker.id);
      const done = workerTasks.filter((t) => t.status === "completed").length;
      const total = workerTasks.length;
      const rate = total ? Math.round((done / total) * 100) : 0;
      const withPhoto = workerTasks.filter((t) => t.status === "completed" && t.completionPhoto).length;
      return { ...worker, done, total, rate, withPhoto };
    });
  }, [workers, lawnTasks]);

  const topWorkers = [...workerStats].sort((a, b) => b.rate - a.rate).slice(0, 3);

  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const offset = i - 6;
      return {
        label: labelFor(offset),
        value: lawnTasks.filter((t) => t.completedAt === isoDate(offset)).length,
      };
    });
  }, [lawnTasks]);

  const recentIssues = useMemo(() => {
    return [...issues]
      .filter((i) => i.business === "lawn")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  }, [issues]);

  const priorityData = useMemo(() => {
    return [
      { label: "Completed", value: completed, color: colors.success },
      { label: "Pending", value: pending, color: colors.warning },
      { label: "In Progress", value: inProgress, color: colors.primary },
      { label: "Overdue", value: overdue, color: colors.destructive },
    ];
  }, [completed, pending, inProgress, overdue, colors]);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 16 },
      ]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInUp.duration(450)}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroGreeting}>Welcome back,</Text>
              <Text style={styles.heroName}>{user?.name ?? "Admin"}</Text>
            </View>
            <View style={[styles.avatar, { backgroundColor: colors.primaryForeground }]}>
              <Feather name="user" size={22} color={colors.primary} />
            </View>
          </View>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroValue}>{completionRate}%</Text>
              <Text style={styles.heroLabel}>Completion rate</Text>
            </View>
            <SparklineChart
              data={trend.map((d) => d.value)}
              color={colors.primaryForeground}
              height={48}
              gap={4}
            />
          </View>
        </View>
      </Animated.View>

      <View style={styles.statsGrid}>
        <MetricCard
          label="Workers"
          value={workers.length.toString()}
          subLabel={`${workers.filter((w) => w.attendance === "present").length} present`}
          icon="users"
          iconColor={colors.primary}
        />
        <MetricCard
          label="Total tasks"
          value={lawnTasks.length.toString()}
          subLabel={`${pending} pending`}
          icon="check-square"
          iconColor={colors.primary}
        />
        <MetricCard
          label="Completed"
          value={completed.toString()}
          subLabel={`${completionRate}% done`}
          icon="check-circle"
          iconColor={colors.success}
        />
        <MetricCard
          label="Open issues"
          value={openIssues.length.toString()}
          subLabel={`₹${issueCost} est. cost`}
          icon="alert-circle"
          iconColor={colors.destructive}
        />
      </View>

      <Animated.View entering={FadeInUp.delay(120).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Task status" subtitle="Current task breakdown" icon="pie-chart" />
        <BarChart data={priorityData} height={150} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(220).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Completion trend" subtitle="Last 7 days" icon="activity" />
        <BarChart data={trend.map((d) => ({ ...d, color: colors.primary }))} height={140} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(320).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Top performers" subtitle="By completion rate" icon="award" />
        <View style={styles.topList}>
          {topWorkers.map((worker, index) => (
            <Pressable
              key={worker.id}
              onPress={() => router.push({ pathname: "/workers/[id]", params: { id: worker.id } })}
              style={[styles.topItem, { borderColor: colors.border }]}
            >
              <View style={[styles.rank, { backgroundColor: index === 0 ? colors.primary + "15" : colors.muted }]}>
                <Text style={[styles.rankText, { color: index === 0 ? colors.primary : colors.mutedForeground }]}>
                  #{index + 1}
                </Text>
              </View>
              <View style={styles.topInfo}>
                <Text style={[styles.topName, { color: colors.cardForeground }]}>{worker.name}</Text>
                <Text style={[styles.topMeta, { color: colors.mutedForeground }]}>
                  {worker.jobType} · {worker.done}/{worker.total} tasks
                </Text>
              </View>
              <ScoreBadge score={worker.rate} size="md" />
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(420).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Recent issues" subtitle="Needs your attention" icon="alert-triangle" />
        {recentIssues.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No issues reported.</Text>
        ) : (
          recentIssues.map((issue) => (
            <Pressable
              key={issue.id}
              onPress={() => router.push("/issues")}
              style={[styles.issueRow, { borderColor: colors.border }]}
            >
              <View style={[styles.issueDot, { backgroundColor: issue.status === "open" ? colors.destructive : colors.success }]} />
              <View style={styles.issueInfo}>
                <Text style={[styles.issueTitle, { color: colors.cardForeground }]}>{issue.title}</Text>
                <Text style={[styles.issueMeta, { color: colors.mutedForeground }]}>
                  {issue.reportedBy} · {issue.date} · ₹{issue.cost}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  hero: {
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  heroGreeting: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  heroName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
    marginTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 42,
    color: "#FFFFFF",
  },
  heroLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
  },
  topList: {
    gap: 10,
  },
  topItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  rank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  topInfo: {
    flex: 1,
    gap: 2,
  },
  topName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  topMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  issueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  issueInfo: {
    flex: 1,
    gap: 2,
  },
  issueTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  issueMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  empty: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 8,
  },
});
