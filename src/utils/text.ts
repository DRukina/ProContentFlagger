const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's',
  '!': 'i', '|': 'i', '2': 'z', '6': 'g', '9': 'g', '+': 't', '×': 'x', '¥': 'y'
};

export function normalizeText(input: string): { normalized: string, map: number[] } {
  const nfkc = input.normalize('NFKC');
  const noDia = nfkc.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const map: number[] = [];
  let deObfuscated = noDia.replace(/([a-zA-Z])[._\-~*]+(?=[a-zA-Z])/g, '$1');
  let lower = '';
  for (let i = 0; i < deObfuscated.length; i++) {
    const ch = deObfuscated[i].toLowerCase();
    lower += ch;
  }
  let leet = '';
  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    leet += (LEET_MAP[ch] ?? ch);
  }
  let collapsed = '';
  let run = 1;
  for (let i = 0; i < leet.length; i++) {
    const ch = leet[i];
    if (i > 0 && ch === leet[i - 1] && /[a-z]/.test(ch)) {
      run++;
      if (run <= 2) collapsed += ch;
    } else {
      run = 1;
      collapsed += ch;
    }
  }
  for (let i = 0; i < collapsed.length; i++) {
    map.push(i);
  }

  return { normalized: collapsed, map };
}

export function findAll(pattern: RegExp, text: string): { span: string; index: number }[] {
  const out: { span: string; index: number }[] = [];
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
  const re = new RegExp(pattern.source, flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    out.push({ span: m[0], index: m.index });
  }
  return out;
}

export function countUrls(text: string): number {
  const urlRe = /\bhttps?:\/\/[\w.-]+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?/gi;
  return (text.match(urlRe) || []).length;
}

export function countHashtags(text: string): number {
  return (text.match(/#[a-z0-9_]+/gi) || []).length;
}

export function tokens(text: string): string[] {
  return text.split(/[^a-z0-9]+/).filter(Boolean);
}

export function getContextWindow(text: string, index: number, windowSize: number = 50): string {
  const start = Math.max(0, index - windowSize);
  const end = Math.min(text.length, index + windowSize);
  return text.substring(start, end);
}

export function hasNegation(text: string, index: number): boolean {
  const before = text.substring(Math.max(0, index - 30), index).toLowerCase();
  const negations = ['not', "don't", "doesn't", "won't", "wouldn't", "shouldn't", "couldn't", 'never', 'no'];
  return negations.some(neg => before.includes(neg));
}
