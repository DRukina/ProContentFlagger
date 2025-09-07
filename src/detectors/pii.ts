import { SignalResult } from '../types.js';
import { findAll } from '../utils/text.js';

const PATTERNS = {
  email: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
  phone: /\b(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  cc: /\b(?:\d[ -]*?){13,19}\b/g,
  iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g,
  crypto: /\b(?:bc1|[13])[a-km-zA-HJ-NP-Z1-9]{25,39}\b/g
};

export function detectPII(text: string): SignalResult | null {
  const evidence = [];
  for (const [k, re] of Object.entries(PATTERNS)) {
    evidence.push(...findAll(re, text).map(e => ({ ...e, span: `${k}:${e.span}` })));
  }
  if (evidence.length === 0) return null;
  const score = Math.min(1, 0.5 + 0.1 * evidence.length);
  return { id: 'pii', category: 'pii', score, evidence };
}
