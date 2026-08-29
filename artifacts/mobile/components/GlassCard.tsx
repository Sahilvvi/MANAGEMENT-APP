import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
}

export function GlassCard({ children, style, intensity = 60, noPadding = false }: GlassCardProps) {
  const colors = useColors();

  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={intensity} tint="light" style={[styles.glass, !noPadding && styles.padding, { borderColor: colors.glassBorder, borderRadius: colors.radius }, style]}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.fallback, !noPadding && styles.padding, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    overflow: "hidden",
    borderWidth: 1,
  },
  fallback: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  padding: {
    padding: 16,
  },
});
