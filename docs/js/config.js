/** Application wide configuration. */

export const APP_VERSION = '3.0.0';

/** Locales the app is translated into. The first one is the default. */
export const SUPPORTED_LOCALES = Object.freeze(['en', 'nl']);
export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

/** Language tags used for `<html lang>` and for formatting dates. */
export const LANGUAGE_TAGS = Object.freeze({ en: 'en-US', nl: 'nl-NL' });

/** Key under which the chosen locale is remembered in localStorage. */
export const LOCALE_STORAGE_KEY = 'cpc.locale';

/** Name of the URL query parameter that selects a locale, e.g. `?lang=nl`. */
export const LOCALE_QUERY_PARAMETER = 'lang';

/** Locations of static resources, relative to the site root (the docs/ directory). */
const siteRoot = new URL('../', import.meta.url);

export const URLS = Object.freeze({
  data: new URL('data/', siteRoot),
  locales: new URL('locales/', siteRoot),
  pictograms: new URL('assets/pictograms/', siteRoot),
  pdfLibrary: new URL('vendor/pdfjs/pdf.min.mjs', siteRoot),
  pdfWorker: new URL('vendor/pdfjs/pdf.worker.min.mjs', siteRoot),
});
