/**
 * The form in which CAS RNs, H codes and P codes are entered by hand.
 */
import { isValidCasrn } from '../domain/casrn.js';
import { normalizeCode } from '../domain/statement-codes.js';
import { RepeatableFieldGroup } from './repeatable-field-group.js';

export class ManualForm {
  #form;
  #groups = {};
  #onSubmit;

  /**
   * @param {object} options
   * @param {HTMLFormElement} options.form
   * @param {import('../i18n/i18n.js').I18n} options.i18n
   * @param {(code: string) => boolean} options.isKnownHCode
   * @param {(code: string) => boolean} options.isKnownPCode
   * @param {(identifiers: { casrns: string[], hCodes: string[], pCodes: string[] }) => void}
   *   options.onSubmit  Called with valid input only.
   */
  constructor({ form, i18n, isKnownHCode, isKnownPCode, onSubmit }) {
    this.#form = form;
    this.#onSubmit = onSubmit;

    const createGroup = (name, config) =>
      new RepeatableFieldGroup({
        root: form.querySelector(`[data-field-group="${name}"]`),
        config: { messagePrefix: `manualForm.${name}`, ...config },
        i18n,
        onInput: () => this.#clearRequiredErrors(),
      });

    this.#groups = {
      casrn: createGroup('casrn', {
        placeholder: '00000000-00-0',
        maxLength: 13,
        columnClass: 'col-12 col-sm-4 col-md-3',
        normalize: (value) => value.trim(),
        isValid: isValidCasrn,
      }),
      hCode: createGroup('hCode', {
        placeholder: 'H123',
        maxLength: 20,
        columnClass: 'col-12 col-sm-6 col-md-4',
        datalistId: 'hCodeOptions',
        normalize: normalizeCode,
        isValid: isKnownHCode,
      }),
      pCode: createGroup('pCode', {
        placeholder: 'P123',
        maxLength: 20,
        columnClass: 'col-12 col-sm-6 col-md-4',
        datalistId: 'pCodeOptions',
        normalize: normalizeCode,
        isValid: isKnownPCode,
      }),
    };

    this.#form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSubmit();
    });
  }

  get element() {
    return this.#form;
  }

  reset() {
    Object.values(this.#groups).forEach((group) => group.reset());
    this.#form.classList.remove('was-validated');
  }

  /** The "required" errors depend on both groups, so input in either one lifts them. */
  #clearRequiredErrors() {
    this.#groups.casrn?.validate();
    this.#groups.hCode?.validate();
  }

  #handleSubmit() {
    const { casrn, hCode, pCode } = this.#groups;
    const allValid = [casrn, hCode, pCode].map((group) => group.validate()).every(Boolean);
    const identifiers = { casrns: casrn.values, hCodes: hCode.values, pCodes: pCode.values };

    // A verdict needs something to go on: at least one CAS RN or H code.
    const nothingToAssess = identifiers.casrns.length === 0 && identifiers.hCodes.length === 0;
    if (allValid && nothingToAssess) {
      casrn.showRequiredError();
      hCode.showRequiredError();
    }

    if (!allValid || nothingToAssess) {
      this.#form.classList.add('was-validated');
      return;
    }
    this.#onSubmit(identifiers);
    this.reset();
  }
}
