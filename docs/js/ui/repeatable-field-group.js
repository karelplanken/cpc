/**
 * A group of text inputs of the same kind (e.g. CAS RNs) to which the user can
 * add and remove inputs. The group validates its inputs and hands out their
 * normalized values.
 *
 * Expected markup inside the root element:
 * - `[data-role="fields"]`    container the inputs are put in;
 * - `[data-action="add"]`     button that adds an input;
 * - `[data-action="remove"]`  button that removes the last input.
 */
import { translateDom } from '../i18n/dom-translator.js';
import { el } from './dom.js';
import { clearFieldError, showFieldError } from './field-feedback.js';

/**
 * @typedef {object} FieldGroupConfig
 * @property {string} messagePrefix  Prefix of the message keys `inputLabel`, `invalid`
 *   and (optionally) `required`.
 * @property {string} placeholder
 * @property {number} maxLength
 * @property {string} columnClass    Bootstrap grid classes of one input.
 * @property {string} [datalistId]   Datalist with suggestions.
 * @property {(value: string) => string} normalize   Brings input into canonical form.
 * @property {(value: string) => boolean} isValid    Judges a normalized, non-empty value.
 */

export class RepeatableFieldGroup {
  #fieldsContainer;
  #removeButton;
  #config;
  #i18n;
  #onInput;

  /**
   * @param {object} options
   * @param {HTMLElement} options.root
   * @param {FieldGroupConfig} options.config
   * @param {import('../i18n/i18n.js').I18n} options.i18n
   * @param {() => void} [options.onInput]  Called after the user changed an input.
   */
  constructor({ root, config, i18n, onInput = () => {} }) {
    this.#fieldsContainer = root.querySelector('[data-role="fields"]');
    this.#removeButton = root.querySelector('[data-action="remove"]');
    this.#config = config;
    this.#i18n = i18n;
    this.#onInput = onInput;

    root.querySelector('[data-action="add"]').addEventListener('click', () => this.#addField());
    this.#removeButton.addEventListener('click', () => this.#removeLastField());
    this.reset();
  }

  /** The normalized, non-empty values, each one once. */
  get values() {
    const values = this.#inputs.map((input) => this.#config.normalize(input.value));
    return [...new Set(values.filter((value) => value !== ''))];
  }

  /** Brings the group back to a single empty input. */
  reset() {
    this.#fieldsContainer.replaceChildren();
    this.#addField();
  }

  /**
   * Validates all inputs and shows an error on the invalid ones.
   *
   * @returns {boolean} Whether all inputs are valid. Empty inputs are valid.
   */
  validate() {
    return this.#inputs.map((input) => this.#validateInput(input)).every(Boolean);
  }

  /** Marks the first input as required, e.g. because another group is empty too. */
  showRequiredError() {
    const [firstInput] = this.#inputs;
    showFieldError(
      firstInput,
      feedbackOf(firstInput),
      `${this.#config.messagePrefix}.required`,
      this.#i18n,
    );
  }

  get #inputs() {
    return [...this.#fieldsContainer.querySelectorAll('input')];
  }

  #addField() {
    const { messagePrefix, placeholder, maxLength, columnClass, datalistId } = this.#config;
    const input = el('input', {
      className: 'form-control',
      attrs: {
        type: 'text',
        placeholder,
        maxlength: String(maxLength),
        autocomplete: 'off',
        spellcheck: 'false',
        list: datalistId ?? false,
      },
      dataset: { i18nAttr: `aria-label:${messagePrefix}.inputLabel` },
    });
    input.addEventListener('input', () => {
      this.#validateInput(input);
      this.#onInput();
    });
    input.addEventListener('change', () => {
      input.value = this.#config.normalize(input.value);
    });

    const field = el('div', {
      className: `${columnClass} mb-3`,
      children: [
        input,
        el('div', { className: 'valid-feedback', dataset: { i18n: 'form.valid' } }),
        el('div', { className: 'invalid-feedback' }),
      ],
    });
    translateDom(field, this.#i18n);
    this.#fieldsContainer.append(field);
    this.#updateRemoveButton();
  }

  #removeLastField() {
    this.#fieldsContainer.lastElementChild.remove();
    this.#updateRemoveButton();
  }

  #updateRemoveButton() {
    this.#removeButton.hidden = this.#fieldsContainer.childElementCount <= 1;
  }

  #validateInput(input) {
    const value = this.#config.normalize(input.value);
    const valid = value === '' || this.#config.isValid(value);
    if (valid) {
      clearFieldError(input, feedbackOf(input));
    } else {
      showFieldError(input, feedbackOf(input), `${this.#config.messagePrefix}.invalid`, this.#i18n);
    }
    return valid;
  }
}

function feedbackOf(input) {
  return input.parentElement.querySelector('.invalid-feedback');
}
