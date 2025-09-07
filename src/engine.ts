import { normalizeText } from './utils/text.js';
import { ContentCache, hashContent } from './utils/cache.js';
import { THRESHOLDS, WEIGHTS, CATEGORY_MAP } from './policy.js';
import { SignalResult, AnalysisOutput, Decision } from './types.js';

import { detectHarassment } from './detectors/harassment.js';
import { detectThreat } from './detectors/threat.js';
import { detectSelfHarm } from './detectors/self_harm.js';
import { detectHate } from './detectors/hate.js';
import { detectSexualMinors } from './detectors/sexual_minors.js';
import { detectSexualViolence, detectGraphicViolence } from './detectors/violence.js';
import { detectPII } from './detectors/pii.js';
import { detectSpam } from './detectors/spam.js';
import { detectMisinformation } from './detectors/misinformation.js';
import { detectCoordinatedBehavior } from './detectors/coordinated.js';

const cache = new ContentCache(1000, 15);

export interface AnalyzeOptions {
  hateTerms?: string[];
  weights?: Partial<typeof WEIGHTS>;
  useCache?: boolean;
}

export function analyze(original: string, opts: AnalyzeOptions = {}): AnalysisOutput {
  const useCache = opts.useCache !== false;
  
  if (useCache) {
    const cacheKey = hashContent(original);
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  const { normalized } = normalizeText(original);
  const text = normalized;

  const signals: (SignalResult | null)[] = [
    detectThreat(text),
    detectSelfHarm(text),
    detectSexualMinors(text),
    detectSexualViolence(text),
    detectGraphicViolence(text),
    detectHate(text, opts.hateTerms || []),
    detectPII(original),
    detectHarassment(text),
    detectSpam(text),
    detectMisinformation(text),
    detectCoordinatedBehavior(text),
  ];

  const active = signals.filter(Boolean) as SignalResult[];

  let totalScore = 0;
  let topCat = 'none';
  let topCatScore = 0;

  for (const s of active) {
    const w = (opts.weights && s.id in opts.weights ? (opts.weights as any)[s.id] : WEIGHTS[s.id]) ?? 0.5;
    const contrib = s.score * w;
    totalScore = Math.max(totalScore, contrib);
    if (contrib > topCatScore) {
      topCatScore = contrib;
      topCat = CATEGORY_MAP[s.id] || s.id;
    }
  }

  let decision: Decision = 'allow';
  if (totalScore >= THRESHOLDS.block) decision = 'block';
  else if (totalScore >= THRESHOLDS.allow) decision = 'review';

  const result: AnalysisOutput = {
    decision,
    score: round2(totalScore),
    category_max: topCat,
    signals: active.sort((a, b) => b.score - a.score),
    normalized: text,
    original,
  };

  if (useCache) {
    const cacheKey = hashContent(original);
    cache.set(cacheKey, result);
  }

  return result;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
