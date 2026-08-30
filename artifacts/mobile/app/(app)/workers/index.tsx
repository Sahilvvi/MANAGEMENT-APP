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
import { ScoreBadge } from "@/components/ScoreBadge";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function WorkersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workers, tasks } = useData();
  const [query, setQuery] = useState("");

  const workerStats = useMemo(() => {
    const list = workers.map((worker) => {
      const workerTasks = tasks.filter((t) => t.assigneeId === worker.id);
      const completed = workerTasks.filter((t) => t.status === "completed").length;
      const total = workerTasks.length;
      const rate = total ? Math.round((completed / total) * 100) : 0;
      const pending = workerTasks.filter((t) => t.status === "pending").length;
      return { ...worker, completed, total, rate, pending };
    });
    return list.filter(
      (w) =>
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.jobType.toLowerCase().includes(query.toLowerCase())
    );
  }, [workers, tasks, query]);

  const renderWorker = ({ item, index }: { item: typeof workerStats[0]; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(400).springify()}
    >
      <Pressable
        onPress={() => router.push({ pathname: "/workers/[id]", params: { id: item.id } })}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: colors.gold + "20" }]}>
            <Feather name="user" size={22} color={colors.gold} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.cardForeground }]}>{item.name}</Text>
            <Text style={[styles.role, { color: colors.mutedForeground }]}>{item.jobType}</Text>
            <View style={styles.chips}>
              <View style={[styles.chip, { backgroundColor: colors.success + "15" }]}>
                <Text style={[styles.chipText, { color: colors.success }]}>{item.completed}/{item.total} done</Text>
              </View>
              {item.pending > 0 && (
                <View style={[styles.chip, { backgroundColor: colors.warning + "15" }]}>
                  <Text style={[styles.chipText, { color: colors.warning }]}>{item.pending} pending</Text>
                </View>
              )}
            </View>
          </View>
          <ScoreBadge score={item.rate} size="lg" showLabel />
        </View>
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
      <Text style={[styles.title, { color: colors.foreground }]}>Workers</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {workers.length} team members · Lawn Care
      </Text>

      <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          placeholder="Search by name or role"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.cardForeground }]}
        />
      </View>

      <FlatList
        data={workerStats}
        keyExtractor={(w) => w.id}
        renderItem={renderWorker}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 0,
    gap: 12,
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
  card: {
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
