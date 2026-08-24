export type GrammarIssue = {
  id: string;
  original: string;
  suggestion: string;
  message: string;
};

export type AnalysisResult = {
  original: string;
  corrected: string;
  simplified: string | null;
  issues: GrammarIssue[];
  offline: boolean;
};

export type ConversationEntry = {
  id: string;
  timestamp: number;
  original: string;
  corrected: string;
  simplified: string | null;
  issueCount: number;
};
