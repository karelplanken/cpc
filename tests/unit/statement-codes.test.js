import { describe, expect, it } from 'vitest';
import { compareCodes, normalizeCode, splitCode } from '../../docs/js/domain/statement-codes.js';

describe('normalizeCode', () => {
  it('removes whitespace and upper-cases', () => {
    expect(normalizeCode(' h302 +\th312 ')).toBe('H302+H312');
    expect(normalizeCode('p501a')).toBe('P501A');
  });
});

describe('splitCode', () => {
  it('returns the single codes of a combination', () => {
    expect(splitCode('P305+P351+P338')).toEqual(['P305', 'P351', 'P338']);
  });

  it('returns a single code as is', () => {
    expect(splitCode('H350')).toEqual(['H350']);
  });
});

describe('compareCodes', () => {
  it('puts single codes before combinations, each in ascending order', () => {
    const codes = ['P305+P351+P338', 'P501A', 'P301+P312', 'P210', 'P102'];
    expect(codes.sort(compareCodes)).toEqual([
      'P102',
      'P210',
      'P501A',
      'P301+P312',
      'P305+P351+P338',
    ]);
  });
});
