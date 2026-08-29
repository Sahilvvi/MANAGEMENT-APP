import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useMemo } from "react";
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
import { CircularScore } from "@/components/CircularScore";
import { SectionHeader } from "@/components/SectionHeader";
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
  const completed = periodTasks.filter((t) => t.status === "completed").length;
  const total = periodTasks.length || 1;
  return {
    completed,
    total: periodTasks.length,
    rate: Math.round((completed / total) * 100),
  };
}

export default function ManagerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { managers, tasks, issues, workers } = useData();

  const manager = managers.find((m) => m.id === id);
  const managerTasks = useMemo(() => tasks.filter((t) => t.assignedBy === manager?.name || t.assignedBy === "Sunita Devi"), [tasks, manager?.name]);
  const reportedIssues = useMemo(() => issues.filter((i) => i.reportedBy === manager?.name || i.reportedBy === "Sunita Devi"), [issues, manager?.name]);
  const team = useMemo(() => workers.filter((w) => w.business === "lawn"), [workers]);

  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const offset = i - 6;
      return {
        label: labelFor(offset),
        value: managerTasks.filter((t) => t.completedAt === isoDate(offset)).length,
      };
    });
  }, [managerTasks]);

  const oneDay = statsFor(managerTasks, 1);
  const fifteenDay = statsFor(managerTasks, 15);
  const thirtyDay = statsFor(managerTasks, 30);

  if (!manager) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Manager not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.gold }]}>
          <Text style={[styles.backText, { color: colors.primaryForeground }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const attendanceColor =
    manager.attendance === "present" ? colors.success : manager.attendance === "late" ? colors.warning : colors.destructive;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
        <Text style={[styles.backLabel, { color: colors.mutedForeground }]}>Managers</Text>
      </Pressable>

      <Animated.View entering={FadeInUp.duration(450)} style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.gold + "20" }]}>
          <Feather name="briefcase" size={32} color={colors.gold} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.cardForeground }]}>{manager.name}</Text>
          <Text style={[styles.role, { color: colors.mutedForeground }]}>Operations Manager</Text>
          <View style={[styles.attendance, { backgroundColor: attendanceColor + "15" }]}>
            <Text style={[styles.attendanceText, { color: attendanceColor }]}>Attendance: {manager.attendance}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Team performance" subtitle={`${team.length} workers under supervision`} icon="users" />
        <View style={styles.teamGrid}>
          <View style={[styles.teamBox, { borderColor: colors.border }]}>
            <Text style={[styles.teamValue, { color: colors.gold }]}>{managerTasks.length}</Text>
            <Text style={[styles.teamLabel, { color: colors.mutedForeground }]}>Tasks assigned</Text>
          </View>
          <View style={[styles.teamBox, { borderColor: colors.border }]}>
            <Text style={[styles.teamValue, { color: colors.success }]}>{reportedIssues.length}</Text>
            <Text style={[styles.teamLabel, { color: colors.mutedForeground }]}>Issues reported</Text>
          </View>
          <View style={[styles.teamBox, { borderColor: colors.border }]}>
            <Text style={[styles.teamValue, { color: colors.primary }]}>{fifteenDay.rate}%</Text>
            <Text style={[styles.teamLabel, { color: colors.mutedForeground }]}>15-day rate</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Performance snapshot" icon="bar-chart-2" />
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <CircularScore score={fifteenDay.rate} size={110} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>15-day efficiency</Text>
          </View>
          <View style={styles.scoreBox}>
            <CircularScore score={thirtyDay.rate} size={110} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>30-day efficiency</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Last 7 days" subtitle="Tasks completed that this manager assigned" icon="activity" />
        <BarChart data={trend.map((d) => ({ ...d, color: [colors.gold, colors.goldLight] as [string, string] }))} height={140} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Detailed report" subtitle="1 · 15 · 30 day summary" icon="file-text" />
        <View style={styles.reportGrid}>
          <ReportBox label="1 day" total={oneDay.total} completed={oneDay.completed} rate={oneDay.rate} colors={colors} />
          <ReportBox label="15 days" total={fifteenDay.total} completed={fifteenDay.completed} rate={fifteenDay.rate} colors={colors} />
          <ReportBox label="30 days" total={thirtyDay.total} completed={thirtyDay.completed} rate={thirtyDay.rate} colors={colors} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Profile details" icon="user" />
        <InfoRow label="Phone" value={manager.phone} />
        <InfoRow label="Salary" value={`₹${manager.salary.toLocaleString("en-IN")}/month`} />
        <InfoRow label="Joining date" value={manager.joinDate} />
        <InfoRow label="Address" value={manager.address} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Recent issues reported" icon="alert-circle" />
        {reportedIssues.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No issues reported.</Text>
        ) : (
          reportedIssues.slice(0, 5).map((issue) => (
            <View key={issue.id} style={[styles.issueRow, { borderColor: colors.border }]}>
              <View style={[styles.issueDot, { backgroundColor: issue.status === "open" ? colors.destructive : issue.status === "approved" ? colors.success : colors.warning }]} />
              <View style={styles.issueInfo}>
                <Text style={[styles.issueTitle, { color: colors.cardForeground }]}>{issue.title}</Text>
                <Text style={[styles.issueMeta, { color: colors.mutedForeground }]}>
                  {issue.date} · ₹{issue.cost} · {issue.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

function ReportBox({
  label,
  total,
  completed,
  rate,
  colors,
}: {
  label: string;
  total: number;
  completed: number;
  rate: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.reportBox, { borderColor: colors.border }]}>
      <Text style={[styles.reportLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.reportRate, { color: colors.gold }]}>{rate}%</Text>
      <Text style={[styles.reportDetail, { color: colors.cardForeground }]}>{completed}/{total} done</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 32,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
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
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  headerCard: {
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    gap: 6,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  role: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  attendance: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  attendanceText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "capitalize",
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
  teamGrid: {
    flexDirection: "row",
    gap: 10,
  },
  teamBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  teamValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  teamLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
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
  },
  scoreLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
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
    fontSize: 26,
  },
  reportDetail: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  infoLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  infoValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    maxWidth: "60%",
    textAlign: "right",
  },
  empty: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 8,
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
});
