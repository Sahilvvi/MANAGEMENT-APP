import { Feather } from "@expo/vector-icons";
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
  user: User;
}

const BASE = { business: "lawn", phone: "9876543210" };

const ROLES: RoleOption[] = [
  {
    role: "owner",
    label: "Super Admin",
    icon: "shield",
    description: "Full oversight of the lawn operation",
    user: { id: "lawn-admin", name: "Ravi Kumar", role: "owner", ...BASE },
  },
  {
    role: "manager",
    label: "Manager",
    icon: "briefcase",
    description: "Manage workers and daily operations",
    user: { id: "lawn-manager", name: "Sunita Devi", role: "manager", ...BASE },
  },
  {
    role: "employee",
    label: "Worker",
    icon: "user",
    description: "Complete daily tasks and upload proof",
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
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{businessName}</Text>
        </View>
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
            entering={FadeInUp.delay(index * 80).duration(420).springify()}
          >
            <Pressable
              onPress={() => handleSelect(option)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={[styles.iconSquare, { backgroundColor: colors.primary + "15" }]}>
                <Feather name={option.icon} size={24} color={colors.primary} />
              </View>
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
    width: "100%",
    paddingHorizontal: 24,
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
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconSquare: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 14,
    lineHeight: 20,
  },
});
