import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CharacterDef, PracticeMode } from "../types";
import { LanguageStats } from "../utils/storage";

interface CharacterGridProps {
  characters: CharacterDef[];
  mode: PracticeMode;
  stats: LanguageStats;
  currentIndex?: number;
  onSelect: (index: number) => void;
}

/** Grid of every character in the current language/mode, so the user can
 * jump straight to any one of them instead of only stepping through with
 * Skip. Cells for characters already answered correctly at least once are
 * marked with a check. */
export function CharacterGrid({ characters, mode, stats, currentIndex, onSelect }: CharacterGridProps) {
  return (
    <View style={styles.grid}>
      {characters.map((char, index) => {
        const charStats = stats.characters[`${mode}:${char.id}`];
        const done = (charStats?.correct ?? 0) > 0;
        const active = index === currentIndex;
        return (
          <TouchableOpacity
            key={char.id}
            style={[styles.cell, active && styles.cellActive, done && styles.cellDone]}
            onPress={() => onSelect(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cellText, active && styles.cellTextActive]}>{char.display}</Text>
            {done && !active && <View style={styles.doneDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#eef0fb",
    alignItems: "center",
    justifyContent: "center",
  },
  cellActive: { backgroundColor: "#4338ca" },
  cellDone: { backgroundColor: "#e0f2e9" },
  cellText: { fontSize: 20, fontWeight: "700", color: "#1f2340" },
  cellTextActive: { color: "#ffffff" },
  doneDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#059669",
  },
});
