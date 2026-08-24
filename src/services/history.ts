import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ConversationEntry } from "../types";

const STORAGE_KEY = "speakeasy.conversation_history";

export async function loadHistory(): Promise<ConversationEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ConversationEntry[];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export async function saveEntry(entry: ConversationEntry): Promise<ConversationEntry[]> {
  const existing = await loadHistory();
  const updated = [entry, ...existing];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteEntry(id: string): Promise<ConversationEntry[]> {
  const existing = await loadHistory();
  const updated = existing.filter((entry) => entry.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
