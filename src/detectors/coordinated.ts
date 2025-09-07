import { SignalResult } from '../types.js';
import { countUrls, countHashtags } from '../utils/text.js';

const BOT_PATTERNS = [
  /follow me for more/gi,
  /check my profile/gi,
  /link in bio/gi,
  /dm for collab/gi,
  /follow back/gi,
  /f4f/gi,
  /l4l/gi,
  /tap link/gi
];

const REPETITION_PATTERNS = [
  /(.{5,})\1{2,}/gi,
  /([!?]){5,}/g,
  /([A-Z\s]){15,}/g,
  /\b(\w+\s+){1,3}\1{2,}/gi
];

const recentMessages = new Map<string, number>();
const MESSAGE_CACHE_SIZE = 1000;
const MESSAGE_CACHE_TTL = 15 * 60 * 1000;

export function detectCoordinatedBehavior(text: string): SignalResult | null {
  const evidence = [];
  let score = 0;
  const botMatches = BOT_PATTERNS.flatMap(pattern => {
    const matches = text.match(pattern) || [];
    return matches.map(m => ({ span: m, index: text.indexOf(m) }));
  });
  evidence.push(...botMatches);
  score += Math.min(0.3, botMatches.length * 0.1);
  const repetitionMatches = REPETITION_PATTERNS.flatMap(pattern => {
    const matches = text.match(pattern) || [];
    return matches.map(m => ({ span: m.substring(0, 30) + '...', index: text.indexOf(m) }));
  });
  evidence.push(...repetitionMatches);
  score += Math.min(0.2, repetitionMatches.length * 0.1);
  const urlCount = countUrls(text);
  const hashtagCount = countHashtags(text);
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount > 0) {
    const urlDensity = urlCount / wordCount;
    const hashtagDensity = hashtagCount / wordCount;
    
    if (urlDensity > 0.2) {
      evidence.push({ span: `High URL density: ${urlCount} URLs`, index: 0 });
      score += 0.2;
    }
    
    if (hashtagDensity > 0.3) {
      evidence.push({ span: `High hashtag density: ${hashtagCount} hashtags`, index: 0 });
      score += 0.15;
    }
  }
  const textHash = simpleHash(text.toLowerCase().replace(/\s+/g, ''));
  const now = Date.now();
  for (const [hash, timestamp] of recentMessages.entries()) {
    if (now - timestamp > MESSAGE_CACHE_TTL) {
      recentMessages.delete(hash);
    }
  }
  
  if (recentMessages.has(textHash)) {
    evidence.push({ span: 'Duplicate content detected', index: 0 });
    score += 0.3;
  } else {
    recentMessages.set(textHash, now);
    if (recentMessages.size > MESSAGE_CACHE_SIZE) {
      const firstKey = recentMessages.keys().next().value;
      if (firstKey) {
        recentMessages.delete(firstKey);
      }
    }
  }
  
  if (evidence.length === 0) return null;
  
  score = Math.min(1, score);
  return { id: 'coordinated', category: 'coordinated', score, evidence };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}