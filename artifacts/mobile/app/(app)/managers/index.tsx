import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function ManagersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { managers, issues, tasks } = useData();
  const [query, setQuery] = useState("");

  const managerStats = useMemo(() => {
    const list = managers.map((manager) => {
      const reportedIssues = issues.filter((i) => i.reportedBy === manager.name).length;
      const assignedTasks = tasks.filter((t) => t.assignedBy === manager.name || t.assignedBy === "Sunita Devi").length;
      return { ...manager, reportedIssues, assignedTasks };
    });
    return list.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));
  }, [managers, issues, tasks, query]);

  const renderManager = ({ item, index }: { item: (typeof managerStats)[0]; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 70).duration(400).springify()}
    >
      <Pressable
        onPress={() => router.push({ pathname: "/managers/[id]", params: { id: item.id } })}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.gold + "20" }]}>
          <Feather name="briefcase" size={22} color={colors.gold} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.cardForeground }]}>{item.name}</Text>
          <Text style={[styles.role, { color: colors.mutedForeground }]}>Manager · {item.phone}</Text>
          <View style={styles.chips}>
            <View style={[styles.chip, { backgroundColor: colors.warning + "15" }]}>
              <Text style={[styles.chipText, { color: colors.warning }]}>{item.reportedIssues} issues</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.success + "15" }]}>
              <Text style={[styles.chipText, { color: colors.success }]}>{item.assignedTasks} tasks</Text>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={22} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 20 },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Managers</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {managers.length} manager{managers.length !== 1 ? "s" : ""} · Lawn Care
      </Text>

      <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          placeholder="Search manager"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.cardForeground }]}
        />
      </View>

      <FlatList
        data={managerStats}
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
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    paddingVertical: 0,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  role: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
});
