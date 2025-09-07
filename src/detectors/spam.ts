import { SignalResult } from '../types.js';
import { countUrls, countHashtags, findAll } from '../utils/text.js';

const BAIT = [
  'giveaway', 'promo code', 'free crypto', 'double your money', 'act now', 'limited time',
  'click here', 'dm me', 'direct message', 'buy now', 'join my telegram'
];
const SHORTENERS = ['bit.ly', 't.co', 'goo.gl', 'tinyurl.com', 'ow.ly'];

export function detectSpam(text: string): SignalResult | null {
  const urlCount = countUrls(text);
  const hashCount = countHashtags(text);
  const baitHits = BAIT.flatMap(b => findAll(new RegExp(`\\b${escapeReg(b)}\\b`, 'gi'), text));
  const shortHits = SHORTENERS.flatMap(s => findAll(new RegExp(escapeReg(s), 'gi'), text));

  if (urlCount + hashCount + baitHits.length + shortHits.length === 0) return null;

  let score = 0;
  score += Math.min(0.3, urlCount * 0.12);
  score += Math.min(0.2, hashCount * 0.06);
  score += Math.min(0.3, baitHits.length * 0.12);
  score += Math.min(0.2, shortHits.length * 0.1);
  score = Math.min(1, 0.2 + score);

  const evidence = [
    ...baitHits,
    ...shortHits
  ];
  return { id: 'spam', category: 'spam', score, evidence };
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
