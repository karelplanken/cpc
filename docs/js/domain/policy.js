/**
 * The compound policy: decides whether a substance or mixture is forbidden,
 * based on its CAS RNs and H codes.
 *
 * This module is pure domain logic. It knows nothing about the DOM, about
 * languages or about where the policy lists come from.
 */
import { splitCode } from './statement-codes.js';

/** Laboratory categories of chemical substances. */
export const Category = Object.freeze({
  /** Not allowed. */
  FORBIDDEN: 0,
  /** Temporarily allowed; cannot be determined by this app (yet). */
  TEMPORARILY_ALLOWED: 1,
  /** Hazardous but tolerated. */
  TOLERATED: 2,
  /** Not forbidden. */
  NOT_FORBIDDEN: 3,
});

/** Why a CAS RN was put in its category. */
export const CasrnStatus = Object.freeze({
  /** On the SZW list, but explicitly tolerated. Exposure must be registered. */
  SZW_TOLERATED: 'szwTolerated',
  /** On the SZW list. */
  SZW_LISTED: 'szwListed',
  /** Carries a forbidden H code, but explicitly tolerated. */
  H_TOLERATED: 'hTolerated',
  /** Not on the SZW list. */
  NOT_LISTED: 'notListed',
});

/** What the verdict is about, derived from the number of CAS RNs. */
export const Subject = Object.freeze({
  SUBSTANCE: 'substance',
  MIXTURE: 'mixture',
  /** No CAS RN is known, so it can be either. */
  UNKNOWN: 'substanceOrMixture',
});

/** What a "forbidden" verdict is based on. */
export const VerdictBasis = Object.freeze({
  CASRN: 'casrn',
  H_CODE: 'hCode',
});

/**
 * The rules that classify a CAS RN. The first rule that applies wins, so the
 * order matters: being tolerated takes precedence over being listed.
 */
const CASRN_RULES = Object.freeze([
  {
    status: CasrnStatus.SZW_TOLERATED,
    category: Category.TOLERATED,
    appliesTo: (casrn, lists) => lists.toleratedSzwCasrns.has(casrn),
  },
  {
    status: CasrnStatus.SZW_LISTED,
    category: Category.FORBIDDEN,
    appliesTo: (casrn, lists) => lists.szwCasrns.has(casrn),
  },
  {
    status: CasrnStatus.H_TOLERATED,
    category: Category.TOLERATED,
    appliesTo: (casrn, lists) => lists.toleratedHCasrns.has(casrn),
  },
  {
    status: CasrnStatus.NOT_LISTED,
    category: Category.NOT_FORBIDDEN,
    appliesTo: () => true,
  },
]);

/**
 * @typedef {object} PolicyLists
 * @property {Set<string>} szwCasrns           CAS RNs on the SZW CMR list.
 * @property {Set<string>} toleratedSzwCasrns  SZW listed CAS RNs that are tolerated.
 * @property {Set<string>} toleratedHCasrns    Tolerated CAS RNs with a forbidden H code.
 * @property {Set<string>} forbiddenHCodes     Single H codes that are forbidden.
 *
 * @typedef {object} CasrnResult
 * @property {string} casrn
 * @property {string} status    One of {@link CasrnStatus}.
 * @property {number} category  One of {@link Category}.
 * @property {boolean} allowed
 *
 * @typedef {object} HCodeResult
 * @property {string} code
 * @property {boolean} allowed
 *
 * @typedef {object} Verdict
 * @property {boolean} allowed
 * @property {string|null} basis  One of {@link VerdictBasis}; null when allowed.
 * @property {string} subject     One of {@link Subject}.
 *
 * @typedef {object} Assessment
 * @property {CasrnResult[]} casrns
 * @property {HCodeResult[]} hCodes
 * @property {string[]} pCodes
 * @property {Verdict} verdict
 */

export class PolicyEngine {
  #lists;

  /** @param {PolicyLists} lists */
  constructor(lists) {
    this.#lists = lists;
  }

  /**
   * @param {string} casrn
   * @returns {CasrnResult}
   */
  classifyCasrn(casrn) {
    const { status, category } = CASRN_RULES.find((rule) => rule.appliesTo(casrn, this.#lists));
    return { casrn, status, category, allowed: category !== Category.FORBIDDEN };
  }

  /**
   * A combined code such as H300+H310 is forbidden when any of its single
   * codes is forbidden.
   *
   * @param {string} code
   * @returns {HCodeResult}
   */
  classifyHCode(code) {
    const forbidden = splitCode(code).some((single) => this.#lists.forbiddenHCodes.has(single));
    return { code, allowed: !forbidden };
  }

  /**
   * Assesses a substance (one CAS RN) or a mixture (several CAS RNs).
   *
   * @param {object} identifiers
   * @param {string[]} [identifiers.casrns]
   * @param {string[]} [identifiers.hCodes]
   * @param {string[]} [identifiers.pCodes]
   * @returns {Assessment}
   */
  assess({ casrns = [], hCodes = [], pCodes = [] }) {
    const casrnResults = casrns.map((casrn) => this.classifyCasrn(casrn));
    const hCodeResults = hCodes.map((code) => this.classifyHCode(code));

    return {
      casrns: casrnResults,
      hCodes: hCodeResults,
      pCodes: [...pCodes],
      verdict: decideVerdict(casrnResults, hCodeResults),
    };
  }
}

/**
 * Combines the individual results into one verdict:
 *
 * 1. A forbidden CAS RN forbids the substance or mixture.
 * 2. Otherwise a tolerated CAS RN overrules forbidden H codes: the tolerance
 *    was granted knowing the hazards of that substance.
 * 3. Otherwise a forbidden H code forbids the substance or mixture.
 *
 * @param {CasrnResult[]} casrnResults
 * @param {HCodeResult[]} hCodeResults
 * @returns {Verdict}
 */
function decideVerdict(casrnResults, hCodeResults) {
  const subject = subjectFor(casrnResults.length);
  const hasCategory = (category) => casrnResults.some((result) => result.category === category);

  if (hasCategory(Category.FORBIDDEN)) {
    return { allowed: false, basis: VerdictBasis.CASRN, subject };
  }
  if (!hasCategory(Category.TOLERATED) && hCodeResults.some((result) => !result.allowed)) {
    return { allowed: false, basis: VerdictBasis.H_CODE, subject };
  }
  return { allowed: true, basis: null, subject };
}

function subjectFor(casrnCount) {
  if (casrnCount === 0) {
    return Subject.UNKNOWN;
  }
  return casrnCount === 1 ? Subject.SUBSTANCE : Subject.MIXTURE;
}
