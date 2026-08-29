import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import type { Vertical } from "@/context/DataContext";

interface VerticalCardProps {
  vertical: Vertical;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VerticalCard({ vertical, onPress }: VerticalCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isPositive = vertical.revenueChange >= 0;
  const revenueStr = vertical.revenue >= 1000000
    ? `$${(vertical.revenue / 1000000).toFixed(1)}M`
    : `$${(vertical.revenue / 1000).toFixed(0)}K`;

  const taskPct = Math.min((vertical.tasks / 50) * 100, 100);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      style={[animStyle, styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, borderLeftColor: vertical.color, borderLeftWidth: 3 }]}
    >
      <View style={[styles.iconBg, { backgroundColor: vertical.color + "22" }]}>
        <Feather name={vertical.icon as keyof typeof Feather.glyphMap} size={20} color={vertical.color} />
      </View>

      <Text style={[styles.name, { color: colors.mutedForeground }]} numberOfLines={1}>{vertical.name}</Text>
      <Text style={[styles.revenue, { color: colors.foreground }]}>{revenueStr}</Text>

      <View style={styles.changeRow}>
        <Feather
          name={isPositive ? "arrow-up-right" : "arrow-down-right"}
          size={11}
          color={isPositive ? colors.success : colors.destructive}
        />
        <Text style={[styles.change, { color: isPositive ? colors.success : colors.destructive }]}>
          {Math.abs(vertical.revenueChange).toFixed(1)}%
        </Text>
      </View>

      {vertical.alerts > 0 && (
        <View style={[styles.alertBadge, { backgroundColor: colors.destructive }]}>
          <Text style={styles.alertText}>{vertical.alerts}</Text>
        </View>
      )}

      {/* Task progress bar */}
      <View style={{ gap: 3, marginTop: 6 }}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${taskPct}%` as any, backgroundColor: vertical.color }]} />
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.stat}>
          <Feather name="users" size={10} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{vertical.employees}</Text>
        </View>
        <View style={styles.stat}>
          <Feather name="check-square" size={10} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{vertical.tasks} tasks</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  revenue: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginTop: 1,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  change: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  alertBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  alertText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});
