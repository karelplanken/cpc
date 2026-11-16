import { describe, expect, it } from 'vitest';
import { extractIdentifiers } from '../../docs/js/domain/extraction.js';
import { fixturesDir, loadReferenceData, readJson, readText } from '../helpers/site.js';

const referenceData = loadReferenceData();
const extract = (text) => extractIdentifiers(text, referenceData);

describe('extractIdentifiers', () => {
  it('returns empty lists when nothing is found', () => {
    expect(extract('Nothing to see here.')).toEqual({ casrns: [], hCodes: [], pCodes: [] });
  });

  describe('CAS RNs', () => {
    it('finds valid CAS RNs, once each and in ascending order', () => {
      expect(extract('Water 7732-18-5, ethanol 64-17-5 and again 7732-18-5.').casrns).toEqual([
        '64-17-5',
        '7732-18-5',
      ]);
    });

    it('ignores numbers with a wrong check digit', () => {
      expect(extract('Not a CAS RN: 64-17-6').casrns).toEqual([]);
    });

    it('ignores CAS RN look-alikes that continue with digits, such as dates', () => {
      expect(extract('Revision 2019-11-25').casrns).toEqual([]);
    });
  });

  describe('H codes', () => {
    it('finds known H codes', () => {
      expect(extract('H225 Highly flammable. H319 Causes serious eye irritation.').hCodes).toEqual([
        'H225',
        'H319',
      ]);
    });

    it('ignores unknown H codes and EU specific EUH codes', () => {
      expect(extract('H999, H299 and EUH066').hCodes).toEqual([]);
    });

    it('recognizes combinations, also when written with spaces or line breaks', () => {
      expect(extract('H302 + H312 +\nH332 Harmful').hCodes).toEqual(['H302+H312+H332']);
    });

    it('falls back to the single codes of a combination that is unknown as a whole', () => {
      expect(extract('H315 + H319').hCodes).toEqual(['H315', 'H319']);
    });

    it('finds codes that are glued to surrounding text', () => {
      expect(extract('statementsH350May cause cancer').hCodes).toEqual(['H350']);
    });
  });

  describe('P codes', () => {
    it('sorts single codes before combinations', () => {
      expect(extract('P305 + P351 + P338, P280 and P210').pCodes).toEqual([
        'P210',
        'P280',
        'P305+P351+P338',
      ]);
    });

    it('falls back to known single codes of an unknown combination', () => {
      expect(extract('P301 + P312 + P330').pCodes).toEqual(['P301', 'P312', 'P330']);
    });
  });

  describe('text of real Safety Data Sheets', () => {
    const expected = readJson(fixturesDir, 'sds-expected.json');

    it.each(Object.keys(expected))('extracts the identifiers of %s', (name) => {
      const text = readText(fixturesDir, 'sds-text', `${name}.txt`);
      expect(extract(text)).toEqual(expected[name]);
    });
  });
});
