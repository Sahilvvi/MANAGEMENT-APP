import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const SLIDES = [
  {
    icon: "home" as const,
    title: "Operations Hub",
    description:
      "One place to manage every location, worker, and task across your business.",
  },
  {
    icon: "check-circle" as const,
    title: "Track Every Job",
    description:
      "Assign daily work, collect photo proof, and see performance at a glance.",
  },
  {
    icon: "users" as const,
    title: "Built for Teams",
    description:
      "Admins, managers, and workers each get the tools they need.",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.replace("/business");
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    router.replace("/business");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.skipRow}>
        <Pressable onPress={handleSkip} hitSlop={8}>
          <Text style={[styles.skip, { color: colors.mutedForeground }]}>
            Skip
          </Text>
        </Pressable>
      </View>

      <View style={styles.slideArea}>
        <Animated.View
          key={slide.title}
          entering={FadeInUp.duration(500).springify()}
          style={styles.slide}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${colors.gold}20` },
            ]}
          >
            <Feather name={slide.icon} size={48} color={colors.gold} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {slide.title}
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {slide.description}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === step ? colors.gold : colors.border,
                  width: i === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={[
            styles.button,
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
            {isLast ? "Get Started" : "Next"}
          </Text>
          <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  skipRow: {
    alignItems: "flex-end",
    paddingTop: 8,
    paddingBottom: 16,
  },
  skip: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  slideArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    alignItems: "center",
    width: "100%",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  footer: {
    paddingBottom: 32,
    gap: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
});
