import { describe, expect, it } from 'vitest';
import { compareCasrns, isValidCasrn } from '../../docs/js/domain/casrn.js';

describe('isValidCasrn', () => {
  it.each(['64-17-5', '7732-18-5', '7240-90-6', '132207-32-0', '50-00-0'])(
    'accepts %s',
    (casrn) => {
      expect(isValidCasrn(casrn)).toBe(true);
    },
  );

  it.each([
    ['a wrong check digit', '64-17-6'],
    ['a missing check digit', '64-17-'],
    ['too few leading digits', '6-17-5'],
    ['too many leading digits', '123456789-17-5'],
    ['letters', 'ab-cd-e'],
    ['surrounding text', 'CAS 64-17-5'],
    ['an empty string', ''],
  ])('rejects %s', (_description, casrn) => {
    expect(isValidCasrn(casrn)).toBe(false);
  });

  it('rejects values that are not strings', () => {
    expect(isValidCasrn(undefined)).toBe(false);
    expect(isValidCasrn(64175)).toBe(false);
  });
});

describe('compareCasrns', () => {
  it('orders numerically instead of alphabetically', () => {
    expect(['7732-18-5', '64-17-5', '132-32-1'].sort(compareCasrns)).toEqual([
      '64-17-5',
      '132-32-1',
      '7732-18-5',
    ]);
  });
});
