import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function WorkersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workers, tasks } = useData();

  const workerStats = useMemo(() => {
    return workers.map((worker) => {
      const workerTasks = tasks.filter((t) => t.assigneeId === worker.id);
      const completed = workerTasks.filter((t) => t.status === "completed").length;
      const total = workerTasks.length;
      const rate = total ? Math.round((completed / total) * 100) : 0;
      return { ...worker, completed, total, rate };
    });
  }, [workers, tasks]);

  const renderWorker = ({ item, index }: { item: typeof workerStats[0]; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 70).duration(400).springify()}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: `${colors.gold}18` }]}>
          <Feather name="user" size={22} color={colors.gold} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.cardForeground }]}>{item.name}</Text>
          <Text style={[styles.role, { color: colors.mutedForeground }]}>{item.jobType}</Text>
        </View>
        <View style={styles.score}>
          <Text style={[styles.scoreValue, { color: colors.gold }]}>{item.rate}%</Text>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
            {item.completed}/{item.total}
          </Text>
        </View>
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
      <Text style={[styles.title, { color: colors.foreground }]}>Workers</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {workers.length} team members · Lawn Care
      </Text>

      <FlatList
        data={workerStats}
        keyExtractor={(w) => w.id}
        renderItem={renderWorker}
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
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
  score: {
    alignItems: "flex-end",
    gap: 2,
  },
  scoreValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  scoreLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
});
