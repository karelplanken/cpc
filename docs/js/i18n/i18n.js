/**
 * Translations and locale aware formatting.
 *
 * Messages live in docs/locales/<locale>.json as nested objects and are
 * addressed with dot separated keys, e.g. `report.verdict.label`. Parameters
 * are written as `{name}` in a message.
 */

export class I18n {
  #messages;
  #languageTags;
  #fallbackLocale;
  #locale;
  #listeners = new Set();

  /**
   * @param {object} options
   * @param {Record<string, object>} options.messages      Nested messages per locale.
   * @param {Record<string, string>} options.languageTags  BCP 47 tag per locale.
   * @param {string} options.fallbackLocale  Used when a message or text lacks a translation.
   * @param {string} [options.locale]        The initial locale.
   */
  constructor({ messages, languageTags, fallbackLocale, locale = fallbackLocale }) {
    this.#messages = Object.fromEntries(
      Object.entries(messages).map(([key, tree]) => [key, flatten(tree)]),
    );
    this.#languageTags = languageTags;
    this.#fallbackLocale = fallbackLocale;
    this.#locale = this.isSupported(locale) ? locale : fallbackLocale;
  }

  /**
   * Loads the message files of all locales in parallel.
   *
   * @param {object} options
   * @param {(url: URL) => Promise<any>} options.fetchJson
   * @param {string|URL} options.baseUrl  URL of the locales directory, ending with a slash.
   * @param {string[]} options.locales
   * @param {Record<string, string>} options.languageTags
   * @param {string} options.fallbackLocale
   * @param {string} [options.locale]
   * @returns {Promise<I18n>}
   */
  static async load({ fetchJson, baseUrl, locales, ...options }) {
    const entries = await Promise.all(
      locales.map(async (locale) => [locale, await fetchJson(new URL(`${locale}.json`, baseUrl))]),
    );
    return new I18n({ messages: Object.fromEntries(entries), ...options });
  }

  get locale() {
    return this.#locale;
  }

  /** The BCP 47 language tag of the current locale, e.g. `en-US`. */
  get languageTag() {
    return this.#languageTags[this.#locale] ?? this.#locale;
  }

  get supportedLocales() {
    return Object.keys(this.#messages);
  }

  isSupported(locale) {
    return Object.hasOwn(this.#messages, locale);
  }

  /**
   * Switches to another locale and notifies the listeners. Unsupported
   * locales and the current locale are ignored.
   *
   * @param {string} locale
   */
  setLocale(locale) {
    if (!this.isSupported(locale) || locale === this.#locale) {
      return;
    }
    this.#locale = locale;
    this.#listeners.forEach((listener) => listener(locale));
  }

  /**
   * Registers a listener that is called after every locale change.
   *
   * @param {(locale: string) => void} listener
   * @returns {() => void} Function that removes the listener again.
   */
  onChange(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /**
   * Translates a message key. Falls back to the fallback locale and finally
   * to the key itself, so a missing translation is visible but harmless.
   *
   * @param {string} key
   * @param {Record<string, string|number>} [params]
   * @returns {string}
   */
  t(key, params = {}) {
    const message =
      this.#messages[this.#locale][key] ?? this.#messages[this.#fallbackLocale]?.[key] ?? key;
    return message.replace(/\{(\w+)\}/g, (placeholder, name) => params[name] ?? placeholder);
  }

  /**
   * Picks the text for the current locale from a `{ en, nl }` style object,
   * as used in the data files.
   *
   * @param {Record<string, string>|undefined} localizedText
   * @returns {string}
   */
  pick(localizedText) {
    return localizedText?.[this.#locale] ?? localizedText?.[this.#fallbackLocale] ?? '';
  }

  /**
   * Formats a date and time the way the current locale writes it.
   *
   * @param {Date} date
   * @returns {string}
   */
  formatDateTime(date) {
    return new Intl.DateTimeFormat(this.languageTag, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}

/** Turns `{ a: { b: 'x' } }` into `{ 'a.b': 'x' }`. */
function flatten(tree, prefix = '') {
  return Object.entries(tree).reduce((flat, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string'
      ? { ...flat, [path]: value }
      : { ...flat, ...flatten(value, path) };
  }, {});
}
