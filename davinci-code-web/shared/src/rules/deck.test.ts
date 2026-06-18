import { describe, expect, it } from 'vitest';
import { getDealCount, tileMatchesClaim } from './deck.js';

describe('getDealCount', () => {
  it('returns 4 for 2-3 players', () => {
    expect(getDealCount(2)).toBe(4);
    expect(getDealCount(3)).toBe(4);
  });
  it('returns 3 for 4 players', () => {
    expect(getDealCount(4)).toBe(3);
  });
});

describe('tileMatchesClaim', () => {
  it('matches joker claim', () => {
    const tile = { id: '1', value: 'joker' as const, color: 'white' as const, revealed: false, position: 0 };
    expect(tileMatchesClaim(tile, { type: 'joker' })).toBe(true);
    expect(tileMatchesClaim(tile, { type: 'number', value: 5 })).toBe(false);
  });
  it('matches number claim', () => {
    const tile = { id: '1', value: 7 as const, color: 'black' as const, revealed: false, position: 0 };
    expect(tileMatchesClaim(tile, { type: 'number', value: 7 })).toBe(true);
    expect(tileMatchesClaim(tile, { type: 'number', value: 6 })).toBe(false);
  });
});
