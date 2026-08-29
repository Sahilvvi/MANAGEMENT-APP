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
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, type User } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface WorkerOption {
  id: string;
  name: string;
  jobType: string;
  phone: string;
  icon: keyof typeof Feather.glyphMap;
}

const WORKERS: WorkerOption[] = [
  { id: "lawn-w1", name: "Raju", jobType: "Sweeper", phone: "9876543201", icon: "wind" },
  { id: "lawn-w2", name: "Lakhan", jobType: "Cook", phone: "9876543202", icon: "coffee" },
  { id: "lawn-w3", name: "Prem", jobType: "Cleaner A", phone: "9876543203", icon: "droplet" },
  { id: "lawn-w4", name: "Kishan", jobType: "Multitasker", phone: "9876543204", icon: "box" },
  { id: "lawn-w5", name: "Suresh", jobType: "Cleaner B", phone: "9876543205", icon: "droplet" },
];

export default function WorkerSelectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const params = useLocalSearchParams<{ business?: string }>();
  const businessId = params.business ?? "lawn";

  const handleSelect = async (worker: WorkerOption) => {
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
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.gold }]}>Lawn Care</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Select worker
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Choose your name to see today's tasks.
        </Text>
      </View>

      <View style={styles.cards}>
        {WORKERS.map((worker, index) => (
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
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: `${colors.gold}18` },
                ]}
              >
                <Feather name={worker.icon} size={24} color={colors.gold} />
              </View>
              <View style={styles.text}>
                <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                  {worker.name}
                </Text>
                <Text style={[styles.cardRole, { color: colors.mutedForeground }]}>
                  {worker.jobType}
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
    paddingTop: 24,
    paddingBottom: 28,
    gap: 6,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 6,
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
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
  cardRole: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
});
