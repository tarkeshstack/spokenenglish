import { LanguageDef } from "../types";
import { LATIN_DIGITS, LATIN_LETTERS } from "./templates/latin";
import { DEVANAGARI_DIGITS } from "./templates/devanagari";

const ENGLISH_ALPHABET = Object.keys(LATIN_LETTERS)
  .filter((id) => id !== "Ñ")
  .map((id) => ({ id, display: id, strokes: LATIN_LETTERS[id] }));

const SPANISH_ALPHABET = Object.keys(LATIN_LETTERS).map((id) => ({
  id,
  display: id,
  strokes: LATIN_LETTERS[id],
}));

const LATIN_NUMBERS = Object.keys(LATIN_DIGITS).map((id) => ({
  id,
  display: id,
  strokes: LATIN_DIGITS[id],
}));

const HINDI_NUMBERS = Object.keys(DEVANAGARI_DIGITS).map((id) => ({
  id,
  display: id,
  strokes: DEVANAGARI_DIGITS[id],
}));

export const LANGUAGES: LanguageDef[] = [
  {
    id: "en",
    name: "English",
    nativeName: "English",
    flagEmoji: "🇬🇧",
    modes: { alphabet: ENGLISH_ALPHABET, numbers: LATIN_NUMBERS },
  },
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español",
    flagEmoji: "🇪🇸",
    modes: { alphabet: SPANISH_ALPHABET, numbers: LATIN_NUMBERS },
  },
  {
    id: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flagEmoji: "🇮🇳",
    modes: { numbers: HINDI_NUMBERS },
  },
];

export function getLanguage(id: string): LanguageDef | undefined {
  return LANGUAGES.find((l) => l.id === id);
}
