import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData, type Task } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  low: "#34C759",
  medium: "#FF9500",
  high: "#FF6B00",
  critical: "#FF3B30",
};

const STATUS_ICON: Record<Task["status"], keyof typeof Feather.glyphMap> = {
  pending: "circle",
  in_progress: "loader",
  completed: "check-circle",
  overdue: "alert-circle",
};

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tasks, updateTaskStatus, addTask } = useData();

  const [filter, setFilter] = useState<"all" | Task["status"]>("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newVertical, setNewVertical] = useState("corporate");

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;

  const role = user?.role ?? "employee";
  const isOwnerLike = role === "owner" || role === "general_manager";
  const isManager = role === "manager";
  const canCreate = isOwnerLike || isManager;

  const myTasks = isOwnerLike
    ? tasks
    : tasks.filter((t) => t.assigneeId === user?.id || t.vertical === user?.vertical);

  const filtered = useMemo(() => {
    let list = filter === "all" ? myTasks : myTasks.filter((t) => t.status === filter);
    if (search.trim())
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.vertical.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [myTasks, filter, search]);

  const counts = useMemo(
    () => ({
      all: myTasks.length,
      pending: myTasks.filter((t) => t.status === "pending").length,
      in_progress: myTasks.filter((t) => t.status === "in_progress").length,
      completed: myTasks.filter((t) => t.status === "completed").length,
      overdue: myTasks.filter((t) => t.status === "overdue").length,
    }),
    [myTasks]
  );

  const handleStatusToggle = async (task: Task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next: Record<Task["status"], Task["status"]> = {
      pending: "in_progress",
      in_progress: "completed",
      completed: "completed",
      overdue: "in_progress",
    };
    await updateTaskStatus(task.id, next[task.status]);
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      assigneeId: user?.id ?? "mgr1",
      assigneeName: user?.name ?? "Manager",
      vertical: newVertical,
      priority: newPriority,
      status: "pending",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setShowCreate(false);
  };

  const FILTERS: { key: "all" | Task["status"]; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "overdue", label: `Overdue (${counts.overdue})` },
    { key: "in_progress", label: `Active (${counts.in_progress})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "completed", label: `Done (${counts.completed})` },
  ];

  const PRIORITY_OPTIONS: Task["priority"][] = ["low", "medium", "high", "critical"];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Tasks</Text>
            <Text style={styles.headerSubtitle}>
              {counts.overdue > 0 ? `${counts.overdue} overdue · ` : ""}
              {counts.in_progress} in progress
            </Text>
          </View>
          {canCreate && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowCreate(true);
              }}
              style={[styles.newTaskBtn, { backgroundColor: colors.gold }]}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.newTaskBtnText}>New</Text>
            </Pressable>
          )}
        </View>

        <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="search" size={15} color="rgba(255,255,255,0.5)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={14} color="rgba(255,255,255,0.5)" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterScroll, { borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => { setFilter(f.key); Haptics.selectionAsync(); }}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.card,
                borderColor: filter === f.key ? colors.primary : colors.border,
              },
            ]}
          >
            {f.key === "overdue" && counts.overdue > 0 && (
              <View style={[styles.chipDot, { backgroundColor: colors.destructive }]} />
            )}
            <Text style={[styles.filterText, { color: filter === f.key ? "#fff" : colors.foreground }]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Task List */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 10,
          paddingBottom: Platform.OS === "web" ? 34 + 60 : 90,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-square" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {filter === "completed" ? "No completed tasks yet" : "All clear"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {canCreate ? "Tap + New to create a task" : "No tasks assigned to you"}
            </Text>
          </View>
        ) : (
          filtered.map((task, idx) => (
            <Animated.View key={task.id} entering={FadeInDown.duration(300).delay(idx * 40)}>
              <Pressable
                onPress={() => handleStatusToggle(task)}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      task.status === "overdue"
                        ? colors.destructive + "44"
                        : colors.border,
                  },
                ]}
              >
                <View style={styles.taskTop}>
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[task.priority] }]} />
                  <Text
                    style={[
                      styles.taskTitle,
                      {
                        color: colors.foreground,
                        textDecorationLine:
                          task.status === "completed" ? "line-through" : "none",
                        opacity: task.status === "completed" ? 0.5 : 1,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <Feather
                    name={STATUS_ICON[task.status]}
                    size={18}
                    color={
                      task.status === "completed"
                        ? colors.success
                        : task.status === "overdue"
                        ? colors.destructive
                        : task.status === "in_progress"
                        ? colors.warning
                        : colors.mutedForeground
                    }
                  />
                </View>

                {task.description.length > 0 && (
                  <Text style={[styles.taskDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {task.description}
                  </Text>
                )}

                <View style={styles.taskFooter}>
                  <View style={[styles.verticalPill, { backgroundColor: colors.primary + "12" }]}>
                    <Text style={[styles.verticalText, { color: colors.primary }]}>{task.vertical}</Text>
                  </View>

                  <View style={[styles.priorityPill, { backgroundColor: PRIORITY_COLOR[task.priority] + "18" }]}>
                    <Text style={[styles.priorityText, { color: PRIORITY_COLOR[task.priority] }]}>
                      {task.priority}
                    </Text>
                  </View>

                  {isOwnerLike && (
                    <Text style={[styles.assignee, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {task.assigneeName.split(" ")[0]}
                    </Text>
                  )}

                  <View style={{ flex: 1 }} />

                  <View
                    style={[
                      styles.dueBadge,
                      {
                        backgroundColor:
                          task.status === "overdue" ? colors.destructive + "12" : colors.muted,
                      },
                    ]}
                  >
                    <Feather
                      name="calendar"
                      size={10}
                      color={task.status === "overdue" ? colors.destructive : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.dueText,
                        {
                          color:
                            task.status === "overdue" ? colors.destructive : colors.mutedForeground,
                        },
                      ]}
                    >
                      {task.dueDate}
                    </Text>
                  </View>
                </View>

                {task.status !== "completed" && task.status !== "overdue" && (
                  <View style={[styles.actionHint, { borderTopColor: colors.border }]}>
                    <Feather name="arrow-right" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.actionHintText, { color: colors.mutedForeground }]}>
                      Tap to mark as {task.status === "pending" ? "in progress" : "complete"}
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Create Task Modal */}
      <Modal
        visible={showCreate}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreate(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Animated.View entering={FadeInUp.duration(300)} style={{ gap: 16 }}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

              <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Task</Text>

              {/* Title */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Title *</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Task title..."
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textField, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
                  autoFocus
                />
              </View>

              {/* Description */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Description</Text>
                <TextInput
                  value={newDesc}
                  onChangeText={setNewDesc}
                  placeholder="Optional details..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                  style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
                />
              </View>

              {/* Priority */}
              <View style={{ gap: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Priority</Text>
                <View style={styles.priorityRow}>
                  {PRIORITY_OPTIONS.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => { setNewPriority(p); Haptics.selectionAsync(); }}
                      style={[
                        styles.priorityOption,
                        {
                          backgroundColor:
                            newPriority === p ? PRIORITY_COLOR[p] + "22" : colors.secondary,
                          borderColor:
                            newPriority === p ? PRIORITY_COLOR[p] : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.priorityOptionText, { color: newPriority === p ? PRIORITY_COLOR[p] : colors.mutedForeground }]}>
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Vertical */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Vertical</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {["corporate", "healthcare", "technology", "agriculture", "mining", "petroleum", "hospitality", "ngo", "realestate"].map((v) => (
                    <Pressable
                      key={v}
                      onPress={() => { setNewVertical(v); Haptics.selectionAsync(); }}
                      style={[
                        styles.verticalOption,
                        {
                          backgroundColor: newVertical === v ? colors.primary : colors.secondary,
                          borderColor: newVertical === v ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.verticalOptionText, { color: newVertical === v ? "#fff" : colors.foreground }]}>
                        {v}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowCreate(false)}
                  style={[styles.modalCancelBtn, { backgroundColor: colors.secondary }]}
                >
                  <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreateTask}
                  disabled={!newTitle.trim()}
                  style={[styles.modalSubmitBtn, { backgroundColor: newTitle.trim() ? colors.primary : colors.muted }]}
                >
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.modalSubmitText}>Create Task</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  newTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newTaskBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 14, fontFamily: "Inter_400Regular" },
  filterScroll: { maxHeight: 54, borderBottomWidth: StyleSheet.hairlineWidth },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  taskCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  taskTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  taskTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1, letterSpacing: -0.2 },
  taskDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginLeft: 16 },
  taskFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 16, flexWrap: "wrap" },
  verticalPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  verticalText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  priorityPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "capitalize" },
  assignee: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dueText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  actionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginLeft: 16,
  },
  actionHintText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  textField: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  priorityOptionText: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  verticalOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  verticalOptionText: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "capitalize" },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalSubmitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    borderRadius: 12,
  },
  modalSubmitText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
