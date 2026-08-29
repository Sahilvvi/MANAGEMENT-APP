import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { useData, type Task, type TaskRecurrence } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  low: "#34C759",
  medium: "#FF9500",
  high: "#FF6B00",
  critical: "#FF3B30",
};

const STATUS_LABEL: Record<Task["status"], string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  overdue: "Overdue",
};

const STATUS_COLORS: Record<Task["status"], string> = {
  pending: "#FF9500",
  in_progress: "#0A84FF",
  completed: "#34C759",
  overdue: "#FF3B30",
};

const FILTERS: Array<{ key: "all" | Task["status"]; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
];

function isoToday() {
  return new Date().toISOString().split("T")[0];
}

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tasks, workers, completeTask, addTask } = useData();
  const { showToast } = useToast();

  const isWorker = user?.role === "employee";

  const [filter, setFilter] = useState<"all" | Task["status"]>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAssignee, setNewAssignee] = useState(workers[0]?.id ?? "");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newRecurrence, setNewRecurrence] = useState<TaskRecurrence>("daily");

  const filteredTasks = useMemo(() => {
    const base = isWorker
      ? tasks.filter((t) => t.assigneeId === user?.id)
      : tasks.filter((t) => t.business === "lawn");
    const byStatus = filter === "all" ? base : base.filter((t) => t.status === filter);
    return [...byStatus].sort((a, b) => {
      if (a.status === b.status) return a.dueDate.localeCompare(b.dueDate);
      const order: Record<Task["status"], number> = { pending: 0, in_progress: 1, overdue: 2, completed: 3 };
      return order[a.status] - order[b.status];
    });
  }, [tasks, user, isWorker, filter]);

  const completedCount = filteredTasks.filter((t) => t.status === "completed").length;
  const totalCount = filteredTasks.length;
  const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleComplete = async (task: Task) => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (Platform.OS === "web") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.3,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Allow camera access to complete tasks with photo proof.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.3,
          base64: true,
        });
      }

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const photo = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : (asset.uri ?? "");
      await completeTask(task.id, photo);
      showToast("Task completed and proof uploaded", "success");
    } catch (e) {
      Alert.alert("Error", "Could not capture photo. Please try again.");
    }
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim() || !newAssignee) return;
    const worker = workers.find((w) => w.id === newAssignee);
    await addTask({
      title: newTitle.trim(),
      description: newDesc.trim() || "No description provided",
      assigneeId: newAssignee,
      assigneeName: worker?.name ?? "Unknown",
      business: "lawn",
      priority: newPriority,
      status: "pending",
      recurrence: newRecurrence,
      dueDate: isoToday(),
      assignedBy: user?.name ?? "Manager",
    });
    showToast("Task assigned", "success");
    setNewTitle("");
    setNewDesc("");
    setShowCreate(false);
  };

  const renderTask = ({ item, index }: { item: Task; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(400).springify()}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.leftHeader}>
          <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
          <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>
            {STATUS_LABEL[item.status]}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>{item.dueDate}</Text>
      </View>

      <Text style={[styles.taskTitle, { color: colors.cardForeground }]}>{item.title}</Text>
      <Text style={[styles.taskDesc, { color: colors.mutedForeground }]}>{item.description}</Text>

      {!isWorker && (
        <View style={styles.assigneeRow}>
          <View style={[styles.miniAvatar, { backgroundColor: colors.gold + "20" }]}>
            <Feather name="user" size={12} color={colors.gold} />
          </View>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {item.assigneeName} · {item.recurrence} · {item.priority} priority
          </Text>
        </View>
      )}

      {item.completionPhoto && (
        <Image source={{ uri: item.completionPhoto }} style={styles.photo} resizeMode="cover" />
      )}

      {item.status !== "completed" && isWorker && (
        <Pressable
          onPress={() => handleComplete(item)}
          style={[styles.actionButton, { backgroundColor: colors.success }]}
        >
          <Feather name="camera" size={16} color={colors.successForeground} />
          <Text style={[styles.actionText, { color: colors.successForeground }]}>
            Complete with photo
          </Text>
        </Pressable>
      )}

      {item.status === "completed" && (
        <View style={[styles.doneBadge, { backgroundColor: colors.success + "15" }]}>
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={[styles.doneText, { color: colors.success }]}>
            Completed{item.completedAt ? ` on ${item.completedAt}` : ""}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 20 },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {isWorker ? "My Tasks" : "Assign Tasks"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {isWorker
              ? `${completedCount}/${totalCount} completed today`
              : "Create, track and review daily lawn tasks"}
          </Text>
        </View>
        {!isWorker && (
          <Pressable
            onPress={() => setShowCreate(true)}
            style={[styles.iconButton, { backgroundColor: colors.gold }]}
          >
            <Feather name="plus" size={22} color={colors.primaryForeground} />
          </Pressable>
        )}
      </View>

      {isWorker && (
        <View style={[styles.scoreCard, { backgroundColor: colors.gold + "12" }]}>
          <Text style={[styles.scoreValue, { color: colors.gold }]}>{completionRate}%</Text>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Completion rate</Text>
        </View>
      )}

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.gold : colors.card,
                borderColor: filter === f.key ? colors.gold : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f.key ? colors.primaryForeground : colors.cardForeground },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(t) => t.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            No tasks found for this filter.
          </Text>
        }
      />

      <Modal visible={showCreate} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.cardForeground }]}>New Task</Text>

              <TextInput
                placeholder="Task title"
                placeholderTextColor={colors.mutedForeground}
                value={newTitle}
                onChangeText={setNewTitle}
                style={[styles.input, { color: colors.cardForeground, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                placeholder="Description"
                placeholderTextColor={colors.mutedForeground}
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
                style={[styles.input, { color: colors.cardForeground, borderColor: colors.border, backgroundColor: colors.background, height: 80 }]}
              />

              <Text style={[styles.label, { color: colors.mutedForeground }]}>Assign to</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                {workers.map((w) => (
                  <Pressable
                    key={w.id}
                    onPress={() => setNewAssignee(w.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: newAssignee === w.id ? colors.gold : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: newAssignee === w.id ? colors.primaryForeground : colors.cardForeground, fontFamily: "Inter_500Medium" }}>
                      {w.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: colors.mutedForeground }]}>Priority</Text>
              <View style={styles.pickerRow}>
                {(["low", "medium", "high"] as Task["priority"][]).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setNewPriority(p)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: newPriority === p ? colors.gold : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: newPriority === p ? colors.primaryForeground : colors.cardForeground, fontFamily: "Inter_500Medium", textTransform: "capitalize" }}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.mutedForeground }]}>Recurrence</Text>
              <View style={styles.pickerRow}>
                {(["once", "daily", "weekly", "monthly"] as TaskRecurrence[]).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setNewRecurrence(r)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: newRecurrence === r ? colors.gold : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: newRecurrence === r ? colors.primaryForeground : colors.cardForeground, fontFamily: "Inter_500Medium", textTransform: "capitalize" }}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowCreate(false)}
                  style={[styles.modalButton, { backgroundColor: colors.muted }]}
                >
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreateTask}
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={{ color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }}>Assign</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 4,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  scoreValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
  },
  scoreLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  date: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  taskTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  taskDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  photo: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
  },
  doneText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  empty: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 22,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginBottom: 12,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 6,
  },
  pickerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
