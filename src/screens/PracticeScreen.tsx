import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MicButton from "../components/MicButton";
import Waveform from "../components/Waveform";
import FeedbackCard from "../components/FeedbackCard";
import { colors, spacing } from "../theme";
import type { useSpeechPractice } from "../hooks/useSpeechPractice";

type Props = ReturnType<typeof useSpeechPractice>;

function statusMessage(props: Props): string {
  switch (props.status) {
    case "idle":
      return "Tap the mic and say a sentence in English";
    case "listening":
      return "Listening… tap again to stop";
    case "analyzing":
      return "Checking your grammar…";
    case "result":
      return "Here's your feedback";
    case "permission-denied":
      return "Microphone permission is required to practice speaking";
    case "error":
      return props.errorMessage ?? "Something went wrong";
    default:
      return "";
  }
}

export default function PracticeScreen(props: Props) {
  const { status, transcript, volume, result, cancel, reset } = props;
  const isListening = status === "listening";
  const showLiveTranscript = isListening && transcript.length > 0;

  const handleMicPress = () => {
    if (status === "listening") {
      props.stop();
    } else if (status === "result" || status === "error" || status === "permission-denied") {
      reset();
      void props.start();
    } else {
      void props.start();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>SpeakEasy</Text>
        <Text style={styles.subtitle}>Practice speaking English out loud</Text>
      </View>

      <View style={styles.statusArea}>
        <Text style={styles.statusText}>{statusMessage(props)}</Text>
        {showLiveTranscript && <Text style={styles.liveTranscript}>{transcript}</Text>}
      </View>

      <View style={styles.micArea}>
        <Waveform level={volume} active={isListening} />
        <MicButton status={status} onPress={handleMicPress} />
        {isListening && (
          <Pressable onPress={cancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.resultArea}>
        {result && <FeedbackCard result={result} onReplay={props.replay} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusArea: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    minHeight: 44,
  },
  statusText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
  },
  liveTranscript: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.sm,
    fontWeight: "500",
  },
  micArea: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  cancelButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    color: colors.danger,
    fontSize: 14,
  },
  resultArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
