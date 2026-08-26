import { CharacterDef, LanguageDef } from "../types";
import { Stroke } from "../utils/geometry";
import { LATIN_DIGITS, LATIN_LETTERS } from "./templates/latin";
import { DEVANAGARI_DIGITS } from "./templates/devanagari";
import { DEVANAGARI_VOWELS, DEVANAGARI_CONSONANTS } from "./templates/devanagariAlphabet";
import { TAMIL_VOWELS, TAMIL_CONSONANTS, TAMIL_DIGITS } from "./templates/tamil";
import { KANNADA_VOWELS, KANNADA_CONSONANTS, KANNADA_DIGITS } from "./templates/kannada";

function charsFrom(...sources: Record<string, Stroke[]>[]): CharacterDef[] {
  const chars: CharacterDef[] = [];
  for (const source of sources) {
    for (const id of Object.keys(source)) {
      chars.push({ id, display: id, strokes: source[id] });
    }
  }
  return chars;
}

const ENGLISH_ALPHABET = Object.keys(LATIN_LETTERS)
  .filter((id) => id !== "Ñ")
  .map((id) => ({ id, display: id, strokes: LATIN_LETTERS[id] }));

const LATIN_NUMBERS = charsFrom(LATIN_DIGITS);
const HINDI_ALPHABET = charsFrom(DEVANAGARI_VOWELS, DEVANAGARI_CONSONANTS);
const HINDI_NUMBERS = charsFrom(DEVANAGARI_DIGITS);
const TAMIL_ALPHABET = charsFrom(TAMIL_VOWELS, TAMIL_CONSONANTS);
const TAMIL_NUMBERS = charsFrom(TAMIL_DIGITS);
const KANNADA_ALPHABET = charsFrom(KANNADA_VOWELS, KANNADA_CONSONANTS);
const KANNADA_NUMBERS = charsFrom(KANNADA_DIGITS);

export const LANGUAGES: LanguageDef[] = [
  {
    id: "en",
    name: "English",
    nativeName: "English",
    flagEmoji: "🇬🇧",
    speechLocale: "en-US",
    modes: { alphabet: ENGLISH_ALPHABET, numbers: LATIN_NUMBERS },
  },
  // Spanish removed for now - LATIN_LETTERS/LATIN_NUMBERS below are still
  // used by English, so re-adding it later is just restoring this entry.
  {
    id: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flagEmoji: "🇮🇳",
    speechLocale: "hi-IN",
    modes: { alphabet: HINDI_ALPHABET, numbers: HINDI_NUMBERS },
  },
  {
    id: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    flagEmoji: "🇮🇳",
    speechLocale: "ta-IN",
    modes: { alphabet: TAMIL_ALPHABET, numbers: TAMIL_NUMBERS },
  },
  {
    id: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flagEmoji: "🇮🇳",
    speechLocale: "kn-IN",
    modes: { alphabet: KANNADA_ALPHABET, numbers: KANNADA_NUMBERS },
  },
];

export function getLanguage(id: string): LanguageDef | undefined {
  return LANGUAGES.find((l) => l.id === id);
}
