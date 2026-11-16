/**
 * Entry point and composition root: loads the data, creates the objects the
 * app consists of and connects them.
 */
import {
  APP_VERSION,
  DEFAULT_LOCALE,
  LANGUAGE_TAGS,
  LOCALE_QUERY_PARAMETER,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  URLS,
} from './config.js';
import { fetchJson } from './data/json-loader.js';
import { ReferenceData } from './data/reference-data.js';
import { PolicyEngine } from './domain/policy.js';
import { I18n } from './i18n/i18n.js';
import { resolveInitialLocale, storeLocale } from './i18n/locale-preference.js';
import { PdfTextExtractor } from './pdf/pdf-text-extractor.js';
import { AssessmentService } from './services/assessment-service.js';
import { ReportStore } from './state/report-store.js';
import { startApp } from './ui/app.js';
import { Tooltips } from './ui/tooltips.js';

/** localStorage, or undefined where the browser denies access to it. */
function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

async function main() {
  const storage = getStorage();
  const locale = resolveInitialLocale({
    search: window.location.search,
    storage,
    storageKey: LOCALE_STORAGE_KEY,
    queryParameter: LOCALE_QUERY_PARAMETER,
    supportedLocales: SUPPORTED_LOCALES,
    defaultLocale: DEFAULT_LOCALE,
  });

  const [i18n, referenceData] = await Promise.all([
    I18n.load({
      fetchJson,
      baseUrl: URLS.locales,
      locales: SUPPORTED_LOCALES,
      languageTags: LANGUAGE_TAGS,
      fallbackLocale: DEFAULT_LOCALE,
      locale,
    }),
    ReferenceData.load(fetchJson, URLS.data),
  ]);
  i18n.onChange((newLocale) => storeLocale(storage, LOCALE_STORAGE_KEY, newLocale));

  const assessmentService = new AssessmentService({
    policyEngine: new PolicyEngine(referenceData.policyLists),
    referenceData,
    pdfTextExtractor: new PdfTextExtractor({
      libraryUrl: URLS.pdfLibrary,
      workerUrl: URLS.pdfWorker,
    }),
  });

  startApp({
    document,
    i18n,
    referenceData,
    assessmentService,
    reportStore: new ReportStore(),
    tooltips: new Tooltips(window.bootstrap),
    pictogramBaseUrl: URLS.pictograms,
    appVersion: APP_VERSION,
  });
  document.documentElement.dataset.appReady = 'true';
}

main().catch((error) => {
  console.error(error);
  document.getElementById('loadError').hidden = false;
});
