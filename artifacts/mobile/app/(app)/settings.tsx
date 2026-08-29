import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mode, toggle } = useTheme();
  const { user, logout } = useAuth();
  const isDark = mode === "dark";

  const handleLogout = async () => {
    await logout();
    router.replace("/business");
  };

  const roleDisplay: Record<string, string> = {
    owner: "Super Admin",
    manager: "Manager",
    employee: "Worker",
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Feather name="moon" size={20} color={colors.cardForeground} />
          <Text style={[styles.rowLabel, { color: colors.cardForeground }]}>
            Dark mode
          </Text>
          <Switch value={isDark} onValueChange={toggle} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Signed in as</Text>
        <Text style={[styles.value, { color: colors.cardForeground }]}>{user?.name}</Text>
        <Text style={[styles.value, { color: colors.mutedForeground }]}>{roleDisplay[user?.role ?? ""] ?? user?.role}</Text>
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
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
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
