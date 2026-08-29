import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
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
import { useColors } from "@/hooks/useColors";
import { useToast } from "@/context/ToastContext";

export default function FinanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { finance, verticals, totalRevenue, totalExpenses } = useData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "payroll">("overview");

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;
  const net = totalRevenue - totalExpenses;
  const margin = ((net / totalRevenue) * 100).toFixed(1);

  const revenueByVertical = useMemo(() => {
    return verticals.map((v) => {
      const rev = finance.filter((f) => f.vertical === v.id && f.type === "revenue").reduce((sum, f) => sum + f.amount, 0);
      const exp = finance.filter((f) => f.vertical === v.id && f.type === "expense").reduce((sum, f) => sum + f.amount, 0);
      return { ...v, rev, exp };
    }).filter((v) => v.rev > 0 || v.exp > 0)
      .sort((a, b) => b.rev - a.rev);
  }, [finance, verticals]);

  const maxRev = Math.max(...revenueByVertical.map((v) => v.rev), 1);

  const TABS = [
    { key: "overview" as const, label: "Overview" },
    { key: "transactions" as const, label: "Transactions" },
    { key: "payroll" as const, label: "Payroll" },
  ];

  const fmt = (n: number) =>
    n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` :
    n >= 1000 ? `$${(n / 1000).toFixed(0)}K` :
    `$${n}`;

  const PAYROLL_DATA = [
    { name: "Arjun Sharma", role: "Senior Nurse", base: 85000, score: 92, fine: 0, bonus: 500 },
    { name: "Priya Nair", role: "Field Engineer", base: 72000, score: 78, fine: 200, bonus: 0 },
    { name: "Sneha Patel", role: "Safety Officer", base: 95000, score: 95, fine: 0, bonus: 800 },
    { name: "Deepak Joshi", role: "Lead Developer", base: 120000, score: 97, fine: 0, bonus: 2000 },
    { name: "Vikram Reddy", role: "Chef de Cuisine", base: 68000, score: 71, fine: 500, bonus: 0 },
    { name: "Meena Krishnan", role: "Accountant", base: 80000, score: 91, fine: 0, bonus: 600 },
  ];

  const totalFines = PAYROLL_DATA.reduce((s, e) => s + e.fine, 0);
  const totalBonuses = PAYROLL_DATA.reduce((s, e) => s + e.bonus, 0);

  const COMPLIANCE = [
    { label: "GST Filing", status: "Submitted", due: "20 May", ok: true, icon: "check-circle" as const },
    { label: "TDS Deposit", status: "Pending", due: "7 May", ok: false, icon: "alert-circle" as const },
    { label: "Advance Tax", status: "Paid", due: "15 Jun", ok: true, icon: "check-circle" as const },
    { label: "Bank Reconciliation", status: "Up to date", due: "Today", ok: true, icon: "check-circle" as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Finance</Text>
            <Text style={styles.headerSubtitle}>Consolidated P&L · May 2026</Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              showToast("Financial report exported as PDF", "success");
            }}
            style={[styles.exportBtn, { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }]}
          >
            <Feather name="download" size={13} color={colors.gold} />
            <Text style={[styles.exportBtnText, { color: colors.gold }]}>Export PDF</Text>
          </Pressable>
        </View>

        <View style={styles.plCard}>
          <View style={styles.plItem}>
            <Text style={styles.plValue}>{fmt(totalRevenue)}</Text>
            <Text style={styles.plLabel}>Revenue</Text>
          </View>
          <View style={styles.plDivider} />
          <View style={styles.plItem}>
            <Text style={[styles.plValue, { color: "#FF6B6B" }]}>{fmt(totalExpenses)}</Text>
            <Text style={styles.plLabel}>Expenses</Text>
          </View>
          <View style={styles.plDivider} />
          <View style={styles.plItem}>
            <Text style={[styles.plValue, { color: "#34C759" }]}>{fmt(net)}</Text>
            <Text style={styles.plLabel}>Net · {margin}%</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => { setActiveTab(t.key); Haptics.selectionAsync(); }}
            style={[styles.tab, { borderBottomColor: activeTab === t.key ? colors.gold : "transparent" }]}
          >
            <Text style={[styles.tabText, { color: activeTab === t.key ? colors.foreground : colors.mutedForeground }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Revenue by Vertical</Text>
            {revenueByVertical.map((v, idx) => {
              const barPct = v.rev / maxRev;
              return (
                <Animated.View key={v.id} entering={FadeInDown.duration(300).delay(idx * 40)}>
                  <View style={[styles.verticalRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.vIcon, { backgroundColor: v.color + "22" }]}>
                      <Feather name={v.icon as keyof typeof Feather.glyphMap} size={14} color={v.color} />
                    </View>
                    <View style={{ flex: 1, gap: 7 }}>
                      <View style={styles.vRowTop}>
                        <Text style={[styles.vName, { color: colors.foreground }]}>{v.name}</Text>
                        <View style={{ flex: 1 }} />
                        {v.rev > 0 && (
                          <Text style={[styles.vRev, { color: colors.foreground }]}>{fmt(v.rev)}</Text>
                        )}
                        {v.revenueChange !== 0 && (
                          <View style={[styles.changePill, {
                            backgroundColor: v.revenueChange > 0 ? colors.success + "15" : colors.destructive + "15",
                          }]}>
                            <Feather
                              name={v.revenueChange > 0 ? "trending-up" : "trending-down"}
                              size={9}
                              color={v.revenueChange > 0 ? colors.success : colors.destructive}
                            />
                            <Text style={[styles.changeText, { color: v.revenueChange > 0 ? colors.success : colors.destructive }]}>
                              {v.revenueChange > 0 ? "+" : ""}{v.revenueChange}%
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
                        <View style={[styles.barFill, { width: `${(barPct * 100).toFixed(0)}%` as any, backgroundColor: v.color }]} />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })}

            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 4 }]}>Compliance & Tax</Text>
            <View style={[styles.complianceGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {COMPLIANCE.map((item, idx) => (
                <View key={item.label}>
                  {idx > 0 && <View style={[styles.complianceDivider, { backgroundColor: colors.border }]} />}
                  <View style={styles.complianceRow}>
                    <Feather name={item.icon} size={15} color={item.ok ? colors.success : colors.destructive} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.complianceName, { color: colors.foreground }]}>{item.label}</Text>
                      <Text style={[styles.complianceDueText, { color: colors.mutedForeground }]}>Due {item.due}</Text>
                    </View>
                    <View style={[styles.complianceStatus, {
                      backgroundColor: item.ok ? colors.success + "12" : colors.destructive + "12",
                    }]}>
                      <Text style={[styles.complianceStatusText, {
                        color: item.ok ? colors.success : colors.destructive,
                      }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Monthly trend */}
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 4 }]}>Monthly Cash Flow</Text>
            <View style={[styles.cashFlowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { month: "Jan", rev: 14.2, exp: 0.6 },
                { month: "Feb", rev: 13.8, exp: 0.8 },
                { month: "Mar", rev: 15.1, exp: 0.7 },
                { month: "Apr", rev: 15.8, exp: 0.85 },
                { month: "May", rev: 16.3, exp: 0.81 },
              ].map((m, i) => (
                <View key={m.month} style={styles.cashFlowMonth}>
                  <View style={styles.cashBars}>
                    <View style={[styles.cashBarRev, { height: m.rev * 3, backgroundColor: colors.primary }]} />
                    <View style={[styles.cashBarExp, { height: m.exp * 30, backgroundColor: colors.destructive + "80" }]} />
                  </View>
                  <Text style={[styles.cashMonthLabel, { color: colors.mutedForeground }]}>{m.month}</Text>
                </View>
              ))}
              <View style={styles.cashFlowLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Revenue</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.destructive + "80" }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Expenses</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <>
            <View style={[styles.txSummaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.txSummaryItem}>
                <Text style={[styles.txSummaryVal, { color: colors.success }]}>+{fmt(totalRevenue)}</Text>
                <Text style={[styles.txSummaryLabel, { color: colors.mutedForeground }]}>Total In</Text>
              </View>
              <View style={[styles.txSummaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.txSummaryItem}>
                <Text style={[styles.txSummaryVal, { color: colors.destructive }]}>-{fmt(totalExpenses)}</Text>
                <Text style={[styles.txSummaryLabel, { color: colors.mutedForeground }]}>Total Out</Text>
              </View>
              <View style={[styles.txSummaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.txSummaryItem}>
                <Text style={[styles.txSummaryVal, { color: colors.foreground }]}>{fmt(net)}</Text>
                <Text style={[styles.txSummaryLabel, { color: colors.mutedForeground }]}>Net</Text>
              </View>
            </View>

            {finance.map((entry, idx) => (
              <Animated.View key={entry.id} entering={FadeInDown.duration(300).delay(idx * 40)}>
                <View style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.txIcon, {
                    backgroundColor: entry.type === "revenue" ? colors.success + "18" : colors.destructive + "18",
                  }]}>
                    <Feather
                      name={entry.type === "revenue" ? "arrow-up-right" : "arrow-down-right"}
                      size={16}
                      color={entry.type === "revenue" ? colors.success : colors.destructive}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txDesc, { color: colors.foreground }]} numberOfLines={1}>
                      {entry.description}
                    </Text>
                    <Text style={[styles.txMeta, { color: colors.mutedForeground }]}>
                      {entry.vertical} · {entry.date} · {entry.category}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, {
                    color: entry.type === "revenue" ? colors.success : colors.destructive,
                  }]}>
                    {entry.type === "revenue" ? "+" : "-"}{fmt(entry.amount)}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </>
        )}

        {/* PAYROLL TAB */}
        {activeTab === "payroll" && (
          <>
            {/* Payroll summary */}
            <View style={[styles.payrollSummary, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "22" }]}>
              <View style={styles.payrollSummaryTop}>
                <View>
                  <Text style={[styles.payrollSummaryTitle, { color: colors.mutedForeground }]}>May 2026 Payroll</Text>
                  <Text style={[styles.payrollSummaryValue, { color: colors.foreground }]}>$648,000</Text>
                  <Text style={[styles.payrollSummaryLabel, { color: colors.mutedForeground }]}>Processing May 31, 2026</Text>
                </View>
                <View style={styles.payrollSummarySide}>
                  <View style={[styles.payrollTag, { backgroundColor: colors.destructive + "12" }]}>
                    <Text style={[styles.payrollTagText, { color: colors.destructive }]}>Fines: {fmt(totalFines)}</Text>
                  </View>
                  <View style={[styles.payrollTag, { backgroundColor: colors.success + "12" }]}>
                    <Text style={[styles.payrollTagText, { color: colors.success }]}>Bonus: +{fmt(totalBonuses)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Wellness Fund */}
            <View style={[styles.wellnessCard, { backgroundColor: "#8B5CF6" + "10", borderColor: "#8B5CF6" + "30" }]}>
              <View style={styles.wellnessHeader}>
                <View style={[styles.wellnessIcon, { backgroundColor: "#8B5CF6" + "20" }]}>
                  <Feather name="heart" size={16} color="#8B5CF6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.wellnessTitle, { color: colors.foreground }]}>Wellness Fund</Text>
                  <Text style={[styles.wellnessSub, { color: colors.mutedForeground }]}>
                    Auto-funded from employee fines
                  </Text>
                </View>
                <View>
                  <Text style={[styles.wellnessAmount, { color: "#8B5CF6" }]}>{fmt(totalFines)}</Text>
                  <Text style={[styles.wellnessAmountLabel, { color: colors.mutedForeground }]}>This month</Text>
                </View>
              </View>
              <View style={styles.wellnessStats}>
                {[
                  { label: "YTD Collected", value: "$3,200" },
                  { label: "Last Disbursed", value: "$1,800" },
                  { label: "Available", value: "$1,400" },
                ].map((w) => (
                  <View key={w.label} style={styles.wellnessStat}>
                    <Text style={[styles.wellnessStatVal, { color: "#8B5CF6" }]}>{w.value}</Text>
                    <Text style={[styles.wellnessStatLabel, { color: colors.mutedForeground }]}>{w.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Individual payroll rows */}
            {PAYROLL_DATA.map((emp, idx) => {
              const monthly = emp.base / 12;
              const net = monthly + emp.bonus - emp.fine;
              return (
                <Animated.View key={emp.name} entering={FadeInDown.duration(300).delay(idx * 50)}>
                  <View style={[styles.payrollRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.payrollAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.payrollAvatarText}>{emp.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={[styles.payrollName, { color: colors.foreground }]}>{emp.name}</Text>
                      <Text style={[styles.payrollRole, { color: colors.mutedForeground }]}>{emp.role}</Text>
                      <View style={styles.payrollDetails}>
                        <Text style={[styles.payrollDetail, { color: colors.mutedForeground }]}>Base {fmt(monthly)}</Text>
                        {emp.bonus > 0 && (
                          <Text style={[styles.payrollDetail, { color: colors.success }]}>+{fmt(emp.bonus)}</Text>
                        )}
                        {emp.fine > 0 && (
                          <Text style={[styles.payrollDetail, { color: colors.destructive }]}>-{fmt(emp.fine)}</Text>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 5 }}>
                      <Text style={[styles.payrollTotal, { color: colors.foreground }]}>{fmt(net)}</Text>
                      <View style={[styles.scoreDot, {
                        backgroundColor: emp.score >= 90 ? colors.success : emp.score >= 75 ? colors.warning : colors.destructive,
                      }]}>
                        <Text style={styles.scoreDotText}>{emp.score}</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 4 },
  headerTopRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  exportBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  plCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  plItem: { flex: 1, alignItems: "center", gap: 3 },
  plValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  plLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  plDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  tabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  verticalRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  vIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  vRowTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  vName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  vRev: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  changePill: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  changeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  barBg: { height: 5, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 5, borderRadius: 3 },
  complianceGrid: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  complianceRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  complianceDivider: { height: StyleSheet.hairlineWidth, marginLeft: 50 },
  complianceName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  complianceDueText: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  complianceStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  complianceStatusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cashFlowCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  cashFlowMonth: { flex: 1, alignItems: "center", gap: 5 },
  cashBars: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 55 },
  cashBarRev: { width: 10, borderRadius: 3, minHeight: 4 },
  cashBarExp: { width: 10, borderRadius: 3, minHeight: 2 },
  cashMonthLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  cashFlowLegend: { flexDirection: "row", justifyContent: "center", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  txSummaryRow: {
    flexDirection: "row", padding: 14, borderRadius: 12,
    borderWidth: 1, alignItems: "center",
  },
  txSummaryItem: { flex: 1, alignItems: "center", gap: 3 },
  txSummaryVal: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  txSummaryLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  txSummaryDivider: { width: 1, height: 28, marginHorizontal: 4 },
  txRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txDesc: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  txMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  payrollSummary: { padding: 16, borderRadius: 14, borderWidth: 1 },
  payrollSummaryTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  payrollSummaryTitle: { fontSize: 12, fontFamily: "Inter_500Medium" },
  payrollSummaryValue: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -1, marginTop: 2 },
  payrollSummaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  payrollSummarySide: { gap: 6, alignItems: "flex-end" },
  payrollTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  payrollTagText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  wellnessCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  wellnessHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  wellnessIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  wellnessTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  wellnessSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  wellnessAmount: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.5, textAlign: "right" },
  wellnessAmountLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "right" },
  wellnessStats: { flexDirection: "row", justifyContent: "space-between" },
  wellnessStat: { alignItems: "center", gap: 2 },
  wellnessStatVal: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  wellnessStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  payrollRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  payrollAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  payrollAvatarText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  payrollName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payrollRole: { fontSize: 11, fontFamily: "Inter_400Regular" },
  payrollDetails: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  payrollDetail: { fontSize: 11, fontFamily: "Inter_400Regular" },
  payrollTotal: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  scoreDot: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  scoreDotText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
});
