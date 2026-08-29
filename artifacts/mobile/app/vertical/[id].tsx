import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { MetricCard } from "@/components/MetricCard";
import { ScoreBadge } from "@/components/ScoreBadge";
import { useColors } from "@/hooks/useColors";

export default function VerticalDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { verticals, employees, tasks, assets, incidents, finance } = useData();

  const vertical = verticals.find((v) => v.id === id);
  if (!vertical) return null;

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;

  const myEmployees = employees.filter((e) => e.vertical === id);
  const myTasks = tasks.filter((t) => t.vertical === id);
  const myAssets = assets.filter((a) => a.vertical === id);
  const myIncidents = incidents.filter((i) => i.vertical === id);
  const myFinance = finance.filter((f) => f.vertical === id);

  const rev = myFinance.filter((f) => f.type === "revenue").reduce((s, f) => s + f.amount, 0);
  const exp = myFinance.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  const net = rev - exp;

  const avgScore = myEmployees.length > 0
    ? Math.round(myEmployees.reduce((s, e) => s + e.score, 0) / myEmployees.length)
    : 0;

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;

  const isPositive = vertical.revenueChange >= 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={[styles.vIconBig, { backgroundColor: vertical.color + "22" }]}>
          <Feather name={vertical.icon as keyof typeof Feather.glyphMap} size={28} color={vertical.color} />
        </View>
        <Text style={styles.verticalName}>{vertical.name}</Text>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueAmount}>{fmt(vertical.revenue)}</Text>
          <View style={[styles.changePill, { backgroundColor: isPositive ? "#34C759" + "22" : "#FF3B30" + "22" }]}>
            <Feather name={isPositive ? "arrow-up-right" : "arrow-down-right"} size={12} color={isPositive ? "#34C759" : "#FF3B30"} />
            <Text style={[styles.changeText, { color: isPositive ? "#34C759" : "#FF3B30" }]}>
              {Math.abs(vertical.revenueChange).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: Platform.OS === "web" ? 34 + 20 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Financial Overview</Text>
          <View style={styles.metricsGrid}>
            <MetricCard label="Revenue" value={fmt(rev)} icon="arrow-up-circle" iconColor={colors.success} style={{ flex: 1 }} />
            <MetricCard label="Expenses" value={fmt(exp)} icon="arrow-down-circle" iconColor={colors.destructive} style={{ flex: 1 }} />
          </View>
          <View style={styles.metricsGrid}>
            <MetricCard label="Net P&L" value={fmt(net)} change={vertical.revenueChange} icon="trending-up" iconColor={colors.gold} style={{ flex: 1 }} />
            <MetricCard label="Staff" value={`${vertical.employees}`} icon="users" iconColor={colors.primary} style={{ flex: 1 }} />
          </View>
        </Animated.View>

        {/* Alerts */}
        {(vertical.alerts > 0 || myIncidents.length > 0) && (
          <Animated.View entering={FadeInDown.duration(400).delay(60)}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Incidents</Text>
            {myIncidents.map((incident) => (
              <View key={incident.id} style={[styles.incidentCard, {
                backgroundColor: colors.card,
                borderColor: incident.severity === "high" || incident.severity === "critical" ? colors.destructive + "44" : colors.border
              }]}>
                <View style={styles.incidentTop}>
                  <View style={[styles.severityDot, {
                    backgroundColor: incident.severity === "critical" ? colors.destructive :
                      incident.severity === "high" ? "#FF6B00" :
                      incident.severity === "medium" ? colors.warning : colors.success
                  }]} />
                  <Text style={[styles.incidentTitle, { color: colors.foreground }]}>{incident.title}</Text>
                  <View style={[styles.statusChip, {
                    backgroundColor: incident.status === "resolved" ? colors.success + "18" :
                      incident.status === "investigating" ? colors.warning + "18" : colors.destructive + "18"
                  }]}>
                    <Text style={[styles.statusChipText, {
                      color: incident.status === "resolved" ? colors.success :
                        incident.status === "investigating" ? colors.warning : colors.destructive
                    }]}>
                      {incident.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.incidentDesc, { color: colors.mutedForeground }]}>{incident.description}</Text>
                <Text style={[styles.incidentMeta, { color: colors.mutedForeground }]}>Reported by {incident.reportedBy} · {incident.date}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Employee Performance */}
        {myEmployees.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(120)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Team Performance</Text>
              <View style={[styles.avgScore, { backgroundColor: colors.primary + "12" }]}>
                <Text style={[styles.avgScoreText, { color: colors.primary }]}>Avg: {avgScore}</Text>
              </View>
            </View>
            {myEmployees.map((emp, idx) => (
              <Animated.View key={emp.id} entering={FadeInDown.duration(300).delay(idx * 40)}>
                <View style={[styles.empCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.empAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.empAvatarText}>{emp.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.empName, { color: colors.foreground }]}>{emp.name}</Text>
                    <Text style={[styles.empRole, { color: colors.mutedForeground }]}>{emp.role}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <ScoreBadge score={emp.score} size="sm" />
                    <View style={styles.attRow}>
                      <View style={[styles.attDot, {
                        backgroundColor: emp.attendance === "present" ? colors.success :
                          emp.attendance === "late" ? colors.warning : colors.destructive
                      }]} />
                      <Text style={[styles.attText, { color: colors.mutedForeground }]}>
                        {emp.attendance}
                        {emp.checkInTime ? ` · ${emp.checkInTime}` : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Tasks */}
        {myTasks.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(180)}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tasks ({myTasks.length})</Text>
            {myTasks.map((task) => (
              <View key={task.id} style={[styles.taskRow, { backgroundColor: colors.card, borderColor: task.status === "overdue" ? colors.destructive + "44" : colors.border }]}>
                <View style={[styles.priorityDot, {
                  backgroundColor: task.priority === "critical" ? colors.destructive :
                    task.priority === "high" ? "#FF6B00" :
                    task.priority === "medium" ? colors.warning : colors.success
                }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, { color: colors.foreground }]} numberOfLines={1}>{task.title}</Text>
                  <Text style={[styles.taskAssignee, { color: colors.mutedForeground }]}>{task.assigneeName} · Due {task.dueDate}</Text>
                </View>
                <View style={[styles.statusChip, {
                  backgroundColor: task.status === "completed" ? colors.success + "18" :
                    task.status === "overdue" ? colors.destructive + "18" :
                    task.status === "in_progress" ? colors.warning + "18" : colors.muted
                }]}>
                  <Text style={[styles.statusChipText, {
                    color: task.status === "completed" ? colors.success :
                      task.status === "overdue" ? colors.destructive :
                      task.status === "in_progress" ? colors.warning : colors.mutedForeground
                  }]}>
                    {task.status.replace("_", " ")}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Assets */}
        {myAssets.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(240)}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Assets ({myAssets.length})</Text>
            {myAssets.map((asset) => (
              <View key={asset.id} style={[styles.assetRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather
                  name={asset.type === "fixed" ? "anchor" : asset.type === "movable" ? "truck" : "package"}
                  size={16}
                  color={colors.mutedForeground}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.assetName, { color: colors.foreground }]}>{asset.name}</Text>
                  <Text style={[styles.assetLocation, { color: colors.mutedForeground }]}>{asset.location}</Text>
                </View>
                <View style={[styles.statusChip, {
                  backgroundColor: asset.status === "operational" ? colors.success + "18" :
                    asset.status === "maintenance" ? colors.warning + "18" : colors.muted
                }]}>
                  <Text style={[styles.statusChipText, {
                    color: asset.status === "operational" ? colors.success :
                      asset.status === "maintenance" ? colors.warning : colors.mutedForeground
                  }]}>
                    {asset.status}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 8,
  },
  vIconBig: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  verticalName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  revenueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  revenueAmount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: -0.5,
  },
  changePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  avgScore: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  avgScoreText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  incidentCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    marginBottom: 8,
  },
  incidentTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  incidentTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
  incidentDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  incidentMeta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  empCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  empAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  empAvatarText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  empName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empRole: { fontSize: 11, fontFamily: "Inter_400Regular" },
  attRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  attDot: { width: 6, height: 6, borderRadius: 3 },
  attText: { fontSize: 10, fontFamily: "Inter_400Regular", textTransform: "capitalize" },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  taskTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  taskAssignee: { fontSize: 11, fontFamily: "Inter_400Regular" },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  assetName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  assetLocation: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
