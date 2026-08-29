import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
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
  gradient: [string, string];
  active: boolean;
}

const BUSINESSES: Business[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    tagline: "Hospitals & clinics",
    icon: "heart",
    gradient: ["#FF6B6B", "#FF8E8E"],
    active: false,
  },
  {
    id: "petroleum",
    name: "Petroleum",
    tagline: "Fuel & energy",
    icon: "droplet",
    gradient: ["#4ECDC4", "#6EE7DE"],
    active: false,
  },
  {
    id: "lawn",
    name: "Lawn Care",
    tagline: "Your active workspace",
    icon: "scissors",
    gradient: ["#0A1628", "#1C3A5F"],
    active: true,
  },
  {
    id: "school",
    name: "School",
    tagline: "Education management",
    icon: "book",
    gradient: ["#8B5CF6", "#A78BFA"],
    active: false,
  },
  {
    id: "agri",
    name: "Agriculture",
    tagline: "Farms & produce",
    icon: "feather",
    gradient: ["#F0A500", "#FBBF24"],
    active: false,
  },
  {
    id: "ngo",
    name: "NGO",
    tagline: "Social impact",
    icon: "users",
    gradient: ["#DDA0DD", "#E9C4E9"],
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

  const renderItem = ({ item, index }: { item: Business; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(450).springify()}
      style={styles.cardWrapper}
    >
      <Pressable
        onPress={() => handleSelect(item)}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: item.active ? colors.gold : colors.border,
            opacity: item.active ? 1 : 0.65,
          },
          item.active && styles.activeCard,
        ]}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Feather name={item.icon} size={26} color="#FFF" />
        </LinearGradient>
        <View style={styles.text}>
          <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
            {item.name}
          </Text>
          <Text style={[styles.cardTagline, { color: colors.mutedForeground }]}>
            {item.tagline}
          </Text>
        </View>
        {item.active ? (
          <View style={[styles.liveBadge, { backgroundColor: colors.success + "18" }]}>
            <Text style={[styles.liveText, { color: colors.success }]}>Active</Text>
          </View>
        ) : (
          <View style={[styles.soonBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.soonText, { color: colors.mutedForeground }]}>Soon</Text>
          </View>
        )}
      </Pressable>
      {comingSoon === item.name && (
        <View style={[styles.toast, { backgroundColor: colors.gold }]}>
          <Text style={[styles.toastText, { color: colors.primaryForeground }]}>
            {item.name} is coming soon
          </Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.gold }]}>Choose workspace</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Which business are you managing today?
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Select an active business to continue. Other verticals will be unlocked in future updates.
        </Text>
      </View>

      <FlatList
        data={BUSINESSES}
        keyExtractor={(b) => b.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  list: {
    paddingBottom: 32,
    gap: 14,
  },
  cardWrapper: {
    flex: 1,
    padding: 6,
    position: "relative",
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    gap: 14,
    minHeight: 170,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  activeCard: {
    borderWidth: 2,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    alignItems: "center",
    gap: 4,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  cardTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
  },
  soonBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  soonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  toast: {
    position: "absolute",
    top: "50%",
    left: 6,
    right: 6,
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
