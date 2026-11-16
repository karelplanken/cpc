/**
 * Small helper for building DOM elements without `innerHTML`, so text is
 * always inserted as text and never interpreted as markup.
 */

/**
 * @param {string} tagName
 * @param {object} [options]
 * @param {string} [options.className]
 * @param {string} [options.text]
 * @param {Record<string, string|boolean>} [options.attrs]  `true` sets an empty
 *   attribute, `false` leaves the attribute out.
 * @param {Record<string, string>} [options.dataset]
 * @param {(Node|string|null|undefined)[]} [options.children]  Empty values are skipped.
 * @returns {HTMLElement}
 */
export function el(tagName, { className, text, attrs = {}, dataset = {}, children = [] } = {}) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== false) {
      element.setAttribute(name, value === true ? '' : value);
    }
  }
  Object.assign(element.dataset, dataset);
  element.append(...children.filter((child) => child !== null && child !== undefined));
  return element;
}
