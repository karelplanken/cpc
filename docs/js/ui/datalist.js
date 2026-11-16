import { el } from './dom.js';

/**
 * Fills a datalist with suggestions.
 *
 * @param {HTMLDataListElement} datalist
 * @param {string[]} values
 * @param {(value: string) => string} describe  Returns the text shown next to a value.
 */
export function populateDatalist(datalist, values, describe) {
  datalist.replaceChildren(
    ...values.map((value) => el('option', { attrs: { value, label: describe(value) } })),
  );
}
