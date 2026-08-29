import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/business");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Name</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>{user?.name ?? "-"}</Text>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Phone</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>{user?.phone ?? "-"}</Text>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Role</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>{user?.jobType ?? "Worker"}</Text>
      </View>

      <Pressable
        onPress={handleLogout}
        style={[styles.button, { backgroundColor: colors.destructive }]}
      >
        <Text style={[styles.buttonText, { color: colors.destructiveForeground }]}>
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  value: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
