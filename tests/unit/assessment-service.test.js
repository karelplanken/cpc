import { describe, expect, it } from 'vitest';
import { PolicyEngine } from '../../docs/js/domain/policy.js';
import {
  AssessmentService,
  SdsError,
  SdsErrorCode,
  SourceType,
} from '../../docs/js/services/assessment-service.js';
import { loadReferenceData } from '../helpers/site.js';

const referenceData = loadReferenceData();

function createService(extractText) {
  return new AssessmentService({
    policyEngine: new PolicyEngine(referenceData.policyLists),
    referenceData,
    pdfTextExtractor: { extractText },
  });
}
const file = { name: 'sheet.pdf' };

describe('AssessmentService.assessManualInput', () => {
  it('creates a report for manual input', () => {
    const report = createService().assessManualInput({
      casrns: ['132-32-1'],
      hCodes: ['H350'],
      pCodes: ['P201'],
    });

    expect(report.source).toEqual({ type: SourceType.MANUAL });
    expect(report.szwPublishedAt).toBe(referenceData.szwPublishedAt);
    expect(report.assessment.verdict.allowed).toBe(false);
    expect(report.assessment.pCodes).toEqual(['P201']);
  });
});

describe('AssessmentService.assessSdsFile', () => {
  it('creates a report from the identifiers in the text of the file', async () => {
    const service = createService(async () => 'Ethanol 64-17-5 H225 H319 P210');
    const report = await service.assessSdsFile(file);

    expect(report.source).toEqual({ type: SourceType.FILE, fileName: 'sheet.pdf' });
    expect(report.assessment.casrns.map((result) => result.casrn)).toEqual(['64-17-5']);
    expect(report.assessment.hCodes.map((result) => result.code)).toEqual(['H225', 'H319']);
    expect(report.assessment.pCodes).toEqual(['P210']);
  });

  it('accepts a file with H codes only', async () => {
    const report = await createService(async () => 'H350').assessSdsFile(file);
    expect(report.assessment.verdict.allowed).toBe(false);
  });

  it.each([
    ['the file cannot be read', () => Promise.reject(new Error('boom')), SdsErrorCode.UNREADABLE],
    ['the file has no text', async () => ' \n ', SdsErrorCode.NO_TEXT],
    [
      'the text has neither CAS RN nor H code',
      async () => 'Only P280 here',
      SdsErrorCode.NO_IDENTIFIERS,
    ],
  ])('rejects when %s', async (_description, extractText, code) => {
    const error = await createService(extractText)
      .assessSdsFile(file)
      .catch((reason) => reason);

    expect(error).toBeInstanceOf(SdsError);
    expect(error.code).toBe(code);
  });

  it('keeps the original error as cause', async () => {
    const cause = new Error('boom');
    const error = await createService(() => Promise.reject(cause))
      .assessSdsFile(file)
      .catch((reason) => reason);
    expect(error.cause).toBe(cause);
  });
});
