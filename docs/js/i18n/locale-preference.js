/**
 * Decides which locale to start with and remembers the user's choice.
 */

/**
 * Resolves the initial locale. In order of precedence:
 *
 * 1. the URL query parameter, e.g. `?lang=nl` (useful for links);
 * 2. the locale the user chose on an earlier visit;
 * 3. the default locale.
 *
 * @param {object} options
 * @param {string} options.search           The query string of the page URL.
 * @param {Storage|undefined} options.storage
 * @param {string} options.storageKey
 * @param {string} options.queryParameter
 * @param {readonly string[]} options.supportedLocales
 * @param {string} options.defaultLocale
 * @returns {string}
 */
export function resolveInitialLocale({
  search,
  storage,
  storageKey,
  queryParameter,
  supportedLocales,
  defaultLocale,
}) {
  const candidates = [
    new URLSearchParams(search).get(queryParameter),
    readStoredLocale(storage, storageKey),
  ];
  const match = candidates
    .map((candidate) => candidate?.toLowerCase().split('-')[0])
    .find((candidate) => supportedLocales.includes(candidate));
  return match ?? defaultLocale;
}

/**
 * @param {Storage|undefined} storage
 * @param {string} storageKey
 * @param {string} locale
 */
export function storeLocale(storage, storageKey, locale) {
  try {
    storage?.setItem(storageKey, locale);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The choice
    // then simply lasts for this visit only.
  }
}

function readStoredLocale(storage, storageKey) {
  try {
    return storage?.getItem(storageKey) ?? null;
  } catch {
    return null;
  }
}
