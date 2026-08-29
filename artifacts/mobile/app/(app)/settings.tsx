import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  destructive?: boolean;
}

function SettingRow({ icon, label, value, onPress, toggle, onToggle, destructive }: SettingRowProps) {
  const colors = useColors();
  const content = (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: destructive ? colors.destructive + "15" : colors.gold + "15" }]}>
        <Feather name={icon} size={18} color={destructive ? colors.destructive : colors.gold} />
      </View>
      <Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.cardForeground }]}>{label}</Text>
      {toggle !== undefined ? (
        <Switch value={toggle} onValueChange={onToggle} />
      ) : (
        <View style={styles.rowRight}>
          {value && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

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
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 20 },
      ]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account</Text>
        <SettingRow icon="user" label="Signed in as" value={user?.name} />
        <SettingRow icon="shield" label="Role" value={roleDisplay[user?.role ?? ""] ?? user?.role} />
        <SettingRow icon="moon" label="Dark mode" toggle={isDark} onToggle={toggle} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Preferences</Text>
        <SettingRow icon="bell" label="Push notifications" value="On" />
        <SettingRow icon="globe" label="Language" value="English" />
        <SettingRow icon="smartphone" label="App version" value="1.0.0" />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Support</Text>
        <SettingRow icon="help-circle" label="Help center" />
        <SettingRow icon="lock" label="Privacy policy" />
        <SettingRow icon="message-circle" label="Contact support" />
      </View>

      <Pressable
        onPress={handleLogout}
        style={[styles.button, { backgroundColor: colors.destructive }]}
      >
        <Feather name="log-out" size={18} color={colors.destructiveForeground} />
        <Text style={[styles.buttonText, { color: colors.destructiveForeground }]}>
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 4,
  },
  section: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});
