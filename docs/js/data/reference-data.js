/**
 * Read-only access to the reference data in docs/data: the statement catalogs
 * and the policy lists. The JSON files are the single source of truth; see
 * docs/data/README.md for their format.
 */

/** The data files, relative to the data directory. */
export const DATA_FILES = Object.freeze({
  hStatements: 'h-statements.json',
  pStatements: 'p-statements.json',
  szwList: 'szw-cmr-list.json',
  toleratedSzwCasrns: 'tolerated-szw-casrns.json',
  toleratedHCasrns: 'tolerated-h-casrns.json',
  forbiddenHCodes: 'forbidden-h-codes.json',
});

/**
 * @typedef {Record<string, string>} LocalizedText  Text per locale, e.g. `{ en, nl }`.
 *
 * @typedef {object} HStatement
 * @property {string[]} pictograms        GHS pictogram codes, e.g. `["GHS02"]`.
 * @property {LocalizedText} hazardClass  Hazard class and category the statement applies to.
 * @property {LocalizedText} statement    The hazard statement itself.
 *
 * @typedef {object} PStatement
 * @property {LocalizedText} statement  The precautionary statement itself.
 */

export class ReferenceData {
  #hStatements;
  #pStatements;
  #policyLists;
  #szwPublishedAt;

  /**
   * @param {object} documents  The parsed JSON documents, keyed like {@link DATA_FILES}.
   */
  constructor({
    hStatements,
    pStatements,
    szwList,
    toleratedSzwCasrns,
    toleratedHCasrns,
    forbiddenHCodes,
  }) {
    this.#hStatements = new Map(Object.entries(hStatements.statements));
    this.#pStatements = new Map(Object.entries(pStatements.statements));
    this.#policyLists = Object.freeze({
      szwCasrns: new Set(szwList.casrns),
      toleratedSzwCasrns: new Set(toleratedSzwCasrns.casrns),
      toleratedHCasrns: new Set(toleratedHCasrns.casrns),
      forbiddenHCodes: new Set(forbiddenHCodes.codes),
    });
    this.#szwPublishedAt = szwList.meta.publishedAt;
  }

  /**
   * Loads all data files in parallel.
   *
   * @param {(url: URL) => Promise<any>} fetchJson
   * @param {string|URL} baseUrl  URL of the data directory, ending with a slash.
   * @returns {Promise<ReferenceData>}
   */
  static async load(fetchJson, baseUrl) {
    const entries = await Promise.all(
      Object.entries(DATA_FILES).map(async ([key, fileName]) => {
        return [key, await fetchJson(new URL(fileName, baseUrl))];
      }),
    );
    return new ReferenceData(Object.fromEntries(entries));
  }

  /** The lists the policy engine decides with. */
  get policyLists() {
    return this.#policyLists;
  }

  /** Publication date and time of the SZW list, as `YYYY-MM-DDTHH:mm`. */
  get szwPublishedAt() {
    return this.#szwPublishedAt;
  }

  /** All known H codes, in catalog order. */
  get hCodes() {
    return [...this.#hStatements.keys()];
  }

  /** All known P codes, in catalog order. */
  get pCodes() {
    return [...this.#pStatements.keys()];
  }

  isKnownHCode = (code) => this.#hStatements.has(code);

  isKnownPCode = (code) => this.#pStatements.has(code);

  /**
   * @param {string} code
   * @returns {HStatement|undefined}
   */
  getHStatement(code) {
    return this.#hStatements.get(code);
  }

  /**
   * @param {string} code
   * @returns {PStatement|undefined}
   */
  getPStatement(code) {
    return this.#pStatements.get(code);
  }
}
