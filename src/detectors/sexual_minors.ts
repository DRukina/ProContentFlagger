import { SignalResult } from '../types.js';
import { findAll } from '../utils/text.js';

const SEX_TERMS = ['sex', 'nude', 'nudes', 'explicit', 'porn', 'naked', 'onlyfans', 'send pics', 'dm pics', 'sexual'];
const MINOR_TERMS = ['minor', 'kid', 'child', 'children', 'underage', 'teen', '14', '15', '16', '17'];

export function detectSexualMinors(text: string): SignalResult | null {
  const sexHits = SEX_TERMS.flatMap(t => findAll(new RegExp(`\\b${escapeReg(t)}\\b`, 'gi'), text));
  const minorHits = MINOR_TERMS.flatMap(t => findAll(new RegExp(`\\b${escapeReg(t)}\\b`, 'gi'), text));

  if (sexHits.length === 0 || minorHits.length === 0) return null;

  const score = Math.min(1, 0.85 + 0.05 * Math.min(2, sexHits.length + minorHits.length));
  const evidence = [...sexHits, ...minorHits];
  return { id: 'sexual_minors', category: 'sexual_minors', score, evidence };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
