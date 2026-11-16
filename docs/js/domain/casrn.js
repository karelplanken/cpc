/**
 * CAS Registry Numbers (CAS RNs).
 *
 * A CAS RN has the form `NNNNNNN-NN-N`: two to seven (historically up to
 * eight) digits, two digits and a single check digit.
 */

/** Source of the CAS RN format, shared by form validation and text extraction. */
export const CASRN_PATTERN_SOURCE = String.raw`\d{2,8}-\d{2}-\d`;

const CASRN_PATTERN = new RegExp(`^${CASRN_PATTERN_SOURCE}$`);

/**
 * Checks the format and the check digit of a CAS RN.
 *
 * The check digit equals the sum of all other digits, each multiplied by its
 * position counted from the right (starting at 1), modulo 10.
 *
 * @param {string} casrn
 * @returns {boolean}
 */
export function isValidCasrn(casrn) {
  if (typeof casrn !== 'string' || !CASRN_PATTERN.test(casrn)) {
    return false;
  }
  const [checkDigit, ...otherDigits] = casrn.replaceAll('-', '').split('').reverse().map(Number);
  const checksum = otherDigits.reduce((sum, digit, index) => sum + digit * (index + 1), 0);
  return checksum % 10 === checkDigit;
}

/**
 * Orders CAS RNs numerically, e.g. 64-17-5 before 7732-18-5.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareCasrns(a, b) {
  return Number(a.replaceAll('-', '')) - Number(b.replaceAll('-', ''));
}
