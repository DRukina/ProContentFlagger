import { SignalResult } from '../types.js';
import { findAll, hasNegation, getContextWindow } from '../utils/text.js';

const THREAT_PHRASES = [
  'kill you', 'hurt you', 'shoot you', 'i will kill', 'i will hurt', 'i will find you',
  'die in a fire', 'beat you up', 'i will destroy you', 'i will break your', 'go kill yourself',
  'watch your back', 'you will pay', 'i know where you live', 'see you soon'
];

const VIOLENCE_VERBS = ['kill', 'hurt', 'shoot', 'stab', 'bomb', 'destroy', 'attack', 'murder', 'eliminate'];

export function detectThreat(text: string): SignalResult | null {
  const hits = THREAT_PHRASES.flatMap(p => findAll(new RegExp(escapeReg(p), 'gi'), text));
  const weak = findAll(new RegExp(`\\bi will (?:${VIOLENCE_VERBS.join('|')})\\b`, 'gi'), text);
  const filteredHits = hits.filter(h => !hasNegation(text, h.index));
  const filteredWeak = weak.filter(w => !hasNegation(text, w.index));

  const all = [...filteredHits, ...filteredWeak];
  if (all.length === 0) return null;
  let score = 0.5 + 0.25 * filteredHits.length + 0.15 * filteredWeak.length;
  const hasDirectTarget = all.some(e => {
    const context = getContextWindow(text, e.index, 30);
    return /\b(you|your|u|ur)\b/i.test(context);
  });
  
  if (hasDirectTarget) score += 0.2;
  
  score = Math.min(1, score);
  return { id: 'threat', category: 'threat', score, evidence: all };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
