import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import PracticeScreen from "./src/screens/PracticeScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import TabBar, { TabKey } from "./src/components/TabBar";
import { useSpeechPractice } from "./src/hooks/useSpeechPractice";
import { colors } from "./src/theme";

export default function App() {
  const [tab, setTab] = useState<TabKey>("practice");
  const practice = useSpeechPractice();

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {tab === "practice" ? (
          <PracticeScreen {...practice} />
        ) : (
          <HistoryScreen
            history={practice.history}
            onDelete={practice.removeHistoryEntry}
            onClearAll={practice.wipeHistory}
          />
        )}
        <TabBar active={tab} onChange={setTab} />
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
