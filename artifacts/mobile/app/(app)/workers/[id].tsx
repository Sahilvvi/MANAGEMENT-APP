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

export default function WorkerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workers, tasks } = useData();

  const worker = workers.find((w) => w.id === id);
  const workerTasks = useMemo(() => tasks.filter((t) => t.assigneeId === id), [tasks, id]);

  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const offset = i - 6;
      return {
        label: labelFor(offset),
        value: workerTasks.filter((t) => t.completedAt === isoDate(offset)).length,
      };
    });
  }, [workerTasks]);

  const oneDay = statsFor(workerTasks, 1);
  const fifteenDay = statsFor(workerTasks, 15);
  const thirtyDay = statsFor(workerTasks, 30);

  const completedTasks = useMemo(
    () =>
      [...workerTasks]
        .filter((t) => t.status === "completed" && t.completedAt)
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    [workerTasks]
  );

  if (!worker) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.centerTitle, { color: colors.foreground }]}>Worker not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.backText, { color: colors.primaryForeground }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const attendanceColor =
    worker.attendance === "present" ? colors.success : worker.attendance === "late" ? colors.warning : colors.destructive;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Feather name="arrow-left" size={20} color={colors.mutedForeground} />
        <Text style={[styles.backLabel, { color: colors.mutedForeground }]}>Workers</Text>
      </Pressable>

      <Animated.View entering={FadeInUp.duration(450)} style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
          <Feather name="user" size={32} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.cardForeground }]}>{worker.name}</Text>
          <Text style={[styles.role, { color: colors.mutedForeground }]}>{worker.jobType}</Text>
          <View style={[styles.attendance, { backgroundColor: attendanceColor + "15" }]}>
            <Text style={[styles.attendanceText, { color: attendanceColor }]}>Attendance: {worker.attendance}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Performance snapshot" icon="bar-chart-2" />
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <CircularScore score={fifteenDay.rate} size={100} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>15-day efficiency</Text>
          </View>
          <View style={styles.scoreBox}>
            <CircularScore score={thirtyDay.rate} size={100} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>30-day efficiency</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Last 7 days" subtitle="Tasks completed per day" icon="activity" />
        <BarChart data={trend.map((d) => ({ ...d, color: colors.primary }))} height={140} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Detailed report" subtitle="1 · 15 · 30 day summary" icon="file-text" />
        <View style={styles.reportGrid}>
          <ReportBox label="1 day" total={oneDay.total} completed={oneDay.completed} rate={oneDay.rate} withPhoto={oneDay.withPhoto} colors={colors} />
          <ReportBox label="15 days" total={fifteenDay.total} completed={fifteenDay.completed} rate={fifteenDay.rate} withPhoto={fifteenDay.withPhoto} colors={colors} />
          <ReportBox label="30 days" total={thirtyDay.total} completed={thirtyDay.completed} rate={thirtyDay.rate} withPhoto={thirtyDay.withPhoto} colors={colors} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Profile details" icon="user" />
        <InfoRow label="Phone" value={worker.phone} />
        <InfoRow label="Salary" value={`₹${worker.salary.toLocaleString("en-IN")}/month`} />
        <InfoRow label="Joining date" value={worker.joinDate} />
        <InfoRow label="Address" value={worker.address} />
        <InfoRow label="Total tasks assigned" value={`${workerTasks.length}`} />
        <InfoRow label="Completed with proof" value={`${completedTasks.filter((t) => t.completionPhoto).length}`} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(450)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionHeader title="Recent completed work" subtitle="With photo proof" icon="camera" />
        {completedTasks.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No completed tasks yet.</Text>
        ) : (
          completedTasks.slice(0, 5).map((task) => (
            <View key={task.id} style={[styles.workItem, { borderColor: colors.border }]}>
              <View style={styles.workInfo}>
                <Text style={[styles.workTitle, { color: colors.cardForeground }]}>{task.title}</Text>
                <Text style={[styles.workDate, { color: colors.mutedForeground }]}>Completed {task.completedAt}</Text>
              </View>
              {task.completionPhoto ? (
                <Image source={{ uri: task.completionPhoto }} style={styles.workPhoto} resizeMode="cover" />
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
  total,
  completed,
  rate,
  withPhoto,
  colors,
}: {
  label: string;
  total: number;
  completed: number;
  rate: number;
  withPhoto: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.reportBox, { borderColor: colors.border }]}>
      <Text style={[styles.reportLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.reportRate, { color: colors.primary }]}>{rate}%</Text>
      <Text style={[styles.reportDetail, { color: colors.cardForeground }]}>
        {completed}/{total} done
      </Text>
      <Text style={[styles.reportSub, { color: colors.mutedForeground }]}>{withPhoto} with photo</Text>
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
    gap: 5,
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
    textAlign: "center",
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
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
  workItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  workInfo: {
    flex: 1,
    gap: 2,
  },
  workTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  workDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  workPhoto: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  noPhoto: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
