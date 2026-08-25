import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PracticeScreen } from "./src/screens/PracticeScreen";
import { ScoreboardScreen } from "./src/screens/ScoreboardScreen";
import { PracticeMode } from "./src/types";
import { skiaWebReady } from "./src/utils/loadSkiaWeb";

type Screen =
  | { name: "home" }
  | { name: "practice"; languageId: string; mode: PracticeMode }
  | { name: "scoreboard" };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [skiaReady, setSkiaReady] = useState(false);

  useEffect(() => {
    skiaWebReady.then(() => setSkiaReady(true));
  }, []);

  if (!skiaReady) return null;

  return (
    <SafeAreaProvider>
      {screen.name === "home" && (
        <HomeScreen
          onStart={(languageId, mode) => setScreen({ name: "practice", languageId, mode })}
          onViewScores={() => setScreen({ name: "scoreboard" })}
        />
      )}
      {screen.name === "practice" && (
        <PracticeScreen
          languageId={screen.languageId}
          mode={screen.mode}
          onExit={() => setScreen({ name: "home" })}
        />
      )}
      {screen.name === "scoreboard" && <ScoreboardScreen onBack={() => setScreen({ name: "home" })} />}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
