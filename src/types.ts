export type Decision = 'allow' | 'review' | 'block';

export interface SignalEvidence {
  span: string;
  index: number;
}

export interface SignalResult {
  id: string;
  category: string;
  score: number;
  evidence: SignalEvidence[];
}

export interface AnalysisOutput {
  decision: Decision;
  score: number;
  category_max: string;
  signals: SignalResult[];
  normalized: string;
  original: string;
}
