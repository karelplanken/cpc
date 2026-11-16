import { describe, expect, it, vi } from 'vitest';
import { fetchJson } from '../../docs/js/data/json-loader.js';
import { DATA_FILES, ReferenceData } from '../../docs/js/data/reference-data.js';
import { SCHEMA_BY_DATA_FILE, validateData } from '../../scripts/lib/data-validation.mjs';
import { loadReferenceData, readJson, rootDir, siteDir } from '../helpers/site.js';

describe('ReferenceData', () => {
  const referenceData = loadReferenceData();

  it('knows the H and P codes of the catalogs', () => {
    expect(referenceData.isKnownHCode('H225')).toBe(true);
    expect(referenceData.isKnownHCode('H999')).toBe(false);
    expect(referenceData.isKnownPCode('P305+P351+P338')).toBe(true);
    expect(referenceData.isKnownPCode('P999')).toBe(false);
    expect(referenceData.hCodes).toContain('H302+H312');
    expect(referenceData.pCodes).toContain('P501A');
  });

  it('returns statements with their texts per language', () => {
    expect(referenceData.getHStatement('H225')).toEqual({
      pictograms: ['GHS02'],
      hazardClass: {
        en: 'Flammable liquids, Category 2.',
        nl: 'Ontvlambare vloeistoffen, gevarencategorie 2.',
      },
      statement: {
        en: 'Highly flammable liquid and vapor.',
        nl: 'Licht ontvlambare vloeistof en damp.',
      },
    });
    expect(referenceData.getPStatement('P102').statement.en).toBe('Keep out of reach of children.');
    expect(referenceData.getHStatement('H999')).toBeUndefined();
  });

  it('exposes the policy lists as sets', () => {
    const { szwCasrns, toleratedSzwCasrns, toleratedHCasrns, forbiddenHCodes } =
      referenceData.policyLists;
    expect(szwCasrns.has('132-32-1')).toBe(true);
    expect(toleratedSzwCasrns.has('64-17-5')).toBe(true);
    expect(toleratedHCasrns.has('7758-99-8')).toBe(true);
    expect(forbiddenHCodes.has('H350')).toBe(true);
  });

  it('exposes the version of the SZW list', () => {
    expect(referenceData.szwPublishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('loads every data file relative to the base URL', async () => {
    const fetcher = vi.fn(async (url) => readJson(siteDir, 'data', url.pathname.split('/').pop()));
    const loaded = await ReferenceData.load(fetcher, 'https://example.test/data/');

    expect(fetcher).toHaveBeenCalledTimes(Object.keys(DATA_FILES).length);
    expect(fetcher.mock.calls[0][0].href).toBe('https://example.test/data/h-statements.json');
    expect(loaded.hCodes).toEqual(referenceData.hCodes);
  });
});

describe('fetchJson', () => {
  it('returns the parsed body', async () => {
    vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({ answer: 42 }) }));
    await expect(fetchJson('data.json')).resolves.toEqual({ answer: 42 });
    vi.unstubAllGlobals();
  });

  it('rejects on HTTP errors', async () => {
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 404 }));
    await expect(fetchJson('missing.json')).rejects.toThrow('HTTP 404');
    vi.unstubAllGlobals();
  });
});

describe('data files', () => {
  it('are valid according to their schemas and consistency rules', async () => {
    expect(await validateData(siteDir)).toEqual([]);
  });

  it('all have a schema', () => {
    expect(Object.keys(SCHEMA_BY_DATA_FILE).sort()).toEqual(Object.values(DATA_FILES).sort());
  });
});

describe('vendored libraries', () => {
  it('match the installed package versions (run `npm run vendor` after an update)', () => {
    const manifest = readJson(siteDir, 'vendor', 'manifest.json');
    for (const [name, version] of Object.entries(manifest)) {
      expect(readJson(rootDir, 'node_modules', name, 'package.json').version).toBe(version);
    }
  });
});
