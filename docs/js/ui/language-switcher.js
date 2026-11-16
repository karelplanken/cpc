/**
 * The buttons that switch the language. Each button carries the locale it
 * selects in its `data-locale` attribute.
 */
export class LanguageSwitcher {
  #buttons;

  /**
   * @param {object} options
   * @param {HTMLElement} options.root
   * @param {import('../i18n/i18n.js').I18n} options.i18n
   */
  constructor({ root, i18n }) {
    this.#buttons = [...root.querySelectorAll('[data-locale]')];
    for (const button of this.#buttons) {
      button.addEventListener('click', () => i18n.setLocale(button.dataset.locale));
    }
    i18n.onChange((locale) => this.#markActive(locale));
    this.#markActive(i18n.locale);
  }

  #markActive(locale) {
    for (const button of this.#buttons) {
      const active = button.dataset.locale === locale;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
}
