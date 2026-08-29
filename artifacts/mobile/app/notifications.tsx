import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Notification {
  id: string;
  type: "alert" | "task" | "attendance" | "finance" | "system" | "ai";
  title: string;
  body: string;
  time: string;
  read: boolean;
  severity?: "low" | "medium" | "high" | "critical";
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "alert", title: "Pipeline Pressure Alert", body: "Anomaly detected in Petroleum pipeline B4. Immediate inspection required.", time: "2 min ago", read: false, severity: "high" },
  { id: "n2", type: "attendance", title: "Late Check-In", body: "Priya Nair clocked in 75 minutes late. Fine of ₹200 auto-applied.", time: "18 min ago", read: false, severity: "medium" },
  { id: "n3", type: "task", title: "Overdue Task", body: "Pipeline pressure review by Priya Nair is 2 days overdue.", time: "1 hr ago", read: false, severity: "high" },
  { id: "n4", type: "finance", title: "Payroll Reminder", body: "May 2026 payroll of $648K is due on May 31. TDS deposit pending by May 7.", time: "2 hr ago", read: true },
  { id: "n5", type: "ai", title: "AI Daily Report Ready", body: "Your operational summary for May 2, 2026 is available. Revenue up 8.4%.", time: "3 hr ago", read: true },
  { id: "n6", type: "attendance", title: "Employee Absent", body: "Vikram Reddy (Hospitality) has not checked in today.", time: "4 hr ago", read: true, severity: "medium" },
  { id: "n7", type: "system", title: "Asset Maintenance Due", body: "Drilling Rig Alpha at Site B is due for scheduled maintenance today.", time: "5 hr ago", read: true },
  { id: "n8", type: "alert", title: "Unauthorized Access", body: "Mining shaft 3 restricted area badge scan denied twice. Security reviewing.", time: "6 hr ago", read: true, severity: "medium" },
  { id: "n9", type: "task", title: "Task Completed", body: "Kavitha Iyer completed 8 lease renewal follow-ups ahead of schedule.", time: "8 hr ago", read: true },
  { id: "n10", type: "finance", title: "GST Filed", body: "Q2 GST filing for all verticals submitted successfully.", time: "Yesterday", read: true },
];

const TYPE_META: Record<Notification["type"], { icon: keyof typeof Feather.glyphMap; color: string; bg: string }> = {
  alert: { icon: "alert-triangle", color: "#FF3B30", bg: "#FF3B3018" },
  task: { icon: "check-square", color: "#007AFF", bg: "#007AFF18" },
  attendance: { icon: "user-check", color: "#FF9500", bg: "#FF950018" },
  finance: { icon: "dollar-sign", color: "#34C759", bg: "#34C75918" },
  system: { icon: "settings", color: "#8E8E93", bg: "#8E8E9318" },
  ai: { icon: "cpu", color: "#C9A84C", bg: "#C9A84C18" },
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayed = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismiss = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}
          >
            <Feather name="arrow-left" size={18} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSub}>{unreadCount} unread</Text>
            )}
          </View>
          {unreadCount > 0 && (
            <Pressable onPress={markAllRead} style={[styles.markAllBtn, { borderColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          )}
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          {(["all", "unread"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => { setFilter(f); Haptics.selectionAsync(); }}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === f ? colors.gold : "rgba(255,255,255,0.08)",
                  borderColor: filter === f ? colors.gold : "rgba(255,255,255,0.15)",
                },
              ]}
            >
              <Text style={[styles.filterBtnText, { color: "#fff" }]}>
                {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: Platform.OS === "web" ? 34 + 20 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {displayed.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All caught up</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>No unread notifications</Text>
          </View>
        ) : (
          displayed.map((notif, idx) => {
            const meta = TYPE_META[notif.type];
            return (
              <Animated.View
                key={notif.id}
                entering={FadeInDown.duration(280).delay(idx * 35)}
                exiting={FadeOutLeft.duration(250)}
              >
                <Pressable
                  onPress={() => markRead(notif.id)}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: !notif.read ? colors.primary + "22" : colors.border,
                      borderLeftWidth: !notif.read ? 3 : 1,
                      borderLeftColor: !notif.read ? meta.color : colors.border,
                    },
                  ]}
                >
                  <View style={styles.notifTop}>
                    <View style={[styles.notifIcon, { backgroundColor: meta.bg }]}>
                      <Feather name={meta.icon} size={16} color={meta.color} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.notifTitleRow}>
                        <Text style={[styles.notifTitle, { color: colors.foreground }]} numberOfLines={1}>
                          {notif.title}
                        </Text>
                        {!notif.read && (
                          <View style={[styles.unreadDot, { backgroundColor: meta.color }]} />
                        )}
                      </View>
                      <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{notif.time}</Text>
                    </View>

                    <Pressable onPress={() => dismiss(notif.id)} style={styles.dismissBtn}>
                      <Feather name="x" size={14} color={colors.mutedForeground} />
                    </Pressable>
                  </View>

                  <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {notif.body}
                  </Text>

                  {notif.severity && (notif.severity === "high" || notif.severity === "critical") && (
                    <View style={[styles.severityBadge, {
                      backgroundColor: notif.severity === "critical" ? colors.destructive + "18" : "#FF6B0018",
                    }]}>
                      <Feather
                        name="alert-circle"
                        size={11}
                        color={notif.severity === "critical" ? colors.destructive : "#FF6B00"}
                      />
                      <Text style={[styles.severityText, {
                        color: notif.severity === "critical" ? colors.destructive : "#FF6B00",
                      }]}>
                        {notif.severity === "critical" ? "Critical — Immediate action required" : "High priority"}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  markAllText: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium" },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  notifCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  notifTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  notifIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  notifTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4 },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  dismissBtn: { padding: 4 },
  notifBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginLeft: 46 },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 46,
  },
  severityText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 80 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
