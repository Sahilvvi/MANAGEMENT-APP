import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { CircularScore } from "@/components/CircularScore";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const { mode, toggle: toggleTheme } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [geoFence, setGeoFence] = useState(true);
  const [showPayslip, setShowPayslip] = useState(false);

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;
  const isDark = mode === "dark";

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await logout();
    router.replace("/login");
  };

  const roleDisplayMap: Record<string, string> = {
    owner: "Owner / Super Admin",
    general_manager: "General Manager",
    manager: "Manager",
    employee: "Employee",
    accountant: "Accountant",
    premium_customer: "Premium Customer",
    walking_customer: "Walking Customer",
  };

  const isEmployee = user?.role === "employee";

  const PAYSLIP_DATA = {
    month: "May 2026",
    base: 120000,
    bonus: 2000,
    fine: 0,
    tax: 24200,
    net: 97800,
    items: [
      { label: "Base Salary", amount: 120000, type: "credit" },
      { label: "Performance Bonus", amount: 2000, type: "credit" },
      { label: "Income Tax (TDS)", amount: -24200, type: "debit" },
      { label: "Provident Fund", amount: -14400, type: "debit" },
      { label: "Professional Tax", amount: -200, type: "debit" },
    ],
  };

  const SECTIONS = [
    {
      title: "Account",
      items: [
        {
          icon: "user" as const,
          label: "Edit Profile",
          hint: user?.name ?? "User",
          action: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast("Profile editing coming soon", "info");
          },
        },
        {
          icon: "shield" as const,
          label: "Security PIN",
          hint: "Enabled",
          action: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast("PIN changed successfully", "success");
          },
        },
        {
          icon: "key" as const,
          label: "Change Password",
          action: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast("Password reset link sent", "success");
          },
        },
        ...(isEmployee ? [{
          icon: "file-text" as const,
          label: "View Payslip",
          hint: "May 2026",
          action: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowPayslip(true);
          },
        }] : []),
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: "bell" as const, label: "Push Notifications", toggle: true, value: notifications, onToggle: (v: boolean) => { setNotifications(v); showToast(v ? "Notifications enabled" : "Notifications muted", v ? "success" : "info"); } },
        { icon: "fingerprint" as const, label: "Biometric Login", toggle: true, value: biometric, onToggle: (v: boolean) => { setBiometric(v); showToast(v ? "Biometrics enabled" : "Biometrics disabled", "info"); } },
        { icon: "radio" as const, label: "Geo-fence Alerts", toggle: true, value: geoFence, onToggle: (v: boolean) => { setGeoFence(v); showToast(v ? "Geo-fence alerts on" : "Geo-fence alerts off", "info"); } },
        { icon: "moon" as const, label: "Dark Mode", toggle: true, value: isDark, onToggle: () => { toggleTheme(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
      ],
    },
    {
      title: "System",
      items: [
        { icon: "database" as const, label: "Offline Storage", hint: "256 MB cached", action: () => {} },
        {
          icon: "refresh-cw" as const,
          label: "Sync Data",
          hint: "Last: Just now",
          action: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast("Data synced successfully", "success");
          },
        },
        {
          icon: "shield" as const,
          label: "Audit Log",
          action: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast("Audit log export requested", "info");
          },
        },
        { icon: "lock" as const, label: "Privacy Settings", action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle" as const,
          label: "Help Center",
          action: () => showToast("Opening help center...", "info"),
        },
        {
          icon: "message-circle" as const,
          label: "Contact Support",
          action: () => showToast("Support ticket created", "success"),
        },
        { icon: "info" as const, label: "App Version", hint: "v2.1.0 (Build 210)" },
      ],
    },
  ];

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.gold }]}>
              <Text style={styles.avatarText}>{(user?.name ?? "U")[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user?.name ?? "User"}</Text>
              <Text style={styles.profileRole}>{roleDisplayMap[user?.role ?? "employee"]}</Text>
              {user?.department && (
                <Text style={styles.profileDept}>{user.department}{user.vertical ? ` · ${user.vertical}` : ""}</Text>
              )}
            </View>
            {isEmployee && user?.score !== undefined && (
              <CircularScore score={user.score} size={64} showLabel />
            )}
          </View>

          {user?.employeeId && (
            <View style={[styles.idBadge, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }]}>
              <Feather name="credit-card" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.idText}>{user.employeeId}</Text>
              <View style={{ flex: 1 }} />
              <View style={[styles.liveIndicator]}>
                <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                <Text style={styles.liveText}>Active</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ padding: 16, gap: 20 }}>
          {SECTIONS.map((section, si) => (
            <Animated.View key={section.title} entering={FadeInDown.duration(300).delay(si * 60)}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {section.items.map((item, ii) => (
                  <View key={item.label}>
                    {ii > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                    <Pressable
                      onPress={(item as any).action}
                      style={({ pressed }) => [styles.settingRow, pressed && (item as any).action ? { backgroundColor: colors.secondary } : {}]}
                    >
                      <View style={[styles.settingIcon, { backgroundColor: colors.primary + "14" }]}>
                        <Feather name={item.icon as any} size={15} color={colors.primary} />
                      </View>
                      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
                      <View style={{ flex: 1 }} />
                      {(item as any).hint && (
                        <Text style={[styles.settingHint, { color: colors.mutedForeground }]}>{(item as any).hint}</Text>
                      )}
                      {(item as any).toggle !== undefined ? (
                        <Switch
                          value={(item as any).value}
                          onValueChange={(v) => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            (item as any).onToggle?.(v);
                          }}
                          trackColor={{ false: colors.border, true: colors.primary }}
                          thumbColor="#ffffff"
                          ios_backgroundColor={colors.muted}
                        />
                      ) : (item as any).action ? (
                        <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
                      ) : null}
                    </Pressable>
                  </View>
                ))}
              </View>
            </Animated.View>
          ))}

          {/* Logout */}
          <Animated.View entering={FadeInDown.duration(300).delay(240)}>
            <Pressable
              onPress={handleLogout}
              style={[styles.logoutBtn, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "33" }]}
            >
              <Feather name="log-out" size={16} color={colors.destructive} />
              <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
            </Pressable>
          </Animated.View>

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            Enterprise Operations Hub · Secured with E2E Encryption
          </Text>
        </View>
      </ScrollView>

      {/* Payslip Modal */}
      <Modal
        visible={showPayslip}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayslip(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPayslip(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Animated.View entering={FadeInUp.duration(300)} style={{ gap: 16 }}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

              <View style={styles.payslipHeader}>
                <View style={[styles.payslipIconBox, { backgroundColor: colors.gold + "18" }]}>
                  <Feather name="file-text" size={22} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.payslipTitle, { color: colors.foreground }]}>Payslip — {PAYSLIP_DATA.month}</Text>
                  <Text style={[styles.payslipSub, { color: colors.mutedForeground }]}>{user?.name} · {user?.employeeId}</Text>
                </View>
              </View>

              {/* Net pay hero */}
              <View style={[styles.netPayCard, { backgroundColor: colors.primary }]}>
                <Text style={styles.netPayLabel}>Net Pay</Text>
                <Text style={styles.netPayAmount}>${PAYSLIP_DATA.net.toLocaleString()}</Text>
                <Text style={styles.netPaySub}>Credited on May 31, 2026</Text>
              </View>

              {/* Line items */}
              <View style={[styles.itemsCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                {PAYSLIP_DATA.items.map((item, i) => (
                  <View key={item.label}>
                    {i > 0 && <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }]} />}
                    <View style={styles.payslipRow}>
                      <Text style={[styles.payslipItemLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                      <Text style={[styles.payslipItemAmount, {
                        color: item.amount > 0 ? colors.success : colors.destructive,
                      }]}>
                        {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.payslipActions}>
                <Pressable
                  onPress={() => { showToast("Payslip downloaded as PDF", "success"); setShowPayslip(false); }}
                  style={[styles.payslipBtn, { backgroundColor: colors.primary }]}
                >
                  <Feather name="download" size={15} color="#fff" />
                  <Text style={styles.payslipBtnText}>Download PDF</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowPayslip(false)}
                  style={[styles.payslipCloseBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                >
                  <Text style={[styles.payslipCloseBtnText, { color: colors.foreground }]}>Close</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  profileName: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.3 },
  profileRole: { fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_500Medium" },
  profileDept: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular", marginTop: 2 },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  idText: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_500Medium" },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_500Medium" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 6, marginLeft: 4 },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  settingIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  settingHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginRight: 6 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1 },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  footer: { textAlign: "center", fontSize: 11, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 36, gap: 4 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 8 },
  payslipHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  payslipIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payslipTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  payslipSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  netPayCard: { borderRadius: 16, padding: 20, alignItems: "center", gap: 4 },
  netPayLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  netPayAmount: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -1 },
  netPaySub: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  itemsCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  payslipRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
  payslipItemLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  payslipItemAmount: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payslipActions: { flexDirection: "row", gap: 10 },
  payslipBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, padding: 14, borderRadius: 12 },
  payslipBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payslipCloseBtn: { flex: 1, alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 12, borderWidth: 1 },
  payslipCloseBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
