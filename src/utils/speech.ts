import { TextToSpeech } from "@capacitor-community/text-to-speech";

/** Speaks a single character/word, stopping any speech already in
 * progress first so rapid character changes (e.g. tapping Skip
 * repeatedly) don't queue up a pile of overlapping utterances.
 *
 * Uses the Capacitor TextToSpeech plugin rather than the browser's
 * SpeechSynthesis API directly: inside the wrapped Android app this
 * routes through Android's native TTS engine, which is reliable, while
 * plain `window.speechSynthesis` inside an Android WebView is not - it
 * frequently reports voices/support but never actually produces audio.
 * In a normal browser (e.g. during development) the plugin's own web
 * fallback uses SpeechSynthesis anyway, so behavior there is unchanged. */
export async function speakCharacter(text: string, locale: string): Promise<void> {
  try {
    await TextToSpeech.stop();
    await TextToSpeech.speak({ text, lang: locale, rate: 0.85 });
  } catch {
    // Speech isn't available on this device/browser - fail silently
    // rather than interrupt practice.
  }
}
