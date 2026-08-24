import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radius } from "../theme";

const BAR_COUNT = 5;
const BAR_WEIGHTS = [0.5, 0.8, 1, 0.75, 0.55];
const MAX_HEIGHT = 48;
const MIN_HEIGHT = 6;

type Props = {
  level: number; // 0..1
  active: boolean;
};

export default function Waveform({ level, active }: Props) {
  const animatedValues = useRef(BAR_WEIGHTS.map(() => new Animated.Value(MIN_HEIGHT))).current;

  useEffect(() => {
    const animations = animatedValues.map((value, index) => {
      const target = active
        ? MIN_HEIGHT + level * BAR_WEIGHTS[index] * (MAX_HEIGHT - MIN_HEIGHT)
        : MIN_HEIGHT;
      return Animated.timing(value, {
        toValue: Math.max(MIN_HEIGHT, target),
        duration: 140,
        useNativeDriver: false,
      });
    });
    Animated.parallel(animations).start();
  }, [level, active, animatedValues]);

  return (
    <View style={styles.row}>
      {animatedValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: value,
              backgroundColor: active ? colors.primary : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: MAX_HEIGHT,
  },
  bar: {
    width: 6,
    borderRadius: radius.pill,
  },
});
