import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
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
import { useData, type Issue } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { useColors } from "@/hooks/useColors";

const STATUS_COLOR: Record<Issue["status"], string> = {
  open: "#F59E0B",
  approved: "#22C55E",
  rejected: "#EF4444",
  resolved: "#3B82F6",
};

export default function IssuesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { issues, addIssue, updateIssueStatus } = useData();
  const { showToast } = useToast();

  const isAdmin = user?.role === "owner";
  const isManager = user?.role === "manager";

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();

  const filteredIssues = issues.filter((i) => i.business === "lawn");

  const handlePickPhoto = async () => {
    try {
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });
      if (libraryStatus !== "granted" && result.canceled) {
        Alert.alert("Permission needed", "Allow gallery access to attach a photo.");
        return;
      }
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setPhoto(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : (asset.uri ?? ""));
    } catch (e) {
      Alert.alert("Error", "Could not pick image.");
    }
  };

  const handleSubmit = async () => {
    const costValue = parseFloat(cost) || 0;
    if (!title.trim()) return;
    await addIssue({
      title: title.trim(),
      description: description.trim() || "No description provided",
      cost: costValue,
      reportedBy: user?.name ?? "Manager",
      status: "open",
      business: "lawn",
      photo,
    });
    showToast("Issue reported", "success");
    setTitle("");
    setDescription("");
    setCost("");
    setPhoto(undefined);
    setShowCreate(false);
  };

  const handleStatus = async (issue: Issue, status: Issue["status"]) => {
    await updateIssueStatus(issue.id, status);
    showToast(`Issue marked ${status}`, "success");
  };

  const renderIssue = ({ item, index }: { item: Issue; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(400).springify()}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>{item.status.toUpperCase()}</Text>
        {item.cost > 0 && <Text style={[styles.cost, { color: colors.primary }]}>₹{item.cost}</Text>}
      </View>
      <Text style={[styles.issueTitle, { color: colors.cardForeground }]}>{item.title}</Text>
      <Text style={[styles.issueDesc, { color: colors.mutedForeground }]}>{item.description}</Text>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>Reported by {item.reportedBy} · {item.date}</Text>
      {item.photo && <Image source={{ uri: item.photo }} style={styles.photo} resizeMode="cover" />}

      {isAdmin && item.status === "open" && (
        <View style={styles.actions}>
          <Pressable onPress={() => handleStatus(item, "approved")} style={[styles.actionButton, { backgroundColor: colors.success }]}>
            <Feather name="check" size={16} color={colors.successForeground} />
            <Text style={[styles.actionText, { color: colors.successForeground }]}>Approve</Text>
          </Pressable>
          <Pressable onPress={() => handleStatus(item, "rejected")} style={[styles.actionButton, { backgroundColor: colors.destructive }]}>
            <Feather name="x" size={16} color={colors.destructiveForeground} />
            <Text style={[styles.actionText, { color: colors.destructiveForeground }]}>Reject</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.foreground }]}>Issues</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {isAdmin ? "Review and approve maintenance reports" : "Report maintenance or extra costs"}
          </Text>
        </View>
        {isManager && (
          <Pressable onPress={() => setShowCreate(true)} style={[styles.iconButton, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={22} color={colors.primaryForeground} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredIssues}
        keyExtractor={(i) => i.id}
        renderItem={renderIssue}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.mutedForeground }]}>No issues reported yet.</Text>}
      />

      <Modal visible={showCreate} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <ScrollView style={[styles.modal, { backgroundColor: colors.card }]} contentContainerStyle={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.cardForeground }]}>Report Issue</Text>
            <TextInput
              placeholder="Issue title"
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
              style={[styles.input, { color: colors.cardForeground, borderColor: colors.border, backgroundColor: colors.background }]}
            />
            <TextInput
              placeholder="Description"
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              style={[styles.input, { color: colors.cardForeground, borderColor: colors.border, backgroundColor: colors.background, height: 80 }]}
            />
            <TextInput
              placeholder="Estimated cost (₹)"
              placeholderTextColor={colors.mutedForeground}
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
              style={[styles.input, { color: colors.cardForeground, borderColor: colors.border, backgroundColor: colors.background }]}
            />

            <Pressable
              onPress={handlePickPhoto}
              style={[styles.photoButton, { borderColor: colors.border, backgroundColor: colors.background }]}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoThumbnail} />
              ) : (
                <>
                  <Feather name="camera" size={20} color={colors.mutedForeground} />
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>Add photo</Text>
                </>
              )}
            </Pressable>

            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowCreate(false)} style={[styles.modalButton, { backgroundColor: colors.muted }]}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmit} style={[styles.modalButton, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }}>Submit</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 0,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 8,
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
  },
  status: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cost: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  issueTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  issueDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  photo: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
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
    padding: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    maxHeight: "90%",
  },
  modalContent: {
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  photoButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
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
