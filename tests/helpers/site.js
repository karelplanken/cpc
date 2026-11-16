/**
 * Access to the real site files (docs/) and test fixtures from Node, so tests
 * run against the same data and translations the app ships with.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_FILES, ReferenceData } from '../../docs/js/data/reference-data.js';
import { I18n } from '../../docs/js/i18n/i18n.js';

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const siteDir = path.join(rootDir, 'docs');
export const fixturesDir = path.join(rootDir, 'tests', 'fixtures');

export const readText = (...segments) => readFileSync(path.join(...segments), 'utf8');
export const readJson = (...segments) => JSON.parse(readText(...segments));

export function loadReferenceData() {
  const documents = Object.fromEntries(
    Object.entries(DATA_FILES).map(([key, fileName]) => [key, readJson(siteDir, 'data', fileName)]),
  );
  return new ReferenceData(documents);
}

export function loadMessages() {
  return {
    en: readJson(siteDir, 'locales', 'en.json'),
    nl: readJson(siteDir, 'locales', 'nl.json'),
  };
}

export function createI18n(locale = 'en') {
  return new I18n({
    messages: loadMessages(),
    languageTags: { en: 'en-US', nl: 'nl-NL' },
    fallbackLocale: 'en',
    locale,
  });
}
