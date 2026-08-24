import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeechRecognitionEvent } from "expo-speech-recognition";
import {
  abortListening,
  requestMicPermission,
  startListening,
  stopListening,
} from "../services/speechRecognition";
import { analyzeSpeech } from "../services/grammar";
import { speak, stopSpeaking } from "../services/tts";
import { loadHistory, saveEntry, deleteEntry, clearHistory } from "../services/history";
import type { AnalysisResult, ConversationEntry } from "../types";

export type PracticeStatus =
  | "idle"
  | "listening"
  | "analyzing"
  | "result"
  | "permission-denied"
  | "error";

export function useSpeechPractice() {
  const [status, setStatus] = useState<PracticeStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const transcriptRef = useRef("");
  const wasStoppedManually = useRef(false);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    transcriptRef.current = text;
    setTranscript(text);
  });

  useSpeechRecognitionEvent("volumechange", (event) => {
    const normalized = Math.max(0, Math.min(1, event.value / 10));
    setVolume(normalized);
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === "no-speech") {
      setStatus("idle");
      return;
    }
    setErrorMessage(event.message || event.error);
    setStatus("error");
  });

  useSpeechRecognitionEvent("end", () => {
    setVolume(0);
    const finalText = transcriptRef.current.trim();
    if (!finalText) {
      setStatus("idle");
      return;
    }
    void runAnalysis(finalText);
  });

  const runAnalysis = useCallback(async (finalText: string) => {
    setStatus("analyzing");
    try {
      const analysis = await analyzeSpeech(finalText);
      setResult(analysis);
      setStatus("result");

      const entry: ConversationEntry = {
        id: `${Date.now()}`,
        timestamp: Date.now(),
        original: analysis.original,
        corrected: analysis.corrected,
        simplified: analysis.simplified,
        issueCount: analysis.issues.length,
      };
      const updated = await saveEntry(entry);
      setHistory(updated);

      speak(analysis.corrected);
    } catch {
      setErrorMessage("Something went wrong while analyzing your speech.");
      setStatus("error");
    }
  }, []);

  const start = useCallback(async () => {
    stopSpeaking();
    setErrorMessage(null);
    setResult(null);
    setTranscript("");
    transcriptRef.current = "";
    wasStoppedManually.current = false;

    const granted = await requestMicPermission();
    if (!granted) {
      setStatus("permission-denied");
      return;
    }
    setStatus("listening");
    startListening();
  }, []);

  const stop = useCallback(() => {
    wasStoppedManually.current = true;
    stopListening();
  }, []);

  const cancel = useCallback(() => {
    abortListening();
    stopSpeaking();
    setStatus("idle");
    setTranscript("");
    transcriptRef.current = "";
  }, []);

  const replay = useCallback((text: string) => {
    speak(text);
  }, []);

  const reset = useCallback(() => {
    stopSpeaking();
    setStatus("idle");
    setResult(null);
    setTranscript("");
    transcriptRef.current = "";
  }, []);

  const removeHistoryEntry = useCallback(async (id: string) => {
    const updated = await deleteEntry(id);
    setHistory(updated);
  }, []);

  const wipeHistory = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  return {
    status,
    transcript,
    volume,
    result,
    history,
    errorMessage,
    start,
    stop,
    cancel,
    reset,
    replay,
    removeHistoryEntry,
    wipeHistory,
  };
}
