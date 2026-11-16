/**
 * Application service: turns user input (manual input or an SDS file) into a
 * report. It coordinates PDF text extraction, identifier extraction and the
 * policy engine, and is independent of the user interface.
 */
import { extractIdentifiers } from '../domain/extraction.js';

/** Where the input of a report came from. */
export const SourceType = Object.freeze({
  FILE: 'file',
  MANUAL: 'manual',
});

/** Reasons why an SDS file cannot be assessed. */
export const SdsErrorCode = Object.freeze({
  /** The file could not be parsed as a PDF. */
  UNREADABLE: 'unreadable',
  /** The PDF contains no text, e.g. because it is a scan. */
  NO_TEXT: 'noText',
  /** The text contains neither a valid CAS RN nor a known H code. */
  NO_IDENTIFIERS: 'noIdentifiers',
});

export class SdsError extends Error {
  /**
   * @param {string} code  One of {@link SdsErrorCode}.
   * @param {ErrorOptions} [options]
   */
  constructor(code, options) {
    super(`The SDS cannot be assessed: ${code}`, options);
    this.name = 'SdsError';
    this.code = code;
  }
}

/**
 * @typedef {object} Report
 * @property {{ type: string, fileName?: string }} source
 * @property {string} szwPublishedAt  Version of the SZW list the report is based on.
 * @property {import('../domain/policy.js').Assessment} assessment
 */

export class AssessmentService {
  #policyEngine;
  #referenceData;
  #pdfTextExtractor;

  /**
   * @param {object} dependencies
   * @param {import('../domain/policy.js').PolicyEngine} dependencies.policyEngine
   * @param {import('../data/reference-data.js').ReferenceData} dependencies.referenceData
   * @param {{ extractText(file: Blob): Promise<string> }} dependencies.pdfTextExtractor
   */
  constructor({ policyEngine, referenceData, pdfTextExtractor }) {
    this.#policyEngine = policyEngine;
    this.#referenceData = referenceData;
    this.#pdfTextExtractor = pdfTextExtractor;
  }

  /**
   * @param {object} identifiers  Validated identifiers entered by the user.
   * @param {string[]} identifiers.casrns
   * @param {string[]} identifiers.hCodes
   * @param {string[]} identifiers.pCodes
   * @returns {Report}
   */
  assessManualInput(identifiers) {
    return this.#createReport({ type: SourceType.MANUAL }, identifiers);
  }

  /**
   * @param {File} file  A Safety Data Sheet as PDF.
   * @returns {Promise<Report>}
   * @throws {SdsError} When the file cannot be assessed.
   */
  async assessSdsFile(file) {
    const text = await this.#extractText(file);
    if (text.trim() === '') {
      throw new SdsError(SdsErrorCode.NO_TEXT);
    }

    const identifiers = extractIdentifiers(text, this.#referenceData);
    if (identifiers.casrns.length === 0 && identifiers.hCodes.length === 0) {
      throw new SdsError(SdsErrorCode.NO_IDENTIFIERS);
    }
    return this.#createReport({ type: SourceType.FILE, fileName: file.name }, identifiers);
  }

  async #extractText(file) {
    try {
      return await this.#pdfTextExtractor.extractText(file);
    } catch (cause) {
      throw new SdsError(SdsErrorCode.UNREADABLE, { cause });
    }
  }

  #createReport(source, identifiers) {
    return {
      source,
      szwPublishedAt: this.#referenceData.szwPublishedAt,
      assessment: this.#policyEngine.assess(identifiers),
    };
  }
}
