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
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData, type Asset } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const STATUS_COLOR: Record<Asset["status"], string> = {
  operational: "#34C759",
  maintenance: "#FF9500",
  retired: "#8E8E93",
  available: "#007AFF",
};

const STATUS_ICON: Record<Asset["status"], keyof typeof Feather.glyphMap> = {
  operational: "check-circle",
  maintenance: "tool",
  retired: "archive",
  available: "package",
};

const TYPE_ICON: Record<Asset["type"], keyof typeof Feather.glyphMap> = {
  fixed: "anchor",
  movable: "truck",
  consumable: "package",
};

export default function AssetsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { assets } = useData();
  const [typeFilter, setTypeFilter] = useState<"all" | Asset["type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Asset["status"]>("all");
  const [selected, setSelected] = useState<(typeof assets)[0] | null>(null);

  const topPad = Platform.OS === "web" ? 67 + 16 : insets.top + 16;

  const filtered = useMemo(() => {
    let list = typeFilter === "all" ? assets : assets.filter((a) => a.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    return list;
  }, [assets, typeFilter, statusFilter]);

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const maintenanceCount = assets.filter((a) => a.status === "maintenance").length;
  const operationalCount = assets.filter((a) => a.status === "operational").length;

  const fmt = (n: number) =>
    n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

  const TYPE_FILTERS: { key: "all" | Asset["type"]; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: "all", label: "All", icon: "grid" },
    { key: "fixed", label: "Fixed", icon: "anchor" },
    { key: "movable", label: "Movable", icon: "truck" },
    { key: "consumable", label: "Consumable", icon: "package" },
  ];

  const STATUS_FILTERS: { key: "all" | Asset["status"]; label: string }[] = [
    { key: "all", label: "Any Status" },
    { key: "operational", label: "Operational" },
    { key: "maintenance", label: "Maintenance" },
    { key: "available", label: "Available" },
    { key: "retired", label: "Retired" },
  ];

  const getDaysToMaintenance = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <Text style={styles.headerTitle}>Assets</Text>
        <Text style={styles.headerSubtitle}>{assets.length} registered · {fmt(totalValue)} total value</Text>

        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{fmt(totalValue)}</Text>
            <Text style={styles.headerStatLabel}>Portfolio</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatValue, { color: "#34C759" }]}>{operationalCount}</Text>
            <Text style={styles.headerStatLabel}>Operational</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatValue, { color: "#FF9500" }]}>{maintenanceCount}</Text>
            <Text style={styles.headerStatLabel}>Maintenance</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{assets.length}</Text>
            <Text style={styles.headerStatLabel}>Registered</Text>
          </View>
        </View>
      </View>

      {/* Filter row */}
      <View style={[styles.filterWrapper, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
          {TYPE_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => { setTypeFilter(f.key); Haptics.selectionAsync(); }}
              style={[styles.filterChip, {
                backgroundColor: typeFilter === f.key ? colors.primary : colors.secondary,
                borderColor: typeFilter === f.key ? colors.primary : colors.border,
              }]}
            >
              <Feather name={f.icon} size={12} color={typeFilter === f.key ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.filterText, { color: typeFilter === f.key ? "#fff" : colors.foreground }]}>
                {f.label}
              </Text>
            </Pressable>
          ))}

          <View style={[styles.filterSep, { backgroundColor: colors.border }]} />

          {STATUS_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => { setStatusFilter(f.key as any); Haptics.selectionAsync(); }}
              style={[styles.filterChip, {
                backgroundColor: statusFilter === f.key
                  ? (f.key === "all" ? colors.primary : STATUS_COLOR[f.key as Asset["status"]])
                  : colors.secondary,
                borderColor: statusFilter === f.key ? "transparent" : colors.border,
              }]}
            >
              <Text style={[styles.filterText, { color: statusFilter === f.key ? "#fff" : colors.foreground }]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Asset list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="box" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No assets found</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Try changing your filters</Text>
          </View>
        ) : (
          filtered.map((asset, idx) => {
            const daysLeft = getDaysToMaintenance(asset.nextMaintenance);
            const urgentMaint = daysLeft <= 14 && asset.status !== "maintenance";
            return (
              <Animated.View key={asset.id} entering={FadeInDown.duration(300).delay(idx * 40)}>
                <Pressable
                  onPress={() => { setSelected(asset); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[styles.assetCard, {
                    backgroundColor: colors.card,
                    borderColor: urgentMaint
                      ? colors.warning + "55"
                      : asset.status === "maintenance"
                      ? colors.warning + "44"
                      : colors.border,
                  }]}
                >
                  {/* Top row */}
                  <View style={styles.assetTop}>
                    <View style={[styles.assetIcon, { backgroundColor: colors.primary + "12" }]}>
                      <Feather name={TYPE_ICON[asset.type]} size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.assetName, { color: colors.foreground }]} numberOfLines={1}>
                        {asset.name}
                      </Text>
                      <Text style={[styles.assetCategory, { color: colors.mutedForeground }]}>
                        {asset.category} · {asset.vertical}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, {
                      backgroundColor: STATUS_COLOR[asset.status] + "18",
                      borderColor: STATUS_COLOR[asset.status] + "44",
                    }]}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[asset.status] }]} />
                      <Text style={[styles.statusText, { color: STATUS_COLOR[asset.status] }]}>
                        {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Details row */}
                  <View style={[styles.assetDetails, { borderTopColor: colors.border }]}>
                    <View style={styles.detailItem}>
                      <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{asset.location}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Feather name="dollar-sign" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{fmt(asset.value)}</Text>
                    </View>
                    <View style={[styles.detailItem, { flex: 0 }]}>
                      <Feather name="tag" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.detailText, { color: colors.mutedForeground, textTransform: "capitalize" }]}>
                        {asset.type}
                      </Text>
                    </View>
                  </View>

                  {/* Maintenance row */}
                  <View style={styles.maintenanceRow}>
                    <View style={styles.maintItem}>
                      <Text style={[styles.maintLabel, { color: colors.mutedForeground }]}>Last Service</Text>
                      <Text style={[styles.maintValue, { color: colors.foreground }]}>{asset.lastMaintenance}</Text>
                    </View>
                    <View style={[styles.maintDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.maintItem}>
                      <Text style={[styles.maintLabel, { color: colors.mutedForeground }]}>Next Service</Text>
                      <Text style={[styles.maintValue, {
                        color: urgentMaint ? colors.warning : asset.status === "maintenance" ? colors.warning : colors.foreground,
                      }]}>
                        {urgentMaint ? `${daysLeft}d` : asset.nextMaintenance}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      style={[styles.scheduleBtn, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "22" }]}
                    >
                      <Feather name="tool" size={12} color={colors.primary} />
                      <Text style={[styles.scheduleBtnText, { color: colors.primary }]}>Schedule</Text>
                    </Pressable>
                  </View>

                  {urgentMaint && (
                    <View style={[styles.urgentBanner, { backgroundColor: colors.warning + "12", borderColor: colors.warning + "30" }]}>
                      <Feather name="alert-triangle" size={12} color={colors.warning} />
                      <Text style={[styles.urgentText, { color: colors.warning }]}>
                        Maintenance due in {daysLeft} days — schedule soon
                      </Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* Asset detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            {selected && (
              <Animated.View entering={FadeInUp.duration(300)} style={{ gap: 16 }}>
                <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

                <View style={styles.assetDetailHeader}>
                  <View style={[styles.assetDetailIcon, { backgroundColor: colors.primary + "15" }]}>
                    <Feather name={TYPE_ICON[selected.type]} size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.assetDetailName, { color: colors.foreground }]}>{selected.name}</Text>
                    <Text style={[styles.assetDetailCat, { color: colors.mutedForeground }]}>
                      {selected.category} · {selected.vertical}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: STATUS_COLOR[selected.status] + "18",
                    borderColor: STATUS_COLOR[selected.status] + "44",
                  }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[selected.status] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLOR[selected.status] }]}>
                      {selected.status}
                    </Text>
                  </View>
                </View>

                <View style={[styles.assetDetailGrid, { borderColor: colors.border }]}>
                  {[
                    { label: "Asset Value", value: fmt(selected.value) },
                    { label: "Location", value: selected.location },
                    { label: "Asset Type", value: selected.type },
                    { label: "Last Service", value: selected.lastMaintenance },
                    { label: "Next Service", value: selected.nextMaintenance },
                    { label: "Vertical", value: selected.vertical },
                  ].map((row) => (
                    <View key={row.label} style={[styles.gridCell, { borderColor: colors.border }]}>
                      <Text style={[styles.gridLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                      <Text style={[styles.gridValue, { color: colors.foreground }]}>{row.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.assetActions}>
                  {[
                    { icon: "tool" as const, label: "Schedule Maintenance" },
                    { icon: "file-text" as const, label: "Service Log" },
                    { icon: "edit-2" as const, label: "Edit Details" },
                  ].map((action) => (
                    <Pressable
                      key={action.label}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected(null); }}
                      style={[styles.assetAction, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                    >
                      <Feather name={action.icon} size={16} color={colors.primary} />
                      <Text style={[styles.assetActionText, { color: colors.foreground }]}>{action.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={() => setSelected(null)}
                  style={[styles.closeBtn, { backgroundColor: colors.secondary }]}
                >
                  <Text style={[styles.closeBtnText, { color: colors.foreground }]}>Close</Text>
                </Pressable>
              </Animated.View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 4 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular", marginBottom: 12 },
  headerStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  headerStat: { flex: 1, alignItems: "center", gap: 3 },
  headerStatValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  headerStatLabel: { fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  headerStatDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  filterWrapper: { borderBottomWidth: StyleSheet.hairlineWidth },
  filterChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  filterSep: { width: 1, height: 20, alignSelf: "center" },
  assetCard: {
    borderRadius: 14, borderWidth: 1, padding: 14, gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  assetTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  assetIcon: { width: 42, height: 42, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  assetName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  assetCategory: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  assetDetails: {
    flexDirection: "row", gap: 12, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth, flexWrap: "wrap",
  },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  detailText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  maintenanceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  maintItem: { flex: 1, gap: 2 },
  maintLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  maintValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  maintDivider: { width: 1, height: 28 },
  scheduleBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
  },
  scheduleBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  urgentBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    padding: 8, borderRadius: 8, borderWidth: 1,
  },
  urgentText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  assetDetailHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  assetDetailIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  assetDetailName: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  assetDetailCat: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  assetDetailGrid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  gridCell: {
    width: "50%", padding: 12,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 3,
  },
  gridLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  gridValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  assetActions: { gap: 8 },
  assetAction: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 13, borderRadius: 12, borderWidth: 1,
  },
  assetActionText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  closeBtn: { padding: 14, borderRadius: 12, alignItems: "center" },
  closeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
