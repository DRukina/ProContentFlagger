import { describe, it, expect } from 'vitest';
import { analyze } from '../src/engine.js';

describe('Core Detection', () => {
  it('flags threats strongly', () => {
    const out = analyze('I will hurt you.');
    expect(out.decision === 'block' || out.decision === 'review').toBeTruthy();
    expect(out.signals.some(s => s.id === 'threat')).toBeTruthy();
  });

  it('detects self-harm intent', () => {
    const out = analyze('I want to die. sometimes i think about suicide.');
    expect(out.decision === 'block' || out.decision === 'review').toBeTruthy();
    expect(out.signals.some(s => s.id === 'self_harm')).toBeTruthy();
  });

  it('detects sexual content involving minors', () => {
    const out = analyze('underage teen asking for nudes');
    expect(out.decision).toBe('block');
    expect(out.signals.some(s => s.id === 'sexual_minors')).toBeTruthy();
  });

  it('detects PII', () => {
    const out = analyze('reach me at jane.doe@example.com or +1 (555) 123-4567');
    expect(out.signals.some(s => s.id === 'pii')).toBeTruthy();
  });

  it('allows normal content', () => {
    const out = analyze('Lovely day for a walk in the park.');
    expect(out.decision).toBe('allow');
    expect(out.signals.length).toBe(0);
  });
});

describe('Obfuscation Detection', () => {
  it('detects leetspeak threats', () => {
    const out = analyze('1 w1ll k1ll y0u');
    expect(out.signals.some(s => s.id === 'threat')).toBeTruthy();
  });

  it('detects spaced-out hate speech', () => {
    const out = analyze('h.a.t.e y.o.u');
    expect(out.signals.some(s => s.id === 'hate')).toBeTruthy();
  });

  it('handles repeated characters', () => {
    const out = analyze('stuuuuupid looooser');
    expect(out.signals.some(s => s.id === 'harassment')).toBeTruthy();
  });
});

describe('Misinformation Detection', () => {
  it('detects COVID misinformation', () => {
    const out = analyze('covid is a hoax and vaccines cause autism');
    expect(out.signals.some(s => s.id === 'misinformation')).toBeTruthy();
    expect(out.decision !== 'allow').toBeTruthy();
  });

  it('detects election fraud claims', () => {
    const out = analyze('The election was stolen with fake ballots');
    expect(out.signals.some(s => s.id === 'misinformation')).toBeTruthy();
  });

  it('detects conspiracy theories', () => {
    const out = analyze('deep state illuminati control everything');
    expect(out.signals.some(s => s.id === 'misinformation')).toBeTruthy();
  });
});

describe('Coordinated Behavior', () => {
  it('detects bot-like patterns', () => {
    const out = analyze('follow me for more content! link in bio! f4f l4l');
    expect(out.signals.some(s => s.id === 'coordinated')).toBeTruthy();
  });

  it('detects excessive hashtags', () => {
    const out = analyze('#love #instagood #photooftheday #fashion #beautiful #happy #cute #tbt #like4like #followme #picoftheday #follow');
    expect(out.signals.some(s => s.id === 'coordinated')).toBeTruthy();
  });

  it('detects repetitive spam', () => {
    const out = analyze('BUY NOW BUY NOW BUY NOW!!! LIMITED TIME OFFER!!!!!!');
    expect(out.signals.some(s => s.id === 'coordinated' || s.id === 'spam')).toBeTruthy();
  });
});

describe('Contextual Analysis', () => {
  it('ignores negated threats', () => {
    const out = analyze("I would never hurt you");
    expect(out.decision).toBe('allow');
  });

  it('detects targeted harassment', () => {
    const out = analyze("@user you're absolutely pathetic");
    expect(out.signals.some(s => s.id === 'harassment')).toBeTruthy();
    expect(out.score).toBeGreaterThan(0.4);
  });

  it('differentiates direct vs indirect threats', () => {
    const direct = analyze("I will find you and hurt you");
    const indirect = analyze("Someone should hurt them");
    expect(direct.score).toBeGreaterThan(indirect.score);
  });
});

describe('Edge Cases', () => {
  it('handles empty input', () => {
    const out = analyze('');
    expect(out.decision).toBe('allow');
    expect(out.signals.length).toBe(0);
  });

  it('handles unicode and emojis', () => {
    const out = analyze('I hate you 😡💀🔪');
    expect(out.signals.some(s => s.id === 'hate')).toBeTruthy();
  });

  it('handles mixed languages', () => {
    const out = analyze('你好 hello مرحبا kill yourself');
    expect(out.signals.some(s => s.id === 'threat' || s.id === 'self_harm')).toBeTruthy();
  });
});

describe('Caching', () => {
  it('returns cached results for identical content', () => {
    const text = 'Test caching mechanism';
    const out1 = analyze(text);
    const out2 = analyze(text);
    expect(out1).toEqual(out2);
  });

  it('respects cache disable option', () => {
    const text = 'No cache test';
    const out1 = analyze(text, { useCache: false });
    const out2 = analyze(text, { useCache: false });
    // Both should work but won't be from cache
    expect(out1.decision).toBe(out2.decision);
  });
});
