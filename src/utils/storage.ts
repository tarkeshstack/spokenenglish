import AsyncStorage from "@react-native-async-storage/async-storage";
import { PracticeMode } from "../types";

const STORAGE_KEY = "writing_practice_scores_v1";

export interface CharacterStats {
  attempts: number;
  correct: number;
  bestScore: number;
}

export interface LanguageStats {
  points: number;
  attempts: number;
  correct: number;
  currentStreak: number;
  bestStreak: number;
  characters: Record<string, CharacterStats>;
  /** Index of the last character visited in each mode, so practice can
   * resume where it left off instead of always restarting at 0. */
  lastIndex?: Partial<Record<PracticeMode, number>>;
}

export interface ScoreState {
  languages: Record<string, LanguageStats>;
  /** Last language + mode picked on the home screen, so navigating back
   * to it (or relaunching the app) doesn't reset to the default. */
  lastSelection?: { languageId: string; mode: PracticeMode };
}

function emptyState(): ScoreState {
  return { languages: {} };
}

function emptyLanguageStats(): LanguageStats {
  return { points: 0, attempts: 0, correct: 0, currentStreak: 0, bestStreak: 0, characters: {} };
}

export async function loadScores(): Promise<ScoreState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && parsed.languages ? parsed : emptyState();
  } catch {
    return emptyState();
  }
}

async function saveScores(state: ScoreState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const POINTS_PER_CORRECT = 10;
const STREAK_BONUS_PER_STEP = 2;
const MAX_STREAK_BONUS_STEPS = 5;

export interface RecordAttemptResult {
  state: ScoreState;
  pointsAwarded: number;
  streak: number;
}

/** Records one practice attempt and persists the updated totals. */
export async function recordAttempt(
  languageId: string,
  mode: PracticeMode,
  charId: string,
  matched: boolean,
  score: number
): Promise<RecordAttemptResult> {
  const state = await loadScores();
  const lang = state.languages[languageId] ?? emptyLanguageStats();
  const charKey = `${mode}:${charId}`;
  const charStats = lang.characters[charKey] ?? { attempts: 0, correct: 0, bestScore: 0 };

  charStats.attempts += 1;
  charStats.bestScore = Math.max(charStats.bestScore, score);
  lang.attempts += 1;

  let pointsAwarded = 0;
  if (matched) {
    charStats.correct += 1;
    lang.correct += 1;
    lang.currentStreak += 1;
    lang.bestStreak = Math.max(lang.bestStreak, lang.currentStreak);
    const streakSteps = Math.min(lang.currentStreak - 1, MAX_STREAK_BONUS_STEPS);
    pointsAwarded = POINTS_PER_CORRECT + streakSteps * STREAK_BONUS_PER_STEP;
    lang.points += pointsAwarded;
  } else {
    lang.currentStreak = 0;
  }

  lang.characters[charKey] = charStats;
  state.languages[languageId] = lang;
  await saveScores(state);

  return { state, pointsAwarded, streak: lang.currentStreak };
}

export async function resetScores(): Promise<ScoreState> {
  const fresh = emptyState();
  await saveScores(fresh);
  return fresh;
}

export function getLanguageStats(state: ScoreState, languageId: string): LanguageStats {
  return state.languages[languageId] ?? emptyLanguageStats();
}

/** Persists which character index the user was on, so a later "Resume"
 * can pick up from there. Best-effort: called on every character change,
 * so failures are swallowed rather than surfaced. */
export async function saveLastIndex(
  languageId: string,
  mode: PracticeMode,
  index: number
): Promise<void> {
  try {
    const state = await loadScores();
    const lang = state.languages[languageId] ?? emptyLanguageStats();
    lang.lastIndex = { ...lang.lastIndex, [mode]: index };
    state.languages[languageId] = lang;
    await saveScores(state);
  } catch {
    // Not critical - practice still works without a saved position.
  }
}

export function getLastIndex(state: ScoreState, languageId: string, mode: PracticeMode): number {
  return state.languages[languageId]?.lastIndex?.[mode] ?? 0;
}

/** Persists which language + mode was selected on the home screen. */
export async function saveLastSelection(languageId: string, mode: PracticeMode): Promise<void> {
  try {
    const state = await loadScores();
    state.lastSelection = { languageId, mode };
    await saveScores(state);
  } catch {
    // Not critical - the home screen just falls back to the default.
  }
}

export function getLastSelection(
  state: ScoreState
): { languageId: string; mode: PracticeMode } | null {
  return state.lastSelection ?? null;
}
