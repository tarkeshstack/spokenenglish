import * as Speech from "expo-speech";

export function speak(text: string, onDone?: () => void) {
  Speech.stop();
  Speech.speak(text, {
    language: "en-US",
    pitch: 1.0,
    rate: 0.95,
    onDone,
    onStopped: onDone,
    onError: onDone,
  });
}

export function stopSpeaking() {
  Speech.stop();
}
