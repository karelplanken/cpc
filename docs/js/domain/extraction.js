/**
 * Extraction of CAS RNs, H codes and P codes from free text, typically the
 * text of a Safety Data Sheet (SDS).
 */
import { CASRN_PATTERN_SOURCE, compareCasrns, isValidCasrn } from './casrn.js';
import {
  SINGLE_H_CODE_SOURCE,
  SINGLE_P_CODE_SOURCE,
  compareCodes,
  normalizeCode,
  splitCode,
} from './statement-codes.js';

/** A combination in an SDS joins at most this many codes, e.g. P303+P361+P353. */
const MAX_CODES_PER_COMBINATION = 4;

/** A CAS RN that is not followed by another digit (which would make it e.g. a date). */
const CASRN_REGEX = new RegExp(String.raw`${CASRN_PATTERN_SOURCE}(?!\d)`, 'g');

/** H codes, excluding EU specific codes such as EUH066. */
const H_CODE_REGEX = combinationRegex(SINGLE_H_CODE_SOURCE, '(?<!EU)');

const P_CODE_REGEX = combinationRegex(SINGLE_P_CODE_SOURCE);

function combinationRegex(singleCodeSource, prefix = '') {
  const joinedCodes = String.raw`(?:${singleCodeSource}\s*\+\s*){0,${MAX_CODES_PER_COMBINATION - 1}}`;
  return new RegExp(`${prefix}${joinedCodes}${singleCodeSource}`, 'g');
}

/**
 * @typedef {object} Identifiers
 * @property {string[]} casrns  Valid CAS RNs, in ascending order.
 * @property {string[]} hCodes  Known H codes, single codes before combinations.
 * @property {string[]} pCodes  Known P codes, single codes before combinations.
 */

/**
 * Extracts all valid, known identifiers from a text. Every identifier is
 * returned once.
 *
 * @param {string} text
 * @param {object} catalog
 * @param {(code: string) => boolean} catalog.isKnownHCode
 * @param {(code: string) => boolean} catalog.isKnownPCode
 * @returns {Identifiers}
 */
export function extractIdentifiers(text, { isKnownHCode, isKnownPCode }) {
  const casrns = unique(text.match(CASRN_REGEX) ?? []).filter(isValidCasrn);

  return {
    casrns: casrns.sort(compareCasrns),
    hCodes: extractKnownCodes(text, H_CODE_REGEX, isKnownHCode),
    pCodes: extractKnownCodes(text, P_CODE_REGEX, isKnownPCode),
  };
}

/**
 * Finds (combined) codes in the text and keeps the known ones. A combination
 * that is not known as a whole, e.g. `H315+H319`, falls back to its known
 * single codes so that no hazard is silently dropped.
 */
function extractKnownCodes(text, regex, isKnownCode) {
  const knownCodes = (text.match(regex) ?? []).map(normalizeCode).flatMap((code) => {
    return isKnownCode(code) ? [code] : splitCode(code).filter(isKnownCode);
  });
  return unique(knownCodes).sort(compareCodes);
}

function unique(values) {
  return [...new Set(values)];
}
