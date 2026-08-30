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
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Sweeper: "wind",
  Cook: "coffee",
  "Cleaner A": "droplet",
  Multitasker: "box",
  "Cleaner B": "droplet",
};

export default function WorkerSelectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { workers } = useData();
  const params = useLocalSearchParams<{ business?: string }>();
  const businessId = params.business ?? "lawn";

  const handleSelect = async (worker: (typeof workers)[0]) => {
    const user: User = {
      id: worker.id,
      name: worker.name,
      role: "employee",
      business: businessId,
      jobType: worker.jobType,
      phone: worker.phone,
    };
    await login(user);
    router.replace("/(app)");
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.success, "#8CEF99"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>Lawn Care</Text>
        </LinearGradient>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Select your profile
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Tap your name to see today’s tasks and upload proof.
        </Text>
      </View>

      <View style={styles.cards}>
        {workers.map((worker, index) => (
          <Animated.View
            key={worker.id}
            entering={FadeInUp.delay(index * 70).duration(400).springify()}
          >
            <Pressable
              onPress={() => handleSelect(worker)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <LinearGradient
                colors={[colors.gold, colors.goldLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}
              >
                <Feather
                  name={ICONS[worker.jobType] ?? "user"}
                  size={24}
                  color={colors.primary}
                />
              </LinearGradient>
              <View style={styles.text}>
                <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                  {worker.name}
                </Text>
                <Text style={[styles.cardRole, { color: colors.mutedForeground }]}>
                  {worker.jobType} · {worker.phone}
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
  content: {
    paddingBottom: 24,
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
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  cardRole: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
});
