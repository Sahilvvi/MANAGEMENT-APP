import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface Business {
  id: string;
  name: string;
  tagline: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  active: boolean;
}

const BUSINESSES: Business[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    tagline: "Hospitals & clinics",
    icon: "heart",
    color: "#EF4444",
    active: false,
  },
  {
    id: "petroleum",
    name: "Petroleum",
    tagline: "Fuel & energy",
    icon: "droplet",
    color: "#06B6D4",
    active: false,
  },
  {
    id: "lawn",
    name: "Lawn Care",
    tagline: "Your active workspace",
    icon: "scissors",
    color: "#10B981",
    active: true,
  },
  {
    id: "school",
    name: "School",
    tagline: "Education management",
    icon: "book",
    color: "#8B5CF6",
    active: false,
  },
  {
    id: "agriculture",
    name: "Agriculture",
    tagline: "Farms & produce",
    icon: "feather",
    color: "#F59E0B",
    active: false,
  },
  {
    id: "ngo",
    name: "NGO",
    tagline: "Social impact",
    icon: "users",
    color: "#EC4899",
    active: false,
  },
];

export default function BusinessSelectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const handleSelect = (business: Business) => {
    if (!business.active) {
      setComingSoon(business.name);
      setTimeout(() => setComingSoon(null), 2000);
      return;
    }
    router.push({ pathname: "/login", params: { business: business.id } });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            Choose workspace
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Which business are you managing today?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Select an active business to continue. Other verticals will be unlocked in future updates.
          </Text>
        </View>

        <View style={styles.list}>
          {BUSINESSES.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(index * 70).duration(400).springify()}
            >
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: item.active ? colors.primary : colors.border,
                  },
                  item.active && styles.activeCard,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View
                  style={[styles.iconSquare, { backgroundColor: item.color + "15" }]}
                >
                  <Feather name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.text}>
                  <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cardTagline, { color: colors.mutedForeground }]}>
                    {item.tagline}
                  </Text>
                </View>
                {item.active ? (
                  <View style={[styles.badge, { backgroundColor: colors.success + "15" }]}>
                    <Text style={[styles.badgeText, { color: colors.success }]}>Available</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Soon</Text>
                  </View>
                )}
              </Pressable>

              {comingSoon === item.name && (
                <View style={[styles.toast, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.toastText, { color: colors.primaryForeground }]}>
                    {item.name} is coming soon
                  </Text>
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 24,
    gap: 8,
  },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeCard: {
    borderWidth: 2,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconSquare: {
    width: 52,
    height: 52,
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
  cardTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  toast: {
    marginTop: -8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
