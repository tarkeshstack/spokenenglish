import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export type TabKey = "practice" | "history";

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "practice", label: "Practice", icon: "🎙️" },
  { key: "history", label: "History", icon: "🗂️" },
];

export default function TabBar({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)}>
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: spacing.sm,
    gap: 2,
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
