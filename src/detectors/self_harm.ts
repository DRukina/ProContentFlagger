import { SignalResult } from '../types.js';
import { findAll } from '../utils/text.js';

const INTENT = [
  'kill myself', 'suicide', 'end my life', 'self harm', 'hurt myself', 'want to die'
];
const ENCOURAGE = [
  'go kill yourself', 'you should kill yourself', 'end yourself'
];

export function detectSelfHarm(text: string): SignalResult | null {
  const hits = INTENT.flatMap(p => findAll(new RegExp(escapeReg(p), 'gi'), text));
  const enc = ENCOURAGE.flatMap(p => findAll(new RegExp(escapeReg(p), 'gi'), text));
  const all = [...hits, ...enc];
  if (all.length === 0) return null;

  const score = Math.min(1, 0.7 + 0.15 * hits.length + 0.15 * enc.length);
  return { id: 'self_harm', category: 'self_harm', score, evidence: all };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
