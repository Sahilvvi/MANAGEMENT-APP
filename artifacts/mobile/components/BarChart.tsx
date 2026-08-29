import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface BarChartProps {
  data: { label: string; value: number; color?: [string, string] }[];
  height?: number;
  unit?: string;
}

export function BarChart({ data, height = 140, unit = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const defaultGradient: [string, string] = ["#C9A84C", "#E8D59A"];

  return (
    <View style={[styles.container, { height }]}>
      {data.map((item, index) => {
        const pct = item.value / max;
        const barHeight = Math.max(pct * (height - 24), 4);
        const gradient = item.color ?? defaultGradient;
        return (
          <Animated.View
            key={item.label}
            entering={FadeInUp.delay(index * 60).duration(500).springify()}
            style={styles.barColumn}
          >
            <View style={[styles.barTrack, { height: height - 24 }]}>
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.barFill, { height: barHeight }]}
              />
            </View>
            <Text style={styles.label}>{item.label}</Text>
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
  },
  barTrack: {
    width: "100%",
    maxWidth: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.04)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 8,
  },
  label: {
    marginTop: 8,
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "#8E8E93",
    textAlign: "center",
  },
  value: {
    marginTop: 2,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#0A1628",
  },
});
