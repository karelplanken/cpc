/**
 * The form that takes a Safety Data Sheet as PDF file.
 */
import { SdsError, SdsErrorCode } from '../services/assessment-service.js';
import { clearFieldError, showFieldError } from './field-feedback.js';

const PDF_MIME_TYPE = 'application/pdf';
const PDF_EXTENSION = /\.pdf$/i;

export class FileForm {
  #form;
  #fileInput;
  #feedback;
  #submitButton;
  #spinner;
  #i18n;
  #onSubmit;

  /**
   * @param {object} options
   * @param {HTMLFormElement} options.form
   * @param {import('../i18n/i18n.js').I18n} options.i18n
   * @param {(file: File) => Promise<void>} options.onSubmit  Processes the file. May
   *   reject with an {@link SdsError}, which is shown to the user as a field error.
   */
  constructor({ form, i18n, onSubmit }) {
    this.#form = form;
    this.#fileInput = form.querySelector('input[type="file"]');
    this.#feedback = form.querySelector('.invalid-feedback');
    this.#submitButton = form.querySelector('[type="submit"]');
    this.#spinner = form.querySelector('.spinner-border');
    this.#i18n = i18n;
    this.#onSubmit = onSubmit;

    this.#fileInput.addEventListener('input', () => this.#clearError());
    this.#form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#handleSubmit();
    });
  }

  get element() {
    return this.#form;
  }

  reset() {
    this.#form.reset();
    this.#clearError();
  }

  async #handleSubmit() {
    this.#clearError();
    const [file] = this.#fileInput.files;
    const precheckError = precheck(file);
    if (precheckError) {
      this.#showError(`fileForm.error.${precheckError}`);
      return;
    }

    this.#setBusy(true);
    try {
      await this.#onSubmit(file);
      this.reset();
    } catch (error) {
      if (!(error instanceof SdsError)) {
        console.error(error);
      }
      const code = error instanceof SdsError ? error.code : SdsErrorCode.UNREADABLE;
      this.#showError(`fileForm.error.${code}`);
    } finally {
      this.#setBusy(false);
    }
  }

  #showError(messageKey) {
    showFieldError(this.#fileInput, this.#feedback, messageKey, this.#i18n);
    this.#form.classList.add('was-validated');
  }

  #clearError() {
    clearFieldError(this.#fileInput, this.#feedback);
    this.#form.classList.remove('was-validated');
  }

  #setBusy(busy) {
    this.#submitButton.disabled = busy;
    this.#spinner.hidden = !busy;
  }
}

/**
 * Cheap checks that need no parsing.
 *
 * @param {File|undefined} file
 * @returns {string|null} The error code, or null when the file looks fine.
 */
function precheck(file) {
  if (!file) {
    return 'noFile';
  }
  // Some systems report no MIME type at all; then the extension decides.
  const looksLikePdf =
    file.type === PDF_MIME_TYPE || (file.type === '' && PDF_EXTENSION.test(file.name));
  return looksLikePdf ? null : 'notPdf';
}
