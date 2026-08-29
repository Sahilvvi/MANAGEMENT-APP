import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const DAILY_REPORT = `**Daily Operations Report — May 3, 2026**

**Revenue Summary**
Total: $16.34M across 9 verticals. Technology (+22.4%) and Real Estate (+15.6%) lead growth. Petroleum down 3.2%.

**Employee Performance**
Present: 8/10 key staff. Vikram Reddy absent (Hospitality). Priya Nair late 75 min — $200 fine auto-applied.

Top performer: Deepak Joshi (97/100) — Technology. Recommend bonus approval ($2,000).

**Active Alerts**
• Petroleum pipeline pressure anomaly — under investigation
• Mining unauthorized access attempt — security reviewing
• Healthcare HVAC malfunction — maintenance dispatched

**Task Completion**
8 active tasks. 1 completed (Kavitha Iyer — lease renewals). 1 overdue (petroleum pipeline review — escalate).

**Recommendations**
1. Approve salary bonus for Deepak Joshi ($2,000)
2. Escalate pipeline pressure issue to senior engineer
3. Schedule HVAC replacement — Ward 3 Healthcare`;

const AI_RESPONSES: Record<string, string> = {
  default: "I'm analyzing the latest operational data from all 9 business verticals. What specific aspect would you like to explore?",
  revenue: "**Revenue Performance**\nTotal: $16.34M. Technology leads at +22.4% growth, followed by Real Estate at +15.6%. Petroleum is down 3.2% due to pipeline maintenance costs.\n\n• Healthcare: $4.1M (+8.2%)\n• Technology: $3.6M (+22.4%)\n• Real Estate: $2.8M (+15.6%)\n• Petroleum: $3.8M (−3.2%)\n\nWould you like a vertical-specific breakdown?",
  employee: "**Employee Status**\nCurrent attendance: 8/10 key staff present.\n\n• **Top Performer:** Deepak Joshi — 97/100\n• **Absent:** Vikram Reddy (Hospitality)\n• **Below 80:** Priya Nair (78), Kavitha Iyer (76)\n\nWellness fund collected $700 in fines this month. 2 employees require performance coaching.",
  alert: "**Active Alerts (3)**\n\n🔴 **High:** Petroleum pipeline pressure anomaly — investigation ongoing\n🟡 **Medium:** Mining unauthorized access — security reviewing\n🟡 **Medium:** Healthcare HVAC fault — maintenance dispatched\n\nAll incidents tracked with photo evidence and geo-tagged.",
  task: "**Task Summary**\n8 active tasks across verticals.\n\n• **Overdue (1):** Petroleum pipeline inspection — Priya Nair (due May 1) → **Escalate immediately**\n• **In Progress (6):** On track\n• **Completed (1):** Lease renewals — Kavitha Iyer ✓\n\nRecommend assigning the overdue task to a backup engineer.",
  petroleum: "**Petroleum Vertical**\nRevenue: $3.8M (−3.2%). Current alerts: 1 high-priority pipeline pressure issue.\n\n• 56 employees, 5 active tasks\n• Drilling Rig Alpha: under maintenance at Site B\n• Tank Farm Bravo: operational\n\n**Recommendation:** Schedule a full safety audit within 48 hours.",
  finance: "**Financial Summary — May 2026**\n\n• Revenue: $16.34M\n• Expenses: $807K\n• Net Profit: $15.53M (margin: 95%)\n• Payroll Due May 31: $648K\n\n**Compliance:**\n• GST filing: ✓ Submitted\n• TDS deposit: ⚠️ Pending by May 7 — action required\n• Advance Tax: ✓ Paid",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("revenue") || lower.includes("profit") || lower.includes("money")) return AI_RESPONSES.revenue;
  if (lower.includes("employee") || lower.includes("staff") || lower.includes("attendance") || lower.includes("performer")) return AI_RESPONSES.employee;
  if (lower.includes("alert") || lower.includes("incident") || lower.includes("issue") || lower.includes("critical")) return AI_RESPONSES.alert;
  if (lower.includes("task") || lower.includes("overdue") || lower.includes("work")) return AI_RESPONSES.task;
  if (lower.includes("petroleum") || lower.includes("oil") || lower.includes("pipeline")) return AI_RESPONSES.petroleum;
  if (lower.includes("finance") || lower.includes("payroll") || lower.includes("tax")) return AI_RESPONSES.finance;
  return AI_RESPONSES.default;
}

const QUICK_QUESTIONS = [
  { icon: "trending-up" as const, label: "Revenue status?" },
  { icon: "users" as const, label: "Top performer?" },
  { icon: "alert-triangle" as const, label: "Critical alerts?" },
  { icon: "dollar-sign" as const, label: "Payroll status?" },
  { icon: "check-square" as const, label: "Overdue tasks?" },
  { icon: "activity" as const, label: "Petroleum update?" },
];

function parseMarkdown(text: string, textColor: string, mutedColor: string) {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      return (
        <Text key={li} style={{ fontFamily: "Inter_700Bold", color: textColor, fontSize: 13, lineHeight: 19, marginTop: li > 0 ? 4 : 0 }}>
          {line.slice(2, -2)}
        </Text>
      );
    }
    if (line.startsWith("•") || line.startsWith("→")) {
      const parts = line.slice(1).trim().split(/\*\*([^*]+)\*\*/g);
      return (
        <View key={li} style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
          <Text style={{ color: mutedColor, fontSize: 13 }}>•</Text>
          <Text style={{ color: textColor, fontSize: 13, lineHeight: 19, flex: 1 }}>
            {parts.map((p, pi) =>
              pi % 2 === 1
                ? <Text key={pi} style={{ fontFamily: "Inter_600SemiBold" }}>{p}</Text>
                : p
            )}
          </Text>
        </View>
      );
    }
    if (line === "") {
      return <View key={li} style={{ height: 4 }} />;
    }
    const parts = line.split(/\*\*([^*]+)\*\*/g);
    return (
      <Text key={li} style={{ color: textColor, fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" }}>
        {parts.map((p, pi) =>
          pi % 2 === 1
            ? <Text key={pi} style={{ fontFamily: "Inter_600SemiBold" }}>{p}</Text>
            : p
        )}
      </Text>
    );
  });
}

function TypingDots({ color }: { color: string }) {
  const d0 = useSharedValue(0.3);
  const d1 = useSharedValue(0.3);
  const d2 = useSharedValue(0.3);

  React.useEffect(() => {
    const DURATION = 350;
    d0.value = withRepeat(withSequence(withTiming(1, { duration: DURATION }), withTiming(0.3, { duration: DURATION })), -1);
    setTimeout(() => {
      d1.value = withRepeat(withSequence(withTiming(1, { duration: DURATION }), withTiming(0.3, { duration: DURATION })), -1);
    }, 200);
    setTimeout(() => {
      d2.value = withRepeat(withSequence(withTiming(1, { duration: DURATION }), withTiming(0.3, { duration: DURATION })), -1);
    }, 400);
  }, []);

  const s0 = useAnimatedStyle(() => ({ opacity: d0.value }));
  const s1 = useAnimatedStyle(() => ({ opacity: d1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: d2.value }));

  return (
    <View style={{ flexDirection: "row", gap: 4, alignItems: "center", paddingVertical: 2 }}>
      {[s0, s1, s2].map((s, i) => (
        <Animated.View key={i} style={[s, { width: 6, height: 6, borderRadius: 3, backgroundColor: color }]} />
      ))}
    </View>
  );
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalRevenue, employees, incidents } = useData();
  const [messages, setMessages] = useState<Message[]>([
    { id: "report", role: "assistant", content: DAILY_REPORT, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const send = async (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getAIResponse(text),
      timestamp: new Date(),
    };
    setMessages((prev) => [aiMsg, ...prev]);
    setIsTyping(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <Animated.View
        entering={isUser ? FadeInRight.duration(280) : FadeInLeft.duration(280)}
        style={[styles.msgRow, isUser && { alignItems: "flex-end" }]}
      >
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: colors.gold }]}>
            <Feather name="cpu" size={11} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
              : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
          ]}
        >
          {isUser ? (
            <Text style={{ color: "#fff", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 }}>
              {item.content}
            </Text>
          ) : (
            <View style={{ gap: 1 }}>
              {parseMarkdown(item.content, colors.foreground, colors.mutedForeground)}
            </View>
          )}
          <Text style={[styles.bubbleTime, { color: isUser ? "rgba(255,255,255,0.5)" : colors.mutedForeground }]}>
            {item.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? (insets.bottom > 0 ? 90 : 64) : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.aiIcon, { backgroundColor: colors.gold }]}>
            <Feather name="cpu" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Operations AI</Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: "#34C759" }]} />
              <Text style={styles.onlineText}>Live · All verticals synced</Text>
            </View>
          </View>
          <Pressable
            onPress={() => { setMessages([{ id: "report", role: "assistant", content: DAILY_REPORT, timestamp: new Date() }]); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.resetBtn, { backgroundColor: "rgba(255,255,255,0.12)" }]}
          >
            <Feather name="refresh-cw" size={14} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>

        <View style={[styles.modelBadge, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="cpu" size={9} color={colors.gold} />
          <Text style={[styles.modelBadgeText, { color: colors.gold }]}>EOH-AI v2.1</Text>
          <View style={styles.modelBadgeSep} />
          <Text style={[styles.modelBadgeText, { color: "rgba(255,255,255,0.45)" }]}>Gemini Enhanced · Context-Aware</Text>
        </View>

        <View style={styles.statsPills}>
          {[
            { icon: "trending-up" as const, label: `$${(totalRevenue / 1000000).toFixed(1)}M` },
            { icon: "users" as const, label: `${employees.filter((e) => e.attendance === "present").length}/${employees.length} present` },
            { icon: "alert-triangle" as const, label: `${incidents.filter((i) => i.status !== "resolved").length} alerts` },
          ].map((p) => (
            <View key={p.label} style={[styles.statPill, { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }]}>
              <Feather name={p.icon} size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.statPillText}>{p.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick questions — scrollable */}
      <View style={[styles.quickWrapper, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <FlatList
          horizontal
          data={QUICK_QUESTIONS}
          keyExtractor={(q) => q.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 9, gap: 8 }}
          renderItem={({ item: q }) => (
            <Pressable
              onPress={() => send(q.label)}
              style={[styles.quickBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Feather name={q.icon} size={11} color={colors.mutedForeground} />
              <Text style={[styles.quickText, { color: colors.foreground }]}>{q.label}</Text>
            </Pressable>
          )}
        />
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isTyping ? (
            <Animated.View entering={FadeInLeft.duration(200)} style={styles.msgRow}>
              <View style={[styles.aiAvatar, { backgroundColor: colors.gold }]}>
                <Feather name="cpu" size={11} color="#fff" />
              </View>
              <View style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 }]}>
                <TypingDots color={colors.mutedForeground} />
              </View>
            </Animated.View>
          ) : null
        }
      />

      {/* Input */}
      <View
        style={[
          styles.inputRow,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
            paddingBottom: Platform.OS === "web" ? 16 : insets.bottom + 8,
          },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about any vertical or operation..."
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              color: colors.foreground,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => { if (input.trim()) send(input); }}
        />
        <Pressable
          onPress={() => send(input)}
          disabled={!input.trim() || isTyping}
          style={[
            styles.sendBtn,
            { backgroundColor: input.trim() && !isTyping ? colors.primary : colors.muted },
          ]}
        >
          <Feather name="send" size={16} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.3 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  resetBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  modelBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, alignSelf: "flex-start",
  },
  modelBadgeText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  modelBadgeSep: { width: 1, height: 10, backgroundColor: "rgba(255,255,255,0.2)" },
  statsPills: { flexDirection: "row", gap: 8 },
  statPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  statPillText: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium" },
  quickWrapper: { borderBottomWidth: StyleSheet.hairlineWidth },
  quickBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  quickText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  aiAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  bubble: { maxWidth: "80%", padding: 12, borderRadius: 16, gap: 5 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "flex-end", marginTop: 2 },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1, borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, fontFamily: "Inter_400Regular", maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
