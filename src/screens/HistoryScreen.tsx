import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../theme";
import { speak } from "../services/tts";
import type { ConversationEntry } from "../types";

type Props = {
  history: ConversationEntry[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
};

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function HistoryItem({ entry, onDelete }: { entry: ConversationEntry; onDelete: (id: string) => void }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.timestamp}>{formatTimestamp(entry.timestamp)}</Text>
        <View style={styles.itemActions}>
          {entry.issueCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{entry.issueCount} fix{entry.issueCount > 1 ? "es" : ""}</Text>
            </View>
          )}
          <Pressable onPress={() => speak(entry.corrected)} hitSlop={8}>
            <Text style={styles.actionIcon}>🔊</Text>
          </Pressable>
          <Pressable onPress={() => onDelete(entry.id)} hitSlop={8}>
            <Text style={styles.actionIcon}>✕</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.originalText}>{entry.original}</Text>
      <Text style={styles.correctedText}>{entry.corrected}</Text>
      {entry.simplified && <Text style={styles.simplifiedText}>Simpler: {entry.simplified}</Text>}
    </View>
  );
}

export default function HistoryScreen({ history, onDelete, onClearAll }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>
            {history.length} practice session{history.length === 1 ? "" : "s"}
          </Text>
        </View>
        {history.length > 0 && (
          <Pressable onPress={onClearAll}>
            <Text style={styles.clearAll}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No practice sessions yet.</Text>
          <Text style={styles.emptySubtext}>Speak on the Practice tab to build your history.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryItem entry={item} onDelete={onDelete} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clearAll: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  badge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  actionIcon: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  originalText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: spacing.xs,
  },
  correctedText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  simplifiedText: {
    color: colors.accent,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
