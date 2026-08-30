import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface BarChartProps {
  data: { label: string; value: number; color?: string | [string, string] }[];
  height?: number;
  unit?: string;
}

export function BarChart({ data, height = 140, unit = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const defaultColor = "#10B981";

  return (
    <View style={[styles.container, { height }]}>
      {data.map((item, index) => {
        const pct = item.value / max;
        const barHeight = Math.max(pct * (height - 28), 4);
        const rawColor = item.color ?? defaultColor;
        const barColor = Array.isArray(rawColor) ? rawColor[0] : rawColor;
        return (
          <Animated.View
            key={`${item.label}-${index}`}
            entering={FadeInUp.delay(index * 60).duration(500).springify()}
            style={styles.barColumn}
          >
            <View style={[styles.barTrack, { height: height - 28 }]}>
              <View style={[styles.barFill, { height: barHeight, backgroundColor: barColor }]} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
            {item.value > 0 && (
              <Text style={styles.value} numberOfLines={1}>
                {item.value}{unit}
              </Text>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 30,
  },
  barTrack: {
    width: "100%",
    maxWidth: 28,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.04)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
    opacity: 0.9,
  },
  label: {
    marginTop: 8,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
  },
  value: {
    marginTop: 2,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#111827",
    textAlign: "center",
  },
});
