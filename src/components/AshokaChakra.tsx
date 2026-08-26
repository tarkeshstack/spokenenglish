import React from "react";
import { StyleSheet, View } from "react-native";

interface AshokaChakraProps {
  size?: number;
  color?: string;
  opacity?: number;
}

const SPOKE_COUNT = 24;
const SPOKES = Array.from({ length: SPOKE_COUNT }, (_, i) => (360 / SPOKE_COUNT) * i);

/** A faint 24-spoke wheel watermark, purely decorative (background flavor
 * for the home screen, evoking the Ashoka Chakra) - built from plain Views
 * rather than an SVG library, since this app only ever ships as a web
 * export and React Native Web passes `transformOrigin` straight through
 * to CSS, which is all a radiating spoke needs. */
export function AshokaChakra({ size = 520, color = "#4338ca", opacity = 0.07 }: AshokaChakraProps) {
  const hubRadius = size * 0.035;
  const spokeLength = size / 2 - hubRadius;

  return (
    <View style={[styles.wrap, { width: size, height: size, opacity }]} pointerEvents="none">
      <View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: color },
        ]}
      />
      {SPOKES.map((angle) => (
        <View
          key={angle}
          style={[
            styles.spoke,
            {
              left: size / 2 - 1,
              top: size / 2,
              height: spokeLength,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.hub,
          {
            width: hubRadius * 2,
            height: hubRadius * 2,
            borderRadius: hubRadius,
            borderColor: color,
            left: size / 2 - hubRadius,
            top: size / 2 - hubRadius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // "relative" (not "absolute") so it stays a normal flex child and its
  // parent can center it - the spokes/hub inside still position
  // themselves relative to THIS view, since it's still a positioning
  // context. An absolutely positioned wrap here would ignore the
  // parent's centering entirely and overflow off one edge instead.
  wrap: { position: "relative" },
  ring: { position: "absolute", borderWidth: 2 },
  spoke: {
    position: "absolute",
    width: 2,
    transformOrigin: "top center",
  },
  hub: { position: "absolute", borderWidth: 2 },
});
