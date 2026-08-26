import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterGrid } from "../components/CharacterGrid";
import { LanguageDropdown } from "../components/LanguageDropdown";
import { LANGUAGES, getLanguage } from "../data/languages";
import { PracticeMode } from "../types";
import {
  ScoreState,
  getLanguageStats,
  getLastIndex,
  getLastSelection,
  loadScores,
  saveLastSelection,
} from "../utils/storage";

const MODE_LABELS: Record<PracticeMode, string> = {
  alphabet: "Alphabets",
  numbers: "Numbers",
};

const MODE_ORDER: PracticeMode[] = ["alphabet", "numbers"];

interface HomeScreenProps {
  onStart: (languageId: string, mode: PracticeMode, startIndex: number) => void;
  onViewScores: () => void;
}

export function HomeScreen({ onStart, onViewScores }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [scores, setScores] = useState<ScoreState>({ languages: {} });
  const [languageId, setLanguageId] = useState(LANGUAGES[0].id);
  const [mode, setMode] = useState<PracticeMode>("alphabet");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadScores().then((s) => {
      if (cancelled) return;
      setScores(s);
      const last = getLastSelection(s);
      // Ignore a saved selection for a language that no longer exists
      // (e.g. temporarily removed) rather than getting stuck on it.
      if (last && getLanguage(last.languageId)) {
        setLanguageId(last.languageId);
        setMode(last.mode);
      }
      setInitialized(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Remember the selection (survives going back to this screen, and
  // relaunching the app) - skipped until the saved selection has loaded
  // so it doesn't get clobbered by the default before that happens.
  useEffect(() => {
    if (initialized) saveLastSelection(languageId, mode);
  }, [languageId, mode, initialized]);

  const language = getLanguage(languageId);
  const availableModes = useMemo(
    () => MODE_ORDER.filter((m) => language?.modes[m]),
    [language]
  );
  useEffect(() => {
    if (availableModes.length > 0 && !availableModes.includes(mode)) {
      setMode(availableModes[0]);
    }
  }, [availableModes, mode]);

  const characters = language?.modes[mode] ?? [];
  const stats = getLanguageStats(scores, languageId);
  const lastIndex = getLastIndex(scores, languageId, mode);
  const hasProgress = lastIndex > 0 && lastIndex < characters.length;
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

      <LanguageDropdown languages={LANGUAGES} selectedId={languageId} onSelect={setLanguageId} />

      <View style={styles.modeTabs}>
        {availableModes.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeTab, mode === m && styles.modeTabActive]}
            onPress={() => setMode(m)}
            activeOpacity={0.85}
          >
            <Text style={[styles.modeTabText, mode === m && styles.modeTabTextActive]}>
              {MODE_LABELS[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionsRow}>
        {hasProgress && (
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => onStart(languageId, mode, lastIndex)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>
              ▶ Resume ({lastIndex + 1}/{characters.length})
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.secondaryAction, !hasProgress && styles.primaryAction]}
          onPress={() => onStart(languageId, mode, 0)}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryActionText, !hasProgress && styles.primaryActionText]}>
            {hasProgress ? "↺ Start again" : "▶ Start practice"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.gridHeading}>Jump to any character</Text>
      <CharacterGrid
        characters={characters}
        mode={mode}
        stats={stats}
        currentIndex={hasProgress ? lastIndex : undefined}
        onSelect={(index) => onStart(languageId, mode, index)}
      />

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
    marginBottom: 16,
  },
  scoreLabel: { color: "#c7d2fe", fontSize: 13 },
  scoreValue: { color: "#ffffff", fontSize: 24, fontWeight: "800", marginTop: 2 },
  scoreLink: { color: "#e0e7ff", fontSize: 13, fontWeight: "600" },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "#eef0fb",
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modeTabActive: { backgroundColor: "#4338ca" },
  modeTabText: { fontSize: 14, fontWeight: "700", color: "#6b7099" },
  modeTabTextActive: { color: "#ffffff" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryAction: {
    flex: 1,
    backgroundColor: "#4338ca",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryActionText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  secondaryAction: {
    flex: 1,
    backgroundColor: "#eef0fb",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryActionText: { color: "#4338ca", fontWeight: "700", fontSize: 14 },
  gridHeading: { fontSize: 14, fontWeight: "700", color: "#1f2340", marginTop: 24, marginBottom: 12 },
  footerNote: { fontSize: 12, color: "#9296b8", textAlign: "center", marginTop: 24, lineHeight: 18 },
});
