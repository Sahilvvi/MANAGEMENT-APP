import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { MetricCard } from "@/components/MetricCard";
import { VerticalCard } from "@/components/VerticalCard";
import { ScoreBadge } from "@/components/ScoreBadge";
import { CircularScore } from "@/components/CircularScore";
import { SparklineChart } from "@/components/SparklineChart";
import { useColors } from "@/hooks/useColors";

const SEVERITY_COLOR: Record<string, string> = {
  low: "#34C759",
  medium: "#FF9500",
  high: "#FF6B00",
  critical: "#FF3B30",
};

const COMPLIANCE_ITEMS = [
  { label: "TDS Deposit", due: "May 7", urgent: true, icon: "alert-circle" as const },
  { label: "GST Monthly Filing", due: "May 20", urgent: false, icon: "file-text" as const },
  { label: "Advance Tax Q1", due: "Jun 15", urgent: false, icon: "calendar" as const },
  { label: "Bank Reconciliation", due: "Today", urgent: false, icon: "check-circle" as const },
  { label: "PF/ESI Deposit", due: "May 15", urgent: false, icon: "dollar-sign" as const },
];

const PAYROLL_QUEUE = [
  { name: "Deepak Joshi", dept: "Technology", amount: 97800 },
  { name: "Priya Sharma", dept: "Healthcare", amount: 88500 },
  { name: "Rahul Singh", dept: "Mining", amount: 112000 },
];

const PREMIUM_SERVICES = [
  { icon: "calendar" as const, label: "Book Room", color: "#0A1628" },
  { icon: "coffee" as const, label: "Concierge", color: "#C9A84C" },
  { icon: "truck" as const, label: "Transport", color: "#34C759" },
  { icon: "phone" as const, label: "Support", color: "#8B5CF6" },
];

const PREMIUM_HISTORY = [
  { service: "Executive Suite — Room 412", date: "May 1, 2026", status: "Completed", amount: "$420" },
  { service: "Airport Transfer", date: "Apr 28, 2026", status: "Completed", amount: "$85" },
  { service: "Spa Package — Premium", date: "Apr 22, 2026", status: "Completed", amount: "$210" },
];

const GUEST_SERVICES = [
  { icon: "key" as const, label: "Check-In", color: "#0A1628" },
  { icon: "coffee" as const, label: "Order Food", color: "#FF9500" },
  { icon: "wifi" as const, label: "Wi-Fi Code", color: "#007AFF" },
  { icon: "map-pin" as const, label: "Directions", color: "#34C759" },
  { icon: "phone" as const, label: "Reception", color: "#8B5CF6" },
  { icon: "info" as const, label: "Info", color: "#C9A84C" },
];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { verticals, employees, tasks, totalRevenue, totalExpenses, incidents, addIncident } = useData();
  const { showToast } = useToast();

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incTitle, setIncTitle] = useState("");
  const [incDesc, setIncDesc] = useState("");
  const [incSeverity, setIncSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [incVertical, setIncVertical] = useState("corporate");

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;

  const myEmployee = useMemo(
    () => employees.find((e) => e.id === user?.id),
    [employees, user]
  );

  const employeeRank = useMemo(() => {
    if (!myEmployee) return null;
    const sorted = [...employees].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((e) => e.id === myEmployee.id) + 1;
    return { rank, total: sorted.length };
  }, [employees, myEmployee]);

  const presentCount = employees.filter((e) => e.attendance === "present").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;
  const overdueTasks = tasks.filter((t) => t.status === "overdue").length;
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;
  const unreadNotifications = 3;

  const role = user?.role ?? "employee";
  const isOwnerLike = role === "owner" || role === "general_manager";
  const isManager = role === "manager";
  const isEmployee = role === "employee";
  const isAccountant = role === "accountant";
  const isPremiumCustomer = role === "premium_customer";
  const isWalkingCustomer = role === "walking_customer";
  const isCustomer = isPremiumCustomer || isWalkingCustomer;

  const totalNet = totalRevenue - totalExpenses;
  const netStr = totalNet >= 1000000 ? `$${(totalNet / 1000000).toFixed(2)}M` : `$${(totalNet / 1000).toFixed(0)}K`;
  const revStr = totalRevenue >= 1000000 ? `$${(totalRevenue / 1000000).toFixed(2)}M` : `$${(totalRevenue / 1000).toFixed(0)}K`;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleReportIncident = async () => {
    if (!incTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addIncident({
      title: incTitle.trim(),
      description: incDesc.trim(),
      reportedBy: user?.name ?? "Unknown",
      vertical: incVertical,
      severity: incSeverity,
      status: "open",
    });
    setIncTitle("");
    setIncDesc("");
    setIncSeverity("medium");
    setShowIncidentModal(false);
    showToast("Incident reported successfully", "success");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 60 : 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Header ─── */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName} numberOfLines={1}>{user?.name ?? "User"}</Text>
            <View style={[styles.rolePill, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "44" }]}>
              <Text style={[styles.rolePillText, { color: colors.gold }]}>
                {role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {!isCustomer && (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/notifications"); }}
                style={[styles.headerActionBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}
              >
                <Feather name="bell" size={18} color="#fff" />
                {unreadNotifications > 0 && (
                  <View style={[styles.badgeDot, { backgroundColor: colors.destructive }]}>
                    <Text style={styles.badgeDotText}>{unreadNotifications}</Text>
                  </View>
                )}
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              style={[styles.avatarBtn, { backgroundColor: colors.gold }]}
            >
              <Text style={styles.avatarText}>{(user?.name ?? "U")[0]}</Text>
            </Pressable>
          </View>
        </View>

        {/* Owner/GM top metrics bar */}
        {isOwnerLike && (
          <View style={styles.topMetrics}>
            <View style={styles.topMetricItem}>
              <Text style={styles.topMetricValue}>{revStr}</Text>
              <Text style={styles.topMetricLabel}>Revenue</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={[styles.topMetricValue, { color: "#34C759" }]}>{netStr}</Text>
              <Text style={styles.topMetricLabel}>Net Profit</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={styles.topMetricValue}>{presentCount}</Text>
              <Text style={styles.topMetricLabel}>Present</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={[styles.topMetricValue, { color: openIncidents > 0 ? "#FF9500" : "#34C759" }]}>
                {openIncidents}
              </Text>
              <Text style={styles.topMetricLabel}>Incidents</Text>
            </View>
          </View>
        )}

        {/* Employee top bar */}
        {isEmployee && myEmployee && (
          <View style={styles.employeeBar}>
            <ScoreBadge score={myEmployee.score} size="md" />
            <View style={{ flex: 1 }}>
              <Text style={styles.empBarLabel}>Performance Score</Text>
              <Text style={styles.empBarValue}>{myEmployee.department} · {myEmployee.vertical}</Text>
              {employeeRank && (
                <View style={[styles.rankPill, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "44" }]}>
                  <Feather name="award" size={9} color={colors.gold} />
                  <Text style={[styles.rankText, { color: colors.gold }]}>
                    #{employeeRank.rank} of {employeeRank.total}
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.attendanceDot, { backgroundColor: myEmployee.attendance === "present" ? colors.success : colors.destructive }]} />
            <Text style={[styles.attText, { color: "rgba(255,255,255,0.6)" }]}>
              {myEmployee.attendance}
            </Text>
          </View>
        )}

        {/* Accountant top bar */}
        {isAccountant && (
          <View style={styles.topMetrics}>
            <View style={styles.topMetricItem}>
              <Text style={styles.topMetricValue}>{revStr}</Text>
              <Text style={styles.topMetricLabel}>Revenue</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={[styles.topMetricValue, { color: "#34C759" }]}>{netStr}</Text>
              <Text style={styles.topMetricLabel}>Net P&L</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={styles.topMetricValue}>$648K</Text>
              <Text style={styles.topMetricLabel}>Payroll Due</Text>
            </View>
          </View>
        )}

        {/* Premium Customer header bar */}
        {isPremiumCustomer && (
          <View style={styles.topMetrics}>
            <View style={styles.topMetricItem}>
              <Text style={[styles.topMetricValue, { color: colors.gold }]}>2,840</Text>
              <Text style={styles.topMetricLabel}>Points</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={styles.topMetricValue}>GOLD</Text>
              <Text style={styles.topMetricLabel}>Tier</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={styles.topMetricValue}>14</Text>
              <Text style={styles.topMetricLabel}>Visits</Text>
            </View>
          </View>
        )}

        {/* Walking Customer header bar */}
        {isWalkingCustomer && (
          <View style={styles.topMetrics}>
            <View style={styles.topMetricItem}>
              <Text style={[styles.topMetricValue, { color: "#10B981" }]}>Active</Text>
              <Text style={styles.topMetricLabel}>Status</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={styles.topMetricValue}>Lobby</Text>
              <Text style={styles.topMetricLabel}>Location</Text>
            </View>
            <View style={styles.topMetricDivider} />
            <View style={styles.topMetricItem}>
              <Text style={styles.topMetricValue}>9:04 AM</Text>
              <Text style={styles.topMetricLabel}>Arrived</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* ─── Alerts Banner ─── */}
        {(openIncidents > 0 || overdueTasks > 0) && !isCustomer && (
          <Animated.View entering={FadeInDown.duration(350)} style={[styles.alertBanner, { backgroundColor: "#FFF3E0", borderColor: "#FF9500" + "44" }]}>
            <Feather name="alert-triangle" size={15} color="#FF9500" />
            <Text style={[styles.alertBannerText, { color: "#CC6600" }]}>
              {[
                openIncidents > 0 ? `${openIncidents} open incident${openIncidents > 1 ? "s" : ""}` : "",
                overdueTasks > 0 ? `${overdueTasks} overdue task${overdueTasks > 1 ? "s" : ""}` : "",
              ].filter(Boolean).join(" · ")}
            </Text>
            <Pressable
              onPress={() => router.push("/notifications")}
              style={[styles.alertViewBtn, { backgroundColor: "#FF950022" }]}
            >
              <Text style={{ color: "#CC6600", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>View</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ─── Owner / GM Quick Actions ─── */}
        {(isOwnerLike || isManager) && (
          <Animated.View entering={FadeInDown.duration(350).delay(50)}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
            <View style={styles.quickActions}>
              {[
                { icon: "cpu" as const, label: "AI Report", color: colors.primary, onPress: () => router.push("/(tabs)/ai") },
                { icon: "alert-circle" as const, label: "Incident", color: colors.destructive, onPress: () => setShowIncidentModal(true) },
                { icon: "plus-square" as const, label: "New Task", color: colors.gold, onPress: () => router.push("/(tabs)/tasks") },
                { icon: "bell" as const, label: "Alerts", color: colors.success, onPress: () => router.push("/notifications"), badge: unreadNotifications },
              ].map((action) => (
                <Pressable
                  key={action.label}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); action.onPress(); }}
                  style={[styles.quickAction, { backgroundColor: action.color + "0A", borderColor: action.color + "22" }]}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + "18" }]}>
                    <Feather name={action.icon} size={18} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{action.label}</Text>
                  {(action.badge ?? 0) > 0 && (
                    <View style={[styles.quickActionBadge, { backgroundColor: colors.destructive }]}>
                      <Text style={styles.quickActionBadgeText}>{action.badge}</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ─── Owner/GM Metric Cards ─── */}
        {isOwnerLike && (
          <Animated.View entering={FadeInDown.duration(350).delay(100)}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today at a Glance</Text>
            <View style={styles.metricsGrid}>
              <MetricCard label="Attendance" value={`${presentCount}/${employees.length}`} icon="user-check" iconColor={colors.success} style={{ flex: 1 }} />
              <MetricCard label="Active Tasks" value={`${pendingTasks}`} icon="check-square" iconColor={colors.primary} style={{ flex: 1 }} />
            </View>
            <View style={styles.metricsGrid}>
              <MetricCard label="Open Incidents" value={`${openIncidents}`} icon="alert-circle" iconColor={colors.destructive} style={{ flex: 1 }} />
              <MetricCard label="Net Profit" value={netStr} change={8.4} icon="trending-up" iconColor={colors.gold} style={{ flex: 1 }} />
            </View>
          </Animated.View>
        )}

        {/* ─── Revenue Trend Sparkline (Owner / GM) ─── */}
        {isOwnerLike && (
          <Animated.View entering={FadeInDown.duration(350).delay(140)}>
            <View style={[styles.trendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.trendHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trendTitle, { color: colors.foreground }]}>Revenue Trend</Text>
                  <Text style={[styles.trendSub, { color: colors.mutedForeground }]}>Last 7 days · May 2026</Text>
                </View>
                <View style={[styles.trendPill, { backgroundColor: colors.success + "18" }]}>
                  <Feather name="trending-up" size={11} color={colors.success} />
                  <Text style={[styles.trendPillText, { color: colors.success }]}>+8.4%</Text>
                </View>
              </View>
              <SparklineChart
                data={[142, 148, 151, 156, 160, 162, 163]}
                color={colors.primary}
                height={52}
                gap={4}
              />
              <View style={styles.trendDayRow}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"].map((d) => (
                  <Text key={d} style={[styles.trendDay, { color: colors.mutedForeground }]}>{d}</Text>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* ─── Accountant Dashboard ─── */}
        {isAccountant && (
          <Animated.View entering={FadeInDown.duration(350).delay(60)} style={{ gap: 20 }}>
            {/* Finance metrics */}
            <View style={{ gap: 8 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Financial Overview</Text>
              <View style={styles.metricsGrid}>
                <MetricCard label="Revenue" value={revStr} change={11.2} icon="arrow-up-circle" iconColor={colors.success} style={{ flex: 1 }} />
                <MetricCard label="Expenses" value={`$${(totalExpenses / 1000).toFixed(0)}K`} icon="arrow-down-circle" iconColor={colors.destructive} style={{ flex: 1 }} />
              </View>
              <View style={styles.metricsGrid}>
                <MetricCard label="Net P&L" value={netStr} change={8.4} icon="trending-up" iconColor={colors.gold} style={{ flex: 1 }} />
                <MetricCard label="Pending Payroll" value="$648K" icon="dollar-sign" iconColor={colors.primary} style={{ flex: 1 }} />
              </View>
            </View>

            {/* Compliance Queue */}
            <View style={{ gap: 10 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Compliance Queue</Text>
              {COMPLIANCE_ITEMS.map((item, idx) => (
                <Animated.View key={item.label} entering={FadeInDown.duration(280).delay(idx * 40)}>
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast(`${item.label} marked as reviewed`, "success"); }}
                    style={[styles.complianceRow, {
                      backgroundColor: colors.card,
                      borderColor: item.urgent ? colors.destructive + "44" : colors.border,
                    }]}
                  >
                    <View style={[styles.complianceIcon, {
                      backgroundColor: item.urgent ? colors.destructive + "18" : colors.success + "14",
                    }]}>
                      <Feather name={item.icon} size={14} color={item.urgent ? colors.destructive : colors.success} />
                    </View>
                    <Text style={[styles.complianceLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.complianceDue, { color: item.urgent ? colors.destructive : colors.mutedForeground }]}>
                      Due {item.due}
                    </Text>
                    {item.urgent && (
                      <View style={[styles.urgentBadge, { backgroundColor: colors.destructive + "18" }]}>
                        <Text style={[styles.urgentText, { color: colors.destructive }]}>URGENT</Text>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            {/* Payroll Queue */}
            <View style={{ gap: 10 }}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payroll Queue</Text>
                <Text style={[styles.seeAll, { color: colors.gold }]}>May 31</Text>
              </View>
              {PAYROLL_QUEUE.map((emp, idx) => (
                <Animated.View key={emp.name} entering={FadeInDown.duration(280).delay(idx * 40)}>
                  <View style={[styles.payrollRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.payrollAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.payrollAvatarText}>{emp.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.payrollName, { color: colors.foreground }]}>{emp.name}</Text>
                      <Text style={[styles.payrollDept, { color: colors.mutedForeground }]}>{emp.dept}</Text>
                    </View>
                    <Text style={[styles.payrollAmount, { color: colors.success }]}>${emp.amount.toLocaleString()}</Text>
                    <Pressable
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast(`Payslip approved for ${emp.name}`, "success"); }}
                      style={[styles.approveBtn, { backgroundColor: colors.primary }]}
                    >
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Open Finance Dashboard CTA */}
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/finance"); }}
              style={[styles.ctaBtn, { backgroundColor: colors.primary + "0E", borderColor: colors.primary + "33" }]}
            >
              <Feather name="bar-chart-2" size={16} color={colors.primary} />
              <Text style={[styles.ctaBtnText, { color: colors.primary }]}>Open Finance Dashboard</Text>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </Pressable>
          </Animated.View>
        )}

        {/* ─── Premium Customer Dashboard ─── */}
        {isPremiumCustomer && (
          <Animated.View entering={FadeInDown.duration(350).delay(60)} style={{ gap: 20 }}>
            {/* Loyalty Card */}
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Loyalty Status</Text>
              <View style={[styles.loyaltyCard, { backgroundColor: colors.gold }]}>
                <View style={styles.loyaltyTop}>
                  <View>
                    <Text style={styles.loyaltyPointsLabel}>POINTS BALANCE</Text>
                    <Text style={styles.loyaltyPoints}>2,840</Text>
                  </View>
                  <View style={styles.loyaltyTierBadge}>
                    <Feather name="star" size={13} color={colors.gold} />
                    <Text style={styles.loyaltyTierText}>GOLD</Text>
                  </View>
                </View>
                <Text style={styles.loyaltyMemberName}>{user?.name}</Text>
                <View style={{ gap: 6, marginTop: 8 }}>
                  <View style={styles.loyaltyProgressRow}>
                    <Text style={styles.loyaltyProgressLabel}>Next tier: 160 pts to Platinum</Text>
                    <Text style={styles.loyaltyProgressPct}>94%</Text>
                  </View>
                  <View style={[styles.loyaltyBar, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                    <View style={[styles.loyaltyBarFill, { width: "94%", backgroundColor: "#fff" }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Services */}
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Services</Text>
              <View style={styles.quickActions}>
                {PREMIUM_SERVICES.map((s) => (
                  <Pressable
                    key={s.label}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast(`${s.label} request sent`, "info"); }}
                    style={[styles.quickAction, { backgroundColor: s.color + "0A", borderColor: s.color + "22" }]}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: s.color + "18" }]}>
                      <Feather name={s.icon} size={18} color={s.color} />
                    </View>
                    <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Metrics */}
            <View style={styles.metricsGrid}>
              <MetricCard label="Total Visits" value="14" icon="map-pin" iconColor={colors.primary} style={{ flex: 1 }} />
              <MetricCard label="Total Spent" value="$3,820" icon="credit-card" iconColor={colors.gold} style={{ flex: 1 }} />
            </View>

            {/* Recent Activity */}
            <View style={{ gap: 10 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
              {PREMIUM_HISTORY.map((item, idx) => (
                <Animated.View key={item.service} entering={FadeInDown.duration(280).delay(idx * 40)}>
                  <View style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.historyDot, { backgroundColor: colors.success + "18" }]}>
                      <Feather name="check" size={12} color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.historyService, { color: colors.foreground }]}>{item.service}</Text>
                      <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{item.date}</Text>
                    </View>
                    <Text style={[styles.historyAmount, { color: colors.foreground }]}>{item.amount}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Concierge CTA */}
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); showToast("Connecting to your personal concierge...", "info"); }}
              style={[styles.conciergeBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="phone" size={16} color="#fff" />
              <Text style={styles.conciergeBtnText}>Contact Personal Concierge</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ─── Walking Customer Dashboard ─── */}
        {isWalkingCustomer && (
          <Animated.View entering={FadeInDown.duration(350).delay(60)} style={{ gap: 20 }}>
            {/* Check-in status card */}
            <View style={[styles.guestCheckedInCard, { backgroundColor: colors.card, borderColor: colors.success + "44" }]}>
              <View style={[styles.guestCheckinIcon, { backgroundColor: colors.success + "18" }]}>
                <Feather name="check-circle" size={26} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.guestCheckedInTitle, { color: colors.foreground }]}>You're Checked In</Text>
                <Text style={[styles.guestCheckedInSub, { color: colors.mutedForeground }]}>
                  Lobby · Arrived 9:04 AM · Pass valid until 6:00 PM
                </Text>
              </View>
            </View>

            {/* QR Code placeholder */}
            <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.qrBox, { borderColor: colors.border }]}>
                {/* Simulated QR pattern */}
                {[0, 1, 2, 3].map((row) => (
                  <View key={row} style={styles.qrRow}>
                    {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                      <View
                        key={col}
                        style={[styles.qrCell, {
                          backgroundColor: ((row + col) % 2 === 0 || row === 0 || col === 0 || (row === 3 && col > 4)) ? colors.primary : colors.card,
                        }]}
                      />
                    ))}
                  </View>
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.qrTitle, { color: colors.foreground }]}>Visitor Pass</Text>
                <Text style={[styles.qrCode, { color: colors.gold }]}>EOH-V-83291</Text>
                <Text style={[styles.qrSub, { color: colors.mutedForeground }]}>Scan at reception or security gates</Text>
              </View>
            </View>

            {/* Guest services grid */}
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Available Services</Text>
              <View style={styles.guestServicesGrid}>
                {GUEST_SERVICES.map((s) => (
                  <Pressable
                    key={s.label}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast(`${s.label} — on the way!`, "success"); }}
                    style={[styles.guestService, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={[styles.guestServiceIcon, { backgroundColor: s.color + "18" }]}>
                      <Feather name={s.icon} size={20} color={s.color} />
                    </View>
                    <Text style={[styles.guestServiceLabel, { color: colors.foreground }]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Upgrade prompt */}
            <View style={[styles.upgradeCard, { backgroundColor: colors.primary }]}>
              <View>
                <Text style={styles.upgradeTitle}>Become a Premium Member</Text>
                <Text style={styles.upgradeSub}>Earn loyalty points, priority service & exclusive perks</Text>
              </View>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); showToast("Membership info sent to your email", "info"); }}
                style={styles.upgradeBtn}
              >
                <Text style={[styles.upgradeBtnText, { color: colors.primary }]}>Join Now</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* ─── Employee Performance Card ─── */}
        {isEmployee && myEmployee && (
          <Animated.View entering={FadeInDown.duration(350).delay(100)} style={{ gap: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Performance</Text>
            <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <CircularScore score={myEmployee.score} size={96} showLabel />
              <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.scoreBreakdown}>
                {[
                  { label: "Punctuality", val: 94, color: "#34C759" },
                  { label: "Tasks", val: 88, color: "#FF9500" },
                  { label: "Compliance", val: 100, color: "#34C759" },
                  { label: "Feedback", val: 96, color: "#34C759" },
                ].map((item) => (
                  <View key={item.label} style={{ gap: 3 }}>
                    <View style={styles.scoreRow}>
                      <Text style={[styles.scoreRowLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                      <Text style={[styles.scoreRowVal, { color: colors.foreground }]}>{item.val}</Text>
                    </View>
                    <View style={[styles.miniBar, { backgroundColor: colors.muted }]}>
                      <View style={[styles.miniBarFill, { width: `${item.val}%` as any, backgroundColor: item.color }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Employee quick actions */}
            <View style={styles.quickActions}>
              {[
                { icon: "check-circle" as const, label: "Check-In", color: colors.primary, onPress: () => router.push("/(tabs)/checkin") },
                { icon: "list" as const, label: "My Tasks", color: colors.gold, onPress: () => router.push("/(tabs)/tasks") },
                { icon: "alert-circle" as const, label: "Report", color: colors.destructive, onPress: () => setShowIncidentModal(true) },
                { icon: "bell" as const, label: "Alerts", color: colors.success, onPress: () => router.push("/notifications") },
              ].map((action) => (
                <Pressable
                  key={action.label}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); action.onPress(); }}
                  style={[styles.quickAction, { backgroundColor: action.color + "0A", borderColor: action.color + "22" }]}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + "18" }]}>
                    <Feather name={action.icon} size={18} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ─── Manager Metric Cards ─── */}
        {isManager && (
          <Animated.View entering={FadeInDown.duration(350).delay(100)} style={{ gap: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Team Overview</Text>
            <View style={styles.metricsGrid}>
              <MetricCard label="Attendance" value={`${presentCount}/${employees.length}`} icon="user-check" iconColor={colors.success} style={{ flex: 1 }} />
              <MetricCard label="Active Tasks" value={`${pendingTasks}`} icon="check-square" iconColor={colors.primary} style={{ flex: 1 }} />
            </View>
          </Animated.View>
        )}

        {/* ─── Business Verticals (owner/GM) ─── */}
        {isOwnerLike && (
          <Animated.View entering={FadeInDown.duration(350).delay(150)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Business Verticals</Text>
              <Text style={[styles.seeAll, { color: colors.gold }]}>{verticals.length} units</Text>
            </View>
            <View style={styles.verticalGrid}>
              {verticals.map((v, idx) => (
                <Animated.View key={v.id} entering={FadeInDown.duration(320).delay(idx * 35)} style={{ width: "48%" }}>
                  <VerticalCard
                    vertical={v}
                    onPress={() => router.push({ pathname: "/vertical/[id]", params: { id: v.id } })}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ─── Manager: Team Status ─── */}
        {isManager && (
          <Animated.View entering={FadeInDown.duration(350).delay(150)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Team Status</Text>
              <Pressable onPress={() => router.push("/(tabs)/team")}>
                <Text style={[styles.seeAll, { color: colors.gold }]}>Full roster</Text>
              </Pressable>
            </View>
            <View style={{ gap: 8 }}>
              {employees.slice(0, 5).map((emp) => (
                <View key={emp.id} style={[styles.empRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.empAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.empAvatarText}>{emp.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.empName, { color: colors.foreground }]}>{emp.name}</Text>
                    <Text style={[styles.empRole, { color: colors.mutedForeground }]}>{emp.role}</Text>
                  </View>
                  <ScoreBadge score={emp.score} size="sm" />
                  <View style={[styles.attendanceDot, {
                    backgroundColor:
                      emp.attendance === "present" ? colors.success :
                      emp.attendance === "late" ? colors.warning :
                      colors.destructive,
                  }]} />
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </View>

      {/* ─── Report Incident Modal ─── */}
      <Modal
        visible={showIncidentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIncidentModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowIncidentModal(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Animated.View entering={FadeInUp.duration(300)} style={{ gap: 16 }}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

              <View style={styles.modalHeaderRow}>
                <View style={[styles.modalIcon, { backgroundColor: colors.destructive + "18" }]}>
                  <Feather name="alert-circle" size={20} color={colors.destructive} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Report Incident</Text>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Incident Title *</Text>
                <TextInput
                  value={incTitle}
                  onChangeText={setIncTitle}
                  placeholder="Brief description..."
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textField, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
                  autoFocus
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Details</Text>
                <TextInput
                  value={incDesc}
                  onChangeText={setIncDesc}
                  placeholder="What happened? Include location, time, involved parties..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                  style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
                />
              </View>

              <View style={{ gap: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Severity</Text>
                <View style={styles.severityRow}>
                  {(["low", "medium", "high", "critical"] as const).map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => { setIncSeverity(s); Haptics.selectionAsync(); }}
                      style={[styles.severityOption, {
                        backgroundColor: incSeverity === s ? SEVERITY_COLOR[s] + "22" : colors.secondary,
                        borderColor: incSeverity === s ? SEVERITY_COLOR[s] : colors.border,
                      }]}
                    >
                      <Text style={[styles.severityOptionText, { color: incSeverity === s ? SEVERITY_COLOR[s] : colors.mutedForeground }]}>
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Vertical</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {["corporate", "healthcare", "petroleum", "mining", "agriculture", "hospitality", "technology", "ngo", "realestate"].map((v) => (
                    <Pressable
                      key={v}
                      onPress={() => { setIncVertical(v); Haptics.selectionAsync(); }}
                      style={[styles.verticalOption, {
                        backgroundColor: incVertical === v ? colors.primary : colors.secondary,
                        borderColor: incVertical === v ? colors.primary : colors.border,
                      }]}
                    >
                      <Text style={[styles.verticalOptionText, { color: incVertical === v ? "#fff" : colors.foreground }]}>
                        {v}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowIncidentModal(false)}
                  style={[styles.modalCancelBtn, { backgroundColor: colors.secondary }]}
                >
                  <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleReportIncident}
                  disabled={!incTitle.trim()}
                  style={[styles.modalSubmitBtn, { backgroundColor: incTitle.trim() ? colors.destructive : colors.muted }]}
                >
                  <Feather name="send" size={15} color="#fff" />
                  <Text style={styles.modalSubmitText}>Submit Report</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 0 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  greeting: { fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
  userName: { fontSize: 22, color: "#FFF", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  rolePill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, marginTop: 6 },
  rolePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerActionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", position: "relative" },
  badgeDot: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#0A1628" },
  badgeDotText: { color: "#fff", fontSize: 8, fontFamily: "Inter_700Bold" },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  topMetrics: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  topMetricItem: { flex: 1, alignItems: "center", gap: 3 },
  topMetricValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: -0.5 },
  topMetricLabel: { fontSize: 9, color: "rgba(255,255,255,0.45)", fontFamily: "Inter_400Regular" },
  topMetricDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)", marginHorizontal: 2 },
  employeeBar: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  empBarLabel: { fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "Inter_400Regular" },
  empBarValue: { fontSize: 13, color: "#FFF", fontFamily: "Inter_600SemiBold", marginTop: 2 },
  rankPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, borderWidth: 1, marginTop: 4 },
  rankText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  trendCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  trendHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  trendTitle: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  trendSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  trendPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  trendPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  trendDayRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  trendDay: { flex: 1, fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  attendanceDot: { width: 8, height: 8, borderRadius: 4 },
  attText: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "capitalize" },
  content: { padding: 16, gap: 20 },
  alertBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  alertBannerText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  alertViewBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.3, marginBottom: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  metricsGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  quickActions: { flexDirection: "row", gap: 8 },
  quickAction: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 14, borderWidth: 1, position: "relative" },
  quickActionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  quickActionBadge: { position: "absolute", top: 8, right: 8, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  quickActionBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  verticalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  scoreCard: { flexDirection: "row", padding: 18, borderRadius: 16, borderWidth: 1, gap: 16, alignItems: "center" },
  scoreDivider: { width: 1, alignSelf: "stretch" },
  scoreBreakdown: { flex: 1, gap: 10 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreRowLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  scoreRowVal: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  miniBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  miniBarFill: { height: 4, borderRadius: 2 },
  empRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, gap: 10 },
  empAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  empAvatarText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  empName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empRole: { fontSize: 11, fontFamily: "Inter_400Regular" },
  // Accountant
  complianceRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  complianceIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  complianceLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  complianceDue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  urgentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  urgentText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  payrollRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  payrollAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  payrollAvatarText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  payrollName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  payrollDept: { fontSize: 11, fontFamily: "Inter_400Regular" },
  payrollAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  approveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  approveBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  ctaBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
  // Premium Customer
  loyaltyCard: { borderRadius: 18, padding: 20, gap: 4 },
  loyaltyTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  loyaltyPointsLabel: { fontSize: 10, color: "rgba(10,22,40,0.7)", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  loyaltyPoints: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#0A1628", letterSpacing: -1.5, marginTop: 2 },
  loyaltyTierBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#0A1628", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  loyaltyTierText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#C9A84C", letterSpacing: 1.5 },
  loyaltyMemberName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(10,22,40,0.75)", marginTop: 6 },
  loyaltyProgressRow: { flexDirection: "row", justifyContent: "space-between" },
  loyaltyProgressLabel: { fontSize: 11, color: "rgba(10,22,40,0.65)", fontFamily: "Inter_400Regular" },
  loyaltyProgressPct: { fontSize: 11, color: "#0A1628", fontFamily: "Inter_700Bold" },
  loyaltyBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  loyaltyBarFill: { height: "100%", borderRadius: 3 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  historyDot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  historyService: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  historyAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  conciergeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 15 },
  conciergeBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  // Walking Customer
  guestCheckedInCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, borderWidth: 1.5 },
  guestCheckinIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  guestCheckedInTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  guestCheckedInSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  qrCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1 },
  qrBox: { width: 80, height: 80, borderRadius: 8, overflow: "hidden", padding: 6, gap: 3 },
  qrRow: { flexDirection: "row", gap: 3, flex: 1 },
  qrCell: { flex: 1, borderRadius: 2 },
  qrTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  qrCode: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 1, marginTop: 3 },
  qrSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },
  guestServicesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  guestService: { width: "30%", alignItems: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  guestServiceIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  guestServiceLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  upgradeCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, gap: 12 },
  upgradeTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  upgradeSub: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", marginTop: 3 },
  upgradeBtn: { backgroundColor: "#C9A84C", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  upgradeBtnText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  modalIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  textField: { height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  textArea: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingTop: 12, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80, textAlignVertical: "top" },
  severityRow: { flexDirection: "row", gap: 8 },
  severityOption: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, alignItems: "center" },
  severityOptionText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  verticalOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  verticalOptionText: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "capitalize" },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalSubmitBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 14, borderRadius: 12 },
  modalSubmitText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
