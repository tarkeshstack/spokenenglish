import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Chip {
  char: string;
  color: string;
}

const CHIPS: Chip[] = [
  { char: "A", color: "#2E7D4F" }, // English
  { char: "अ", color: "#D98C22" }, // Hindi
  { char: "அ", color: "#B33951" }, // Tamil
  { char: "ಅ", color: "#1F8A70" }, // Kannada
];

/** Purely decorative row of colorful rounded-square language chips above
 * the home screen title. */
export function LanguageChips() {
  return (
    <View style={styles.row} pointerEvents="none">
      {CHIPS.map((chip) => (
        <View key={chip.char} style={[styles.chip, { backgroundColor: chip.color }]}>
          <Text style={styles.chipText}>{chip.char}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 16 },
  chip: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipText: { color: "#ffffff", fontSize: 22, fontWeight: "700" },
});
