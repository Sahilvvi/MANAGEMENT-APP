import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

const TOAST_META: Record<ToastType, { icon: keyof typeof Feather.glyphMap; bg: string; border: string; iconColor: string }> = {
  success: { icon: "check-circle", bg: "#0A2010", border: "#30D158", iconColor: "#30D158" },
  error:   { icon: "x-circle",    bg: "#200A0A", border: "#FF453A", iconColor: "#FF453A" },
  warning: { icon: "alert-circle", bg: "#201500", border: "#FF9F0A", iconColor: "#FF9F0A" },
  info:    { icon: "info",         bg: "#0A1628", border: "#C9A84C", iconColor: "#C9A84C" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const meta = TOAST_META[toast.type];
  return (
    <Animated.View
      entering={FadeInDown.duration(320).springify()}
      exiting={FadeOutUp.duration(250)}
      style={[styles.toast, { backgroundColor: meta.bg, borderColor: meta.border }]}
    >
      <Feather name={meta.icon} size={16} color={meta.iconColor} />
      <Text style={[styles.toastText, { color: "#FFFFFF" }]} numberOfLines={2}>
        {toast.message}
      </Text>
      <Pressable onPress={onDismiss} style={styles.toastClose} hitSlop={8}>
        <Feather name="x" size={13} color="rgba(255,255,255,0.5)" />
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast_${++counter.current}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => dismiss(id), 3000);
  }, [dismiss]);

  const topOffset = Platform.OS === "web" ? 70 : insets.top + 8;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.container, { top: topOffset }]} pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
    pointerEvents: "box-none",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 19,
  },
  toastClose: {
    padding: 2,
  },
});
