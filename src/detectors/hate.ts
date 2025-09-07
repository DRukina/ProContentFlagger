import { SignalResult } from '../types.js';
import { findAll } from '../utils/text.js';

const GROUP_TERMS = [
  'women', 'men', 'immigrants', 'disabled', 'trans', 'gay', 'lesbian', 'jewish', 'muslim', 'christian', 'asian', 'black', 'white'
];

const ATTACK_TEMPLATES = [
  (g: string) => new RegExp(`\\ball ${escapeReg(g)}\\s+are\\s+[^.?!]+`, 'gi'),
  (g: string) => new RegExp(`\\b${escapeReg(g)}\\s+(?:are\\s+not\\s+human|should\\s+die|are\\s+inferior)\\b`, 'gi'),
  (g: string) => new RegExp(`\\b(?:hate|kill)\\s+${escapeReg(g)}\\b`, 'gi'),
];

export function detectHate(text: string, extraTerms: string[] = []): SignalResult | null {
  const groups = [...new Set([...GROUP_TERMS, ...extraTerms].map(s => s.toLowerCase()))];
  const evidence = [];
  for (const g of groups) {
    for (const tmpl of ATTACK_TEMPLATES) {
      evidence.push(...findAll(tmpl(g), text));
    }
  }
  const generalHate = [
    /\bi hate you\b/gi,
    /\bhate you\b/gi,
    /\bi hate\b/gi,
    /\bhate speech\b/gi
  ];
  
  for (const pattern of generalHate) {
    evidence.push(...findAll(pattern, text));
  }
  
  if (evidence.length === 0) return null;
  const score = Math.min(1, 0.5 + 0.15 * evidence.length);
  return { id: 'hate', category: 'hate', score, evidence };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
