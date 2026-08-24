import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import type { AnalysisResult } from "../types";

type Props = {
  result: AnalysisResult;
  onReplay: (text: string) => void;
};

export default function FeedbackCard({ result, onReplay }: Props) {
  const hasIssues = result.issues.length > 0;

  return (
    <ScrollView style={styles.card} contentContainerStyle={styles.cardContent}>
      <Text style={styles.label}>You said</Text>
      <Text style={styles.originalText}>{result.original}</Text>

      {result.offline && (
        <Text style={styles.offlineNote}>
          Offline mode: showing basic suggestions only. Connect to the internet for full grammar
          checks.
        </Text>
      )}

      <View style={styles.divider} />

      <Text style={styles.label}>
        {hasIssues ? `Corrected · ${result.issues.length} suggestion${result.issues.length > 1 ? "s" : ""}` : "Looks good!"}
      </Text>
      <Text style={styles.correctedText}>{result.corrected}</Text>
      <Pressable style={styles.replayButton} onPress={() => onReplay(result.corrected)}>
        <Text style={styles.replayButtonText}>🔊 Play corrected sentence</Text>
      </Pressable>

      {hasIssues && (
        <View style={styles.issueList}>
          {result.issues.map((issue) => (
            <View key={issue.id} style={styles.issueRow}>
              <Text style={styles.issueOriginal}>{issue.original}</Text>
              <Text style={styles.issueArrow}>→</Text>
              <Text style={styles.issueSuggestion}>{issue.suggestion}</Text>
              <Text style={styles.issueMessage}>{issue.message}</Text>
            </View>
          ))}
        </View>
      )}

      {result.simplified && (
        <>
          <View style={styles.divider} />
          <Text style={styles.label}>Simpler way to say it</Text>
          <Text style={styles.simplifiedText}>{result.simplified}</Text>
          <Pressable style={styles.replayButtonSecondary} onPress={() => onReplay(result.simplified!)}>
            <Text style={styles.replayButtonSecondaryText}>🔊 Play simplified sentence</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    maxHeight: 360,
  },
  cardContent: {
    padding: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  originalText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 22,
  },
  offlineNote: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  correctedText: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: "600",
    lineHeight: 26,
  },
  replayButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  replayButtonText: {
    color: colors.background,
    fontWeight: "700",
  },
  replayButtonSecondary: {
    marginTop: spacing.md,
    borderColor: colors.accent,
    borderWidth: 1.5,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  replayButtonSecondaryText: {
    color: colors.accent,
    fontWeight: "700",
  },
  issueList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  issueRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  issueOriginal: {
    color: colors.danger,
    textDecorationLine: "line-through",
    fontSize: 14,
  },
  issueArrow: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  issueSuggestion: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  issueMessage: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  simplifiedText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
});
