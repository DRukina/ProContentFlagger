import { SignalResult } from '../types.js';
import { findAll, getContextWindow } from '../utils/text.js';

const INSULTS = [
  'idiot', 'stupid', 'moron', 'loser', 'looser', 'dumb', 'ugly', 'trash', 'clown', 'shut up',
  'pathetic', 'worthless', 'garbage', 'scum', 'disgusting', 'fat', 'retard',
  'waste of space', 'nobody likes you', 'kys', 'go die'
];

const TARGETED_PATTERNS = [
  /you(?:'re| are) (?:a |an )?(?:fucking |goddamn |absolute )?(?:idiot|moron|stupid|pathetic|worthless|trash|loser)/gi,
  /fuck(?:ing)? you/gi,
  /nobody (?:likes|wants|cares about) you/gi
];

export function detectHarassment(text: string): SignalResult | null {
  const insultHits = INSULTS.flatMap(w => findAll(new RegExp(`\\b${escapeReg(w)}\\b`, 'gi'), text));
  const targetedHits = TARGETED_PATTERNS.flatMap(p => findAll(p, text));
  
  const evidence = [...insultHits, ...targetedHits];
  if (evidence.length === 0) return null;

  const hasTarget = evidence.some(e => {
    const context = getContextWindow(text, e.index, 30);
    return /\b(you|your|u|ur|@\w+)\b/i.test(context);
  });
  const uniq = new Set(evidence.map(e => e.span.toLowerCase())).size;
  let score = Math.min(1, 0.4 + 0.15 * uniq);
  if (hasTarget) score = Math.min(1, score + 0.2);

  return { id: 'harassment', category: 'harassment', score, evidence };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
