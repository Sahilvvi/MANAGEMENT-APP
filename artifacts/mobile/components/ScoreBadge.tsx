import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  showLabel?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 90) return "#34C759";
  if (score >= 75) return "#FF9500";
  if (score >= 60) return "#FF6B00";
  return "#FF3B30";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Average";
  return "Poor";
}

export function ScoreBadge({ score, size = "md", style, showLabel = false }: ScoreBadgeProps) {
  const colors = useColors();
  const color = getScoreColor(score);
  const dim = size === "lg" ? 56 : size === "md" ? 40 : 28;
  const fontSize = size === "lg" ? 18 : size === "md" ? 14 : 10;

  return (
    <View style={[style, { alignItems: "center", gap: 4 }]}>
      <View
        style={[
          styles.badge,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: color + "18",
            borderColor: color + "44",
          },
        ]}
      >
        <Text style={[styles.score, { fontSize, color }]}>{score}</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {getScoreLabel(score)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  score: {
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});
