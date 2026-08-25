import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LANGUAGES } from "../data/languages";
import { PracticeMode } from "../types";
import { ScoreState, loadScores, getLanguageStats } from "../utils/storage";

const MODE_LABELS: Record<PracticeMode, string> = {
  alphabet: "Alphabet",
  numbers: "Numbers",
};

interface HomeScreenProps {
  onStart: (languageId: string, mode: PracticeMode) => void;
  onViewScores: () => void;
}

export function HomeScreen({ onStart, onViewScores }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [scores, setScores] = useState<ScoreState>({ languages: {} });

  useEffect(() => {
    let cancelled = false;
    loadScores().then((s) => {
      if (!cancelled) setScores(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPoints = Object.values(scores.languages).reduce((sum, l) => sum + l.points, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
    >
      <Text style={styles.title}>Writing Practice</Text>
      <Text style={styles.subtitle}>Trace letters and numbers with your finger or a stylus</Text>

      <TouchableOpacity style={styles.scoreCard} onPress={onViewScores} activeOpacity={0.8}>
        <View>
          <Text style={styles.scoreLabel}>Total score</Text>
          <Text style={styles.scoreValue}>{totalPoints} pts</Text>
        </View>
        <Text style={styles.scoreLink}>View scoreboard ›</Text>
      </TouchableOpacity>

      {LANGUAGES.map((lang) => {
        const stats = getLanguageStats(scores, lang.id);
        return (
          <View key={lang.id} style={styles.languageCard}>
            <View style={styles.languageHeader}>
              <Text style={styles.flag}>{lang.flagEmoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.languageName}>{lang.name}</Text>
                <Text style={styles.languageNative}>{lang.nativeName}</Text>
              </View>
              <Text style={styles.languagePoints}>{stats.points} pts</Text>
            </View>
            <View style={styles.modeRow}>
              {(Object.keys(lang.modes) as PracticeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={styles.modeButton}
                  onPress={() => onStart(lang.id, mode)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modeButtonText}>{MODE_LABELS[mode]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}

      <Text style={styles.footerNote}>
        Practice guides are simplified stroke outlines to help you learn the basic shape and stroke
        order.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f5fb" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "800", color: "#1f2340" },
  subtitle: { fontSize: 14, color: "#6b7099", marginTop: 4, marginBottom: 20 },
  scoreCard: {
    backgroundColor: "#4338ca",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreLabel: { color: "#c7d2fe", fontSize: 13 },
  scoreValue: { color: "#ffffff", fontSize: 24, fontWeight: "800", marginTop: 2 },
  scoreLink: { color: "#e0e7ff", fontSize: 13, fontWeight: "600" },
  languageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  languageHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  flag: { fontSize: 30, marginRight: 12 },
  languageName: { fontSize: 17, fontWeight: "700", color: "#1f2340" },
  languageNative: { fontSize: 13, color: "#8b8fb3" },
  languagePoints: { fontSize: 14, fontWeight: "700", color: "#4338ca" },
  modeRow: { flexDirection: "row", gap: 10 },
  modeButton: {
    backgroundColor: "#eef0fb",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modeButtonText: { color: "#4338ca", fontWeight: "700", fontSize: 14 },
  footerNote: { fontSize: 12, color: "#9296b8", textAlign: "center", marginTop: 12, lineHeight: 18 },
});
