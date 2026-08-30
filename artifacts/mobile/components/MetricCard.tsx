import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  style?: ViewStyle;
  accentColor?: string;
  subLabel?: string;
}

export function MetricCard({ label, value, change, icon, iconColor, style, accentColor, subLabel }: MetricCardProps) {
  const colors = useColors();
  const isPositive = (change ?? 0) >= 0;
  const accent = accentColor ?? iconColor ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.inner}>
        <View style={styles.topRow}>
          {icon && (
            <View style={[styles.iconBg, { backgroundColor: accent + "15" }]}>
              <Feather name={icon} size={14} color={accent} />
            </View>
          )}
          <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={1}>
            {label}
          </Text>
        </View>

        <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>

        {(change !== undefined || subLabel) && (
          <View style={styles.bottomRow}>
            {change !== undefined && (
              <View style={styles.changeRow}>
                <Feather
                  name={isPositive ? "trending-up" : "trending-down"}
                  size={11}
                  color={isPositive ? colors.success : colors.destructive}
                />
                <Text style={[styles.change, { color: isPositive ? colors.success : colors.destructive }]}>
                  {isPositive ? "+" : ""}{change.toFixed(1)}%
                </Text>
              </View>
            )}
            {subLabel && (
              <Text style={[styles.subLabel, { color: colors.mutedForeground }]}>{subLabel}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    overflow: "hidden",
    flex: 1,
    minWidth: "46%",
  },
  accentBar: {
    height: 3,
    width: "100%",
    opacity: 0.9,
  },
  inner: {
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  iconBg: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.1,
    flex: 1,
  },
  value: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  change: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  subLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
