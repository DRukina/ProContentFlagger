import { SignalResult } from '../types.js';
import { findAll } from '../utils/text.js';

const MISINFO_PATTERNS = [
  'vaccine causes autism', 'vaccines? cause', 'vaccine deaths', 'vaccine injury',
  'covid is a hoax', 'covid hoax', 'plandemic', 'scamdemic',
  '5g causes covid', '5g towers', 'microchip vaccine', 'vaccine microchip',
  'ivermectin cures', 'hydroxychloroquine cures',
  'stolen election', 'rigged election', 'fake ballots', 'ballot stuffing',
  'dominion voting', 'stop the steal', 'fraudulent votes',
  'climate hoax', 'global warming hoax', 'climate change is fake',
  'cure cancer with', 'doctors hate this', 'big pharma hiding',
  'miracle cure', 'detox toxins'
];

const CONSPIRACY_KEYWORDS = [
  'deep state', 'new world order', 'illuminati', 'pizzagate', 'qanon',
  'false flag', 'crisis actors', 'chemtrails', 'flat earth'
];

export function detectMisinformation(text: string): SignalResult | null {
  const misinfoHits = MISINFO_PATTERNS.flatMap(p => 
    findAll(new RegExp(escapeReg(p), 'gi'), text)
  );
  
  const conspiracyHits = CONSPIRACY_KEYWORDS.flatMap(k => 
    findAll(new RegExp(`\\b${escapeReg(k)}\\b`, 'gi'), text)
  );
  
  const all = [...misinfoHits, ...conspiracyHits];
  if (all.length === 0) return null;
  let score = Math.min(1, 0.4 + 0.3 * misinfoHits.length + 0.2 * conspiracyHits.length);
  const uniquePatterns = new Set(all.map(e => e.span.toLowerCase()));
  if (uniquePatterns.size > 2) score = Math.min(1, score + 0.2);
  
  return { id: 'misinformation', category: 'misinformation', score, evidence: all };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}