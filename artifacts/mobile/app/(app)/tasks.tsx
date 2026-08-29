import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const label = user?.role === "employee" ? "My Tasks" : "Assign Tasks";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {user?.role === "employee"
          ? "Complete today's tasks and upload proof."
          : "Create and assign recurring daily tasks."}
      </Text>
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
    fontSize: 16,
    marginTop: 8,
  },
});
