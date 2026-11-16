import { describe, expect, it } from 'vitest';
import {
  CasrnStatus,
  Category,
  PolicyEngine,
  Subject,
  VerdictBasis,
} from '../../docs/js/domain/policy.js';
import { loadReferenceData } from '../helpers/site.js';

/** Small, self-explanatory lists so the tests do not depend on the real data. */
const LISTED = '132-32-1';
const LISTED_BUT_TOLERATED = '64-17-5';
const TOLERATED_DESPITE_H_CODE = '7758-99-8';
const UNLISTED = '7732-18-5';
const OTHER_UNLISTED = '7647-14-5';

const engine = new PolicyEngine({
  szwCasrns: new Set([LISTED, LISTED_BUT_TOLERATED]),
  toleratedSzwCasrns: new Set([LISTED_BUT_TOLERATED]),
  toleratedHCasrns: new Set([TOLERATED_DESPITE_H_CODE]),
  forbiddenHCodes: new Set(['H350', 'H300', 'H410']),
});

describe('PolicyEngine.classifyCasrn', () => {
  it.each([
    ['a listed CAS RN', LISTED, CasrnStatus.SZW_LISTED, Category.FORBIDDEN, false],
    [
      'a listed but tolerated CAS RN',
      LISTED_BUT_TOLERATED,
      CasrnStatus.SZW_TOLERATED,
      Category.TOLERATED,
      true,
    ],
    [
      'a CAS RN tolerated despite its H codes',
      TOLERATED_DESPITE_H_CODE,
      CasrnStatus.H_TOLERATED,
      Category.TOLERATED,
      true,
    ],
    ['an unlisted CAS RN', UNLISTED, CasrnStatus.NOT_LISTED, Category.NOT_FORBIDDEN, true],
  ])('classifies %s', (_description, casrn, status, category, allowed) => {
    expect(engine.classifyCasrn(casrn)).toEqual({ casrn, status, category, allowed });
  });
});

describe('PolicyEngine.classifyHCode', () => {
  it('forbids a listed H code', () => {
    expect(engine.classifyHCode('H350')).toEqual({ code: 'H350', allowed: false });
  });

  it('allows other H codes', () => {
    expect(engine.classifyHCode('H302')).toEqual({ code: 'H302', allowed: true });
  });

  it('forbids a combination when one of its codes is forbidden', () => {
    expect(engine.classifyHCode('H300+H310').allowed).toBe(false);
    expect(engine.classifyHCode('H302+H312').allowed).toBe(true);
  });
});

describe('PolicyEngine.assess', () => {
  const verdictOf = (identifiers) => engine.assess(identifiers).verdict;

  it('returns the classified identifiers and passes P codes through', () => {
    const assessment = engine.assess({ casrns: [UNLISTED], hCodes: ['H302'], pCodes: ['P280'] });
    expect(assessment.casrns).toEqual([engine.classifyCasrn(UNLISTED)]);
    expect(assessment.hCodes).toEqual([{ code: 'H302', allowed: true }]);
    expect(assessment.pCodes).toEqual(['P280']);
  });

  describe('subject of the verdict', () => {
    it.each([
      ['no CAS RN', [], Subject.UNKNOWN],
      ['one CAS RN', [UNLISTED], Subject.SUBSTANCE],
      ['several CAS RNs', [UNLISTED, OTHER_UNLISTED], Subject.MIXTURE],
    ])('with %s', (_description, casrns, subject) => {
      expect(verdictOf({ casrns, hCodes: ['H302'] }).subject).toBe(subject);
    });
  });

  it('allows a substance without listed CAS RN and without forbidden H code', () => {
    expect(verdictOf({ casrns: [UNLISTED], hCodes: ['H302'] })).toEqual({
      allowed: true,
      basis: null,
      subject: Subject.SUBSTANCE,
    });
  });

  it('forbids a listed CAS RN', () => {
    expect(verdictOf({ casrns: [LISTED] })).toEqual({
      allowed: false,
      basis: VerdictBasis.CASRN,
      subject: Subject.SUBSTANCE,
    });
  });

  it('forbids a mixture that contains a listed CAS RN', () => {
    expect(verdictOf({ casrns: [UNLISTED, LISTED] })).toEqual({
      allowed: false,
      basis: VerdictBasis.CASRN,
      subject: Subject.MIXTURE,
    });
  });

  it('forbids a listed CAS RN even when another CAS RN is tolerated', () => {
    expect(verdictOf({ casrns: [LISTED_BUT_TOLERATED, LISTED] }).allowed).toBe(false);
  });

  it('forbids a forbidden H code', () => {
    expect(verdictOf({ casrns: [UNLISTED], hCodes: ['H302', 'H350'] })).toEqual({
      allowed: false,
      basis: VerdictBasis.H_CODE,
      subject: Subject.SUBSTANCE,
    });
  });

  it('forbids a forbidden H code without any CAS RN', () => {
    expect(verdictOf({ hCodes: ['H350'] })).toEqual({
      allowed: false,
      basis: VerdictBasis.H_CODE,
      subject: Subject.UNKNOWN,
    });
  });

  it('bases the verdict on the CAS RN when both CAS RN and H code are forbidden', () => {
    expect(verdictOf({ casrns: [LISTED], hCodes: ['H350'] }).basis).toBe(VerdictBasis.CASRN);
  });

  it('lets a tolerated CAS RN overrule forbidden H codes', () => {
    expect(verdictOf({ casrns: [TOLERATED_DESPITE_H_CODE], hCodes: ['H410'] }).allowed).toBe(true);
    expect(verdictOf({ casrns: [LISTED_BUT_TOLERATED, UNLISTED], hCodes: ['H350'] }).allowed).toBe(
      true,
    );
  });

  it('allows empty input, which callers are expected to prevent', () => {
    expect(verdictOf({})).toEqual({ allowed: true, basis: null, subject: Subject.UNKNOWN });
  });
});

/**
 * Characterization of version 2 of the app with the real lists: the same
 * manual inputs must lead to the same verdicts.
 */
describe('verdicts with the real policy lists', () => {
  const realEngine = new PolicyEngine(loadReferenceData().policyLists);

  it.each([
    [{ casrns: ['64-19-7'], hCodes: ['H226', 'H314'] }, true, null],
    [{ casrns: ['865-49-6'], hCodes: ['H302', 'H315', 'H351', 'H373'] }, true, null],
    [{ casrns: ['7732-18-5'] }, true, null],
    [{ casrns: ['132-32-1'], hCodes: ['H350'] }, false, VerdictBasis.CASRN],
    [{ hCodes: ['H350'] }, false, VerdictBasis.H_CODE],
    [{ hCodes: ['H302'] }, true, null],
    [{ casrns: ['64-17-5', '7732-18-5'], hCodes: ['H225', 'H350'] }, true, null],
    [{ casrns: ['7732-18-5', '7647-14-5'], hCodes: ['H350'] }, false, VerdictBasis.H_CODE],
    [{ casrns: ['7732-18-5', '132-32-1'] }, false, VerdictBasis.CASRN],
    [{ casrns: ['7758-99-8'], hCodes: ['H410'] }, true, null],
    [{ casrns: ['64-17-5'] }, true, null],
  ])('%j', (identifiers, allowed, basis) => {
    expect(realEngine.assess(identifiers).verdict).toMatchObject({ allowed, basis });
  });

  it('forbids H300+H310, which version 2 let through', () => {
    expect(realEngine.assess({ hCodes: ['H300+H310'] }).verdict.allowed).toBe(false);
  });
});
