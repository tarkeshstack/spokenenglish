import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterGrid } from "../components/CharacterGrid";
import type { WritingPadHandle } from "../components/WritingPad";
import { getLanguage } from "../data/languages";
import { PracticeMode } from "../types";
import { MatchResult, scoreAttempt } from "../utils/recognizer";
import { speakCharacter } from "../utils/speech";
import { ScoreState, getLanguageStats, loadScores, recordAttempt, saveLastIndex } from "../utils/storage";

// Lazily imported so its module body (which pulls in @shopify/react-native-skia)
// only evaluates after skiaWebReady has resolved on web - the Skia web binding
// reads the global CanvasKit object once at import time, and importing it
// eagerly at the top of the bundle would run before LoadSkiaWeb() finishes.
const WritingPad = lazy(() =>
  import("../components/WritingPad").then((m) => ({ default: m.WritingPad }))
);

const MODE_LABELS: Record<PracticeMode, string> = {
  alphabet: "Alphabet",
  numbers: "Numbers",
};

const CONGRATS_MESSAGES = [
  "Great job! 🎉",
  "Nicely traced! ✨",
  "You've got it! 🙌",
  "Beautiful writing! 🌟",
  "Perfect! Keep going! 🚀",
];

const TRY_AGAIN_MESSAGES = [
  "Almost there — give it another go.",
  "Close! Try tracing the guide a bit more closely.",
  "Not quite — follow the light gray outline.",
  "Keep practicing, you're getting closer!",
];

function pickRandom(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

interface PracticeScreenProps {
  languageId: string;
  mode: PracticeMode;
  startIndex?: number;
  onExit: () => void;
}

export function PracticeScreen({ languageId, mode, startIndex = 0, onExit }: PracticeScreenProps) {
  const insets = useSafeAreaInsets();
  const language = getLanguage(languageId);
  const characters = language?.modes[mode] ?? [];

  const [index, setIndex] = useState(
    characters.length > 0 ? ((startIndex % characters.length) + characters.length) % characters.length : 0
  );
  const [result, setResult] = useState<MatchResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [scores, setScores] = useState<ScoreState>({ languages: {} });
  const [gridOpen, setGridOpen] = useState(false);
  const padRef = useRef<WritingPadHandle>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadScores().then(setScores);
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  const current = characters[index];

  useEffect(() => {
    if (language && current) {
      speakCharacter(current.display, language.speechLocale);
    }
  }, [language, current]);

  useEffect(() => {
    saveLastIndex(languageId, mode, index);
  }, [languageId, mode, index]);

  const padSize = useMemo(() => {
    const { width, height } = Dimensions.get("window");
    return Math.min(width - 48, height * 0.42, 380);
  }, []);

  if (!language || !current) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No characters available for this mode yet.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onExit}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const goToIndex = (next: number) => {
    setIndex(((next % characters.length) + characters.length) % characters.length);
    setResult(null);
    setMessage(null);
    padRef.current?.clear();
  };

  const handleClear = () => {
    padRef.current?.clear();
    setResult(null);
    setMessage(null);
  };

  const handleCheck = async () => {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) {
      setMessage("Draw the character on the pad first.");
      setResult(null);
      return;
    }
    const userStrokes = pad.getStrokes();
    const match = scoreAttempt(userStrokes, current.strokes);
    setResult(match);
    setMessage(match.matched ? pickRandom(CONGRATS_MESSAGES) : pickRandom(TRY_AGAIN_MESSAGES));

    const { state, pointsAwarded, streak: newStreak } = await recordAttempt(
      languageId,
      mode,
      current.id,
      match.matched,
      match.score
    );
    setScores(state);
    setStreak(newStreak);
    if (match.matched) {
      setSessionPoints((p) => p + pointsAwarded);
      autoAdvanceTimer.current = setTimeout(() => goToIndex(index + 1), 1100);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onExit} hitSlop={12}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerCenter}
          onPress={() => setGridOpen(true)}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Text style={styles.headerTitle}>
            {language.flagEmoji} {language.name} · {MODE_LABELS[mode]}
          </Text>
          <Text style={styles.headerProgress}>
            {index + 1} / {characters.length} · tap to jump ▤
          </Text>
        </TouchableOpacity>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>{sessionPoints} pts</Text>
          {streak > 1 && <Text style={styles.streakText}>🔥 {streak}</Text>}
        </View>
      </View>

      <View style={styles.targetRow}>
        <Text style={styles.targetChar}>{current.display}</Text>
        <TouchableOpacity
          style={styles.speakerButton}
          hitSlop={10}
          onPress={() => speakCharacter(current.display, language.speechLocale)}
        >
          <Text style={styles.speakerIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.padWrapper}>
        <Suspense fallback={<View style={{ width: padSize, height: padSize }} />}>
          <WritingPad ref={padRef} size={padSize} guideStrokes={current.strokes} />
        </Suspense>
      </View>

      <View style={styles.messageArea}>
        {message && (
          <Text style={[styles.message, result?.matched ? styles.messageSuccess : styles.messageRetry]}>
            {message}
          </Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleClear}>
          <Text style={styles.secondaryButtonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCheck}>
          <Text style={styles.primaryButtonText}>Check</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => goToIndex(index + 1)}>
          <Text style={styles.secondaryButtonText}>Skip ›</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={gridOpen} transparent animationType="slide" onRequestClose={() => setGridOpen(false)}>
        <View style={styles.gridBackdrop}>
          <View style={[styles.gridSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridTitle}>Jump to a character</Text>
              <TouchableOpacity onPress={() => setGridOpen(false)} hitSlop={12}>
                <Text style={styles.gridClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.gridScrollContent}>
              <CharacterGrid
                characters={characters}
                mode={mode}
                stats={getLanguageStats(scores, languageId)}
                currentIndex={index}
                onSelect={(next) => {
                  goToIndex(next);
                  setGridOpen(false);
                }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f5fb" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  emptyText: { fontSize: 16, color: "#6b7099", textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backText: { fontSize: 16, color: "#4338ca", fontWeight: "600" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 14, fontWeight: "700", color: "#1f2340" },
  headerProgress: { fontSize: 12, color: "#8b8fb3", marginTop: 2 },
  headerStats: { alignItems: "flex-end", minWidth: 60 },
  headerStatsText: { fontSize: 13, fontWeight: "700", color: "#4338ca" },
  streakText: { fontSize: 12, color: "#d97706", marginTop: 2 },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  targetChar: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "800",
    color: "#1f2340",
  },
  speakerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eef0fb",
    alignItems: "center",
    justifyContent: "center",
  },
  speakerIcon: { fontSize: 18 },
  padWrapper: { alignItems: "center", justifyContent: "center" },
  messageArea: { minHeight: 40, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  message: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  messageSuccess: { color: "#059669" },
  messageRetry: { color: "#b45309" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    paddingVertical: 20,
  },
  primaryButton: {
    backgroundColor: "#4338ca",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    backgroundColor: "#eef0fb",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  secondaryButtonText: { color: "#4338ca", fontWeight: "700", fontSize: 15 },
  gridBackdrop: { flex: 1, backgroundColor: "rgba(15,17,35,0.4)", justifyContent: "flex-end" },
  gridSheet: {
    backgroundColor: "#f4f5fb",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  gridTitle: { fontSize: 16, fontWeight: "800", color: "#1f2340" },
  gridClose: { fontSize: 18, color: "#8b8fb3", fontWeight: "700" },
  gridScrollContent: { paddingBottom: 8 },
});
