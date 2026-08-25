import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WritingPad, WritingPadHandle } from "../components/WritingPad";
import { getLanguage } from "../data/languages";
import { PracticeMode } from "../types";
import { MatchResult, scoreAttempt } from "../utils/recognizer";
import { recordAttempt } from "../utils/storage";

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
  onExit: () => void;
}

export function PracticeScreen({ languageId, mode, onExit }: PracticeScreenProps) {
  const insets = useSafeAreaInsets();
  const language = getLanguage(languageId);
  const characters = language?.modes[mode] ?? [];

  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const padRef = useRef<WritingPadHandle>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  const current = characters[index];

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

    const { pointsAwarded, streak: newStreak } = await recordAttempt(
      languageId,
      mode,
      current.id,
      match.matched,
      match.score
    );
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {language.flagEmoji} {language.name} · {MODE_LABELS[mode]}
          </Text>
          <Text style={styles.headerProgress}>
            {index + 1} / {characters.length}
          </Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>{sessionPoints} pts</Text>
          {streak > 1 && <Text style={styles.streakText}>🔥 {streak}</Text>}
        </View>
      </View>

      <Text style={styles.targetChar}>{current.display}</Text>

      <View style={styles.padWrapper}>
        <WritingPad ref={padRef} size={padSize} guideStrokes={current.strokes} />
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
  targetChar: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "800",
    color: "#1f2340",
    marginTop: 4,
    marginBottom: 8,
  },
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
});
