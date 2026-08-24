import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../theme";
import type { PracticeStatus } from "../hooks/useSpeechPractice";

type Props = {
  status: PracticeStatus;
  onPress: () => void;
  disabled?: boolean;
};

export default function MicButton({ status, onPress, disabled }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const listening = status === "listening";
  const analyzing = status === "analyzing";

  useEffect(() => {
    if (!listening) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  const backgroundColor = listening
    ? colors.danger
    : analyzing
    ? colors.surfaceAlt
    : colors.primary;

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled || analyzing}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor, opacity: pressed ? 0.85 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={listening ? "Stop speaking" : "Start speaking"}
      >
        <Text style={styles.icon}>{listening ? "⏹" : analyzing ? "…" : "🎤"}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  icon: {
    fontSize: 36,
  },
});
