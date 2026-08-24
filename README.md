# SpeakEasy — Spoken English Practice

A simple mobile app for practicing spoken English. Tap the mic, say a
sentence, and the app transcribes it, checks your grammar, suggests a
simpler way to phrase it, and reads the corrected sentence back to you.
Every practice turn is saved to a local history so you can track progress
over time.

## How it works

1. **Tap the mic** — the app asks for microphone/speech permission the first
   time, then starts listening. A waveform animates with your voice volume
   and the live transcript appears as you speak.
2. **Tap the mic again (or pause)** — recognition stops and the transcript is
   finalized.
3. **Analyze** — the transcript is sent to the free
   [LanguageTool](https://languagetool.org) API for grammar/style checking.
   Filler words ("um", "uh", "you know", …) are stripped locally first. The
   app also runs a small local "simplify" pass that swaps wordy phrases
   ("in order to" → "to", "utilize" → "use", …) and splits very long run-on
   sentences.
4. **Read back** — the corrected sentence is spoken aloud automatically
   using on-device text-to-speech, and can be replayed on demand. The
   simplified version can be replayed separately too.
5. **History** — every turn (original, corrected, simplified, number of
   fixes) is saved on-device with `AsyncStorage` and shown on the History
   tab, newest first. Entries can be replayed or deleted individually, or
   the whole history can be cleared.

If the device is offline, the grammar API call fails gracefully and the app
falls back to the local filler-word cleanup and simplify pass only, with a
note shown in the UI ("Offline mode: showing basic suggestions only").

## Tech stack

- [Expo](https://expo.dev) (SDK 57) + React Native + TypeScript
- [`expo-speech-recognition`](https://github.com/jamsch/expo-speech-recognition) —
  on-device speech-to-text with live interim results and volume metering
  (drives the waveform)
- [`expo-speech`](https://docs.expo.dev/versions/latest/sdk/speech/) — text-to-speech
- [`@react-native-async-storage/async-storage`](https://react-native-async-storage.github.io/async-storage/) —
  local conversation history
- [LanguageTool public API](https://languagetool.org/http-api/) — grammar
  checking (no API key required)

No backend/server is required — everything runs on-device except the
grammar check, which calls the free public LanguageTool endpoint directly
from the app.

## Project structure

```
App.tsx                        Root component: tab switcher (Practice/History)
app.json                       Expo config, permissions, speech-recognition plugin
src/
  types.ts                     Shared types (AnalysisResult, ConversationEntry, ...)
  theme.ts                     Colors / spacing / radius tokens
  services/
    speechRecognition.ts       Thin wrapper over ExpoSpeechRecognitionModule
    tts.ts                     Thin wrapper over expo-speech
    grammar.ts                 Filler-word cleanup + LanguageTool call + simplify pass
    history.ts                 AsyncStorage CRUD for conversation history
  hooks/
    useSpeechPractice.ts       Orchestrates mic -> transcript -> analyze -> speak -> save
  components/
    MicButton.tsx              Pulsing circular mic/stop button
    Waveform.tsx                Animated volume-reactive waveform bars
    FeedbackCard.tsx            Grammar issues, corrected + simplified sentence, replay
    TabBar.tsx                  Practice / History tab switcher
  screens/
    PracticeScreen.tsx
    HistoryScreen.tsx
```

## Running it

Install dependencies (already done if you just cloned this repo and ran
`npm install`):

```bash
npm install
```

### Web (fastest way to try the UI)

Speech recognition on web uses the browser's native Web Speech API, which
Chrome and Safari (desktop) support without any extra build step:

```bash
npm run web
```

### iOS / Android — development build required

`expo-speech-recognition` uses native modules, so it **will not work in
Expo Go**. You need a development build:

```bash
npx expo prebuild
npx expo run:ios      # requires macOS + Xcode
npx expo run:android  # requires Android Studio / an emulator or device
```

(Or build with [EAS Build](https://docs.expo.dev/build/introduction/) and
install the resulting dev client on a device.)

### Getting an installable APK (no local Android Studio needed)

This repo includes an `eas.json` with a `preview` profile that produces a
directly-installable `.apk` (not an `.aab`), built in Expo's cloud:

```bash
npm install -g eas-cli
eas login              # free Expo account
eas build -p android --profile preview
```

The first run will prompt to link/create an EAS project (writes an
`extra.eas.projectId` into `app.json` — safe to commit). When the build
finishes, `eas build` prints a download link for the `.apk`; install it on a
device with "install from unknown sources" enabled, or run
`eas build -p android --profile preview --local` to build it on your own
machine instead of in the cloud.

## Notes / limitations

- Grammar correction quality depends on the LanguageTool free tier, which is
  rate-limited for heavy use; for production use, consider a paid
  LanguageTool plan or self-hosting it.
- The "simplify" step is a lightweight rule-based pass (wordy-phrase
  substitution + run-on sentence splitting), not an AI rewrite — it's meant
  to nudge learners toward simpler phrasing, not to be exhaustive.
- Continuous "always listening" conversation mode isn't implemented; each
  turn is a discrete tap-to-speak → feedback cycle by design, to keep the
  interface simple.
