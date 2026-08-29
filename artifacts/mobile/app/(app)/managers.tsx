import { Feather } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function ManagersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { managers } = useData();

  const renderManager = ({ item, index }: { item: (typeof managers)[0]; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 70).duration(400).springify()}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.avatar, { backgroundColor: `${colors.gold}18` }]}>
        <Feather name="briefcase" size={22} color={colors.gold} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.cardForeground }]}>{item.name}</Text>
        <Text style={[styles.role, { color: colors.mutedForeground }]}>Manager</Text>
        <Text style={[styles.phone, { color: colors.mutedForeground }]}>{item.phone}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Managers</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {managers.length} manager{managers.length !== 1 ? "s" : ""} · Lawn Care
      </Text>

      <FlatList
        data={managers}
        keyExtractor={(m) => m.id}
        renderItem={renderManager}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    gap: 2,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  role: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  phone: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
