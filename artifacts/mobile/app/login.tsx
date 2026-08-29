import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAuth, type User } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface RoleOption {
  role: User["role"];
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
  accent: [string, string];
  user: User;
}

const BASE = { business: "lawn", phone: "9876543210" };

const ROLES: RoleOption[] = [
  {
    role: "owner",
    label: "Super Admin",
    icon: "shield",
    description: "Full oversight of the lawn operation",
    accent: ["#C9A84C", "#E8D59A"],
    user: { id: "lawn-admin", name: "Ravi Kumar", role: "owner", ...BASE },
  },
  {
    role: "manager",
    label: "Manager",
    icon: "briefcase",
    description: "Manage workers and daily operations",
    accent: ["#0A84FF", "#5AC8FA"],
    user: { id: "lawn-manager", name: "Sunita Devi", role: "manager", ...BASE },
  },
  {
    role: "employee",
    label: "Worker",
    icon: "user",
    description: "Complete daily tasks and upload proof",
    accent: ["#34C759", "#8CEF99"],
    user: { id: "lawn-worker", name: "Worker", role: "employee", ...BASE, jobType: "" },
  },
];

export default function RoleSelectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const params = useLocalSearchParams<{ business?: string }>();
  const businessId = params.business ?? "lawn";
  const businessName = businessId === "lawn" ? "Lawn Care" : businessId;

  const handleSelect = async (option: RoleOption) => {
    if (option.role === "employee") {
      router.push({ pathname: "/worker-select", params: { business: businessId } });
      return;
    }
    await login({ ...option.user, business: businessId });
    router.replace("/(app)");
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.gold, colors.goldLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>{businessName}</Text>
        </LinearGradient>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Who is using the app today?
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Select your role to access the right dashboard.
        </Text>
      </View>

      <View style={styles.cards}>
        {ROLES.map((option, index) => (
          <Animated.View
            key={option.role}
            entering={FadeInUp.delay(index * 90).duration(450).springify()}
          >
            <Pressable
              onPress={() => handleSelect(option)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <LinearGradient
                colors={option.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}
              >
                <Feather name={option.icon} size={26} color="#FFF" />
              </LinearGradient>
              <View style={styles.text}>
                <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                  {option.label}
                </Text>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                  {option.description}
                </Text>
              </View>
              <Feather name="chevron-right" size={22} color={colors.mutedForeground} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 28,
    paddingBottom: 32,
    gap: 10,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#0A1628",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 2,
    lineHeight: 22,
  },
  cards: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  cardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
});
