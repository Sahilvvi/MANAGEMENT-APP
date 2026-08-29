import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { CircularScore } from "@/components/CircularScore";
import { useColors } from "@/hooks/useColors";

const SHIFTS = [
  { id: "s1", name: "Morning", time: "06:00 – 14:00", color: "#FF9500" },
  { id: "s2", name: "General", time: "09:00 – 18:00", color: "#007AFF" },
  { id: "s3", name: "Evening", time: "14:00 – 22:00", color: "#8B5CF6" },
  { id: "s4", name: "Night",   time: "22:00 – 06:00", color: "#34C759" },
];

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

type SortKey = "score" | "name" | "attendance";

export default function TeamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { employees, incidents } = useData();
  const { showToast } = useToast();
  const [sort, setSort] = useState<SortKey>("score");
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<(typeof employees)[0] | null>(null);
  const [activeView, setActiveView] = useState<"roster" | "shifts" | "incidents">("roster");

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;

  const sorted = useMemo(() => {
    let list = [...employees];
    if (search.trim()) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.role.toLowerCase().includes(search.toLowerCase()) ||
          e.vertical.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sort === "score") return list.sort((a, b) => b.score - a.score);
    if (sort === "name") return list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "attendance") {
      const order = { present: 0, late: 1, absent: 2 };
      return list.sort((a, b) => order[a.attendance] - order[b.attendance]);
    }
    return list;
  }, [employees, sort, search]);

  const present = employees.filter((e) => e.attendance === "present").length;
  const late = employees.filter((e) => e.attendance === "late").length;
  const absent = employees.filter((e) => e.attendance === "absent").length;
  const avgScore = Math.round(employees.reduce((s, e) => s + e.score, 0) / employees.length);

  const attColor = (att: string) =>
    att === "present" ? colors.success : att === "late" ? colors.warning : colors.destructive;

  const VIEWS = [
    { key: "roster" as const, label: "Roster" },
    { key: "shifts" as const, label: "Shifts" },
    { key: "incidents" as const, label: "Incidents" },
  ];

  const getRankInSorted = (empId: string) => {
    const byScore = [...employees].sort((a, b) => b.score - a.score);
    return byScore.findIndex((e) => e.id === empId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <Text style={styles.headerTitle}>Team</Text>
        <Text style={styles.headerSub}>{employees.length} members across all verticals</Text>

        {/* Attendance summary bar */}
        <View style={[styles.attBar, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }]}>
          <View style={styles.attItem}>
            <View style={[styles.attDot, { backgroundColor: colors.success }]} />
            <Text style={styles.attCount}>{present}</Text>
            <Text style={styles.attLabel}>Present</Text>
          </View>
          <View style={[styles.attDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
          <View style={styles.attItem}>
            <View style={[styles.attDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.attCount}>{late}</Text>
            <Text style={styles.attLabel}>Late</Text>
          </View>
          <View style={[styles.attDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
          <View style={styles.attItem}>
            <View style={[styles.attDot, { backgroundColor: colors.destructive }]} />
            <Text style={styles.attCount}>{absent}</Text>
            <Text style={styles.attLabel}>Absent</Text>
          </View>
          <View style={[styles.attDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
          <View style={styles.attItem}>
            <Text style={[styles.attCount, { color: colors.gold }]}>{avgScore}</Text>
            <Text style={styles.attLabel}>Avg Score</Text>
          </View>
        </View>
      </View>

      {/* View Switcher */}
      <View style={[styles.viewSwitcher, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        {VIEWS.map((v) => (
          <Pressable
            key={v.key}
            onPress={() => { setActiveView(v.key); Haptics.selectionAsync(); }}
            style={[styles.viewTab, { borderBottomColor: activeView === v.key ? colors.gold : "transparent" }]}
          >
            <Text style={[styles.viewTabText, { color: activeView === v.key ? colors.gold : colors.mutedForeground }]}>
              {v.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeView === "roster" && (
        <>
          {/* Search & Sort */}
          <View style={[styles.controls, { borderBottomColor: colors.border }]}>
            <View style={[styles.searchBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search members..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.searchInput, { color: colors.foreground }]}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {(["score", "name", "attendance"] as SortKey[]).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => { setSort(s); Haptics.selectionAsync(); }}
                  style={[styles.sortChip, { backgroundColor: sort === s ? colors.primary : colors.card, borderColor: sort === s ? colors.primary : colors.border }]}
                >
                  <Text style={[styles.sortText, { color: sort === s ? "#fff" : colors.foreground }]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: Platform.OS === "web" ? 34 + 60 : 90 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Top 3 leaderboard */}
            {sort === "score" && search === "" && (
              <Animated.View entering={FadeInDown.duration(350)} style={{ gap: 8, marginBottom: 8 }}>
                <Text style={[styles.leaderboardTitle, { color: colors.mutedForeground }]}>TOP PERFORMERS</Text>
                <View style={styles.podiumRow}>
                  {sorted.slice(0, 3).map((emp, idx) => (
                    <Pressable
                      key={emp.id}
                      onPress={() => { setSelectedEmp(emp); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      style={[
                        styles.podiumCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: MEDAL_COLORS[idx] + "55",
                          borderWidth: 1.5,
                          transform: [{ scale: idx === 0 ? 1.04 : 1 }],
                        },
                      ]}
                    >
                      <Text style={styles.medal}>{MEDALS[idx]}</Text>
                      <View style={[styles.podiumAvatar, { backgroundColor: colors.primary + "CC", borderColor: MEDAL_COLORS[idx], borderWidth: 2 }]}>
                        <Text style={styles.podiumAvatarText}>{emp.name[0]}</Text>
                      </View>
                      <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>
                        {emp.name.split(" ")[0]}
                      </Text>
                      <Text style={[styles.podiumScore, { color: MEDAL_COLORS[idx] }]}>{emp.score}</Text>
                      <View style={[styles.attPill, {
                        backgroundColor: emp.attendance === "present" ? colors.success + "18" :
                          emp.attendance === "late" ? colors.warning + "18" : colors.destructive + "18",
                      }]}>
                        <Text style={[styles.attPillText, {
                          color: emp.attendance === "present" ? colors.success :
                            emp.attendance === "late" ? colors.warning : colors.destructive,
                        }]}>{emp.attendance}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
                <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
              </Animated.View>
            )}

            {sorted.map((emp, idx) => {
              const rank = getRankInSorted(emp.id);
              const isTopThree = rank < 3 && sort === "score" && search === "";
              if (isTopThree) return null;
              return (
                <Animated.View key={emp.id} entering={FadeInDown.duration(280).delay(idx * 30)}>
                  <Pressable
                    onPress={() => { setSelectedEmp(emp); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={[styles.empCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Text style={[styles.rank, { color: colors.mutedForeground }]}>#{rank + 1}</Text>
                    <View style={[styles.avatar, { backgroundColor: colors.primary + "CC" }]}>
                      <Text style={styles.avatarText}>{emp.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.empName, { color: colors.foreground }]}>{emp.name}</Text>
                      <Text style={[styles.empRole, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {emp.role} · {emp.vertical}
                      </Text>
                    </View>
                    <Text style={[styles.scoreNum, { color: colors.foreground }]}>{emp.score}</Text>
                    <View style={[styles.attIndicator, { backgroundColor: attColor(emp.attendance) }]} />
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </>
      )}

      {activeView === "shifts" && (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Platform.OS === "web" ? 34 + 60 : 90 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.shiftDate, { color: colors.mutedForeground }]}>Week of 4 – 10 May 2026</Text>
          {SHIFTS.map((shift, si) => {
            const assigned = employees.slice(si * 2, si * 2 + 3);
            return (
              <Animated.View key={shift.id} entering={FadeInDown.duration(300).delay(si * 60)}>
                <View style={[styles.shiftCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: shift.color, borderLeftWidth: 4 }]}>
                  <View style={styles.shiftHeader}>
                    <View>
                      <Text style={[styles.shiftName, { color: colors.foreground }]}>{shift.name} Shift</Text>
                      <Text style={[styles.shiftTime, { color: colors.mutedForeground }]}>{shift.time}</Text>
                    </View>
                    <View style={[styles.shiftBadge, { backgroundColor: shift.color + "18" }]}>
                      <Text style={[styles.shiftBadgeText, { color: shift.color }]}>{assigned.length} staff</Text>
                    </View>
                  </View>
                  <View style={styles.shiftEmployees}>
                    {assigned.map((emp) => (
                      <View key={emp.id} style={[styles.shiftEmpPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                        <View style={[styles.shiftEmpDot, { backgroundColor: colors.primary }]}>
                          <Text style={styles.shiftEmpDotText}>{emp.name[0]}</Text>
                        </View>
                        <Text style={[styles.shiftEmpName, { color: colors.foreground }]} numberOfLines={1}>{emp.name.split(" ")[0]}</Text>
                      </View>
                    ))}
                    <Pressable
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast("Staff added to shift", "success"); }}
                      style={[styles.addShiftBtn, { borderColor: colors.border }]}
                    >
                      <Feather name="plus" size={14} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      {activeView === "incidents" && (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === "web" ? 34 + 60 : 90 }}
          showsVerticalScrollIndicator={false}
        >
          {incidents.map((inc, idx) => (
            <Animated.View key={inc.id} entering={FadeInDown.duration(280).delay(idx * 50)}>
              <View style={[styles.incCard, {
                backgroundColor: colors.card,
                borderColor: inc.severity === "high" || inc.severity === "critical" ? colors.destructive + "33" : colors.border,
              }]}>
                <View style={styles.incTop}>
                  <View style={[styles.sevDot, {
                    backgroundColor: inc.severity === "critical" ? colors.destructive :
                      inc.severity === "high" ? "#FF6B00" :
                      inc.severity === "medium" ? colors.warning : colors.success,
                  }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.incTitle, { color: colors.foreground }]}>{inc.title}</Text>
                    <Text style={[styles.incMeta, { color: colors.mutedForeground }]}>
                      {inc.reportedBy} · {inc.vertical} · {inc.date}
                    </Text>
                  </View>
                  <View style={[styles.statusChip, {
                    backgroundColor: inc.status === "resolved" ? colors.success + "18" :
                      inc.status === "investigating" ? colors.warning + "18" : colors.destructive + "18",
                  }]}>
                    <Text style={[styles.statusText, {
                      color: inc.status === "resolved" ? colors.success :
                        inc.status === "investigating" ? colors.warning : colors.destructive,
                    }]}>
                      {inc.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.incDesc, { color: colors.mutedForeground }]}>{inc.description}</Text>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* Employee Detail Modal */}
      <Modal visible={!!selectedEmp} transparent animationType="slide" onRequestClose={() => setSelectedEmp(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedEmp(null)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            {selectedEmp && (() => {
              const rank = getRankInSorted(selectedEmp.id);
              return (
                <Animated.View entering={FadeInUp.duration(300)} style={{ gap: 16 }}>
                  <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

                  <View style={styles.empDetailHeader}>
                    <View style={{ position: "relative" }}>
                      <View style={[styles.empDetailAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.empDetailAvatarText}>{selectedEmp.name[0]}</Text>
                      </View>
                      {rank < 3 && (
                        <Text style={styles.rankMedalOverlay}>{MEDALS[rank]}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.empDetailName, { color: colors.foreground }]}>{selectedEmp.name}</Text>
                      <Text style={[styles.empDetailRole, { color: colors.mutedForeground }]}>{selectedEmp.role}</Text>
                      <Text style={[styles.empDetailVert, { color: colors.mutedForeground }]}>{selectedEmp.department} · {selectedEmp.vertical}</Text>
                    </View>
                    <CircularScore score={selectedEmp.score} size={72} showLabel />
                  </View>

                  <View style={[styles.empDetailGrid, { borderColor: colors.border }]}>
                    {[
                      { label: "Attendance", value: selectedEmp.attendance, color: attColor(selectedEmp.attendance) },
                      { label: "Check-In", value: selectedEmp.checkInTime ?? "—" },
                      { label: "Location", value: selectedEmp.location ?? "—" },
                      { label: "Bonus", value: selectedEmp.bonus > 0 ? `+$${selectedEmp.bonus}` : "None", color: selectedEmp.bonus > 0 ? colors.success : undefined },
                      { label: "Fine", value: selectedEmp.fines > 0 ? `-$${selectedEmp.fines}` : "None", color: selectedEmp.fines > 0 ? colors.destructive : undefined },
                      { label: "Net Pay", value: `$${((85000 / 12) + selectedEmp.bonus - selectedEmp.fines).toLocaleString()}` },
                    ].map((row) => (
                      <View key={row.label} style={[styles.empDetailCell, { borderColor: colors.border }]}>
                        <Text style={[styles.empDetailCellLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                        <Text style={[styles.empDetailCellValue, { color: row.color ?? colors.foreground }]}>{row.value}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.empDetailActions}>
                    {[
                      { icon: "message-circle" as const, label: "Message", toast: "Message sent" },
                      { icon: "file-text" as const, label: "Report", toast: "Report generated" },
                      { icon: "alert-circle" as const, label: "Incident", toast: "Incident logged" },
                    ].map((action) => (
                      <Pressable
                        key={action.label}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          showToast(action.toast, "success");
                          setSelectedEmp(null);
                        }}
                        style={[styles.empAction, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                      >
                        <Feather name={action.icon} size={18} color={colors.primary} />
                        <Text style={[styles.empActionText, { color: colors.foreground }]}>{action.label}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Pressable
                    onPress={() => setSelectedEmp(null)}
                    style={[styles.closeModalBtn, { backgroundColor: colors.secondary }]}
                  >
                    <Text style={[styles.closeModalText, { color: colors.foreground }]}>Close</Text>
                  </Pressable>
                </Animated.View>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 4 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular", marginBottom: 12 },
  attBar: { flexDirection: "row", borderRadius: 14, padding: 12, borderWidth: 1, alignItems: "center" },
  attItem: { flex: 1, alignItems: "center", gap: 3 },
  attDot: { width: 7, height: 7, borderRadius: 4 },
  attCount: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: -0.5 },
  attLabel: { fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "Inter_400Regular" },
  attDivider: { width: 1, height: 32 },
  viewSwitcher: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  viewTab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2 },
  viewTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  controls: { padding: 12, gap: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, height: 38 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  sortText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  leaderboardTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  podiumRow: { flexDirection: "row", gap: 8 },
  podiumCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medal: { fontSize: 22 },
  podiumAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  podiumAvatarText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  podiumName: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  podiumScore: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  attPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  attPillText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  sectionDivider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  empCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  rank: { fontSize: 11, fontFamily: "Inter_600SemiBold", width: 24, textAlign: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  empName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empRole: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  scoreNum: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginRight: 4 },
  attIndicator: { width: 8, height: 8, borderRadius: 4 },
  shiftDate: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 4 },
  shiftCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  shiftHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  shiftName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  shiftTime: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  shiftBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  shiftBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  shiftEmployees: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shiftEmpPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  shiftEmpDot: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  shiftEmpDotText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  shiftEmpName: { fontSize: 12, fontFamily: "Inter_500Medium" },
  addShiftBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderStyle: "dashed" },
  incCard: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 6 },
  incTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  sevDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  incTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  incMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  incDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginLeft: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 36, maxHeight: "92%" },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  empDetailHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  empDetailAvatar: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  empDetailAvatarText: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  rankMedalOverlay: { position: "absolute", bottom: -4, right: -4, fontSize: 18 },
  empDetailName: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  empDetailRole: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empDetailVert: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empDetailGrid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  empDetailCell: { width: "50%", padding: 12, borderRightWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, gap: 3 },
  empDetailCellLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empDetailCellValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  empDetailActions: { flexDirection: "row", gap: 10 },
  empAction: { flex: 1, alignItems: "center", gap: 6, padding: 12, borderRadius: 12, borderWidth: 1 },
  empActionText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  closeModalBtn: { padding: 14, borderRadius: 12, alignItems: "center" },
  closeModalText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
