import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { GlassCard } from "@/components/GlassCard";
import { CircularScore } from "@/components/CircularScore";
import { useColors } from "@/hooks/useColors";

type CheckInStep = "idle" | "face" | "uniform" | "geo" | "done";

export default function CheckInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { employees, checkIn } = useData();

  const [step, setStep] = useState<CheckInStep>("idle");
  const [location, setLocation] = useState<string | null>(null);
  const [faceOk, setFaceOk] = useState(false);
  const [uniformOk, setUniformOk] = useState(false);
  const [geoOk, setGeoOk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Live wall clock
  const [clock, setClock] = useState(new Date());

  // Clock-out state
  const [clockedOut, setClockedOut] = useState(false);
  const [showClockOutModal, setShowClockOutModal] = useState(false);

  // Work timer (time since check-in)
  const [workSeconds, setWorkSeconds] = useState(0);
  const workTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Break timer state
  const [breakActive, setBreakActive] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [breakCount, setBreakCount] = useState(0);
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);
  const breakTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulse = useSharedValue(1);
  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;

  const myEmployee = employees.find((e) => e.id === user?.id);
  const alreadyCheckedIn = myEmployee?.attendance === "present";
  const isCheckedIn = alreadyCheckedIn || step === "done";

  // Live wall clock tick (every second)
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Work timer tick
  useEffect(() => {
    if (isCheckedIn && !clockedOut) {
      workTimer.current = setInterval(() => setWorkSeconds((s) => s + 1), 1000);
    }
    return () => { if (workTimer.current) clearInterval(workTimer.current); };
  }, [isCheckedIn, clockedOut]);

  useEffect(() => {
    if (step === "face") {
      pulse.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1, true
      );
    } else {
      pulse.value = withSpring(1);
    }
  }, [step]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // Break timer tick
  useEffect(() => {
    if (breakActive) {
      breakTimer.current = setInterval(() => setBreakSeconds((s) => s + 1), 1000);
    } else {
      if (breakTimer.current) clearInterval(breakTimer.current);
      if (breakSeconds > 0) {
        setTotalBreakSeconds((t) => t + breakSeconds);
        setBreakSeconds(0);
        setBreakCount((c) => c + 1);
      }
    }
    return () => { if (breakTimer.current) clearInterval(breakTimer.current); };
  }, [breakActive]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleBreakToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBreakActive((v) => !v);
  };

  const handleClockOut = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBreakActive(false);
    if (workTimer.current) clearInterval(workTimer.current);
    setShowClockOutModal(true);
  };

  const confirmClockOut = () => {
    setClockedOut(true);
    setShowClockOutModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const simulate = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setIsLoading(false);
    return true;
  };

  const startCheckIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("face");
    await simulate();
    setFaceOk(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setStep("uniform");
    await simulate();
    setUniformOk(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setStep("geo");
    if (Platform.OS !== "web") {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      } else {
        setLocation("12.9716, 77.5946");
      }
    } else {
      await new Promise((r) => setTimeout(r, 900));
      setLocation("12.9716, 77.5946");
    }
    setGeoOk(true);
    setStep("done");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (user?.id) await checkIn(user.id);
  };

  const h = clock.getHours().toString().padStart(2, "0");
  const m = clock.getMinutes().toString().padStart(2, "0");
  const s = clock.getSeconds().toString().padStart(2, "0");
  const timeStr = `${h}:${m}`;
  const secStr = `:${s}`;
  const dateStr = clock.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const netWorkSeconds = workSeconds - totalBreakSeconds;
  const efficiency = workSeconds > 0 ? Math.round((netWorkSeconds / Math.max(workSeconds, 1)) * 100) : 100;

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 60 : 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
          <Text style={styles.headerLabel}>Smart Check-In</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={styles.time}>{timeStr}</Text>
            <Text style={styles.timeSec}>{secStr}</Text>
          </View>
          <Text style={styles.date}>{dateStr}</Text>
          {isCheckedIn && !clockedOut && (
            <View style={[styles.workTimer, { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }]}>
              <View style={[styles.liveBlip, { backgroundColor: colors.success }]} />
              <Text style={styles.workTimerText}>On duty · {formatTime(workSeconds)}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Clocked Out State */}
          {clockedOut ? (
            <Animated.View entering={FadeInDown.duration(400)}>
              <GlassCard style={{ alignItems: "center", gap: 16, padding: 28 }}>
                <View style={[styles.doneIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name="log-out" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.doneTitle, { color: colors.foreground }]}>Clocked Out</Text>
                <Text style={[styles.doneTime, { color: colors.mutedForeground }]}>
                  Session ended · {timeStr}
                </Text>
                <View style={[styles.sessionSummary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  {[
                    { label: "Total Time", value: formatTime(workSeconds), icon: "clock" as const },
                    { label: "Active Work", value: formatTime(netWorkSeconds), icon: "activity" as const },
                    { label: "Breaks Taken", value: `${breakCount}`, icon: "coffee" as const },
                    { label: "Break Time", value: formatTime(totalBreakSeconds), icon: "pause" as const },
                    { label: "Efficiency", value: `${efficiency}%`, icon: "zap" as const },
                  ].map((s, i) => (
                    <View key={s.label}>
                      {i > 0 && <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }]} />}
                      <View style={styles.sessionRow}>
                        <Feather name={s.icon} size={13} color={colors.mutedForeground} />
                        <Text style={[styles.sessionLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                        <Text style={[styles.sessionValue, { color: colors.foreground }]}>{s.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </Animated.View>
          ) : isCheckedIn ? (
            /* Already Checked In */
            <Animated.View entering={FadeInDown.duration(400)}>
              <GlassCard style={{ alignItems: "center", gap: 16, padding: 24 }}>
                <View style={[styles.doneIcon, { backgroundColor: colors.success + "18" }]}>
                  <Feather name="check-circle" size={36} color={colors.success} />
                </View>
                <Text style={[styles.doneTitle, { color: colors.foreground }]}>
                  {step === "done" ? "Check-In Complete" : "Already Checked In"}
                </Text>
                <Text style={[styles.doneTime, { color: colors.mutedForeground }]}>
                  {myEmployee?.checkInTime ? `${myEmployee.checkInTime} · ${myEmployee.location}` : `Verified at ${timeStr}`}
                </Text>

                {myEmployee && (
                  <CircularScore score={myEmployee.score} size={90} showLabel />
                )}

                {step === "done" && (
                  <View style={styles.checklistDone}>
                    {[
                      { label: "Face verified", ok: faceOk },
                      { label: "Uniform check passed", ok: uniformOk },
                      { label: "Location confirmed", ok: geoOk },
                    ].map((item) => (
                      <View key={item.label} style={styles.checkItem}>
                        <Feather name={item.ok ? "check-circle" : "x-circle"} size={15} color={item.ok ? colors.success : colors.destructive} />
                        <Text style={[styles.checkLabel, { color: colors.foreground }]}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {location && (
                  <View style={[styles.locationPill, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "22" }]}>
                    <Feather name="map-pin" size={12} color={colors.primary} />
                    <Text style={[styles.locationText, { color: colors.primary }]}>{location}</Text>
                  </View>
                )}

                {/* Clock-Out Button */}
                <Pressable
                  onPress={handleClockOut}
                  style={[styles.clockOutBtn, { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "30" }]}
                >
                  <Feather name="log-out" size={16} color={colors.destructive} />
                  <Text style={[styles.clockOutBtnText, { color: colors.destructive }]}>Clock Out</Text>
                </Pressable>
              </GlassCard>
            </Animated.View>
          ) : (
            /* Check-In Flow */
            <>
              <Animated.View entering={FadeInDown.duration(400)}>
                <GlassCard style={{ gap: 14 }}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Verification Steps</Text>
                  {[
                    { key: "face" as CheckInStep, label: "Face Detection", icon: "camera" as const, ok: faceOk, active: step === "face" },
                    { key: "uniform" as CheckInStep, label: "Uniform Check", icon: "eye" as const, ok: uniformOk, active: step === "uniform" },
                    { key: "geo" as CheckInStep, label: "Geo-Tag & Verify", icon: "map-pin" as const, ok: geoOk, active: step === "geo" },
                  ].map((item) => (
                    <View
                      key={item.key}
                      style={[
                        styles.stepRow,
                        {
                          backgroundColor: item.active ? colors.primary + "08" : "transparent",
                          borderRadius: 10,
                          borderColor: item.active ? colors.primary + "22" : "transparent",
                          borderWidth: 1,
                          padding: 10,
                        },
                      ]}
                    >
                      <View style={[styles.stepIcon, {
                        backgroundColor: item.ok ? colors.success + "18" : item.active ? colors.primary + "18" : colors.muted,
                      }]}>
                        {item.active && isLoading ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Feather
                            name={item.ok ? "check" : item.icon}
                            size={16}
                            color={item.ok ? colors.success : item.active ? colors.primary : colors.mutedForeground}
                          />
                        )}
                      </View>
                      <Text style={[styles.stepLabel, {
                        color: item.ok ? colors.success : item.active ? colors.primary : colors.mutedForeground,
                      }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.stepStatus, {
                        color: item.ok ? colors.success : colors.mutedForeground,
                      }]}>
                        {item.ok ? "Verified ✓" : item.active && isLoading ? "Scanning..." : ""}
                      </Text>
                    </View>
                  ))}
                </GlassCard>
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(400).delay(80)} style={{ alignItems: "center" }}>
                <Animated.View style={pulseStyle}>
                  <Pressable
                    onPress={step === "idle" ? startCheckIn : undefined}
                    style={[styles.checkInBtn, { backgroundColor: step === "idle" ? colors.primary : colors.primary + "88" }]}
                  >
                    {step === "idle" ? (
                      <>
                        <Feather name="zap" size={26} color="#fff" />
                        <Text style={styles.checkInBtnText}>Start Check-In</Text>
                      </>
                    ) : (
                      <>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.checkInBtnText}>Verifying...</Text>
                      </>
                    )}
                  </Pressable>
                </Animated.View>
                <Text style={[styles.checkInHint, { color: colors.mutedForeground }]}>
                  AI-powered · Face + Uniform + Geo
                </Text>
              </Animated.View>
            </>
          )}

          {/* Break Timer — shown when checked in and not clocked out */}
          {isCheckedIn && !clockedOut && (
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <GlassCard style={{ gap: 14 }}>
                <View style={styles.breakHeader}>
                  <Feather name="coffee" size={16} color={colors.gold} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Break Timer</Text>
                </View>

                <View style={styles.breakStats}>
                  <View style={styles.breakStat}>
                    <Text style={[styles.breakStatValue, { color: colors.foreground }]}>{breakCount}</Text>
                    <Text style={[styles.breakStatLabel, { color: colors.mutedForeground }]}>Breaks</Text>
                  </View>
                  <View style={[styles.breakStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.breakStat}>
                    <Text style={[styles.breakStatValue, { color: colors.foreground }]}>{formatTime(totalBreakSeconds)}</Text>
                    <Text style={[styles.breakStatLabel, { color: colors.mutedForeground }]}>Total break</Text>
                  </View>
                  <View style={[styles.breakStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.breakStat}>
                    <Text style={[styles.breakStatValue, { color: breakActive ? colors.warning : colors.foreground }]}>
                      {breakActive ? formatTime(breakSeconds) : "—"}
                    </Text>
                    <Text style={[styles.breakStatLabel, { color: colors.mutedForeground }]}>Current</Text>
                  </View>
                </View>

                {breakActive && (
                  <View style={[styles.activeBreakBanner, { backgroundColor: colors.warning + "12", borderColor: colors.warning + "33" }]}>
                    <View style={[styles.liveBlip, { backgroundColor: colors.warning }]} />
                    <Text style={[styles.activeBreakText, { color: colors.warning }]}>
                      On break · {formatTime(breakSeconds)}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleBreakToggle}
                  style={[
                    styles.breakBtn,
                    {
                      backgroundColor: breakActive ? colors.warning + "18" : colors.primary + "12",
                      borderColor: breakActive ? colors.warning + "44" : colors.primary + "22",
                    },
                  ]}
                >
                  <Feather name={breakActive ? "square" : "play"} size={16} color={breakActive ? colors.warning : colors.primary} />
                  <Text style={[styles.breakBtnText, { color: breakActive ? colors.warning : colors.primary }]}>
                    {breakActive ? "End Break" : "Start Break"}
                  </Text>
                </Pressable>
              </GlassCard>
            </Animated.View>
          )}

          {/* Geo-Fence Status */}
          <Animated.View entering={FadeInDown.duration(400).delay(160)}>
            <GlassCard style={{ gap: 12 }}>
              <View style={styles.geoHeader}>
                <Feather name="radio" size={16} color={colors.gold} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Geo-Fence Status</Text>
                <View style={{ flex: 1 }} />
                <View style={[styles.liveDot, { backgroundColor: clockedOut ? colors.mutedForeground : colors.success }]} />
                <Text style={[styles.liveText, { color: clockedOut ? colors.mutedForeground : colors.success }]}>
                  {clockedOut ? "Inactive" : "Active"}
                </Text>
              </View>
              <View style={{ gap: 9 }}>
                {[
                  { label: "Zone", value: "Tech Hub · Bangalore" },
                  { label: "Radius", value: "500m perimeter" },
                  { label: "Drift Alert", value: "Auto-trigger at 50m" },
                  { label: "Random Check", value: "AI-scheduled · Contextual" },
                ].map((row) => (
                  <View key={row.label} style={styles.geoRow}>
                    <Text style={[styles.geoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                    <Text style={[styles.geoValue, { color: colors.foreground }]}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Score Breakdown */}
          {myEmployee && (
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <GlassCard style={{ gap: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="award" size={16} color={colors.gold} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Performance Score</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                  <CircularScore score={myEmployee.score} size={80} showLabel />
                  <View style={{ flex: 1, gap: 8 }}>
                    {[
                      { label: "Punctuality", val: 94 },
                      { label: "Task Completion", val: 88 },
                      { label: "Compliance", val: 100 },
                    ].map((item) => (
                      <View key={item.label} style={{ gap: 3 }}>
                        <View style={styles.scoreRowHeader}>
                          <Text style={[styles.scoreRowLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                          <Text style={[styles.scoreRowVal, { color: colors.foreground }]}>{item.val}</Text>
                        </View>
                        <View style={[styles.scoreBar, { backgroundColor: colors.muted }]}>
                          <View style={[styles.scoreBarFill, {
                            width: `${item.val}%` as any,
                            backgroundColor: item.val >= 90 ? colors.success : item.val >= 75 ? colors.warning : colors.destructive,
                          }]} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Clock-Out Confirmation Modal */}
      <Modal visible={showClockOutModal} transparent animationType="slide" onRequestClose={() => setShowClockOutModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowClockOutModal(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Animated.View entering={FadeInUp.duration(300)} style={{ gap: 20 }}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

              <View style={{ alignItems: "center", gap: 10 }}>
                <View style={[styles.doneIcon, { backgroundColor: colors.destructive + "12" }]}>
                  <Feather name="log-out" size={32} color={colors.destructive} />
                </View>
                <Text style={[styles.doneTitle, { color: colors.foreground }]}>Clock Out?</Text>
                <Text style={[styles.doneTime, { color: colors.mutedForeground }]}>
                  Your session summary will be recorded
                </Text>
              </View>

              {/* Summary preview */}
              <View style={[styles.sessionSummary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                {[
                  { label: "Total on duty", value: formatTime(workSeconds) },
                  { label: "Breaks taken", value: `${breakCount} · ${formatTime(totalBreakSeconds)}` },
                  { label: "Work efficiency", value: `${efficiency}%` },
                ].map((s, i) => (
                  <View key={s.label}>
                    {i > 0 && <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }]} />}
                    <View style={styles.sessionRow}>
                      <Text style={[styles.sessionLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                      <Text style={[styles.sessionValue, { color: colors.foreground }]}>{s.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={confirmClockOut}
                style={[styles.confirmBtn, { backgroundColor: colors.destructive }]}
              >
                <Feather name="log-out" size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>Confirm Clock Out</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowClockOutModal(false)}
                style={[styles.cancelBtn, { backgroundColor: colors.secondary }]}
              >
                <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Stay On Duty</Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24, alignItems: "center", gap: 4 },
  headerLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter_400Regular", letterSpacing: 1 },
  time: { fontSize: 52, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: -2, marginTop: 4 },
  timeSec: { fontSize: 24, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", letterSpacing: -0.5, marginBottom: 8, marginLeft: 2 },
  date: { fontSize: 14, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
  workTimer: {
    flexDirection: "row", alignItems: "center", gap: 7,
    marginTop: 8, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  workTimerText: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_500Medium" },
  content: { padding: 16, gap: 16 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: -0.2, flex: 1 },
  doneIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  doneTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  doneTime: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  checklistDone: { gap: 8, width: "100%" },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  locationPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  locationText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  clockOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 11, borderRadius: 12, borderWidth: 1, width: "100%",
  },
  clockOutBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sessionSummary: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  sessionRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  sessionLabel: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  sessionValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  stepLabel: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  stepStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  checkInBtn: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "#0A1628",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  checkInBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  checkInHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 12 },
  breakHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  breakStats: { flexDirection: "row", alignItems: "center" },
  breakStat: { flex: 1, alignItems: "center", gap: 3 },
  breakStatValue: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  breakStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  breakStatDivider: { width: 1, height: 30, marginHorizontal: 4 },
  activeBreakBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  liveBlip: { width: 7, height: 7, borderRadius: 4 },
  activeBreakText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  breakBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 13, borderRadius: 12, borderWidth: 1,
  },
  breakBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  geoHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  geoRow: { flexDirection: "row", justifyContent: "space-between" },
  geoLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  geoValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  scoreRowHeader: { flexDirection: "row", justifyContent: "space-between" },
  scoreRowLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scoreRowVal: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  scoreBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  scoreBarFill: { height: 4, borderRadius: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center" },
  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 15, borderRadius: 14,
  },
  confirmBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cancelBtn: { padding: 14, borderRadius: 14, alignItems: "center" },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
