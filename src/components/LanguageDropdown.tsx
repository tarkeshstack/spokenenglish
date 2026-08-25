import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LanguageDef } from "../types";

interface LanguageDropdownProps {
  languages: LanguageDef[];
  selectedId: string;
  onSelect: (languageId: string) => void;
}

/** A lightweight custom dropdown (no extra native picker dependency, so it
 * behaves the same on web export and inside the wrapped Android app):
 * a button showing the current language that opens a modal list to pick
 * from. */
export function LanguageDropdown({ languages, selectedId, onSelect }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = languages.find((l) => l.id === selectedId) ?? languages[0];

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={styles.flag}>{selected.flagEmoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{selected.name}</Text>
          <Text style={styles.native}>{selected.nativeName}</Text>
        </View>
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose a language</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[styles.option, lang.id === selectedId && styles.optionSelected]}
                onPress={() => {
                  onSelect(lang.id);
                  setOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.flag}>{lang.flagEmoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{lang.name}</Text>
                  <Text style={styles.native}>{lang.nativeName}</Text>
                </View>
                {lang.id === selectedId && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  flag: { fontSize: 26 },
  name: { fontSize: 16, fontWeight: "700", color: "#1f2340" },
  native: { fontSize: 12, color: "#8b8fb3" },
  chevron: { fontSize: 18, color: "#8b8fb3", fontWeight: "700" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,17,35,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
    gap: 4,
  },
  sheetTitle: { fontSize: 14, fontWeight: "700", color: "#8b8fb3", marginBottom: 8, marginLeft: 4 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  optionSelected: { backgroundColor: "#eef0fb" },
  checkmark: { fontSize: 18, color: "#4338ca", fontWeight: "800" },
});
