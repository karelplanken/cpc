/**
 * Translates static markup. Elements declare what to translate with data
 * attributes:
 *
 * - `data-i18n="key"`               sets the text content;
 * - `data-i18n-html="key"`          sets the inner HTML, for messages with inline
 *                                   markup such as `<strong>` or `<abbr>`;
 * - `data-i18n-attr="title:key"`    sets attributes; several pairs are separated
 *                                   by semicolons;
 * - `data-i18n-params='{"n": 1}'`   optional message parameters, as JSON.
 *
 * Messages come from the locale files, which are part of the app and therefore
 * trusted. Never use `data-i18n-html` with a key whose parameters contain user
 * input.
 */

/**
 * @param {ParentNode} root
 * @param {import('./i18n.js').I18n} i18n
 */
export function translateDom(root, i18n) {
  for (const element of root.querySelectorAll('[data-i18n]')) {
    element.textContent = i18n.t(element.dataset.i18n, paramsOf(element));
  }
  for (const element of root.querySelectorAll('[data-i18n-html]')) {
    element.innerHTML = i18n.t(element.dataset.i18nHtml, paramsOf(element));
  }
  for (const element of root.querySelectorAll('[data-i18n-attr]')) {
    for (const [attribute, key] of parseAttributePairs(element.dataset.i18nAttr)) {
      element.setAttribute(attribute, i18n.t(key, paramsOf(element)));
    }
  }
}

function paramsOf(element) {
  return element.dataset.i18nParams ? JSON.parse(element.dataset.i18nParams) : {};
}

function parseAttributePairs(value) {
  return value
    .split(';')
    .map((pair) => pair.split(':').map((part) => part.trim()))
    .filter(([attribute, key]) => attribute && key);
}
