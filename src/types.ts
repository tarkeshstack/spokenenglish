import { Stroke } from "./utils/geometry";

export type PracticeMode = "alphabet" | "numbers";

export interface CharacterDef {
  /** Stable id used as a storage key, e.g. "A", "3", "०". */
  id: string;
  /** What's shown as the big guide label above the pad. */
  display: string;
  strokes: Stroke[];
}

export interface LanguageDef {
  id: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
  modes: Partial<Record<PracticeMode, CharacterDef[]>>;
}
