import { describe, expect, it, vi } from 'vitest';
import { I18n } from '../../docs/js/i18n/i18n.js';
import { resolveInitialLocale, storeLocale } from '../../docs/js/i18n/locale-preference.js';
import { loadMessages } from '../helpers/site.js';

const createI18n = (locale) =>
  new I18n({
    messages: {
      en: { greeting: 'Hello {name}', nested: { key: 'Nested' }, onlyEnglish: 'English only' },
      nl: { greeting: 'Hallo {name}', nested: { key: 'Genest' } },
    },
    languageTags: { en: 'en-US', nl: 'nl-NL' },
    fallbackLocale: 'en',
    locale,
  });

describe('I18n', () => {
  it('starts in the fallback locale by default', () => {
    expect(createI18n().locale).toBe('en');
    expect(createI18n('fr').locale).toBe('en');
  });

  it('translates nested keys and fills in parameters', () => {
    const i18n = createI18n('nl');
    expect(i18n.t('nested.key')).toBe('Genest');
    expect(i18n.t('greeting', { name: 'Karel' })).toBe('Hallo Karel');
  });

  it('leaves placeholders without a value untouched', () => {
    expect(createI18n().t('greeting')).toBe('Hello {name}');
  });

  it('falls back to the fallback locale and then to the key', () => {
    const i18n = createI18n('nl');
    expect(i18n.t('onlyEnglish')).toBe('English only');
    expect(i18n.t('does.not.exist')).toBe('does.not.exist');
  });

  it('picks the text of the current locale from localized data', () => {
    const i18n = createI18n('nl');
    expect(i18n.pick({ en: 'Flame', nl: 'Vlam' })).toBe('Vlam');
    expect(i18n.pick({ en: 'Flame' })).toBe('Flame');
    expect(i18n.pick(undefined)).toBe('');
  });

  it('notifies listeners when the locale changes', () => {
    const i18n = createI18n();
    const listener = vi.fn();
    const unsubscribe = i18n.onChange(listener);

    i18n.setLocale('nl');
    expect(i18n.locale).toBe('nl');
    expect(i18n.languageTag).toBe('nl-NL');
    expect(listener).toHaveBeenCalledExactlyOnceWith('nl');

    unsubscribe();
    i18n.setLocale('en');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('ignores unsupported locales and the current locale', () => {
    const i18n = createI18n();
    const listener = vi.fn();
    i18n.onChange(listener);

    i18n.setLocale('fr');
    i18n.setLocale('en');
    expect(i18n.locale).toBe('en');
    expect(listener).not.toHaveBeenCalled();
  });

  it('formats dates per locale', () => {
    const date = new Date(2025, 0, 2, 9, 0);
    expect(createI18n('en').formatDateTime(date)).toMatch(/^Jan 2, 2025, 9:00\sAM$/);
    expect(createI18n('nl').formatDateTime(date)).toBe('2 jan 2025, 09:00');
  });

  it('loads the message files of all locales', async () => {
    const fetchJson = vi.fn(async (url) => ({ file: url.href }));
    const i18n = await I18n.load({
      fetchJson,
      baseUrl: 'https://example.test/locales/',
      locales: ['en', 'nl'],
      languageTags: {},
      fallbackLocale: 'en',
      locale: 'nl',
    });
    expect(i18n.t('file')).toBe('https://example.test/locales/nl.json');
    expect(i18n.supportedLocales).toEqual(['en', 'nl']);
  });
});

describe('locale files', () => {
  const flattenKeys = (tree, prefix = '') =>
    Object.entries(tree).flatMap(([key, value]) =>
      typeof value === 'string' ? [prefix + key] : flattenKeys(value, `${prefix}${key}.`),
    );

  it('contain exactly the same keys in every language', () => {
    const { en, nl } = loadMessages();
    expect(flattenKeys(nl).sort()).toEqual(flattenKeys(en).sort());
  });
});

describe('resolveInitialLocale', () => {
  const options = {
    search: '',
    storage: undefined,
    storageKey: 'locale',
    queryParameter: 'lang',
    supportedLocales: ['en', 'nl'],
    defaultLocale: 'en',
  };
  const storageWith = (value) => ({ getItem: () => value });

  it('uses the default locale when nothing else is known', () => {
    expect(resolveInitialLocale(options)).toBe('en');
  });

  it('uses the stored locale', () => {
    expect(resolveInitialLocale({ ...options, storage: storageWith('nl') })).toBe('nl');
  });

  it('prefers the query parameter over the stored locale', () => {
    expect(
      resolveInitialLocale({ ...options, search: '?lang=nl', storage: storageWith('en') }),
    ).toBe('nl');
  });

  it('accepts full language tags in any case', () => {
    expect(resolveInitialLocale({ ...options, search: '?lang=NL-nl' })).toBe('nl');
  });

  it('ignores unsupported values', () => {
    expect(
      resolveInitialLocale({ ...options, search: '?lang=fr', storage: storageWith('de') }),
    ).toBe('en');
  });

  it('survives storage that throws', () => {
    const storage = {
      getItem() {
        throw new Error('denied');
      },
      setItem() {
        throw new Error('denied');
      },
    };
    expect(resolveInitialLocale({ ...options, storage })).toBe('en');
    expect(() => storeLocale(storage, 'locale', 'nl')).not.toThrow();
  });

  it('stores the chosen locale', () => {
    const storage = { setItem: vi.fn() };
    storeLocale(storage, 'locale', 'nl');
    expect(storage.setItem).toHaveBeenCalledWith('locale', 'nl');
  });
});
