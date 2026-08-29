import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, type User, type UserRole } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface RoleOption {
  role: UserRole;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  description: string;
}

const ROLES: RoleOption[] = [
  { role: "owner",            label: "Owner",            icon: "shield",     color: "#0A1628", description: "Full access to all systems" },
  { role: "general_manager",  label: "General Manager",  icon: "briefcase",  color: "#1C2E4A", description: "Operations oversight" },
  { role: "manager",          label: "Manager",          icon: "users",      color: "#2D4A6E", description: "Team management" },
  { role: "employee",         label: "Employee",         icon: "user",       color: "#4A7FA5", description: "Daily operations" },
  { role: "accountant",       label: "Accountant",       icon: "dollar-sign",color: "#C9A84C", description: "Finance & payroll" },
  { role: "premium_customer", label: "Premium Customer", icon: "star",       color: "#8B5CF6", description: "Priority services" },
  { role: "walking_customer", label: "Walking Customer", icon: "log-in",     color: "#10B981", description: "Quick OTP access" },
];

const DEMO_USERS: Record<UserRole, User> = {
  owner:            { id: "owner1", name: "Rajesh Mehta",    role: "owner",            department: "Executive", vertical: "All" },
  general_manager:  { id: "gm1",    name: "Sunita Rao",      role: "general_manager",  department: "Operations" },
  manager:          { id: "mgr1",   name: "Aditya Kumar",    role: "manager",          department: "Mining Ops", vertical: "mining" },
  employee:         { id: "e9",     name: "Deepak Joshi",    role: "employee",         department: "Engineering", vertical: "technology", score: 97, employeeId: "EOH-2024-009" },
  accountant:       { id: "acc1",   name: "Meena Krishnan",  role: "accountant",       department: "Finance" },
  premium_customer: { id: "pc1",    name: "Vikram Anand",    role: "premium_customer" },
  walking_customer: { id: "wc1",    name: "Guest User",      role: "walking_customer" },
};

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    Haptics.selectionAsync();
    setSelectedRole(role);
  };

  const handleLogin = async () => {
    if (!selectedRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    await login(DEMO_USERS[selectedRole]);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.primary }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(700).springify()} style={styles.header}>
          <Animated.View entering={ZoomIn.duration(500).delay(100)} style={[styles.logoBox, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "44" }]}>
            <Feather name="grid" size={34} color={colors.gold} />
          </Animated.View>
          <Text style={styles.appName}>Enterprise Ops Hub</Text>
          <Text style={styles.tagline}>Centralized business intelligence</Text>
          <View style={styles.taglinePills}>
            {["9 Verticals", "7 Roles", "AI Powered"].map((pill, i) => (
              <Animated.View key={pill} entering={FadeInDown.duration(400).delay(300 + i * 80)} style={[styles.taglinePill, { backgroundColor: "rgba(201,168,76,0.15)", borderColor: "rgba(201,168,76,0.3)" }]}>
                <Text style={[styles.taglinePillText, { color: colors.gold }]}>{pill}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(250)} style={[styles.card, { backgroundColor: colors.card, shadowColor: "#000" }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Select your role</Text>
          <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
            Role-based access controls your dashboard
          </Text>

          <View style={styles.roleGrid}>
            {ROLES.map((r, i) => (
              <Animated.View key={r.role} entering={FadeInDown.duration(350).delay(300 + i * 45)}>
                <Pressable
                  onPress={() => handleRoleSelect(r.role)}
                  style={[
                    styles.roleBtn,
                    {
                      borderColor: selectedRole === r.role ? r.color : colors.border,
                      backgroundColor: selectedRole === r.role ? r.color + "10" : colors.background,
                    },
                  ]}
                >
                  <View style={[styles.roleIcon, { backgroundColor: r.color + "18" }]}>
                    <Feather name={r.icon} size={18} color={r.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleLabel, { color: colors.foreground }]}>{r.label}</Text>
                    <Text style={[styles.roleDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {r.description}
                    </Text>
                  </View>
                  {selectedRole === r.role && (
                    <Animated.View entering={ZoomIn.duration(200)} style={[styles.checkMark, { backgroundColor: r.color }]}>
                      <Feather name="check" size={11} color="#fff" />
                    </Animated.View>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {selectedRole === "walking_customer" && (
            <Animated.View entering={FadeInDown.duration(300)} style={[styles.otpBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[styles.otpLabel, { color: colors.foreground }]}>Enter OTP</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="6-digit OTP"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                maxLength={6}
                style={[styles.otpInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              />
            </Animated.View>
          )}

          <Pressable
            onPress={handleLogin}
            disabled={!selectedRole || loading}
            style={[
              styles.loginBtn,
              {
                backgroundColor: selectedRole ? colors.gold : colors.muted,
                opacity: (!selectedRole || loading) ? 0.65 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Continue</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </Pressable>
        </Animated.View>

        <Animated.Text entering={FadeInUp.duration(500).delay(600)} style={styles.footer}>
          Enterprise Operations Hub v2.1 · End-to-End Encrypted
        </Animated.Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 24 },
  header: { alignItems: "center", gap: 8 },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 6,
  },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.8 },
  tagline: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)" },
  taglinePills: { flexDirection: "row", gap: 8, marginTop: 4 },
  taglinePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  taglinePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  card: {
    borderRadius: 26,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    gap: 14,
  },
  cardTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  cardSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  roleGrid: { gap: 6 },
  roleBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
    position: "relative",
  },
  roleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  roleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  roleDesc: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  checkMark: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  otpBox: { gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  otpLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  otpInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 12,
    textAlign: "center",
  },
  loginBtn: {
    height: 54,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  footer: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "Inter_400Regular" },
});
