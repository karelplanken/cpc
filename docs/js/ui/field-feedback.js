/**
 * Shows validation errors on form fields the Bootstrap way: the field gets a
 * custom validity and the message is put in its `.invalid-feedback` element.
 *
 * The message key is kept on the feedback element as `data-i18n`, so a visible
 * error follows along when the user switches language.
 */

/**
 * @param {HTMLInputElement} input
 * @param {HTMLElement} feedback
 * @param {string} messageKey
 * @param {import('../i18n/i18n.js').I18n} i18n
 */
export function showFieldError(input, feedback, messageKey, i18n) {
  const message = i18n.t(messageKey);
  input.setCustomValidity(message);
  feedback.dataset.i18n = messageKey;
  feedback.textContent = message;
}

/**
 * @param {HTMLInputElement} input
 * @param {HTMLElement} feedback
 */
export function clearFieldError(input, feedback) {
  input.setCustomValidity('');
  delete feedback.dataset.i18n;
  feedback.textContent = '';
}
