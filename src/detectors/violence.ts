import { SignalResult } from '../types.js';
import { findAll } from '../utils/text.js';

const SEXUAL_VIOLENCE = ['rape', 'sexual assault'];
const GRAPHIC = ['behead', 'bloodbath', 'gore', 'dismember', 'slaughter'];

export function detectSexualViolence(text: string): SignalResult | null {
  const hits = SEXUAL_VIOLENCE.flatMap(t => findAll(new RegExp(`\\b${escapeReg(t)}\\b`, 'gi'), text));
  if (hits.length === 0) return null;
  const score = Math.min(1, 0.7 + 0.15 * hits.length);
  return { id: 'sexual_violence', category: 'sexual_violence', score, evidence: hits };
}

export function detectGraphicViolence(text: string): SignalResult | null {
  const hits = GRAPHIC.flatMap(t => findAll(new RegExp(`\\b${escapeReg(t)}\\b`, 'gi'), text));
  if (hits.length === 0) return null;
  const score = Math.min(1, 0.6 + 0.1 * hits.length);
  return { id: 'graphic_violence', category: 'graphic_violence', score, evidence: hits };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
