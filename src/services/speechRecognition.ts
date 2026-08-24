import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

export async function requestMicPermission(): Promise<boolean> {
  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return result.granted;
}

export function startListening() {
  ExpoSpeechRecognitionModule.start({
    lang: "en-US",
    interimResults: true,
    continuous: false,
    addsPunctuation: true,
    volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
  });
}

export function stopListening() {
  ExpoSpeechRecognitionModule.stop();
}

export function abortListening() {
  ExpoSpeechRecognitionModule.abort();
}
