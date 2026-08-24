import type { AnalysisResult, GrammarIssue } from "../types";

const LANGUAGETOOL_ENDPOINT = "https://api.languagetool.org/v2/check";
const REQUEST_TIMEOUT_MS = 8000;

const FILLER_WORDS = [
  "um",
  "umm",
  "uh",
  "uhh",
  "erm",
  "hmm",
  "you know",
  "i mean",
  "sort of",
  "kind of",
];

// Wordy phrase -> simpler replacement, applied case-insensitively.
const SIMPLIFY_PHRASES: [RegExp, string][] = [
  [/\bin order to\b/gi, "to"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bat this point in time\b/gi, "now"],
  [/\bin the event that\b/gi, "if"],
  [/\ba large number of\b/gi, "many"],
  [/\bfor the purpose of\b/gi, "to"],
  [/\butilize\b/gi, "use"],
  [/\butilized\b/gi, "used"],
  [/\bcommence\b/gi, "start"],
  [/\bterminate\b/gi, "end"],
  [/\bsubsequently\b/gi, "later"],
  [/\bnumerous\b/gi, "many"],
  [/\bassistance\b/gi, "help"],
  [/\bpurchase\b/gi, "buy"],
  [/\bregarding\b/gi, "about"],
  [/\bnevertheless\b/gi, "still"],
];

function stripFillers(text: string): string {
  let cleaned = text;
  for (const filler of FILLER_WORDS) {
    const pattern = new RegExp(`\\b${filler.replace(/\s+/g, "\\s+")}\\b[,]?\\s*`, "gi");
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/\s+/g, " ").replace(/\s+([.,!?])/g, "$1").trim();
}

function capitalizeAndPunctuate(text: string): string {
  let result = text.trim();
  if (!result) return result;
  result = result.charAt(0).toUpperCase() + result.slice(1);
  if (!/[.!?]$/.test(result)) {
    result += ".";
  }
  return result;
}

function simplifyText(text: string): string {
  let simplified = text;
  for (const [pattern, replacement] of SIMPLIFY_PHRASES) {
    simplified = simplified.replace(pattern, replacement);
  }
  // Split very long run-on sentences at "and"/"but" conjunctions into two sentences.
  const words = simplified.split(/\s+/);
  if (words.length > 28) {
    const midpoint = Math.floor(words.length / 2);
    for (let i = midpoint; i < words.length - 3; i++) {
      if (/^(and|but|so)$/i.test(words[i])) {
        const before = words.slice(0, i).join(" ").replace(/[,]?$/, "");
        const after = words.slice(i + 1).join(" ");
        simplified = `${capitalizeAndPunctuate(before)} ${capitalizeAndPunctuate(after)}`;
        break;
      }
    }
  }
  return simplified;
}

type LanguageToolMatch = {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  context: { text: string; offset: number; length: number };
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkWithLanguageTool(text: string): Promise<{
  corrected: string;
  issues: GrammarIssue[];
} | null> {
  try {
    const response = await fetchWithTimeout(
      LANGUAGETOOL_ENDPOINT,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `text=${encodeURIComponent(text)}&language=en-US`,
      },
      REQUEST_TIMEOUT_MS
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { matches: LanguageToolMatch[] };

    let corrected = text;
    const issues: GrammarIssue[] = [];
    const sortedMatches = [...data.matches].sort((a, b) => b.offset - a.offset);

    for (const match of sortedMatches) {
      const original = text.slice(match.offset, match.offset + match.length);
      const bestReplacement = match.replacements[0]?.value;
      issues.push({
        id: `${match.offset}-${match.length}`,
        original,
        suggestion: bestReplacement ?? original,
        message: match.shortMessage || match.message,
      });
      if (bestReplacement !== undefined) {
        corrected =
          corrected.slice(0, match.offset) +
          bestReplacement +
          corrected.slice(match.offset + match.length);
      }
    }

    issues.reverse();
    return { corrected, issues };
  } catch {
    return null;
  }
}

export async function analyzeSpeech(rawTranscript: string): Promise<AnalysisResult> {
  const withoutFillers = stripFillers(rawTranscript);
  const base = withoutFillers.length > 0 ? withoutFillers : rawTranscript.trim();

  const remote = await checkWithLanguageTool(base);

  const corrected = capitalizeAndPunctuate(remote?.corrected ?? base);
  const issues = remote?.issues ?? [];
  const simplifiedCandidate = capitalizeAndPunctuate(simplifyText(corrected));
  const simplified = simplifiedCandidate !== corrected ? simplifiedCandidate : null;

  return {
    original: rawTranscript.trim(),
    corrected,
    simplified,
    issues,
    offline: remote === null,
  };
}
