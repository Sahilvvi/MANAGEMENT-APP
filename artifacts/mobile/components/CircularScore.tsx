import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface CircularScoreProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export function CircularScore({ score, size = 80, showLabel = false }: CircularScoreProps) {
  const colors = useColors();
  const half = size / 2;
  const sw = Math.round(size * 0.1);

  const color =
    score >= 90 ? "#34C759" : score >= 75 ? "#FF9500" : "#FF3B30";
  const trackColor = "rgba(0,0,0,0.07)";

  const prog = Math.min(100, Math.max(0, score));
  const totalDeg = (prog / 100) * 360;

  // Animated values for right and left arcs
  const rightAnim = useSharedValue(0); // 0 to 180
  const leftAnim = useSharedValue(0);  // 0 to 180

  useEffect(() => {
    const rightTarget = Math.min(totalDeg, 180);
    const leftTarget = Math.max(0, totalDeg - 180);
    rightAnim.value = withTiming(rightTarget, { duration: 900 });
    leftAnim.value = withDelay(
      leftTarget > 0 ? 450 : 0,
      withTiming(leftTarget, { duration: 700 })
    );
  }, [score]);

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rightAnim.value - 180}deg` }],
  }));

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leftAnim.value - 180}deg` }],
  }));

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={{ width: size, height: size }}>
        {/* Track ring */}
        <View
          style={[
            styles.absRing,
            {
              width: size, height: size, borderRadius: half,
              borderWidth: sw, borderColor: trackColor,
            },
          ]}
        />

        {/* Right clip — shows 0–50% */}
        <View
          style={{
            position: "absolute",
            width: half, height: size,
            right: 0,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                right: 0,
                width: size, height: size,
                borderRadius: half,
                borderWidth: sw,
                borderColor: prog > 0 ? color : "transparent",
              },
              rightStyle,
            ]}
          />
        </View>

        {/* Left clip — shows 50–100% */}
        <View
          style={{
            position: "absolute",
            width: half, height: size,
            left: 0,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                width: size, height: size,
                borderRadius: half,
                borderWidth: sw,
                borderColor: prog > 50 ? color : "transparent",
              },
              leftStyle,
            ]}
          />
        </View>

        {/* Center text */}
        <View style={[styles.absRing, { width: size, height: size, alignItems: "center", justifyContent: "center" }]}>
          <Text
            style={{
              fontSize: size * 0.27,
              fontFamily: "Inter_700Bold",
              color,
              letterSpacing: -1,
            }}
          >
            {score}
          </Text>
          {size >= 70 && (
            <Text
              style={{
                fontSize: size * 0.13,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                marginTop: -1,
              }}
            >
              / 100
            </Text>
          )}
        </View>
      </View>

      {showLabel && (
        <Text
          style={{
            fontSize: 11,
            fontFamily: "Inter_600SemiBold",
            color,
            letterSpacing: 0.2,
          }}
        >
          {score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Improvement"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  absRing: {
    position: "absolute",
  },
});
