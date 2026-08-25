import * as Speech from "expo-speech";

/** Speaks a single character/word, stopping any speech already in
 * progress first so rapid character changes (e.g. tapping Skip
 * repeatedly) don't queue up a pile of overlapping utterances. */
export function speakCharacter(text: string, locale: string): void {
  Speech.stop();
  Speech.speak(text, { language: locale, rate: 0.85 });
}
