import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
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
  icon: keyof typeof Feather.glyphMap;
  color: string;
  active: boolean;
}

const BUSINESSES: Business[] = [
  { id: "healthcare", name: "Healthcare", icon: "heart", color: "#FF6B6B", active: false },
  { id: "petroleum", name: "Petroleum", icon: "droplet", color: "#4ECDC4", active: false },
  { id: "lawn", name: "Lawn Care", icon: "scissors", color: "#34C759", active: true },
  { id: "school", name: "School", icon: "book", color: "#8B5CF6", active: false },
  { id: "agri", name: "Agriculture", icon: "feather", color: "#F0A500", active: false },
  { id: "ngo", name: "NGO", icon: "users", color: "#DDA0DD", active: false },
];

export default function BusinessSelectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleSelect = (business: Business) => {
    if (!business.active) {
      Alert.alert("Coming soon", `${business.name} will be available in a future update.`);
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
            borderColor: colors.border,
            opacity: item.active ? 1 : 0.55,
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${item.color}15` },
          ]}
        >
          <Feather name={item.icon} size={28} color={item.color} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
          {item.name}
        </Text>
        {!item.active && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        )}
      </Pressable>
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
        <Text style={[styles.eyebrow, { color: colors.gold }]}>Select business</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Which business are you managing today?
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
    paddingBottom: 20,
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
    fontSize: 24,
    lineHeight: 32,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
    padding: 6,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    gap: 12,
    minHeight: 150,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(120,120,130,0.16)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  comingSoonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#888",
  },
});
