/**
 * GHS/CLP hazard (H) and precautionary (P) statement codes.
 *
 * A code is either a single code (`H302`, `P501A`) or a combination of codes
 * joined by a plus sign (`H302+H312`, `P305+P351+P338`).
 */

/** Source of a single H code: H2xx (physical), H3xx (health) or H4xx (environmental). */
export const SINGLE_H_CODE_SOURCE = String.raw`H[2-4]\d{2}`;

/** Source of a single P code: P1xx to P5xx, with an optional A/B variant suffix. */
export const SINGLE_P_CODE_SOURCE = String.raw`P[1-5]\d{2}[AB]?`;

const COMBINATION_SEPARATOR = '+';

/**
 * Brings user or document input into canonical form: upper case without
 * whitespace, e.g. `" h302 + h312 "` becomes `"H302+H312"`.
 *
 * @param {string} code
 * @returns {string}
 */
export function normalizeCode(code) {
  return code.replace(/\s+/g, '').toUpperCase();
}

/**
 * Splits a (combined) code into its single codes.
 *
 * @param {string} code
 * @returns {string[]}
 */
export function splitCode(code) {
  return code.split(COMBINATION_SEPARATOR);
}

/**
 * Orders codes the way they are presented in a report: single codes first,
 * then combinations, each group in ascending numerical order.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareCodes(a, b) {
  return sortKey(a) - sortKey(b);
}

/** `P210` becomes 210 and `P301+P312` becomes 301312, so combinations sort last. */
function sortKey(code) {
  return Number.parseInt(code.replace(/[HP+]/g, ''), 10);
}
