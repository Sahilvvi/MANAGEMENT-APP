import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const ROLE_LABEL: Record<string, string> = {
  owner: "Super Admin",
  manager: "Manager",
  employee: "Worker",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { workers, managers, tasks } = useData();

  const person = useMemo(() => {
    if (user?.role === "owner") return null;
    return (
      workers.find((w) => w.id === user?.id) ??
      managers.find((m) => m.id === user?.id)
    );
  }, [workers, managers, user]);

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assigneeId === user?.id),
    [tasks, user]
  );
  const completed = myTasks.filter((t) => t.status === "completed").length;
  const withPhoto = myTasks.filter((t) => t.completionPhoto).length;
  const rate = myTasks.length ? Math.round((completed / myTasks.length) * 100) : 0;

  const handleLogout = async () => {
    await logout();
    router.replace("/business");
  };

  const attendanceColor =
    person?.attendance === "present"
      ? colors.success
      : person?.attendance === "late"
      ? colors.warning
      : colors.destructive;

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 20 },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient
          colors={[colors.gold, colors.goldLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Feather name="user" size={36} color={colors.primary} />
        </LinearGradient>
        <Text style={[styles.name, { color: colors.cardForeground }]}>{user?.name ?? "-"}</Text>
        <Text style={[styles.role, { color: colors.mutedForeground }]}>
          {ROLE_LABEL[user?.role ?? ""] ?? user?.role} · {user?.jobType ?? "Lawn Care"}
        </Text>
        {person && (
          <View style={[styles.attendance, { backgroundColor: attendanceColor + "15" }]}>
            <Text style={[styles.attendanceText, { color: attendanceColor }]}>
              Attendance: {person.attendance}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.gold }]}>{myTasks.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tasks</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.success }]}>{withPhoto}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>With proof</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{rate}%</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Efficiency</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow icon="phone" label="Phone" value={user?.phone ?? person?.phone ?? "-"} />
        {person && (
          <>
            <InfoRow icon="dollar-sign" label="Salary" value={`₹${person.salary.toLocaleString("en-IN")}/month`} />
            <InfoRow icon="calendar" label="Joining date" value={person.joinDate} />
            <InfoRow icon="map-pin" label="Address" value={person.address} />
          </>
        )}
        <InfoRow icon="briefcase" label="Business" value={user?.business ?? "Lawn Care"} />
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={[styles.infoIcon, { backgroundColor: colors.gold + "15" }]}>
          <Feather name={icon} size={16} color={colors.gold} />
        </View>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 4,
  },
  headerCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 4,
  },
  role: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  attendance: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  attendanceText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "capitalize",
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  infoValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    maxWidth: "55%",
    textAlign: "right",
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
