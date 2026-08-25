import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LANGUAGES } from "../data/languages";
import { ScoreState, getLanguageStats, loadScores, resetScores } from "../utils/storage";

interface ScoreboardScreenProps {
  onBack: () => void;
}

export function ScoreboardScreen({ onBack }: ScoreboardScreenProps) {
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

  const handleReset = () => {
    Alert.alert("Reset all scores?", "This clears your points and progress for every language.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => setScores(await resetScores()),
      },
    ]);
  };

  const totalPoints = Object.values(scores.languages).reduce((sum, l) => sum + l.points, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scoreboard</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total score</Text>
        <Text style={styles.totalValue}>{totalPoints} pts</Text>
      </View>

      {LANGUAGES.map((lang) => {
        const stats = getLanguageStats(scores, lang.id);
        const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
        return (
          <View key={lang.id} style={styles.langCard}>
            <View style={styles.langHeader}>
              <Text style={styles.flag}>{lang.flagEmoji}</Text>
              <Text style={styles.langName}>{lang.name}</Text>
              <Text style={styles.langPoints}>{stats.points} pts</Text>
            </View>
            <View style={styles.statRow}>
              <Stat label="Attempts" value={String(stats.attempts)} />
              <Stat label="Correct" value={String(stats.correct)} />
              <Stat label="Accuracy" value={`${accuracy}%`} />
              <Stat label="Best streak" value={String(stats.bestStreak)} />
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Reset all scores</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f5fb" },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backText: { fontSize: 16, color: "#4338ca", fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "800", color: "#1f2340" },
  totalCard: {
    backgroundColor: "#4338ca",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  totalLabel: { color: "#c7d2fe", fontSize: 13 },
  totalValue: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 2 },
  langCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  langHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  flag: { fontSize: 22, marginRight: 10 },
  langName: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1f2340" },
  langPoints: { fontSize: 14, fontWeight: "700", color: "#4338ca" },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 16, fontWeight: "800", color: "#1f2340" },
  statLabel: { fontSize: 11, color: "#8b8fb3", marginTop: 2 },
  resetButton: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  resetButtonText: { color: "#dc2626", fontWeight: "700", fontSize: 14 },
});
