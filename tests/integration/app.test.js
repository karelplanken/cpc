// @vitest-environment jsdom
/**
 * Integration tests: the real page markup, translations and data files, wired
 * together like in the browser. Only PDF parsing is replaced by a stub.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PolicyEngine } from '../../docs/js/domain/policy.js';
import { AssessmentService } from '../../docs/js/services/assessment-service.js';
import { ReportStore } from '../../docs/js/state/report-store.js';
import { startApp } from '../../docs/js/ui/app.js';
import { Tooltips } from '../../docs/js/ui/tooltips.js';
import { createI18n, fixturesDir, loadReferenceData, readText, siteDir } from '../helpers/site.js';

const referenceData = loadReferenceData();
const pageMarkup = readText(siteDir, 'index.html');

/** Text per file name that the stubbed PDF parser "finds" in a file. */
const pdfTexts = new Map();
let i18n;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reports = () => $$('#reports article');
const rowCodes = (report, section) =>
  [...report.querySelectorAll(`[data-section="${section}"] [data-row] > :first-child`)].map(
    (cell) => cell.textContent,
  );
const verdictText = (report) => report.querySelector('[data-section="verdict"] strong').textContent;

function type(input, value) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function chooseMethod(id) {
  const radio = document.getElementById(id);
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
}

function submit(formId) {
  document.getElementById(formId).dispatchEvent(new Event('submit', { cancelable: true }));
}

const groupInputs = (group) => $$(`[data-field-group="${group}"] input`);

function submitManualInput({ casrns = [], hCodes = [], pCodes = [] }) {
  chooseMethod('manualMethod');
  for (const [group, values] of Object.entries({ casrn: casrns, hCode: hCodes, pCode: pCodes })) {
    values.forEach((value, index) => {
      if (index > 0) {
        $(`[data-field-group="${group}"] [data-action="add"]`).click();
      }
      type(groupInputs(group)[index], value);
    });
  }
  submit('manualForm');
}

async function submitFile(name, mimeType = 'application/pdf') {
  chooseMethod('fileMethod');
  const file = new File(['%PDF'], name, { type: mimeType });
  Object.defineProperty($('#sdsFile'), 'files', { value: [file], configurable: true });
  submit('fileForm');
  await vi.waitFor(() => expect($('#fileForm button[type="submit"]').disabled).toBe(false));
}

beforeEach(() => {
  document.documentElement.innerHTML = pageMarkup.replace(/^[\s\S]*?<html[^>]*>/, '');
  pdfTexts.clear();
  i18n = createI18n('en');

  startApp({
    document,
    i18n,
    referenceData,
    assessmentService: new AssessmentService({
      policyEngine: new PolicyEngine(referenceData.policyLists),
      referenceData,
      pdfTextExtractor: {
        extractText: async (file) => {
          if (!pdfTexts.has(file.name)) {
            throw new Error('Invalid PDF');
          }
          return pdfTexts.get(file.name);
        },
      },
    }),
    reportStore: new ReportStore(),
    tooltips: new Tooltips(undefined),
    pictogramBaseUrl: 'https://example.test/assets/pictograms/',
    appVersion: '9.9.9',
  });
});

describe('page', () => {
  it('starts in English with both forms hidden', () => {
    expect(document.documentElement.lang).toBe('en-US');
    expect($('legend[data-i18n="input.heading"]').textContent).toBe('Select input method:');
    expect($('#fileForm').hidden).toBe(true);
    expect($('#manualForm').hidden).toBe(true);
    expect($('#appVersion').textContent).toBe('CPC version 9.9.9');
  });

  it('has a translation for every key used in the markup', () => {
    const keys = [
      ...$$('[data-i18n]').map((element) => element.dataset.i18n),
      ...$$('[data-i18n-html]').map((element) => element.dataset.i18nHtml),
      ...$$('[data-i18n-attr]').flatMap((element) =>
        element.dataset.i18nAttr.split(';').map((pair) => pair.split(':')[1].trim()),
      ),
    ];
    expect(keys.length).toBeGreaterThan(20);
    for (const key of keys) {
      expect(i18n.t(key), key).not.toBe(key);
    }
  });

  it('shows only the form of the chosen input method', () => {
    chooseMethod('manualMethod');
    expect($('#manualForm').hidden).toBe(false);
    expect($('#fileForm').hidden).toBe(true);

    chooseMethod('fileMethod');
    expect($('#manualForm').hidden).toBe(true);
    expect($('#fileForm').hidden).toBe(false);
  });

  it('offers the known H and P codes as suggestions', () => {
    expect($$('#hCodeOptions option')).toHaveLength(referenceData.hCodes.length);
    expect($('#pCodeOptions option[value="P102"]').label).toBe('Keep out of reach of children.');
  });
});

describe('manual input', () => {
  it('reports a forbidden substance', () => {
    submitManualInput({ casrns: ['132-32-1'], hCodes: ['H350'], pCodes: ['P201'] });

    const [report] = reports();
    expect(report.dataset.verdict).toBe('forbidden');
    expect(report.querySelector('.report-source').textContent).toMatch(
      /^Input: manual \(SZW list of Jan 2, 2025, 9:00\sAM\)$/,
    );
    expect(rowCodes(report, 'casrns')).toEqual(['132-32-1']);
    expect(rowCodes(report, 'hCodes')).toEqual(['H350']);
    expect(rowCodes(report, 'pCodes')).toEqual(['P201']);
    expect(verdictText(report)).toBe('This substance is forbidden based on its CAS RN.');
    expect(report.querySelector('[data-section="hCodes"] img').src).toBe(
      'https://example.test/assets/pictograms/GHS08.svg',
    );
  });

  it('reports a tolerated substance with the registration note', () => {
    submitManualInput({ casrns: ['64-17-5'], hCodes: ['H225'] });

    const [report] = reports();
    expect(report.dataset.verdict).toBe('allowed');
    expect(report.querySelector('[data-category="2"]').textContent).toContain(
      'Please note: exposure must be registered!',
    );
    expect(verdictText(report)).toBe('This substance is not forbidden.');
  });

  it('leaves out the sections that were not filled in', () => {
    submitManualInput({ hCodes: ['H350'] });

    const [report] = reports();
    expect(report.querySelector('[data-section="casrns"]')).toBeNull();
    expect(report.querySelector('[data-section="pCodes"]')).toBeNull();
    expect(verdictText(report)).toBe(
      'This substance or mixture is forbidden based on one or more H codes.',
    );
  });

  it('shows the placeholder pictogram for statements without pictogram', () => {
    submitManualInput({ hCodes: ['H227'] });
    const image = reports()[0].querySelector('img');
    expect(image.src).toMatch(/none\.svg$/);
    expect(image.alt).toBe('No pictogram');
  });

  it('normalizes codes and ignores duplicates and empty inputs', () => {
    submitManualInput({ casrns: ['7732-18-5', '', ' 7732-18-5 '], hCodes: [' h302 + h312 '] });

    const [report] = reports();
    expect(rowCodes(report, 'casrns')).toEqual(['7732-18-5']);
    expect(rowCodes(report, 'hCodes')).toEqual(['H302+H312']);
  });

  it('resets and hides the form after a report was created', () => {
    submitManualInput({ casrns: ['7732-18-5', '7647-14-5'] });

    expect($('#manualForm').hidden).toBe(true);
    expect($('#manualMethod').checked).toBe(false);
    expect(groupInputs('casrn').map((input) => input.value)).toEqual(['']);
  });

  it('requires a CAS RN or an H code', () => {
    submitManualInput({ pCodes: ['P280'] });

    expect(reports()).toHaveLength(0);
    expect($('#manualForm').classList.contains('was-validated')).toBe(true);
    expect($('[data-field-group="casrn"] .invalid-feedback').textContent).toBe(
      'Required if H code is empty…',
    );
    expect($('[data-field-group="hCode"] .invalid-feedback').textContent).toBe(
      'Required if CAS RN is empty…',
    );

    type(groupInputs('hCode')[0], 'H302');
    expect(groupInputs('casrn')[0].validity.valid).toBe(true);
    submit('manualForm');
    expect(reports()).toHaveLength(1);
  });

  it.each([
    ['casrn', '64-17-6', 'Invalid CAS RN…'],
    ['hCode', 'H999', 'Invalid H code…'],
    ['pCode', 'P999', 'Invalid P code…'],
  ])('rejects an invalid %s', (group, value, message) => {
    chooseMethod('manualMethod');
    type(groupInputs('hCode')[0], 'H302');
    type(groupInputs(group)[0], value);
    submit('manualForm');

    expect(reports()).toHaveLength(0);
    expect($(`[data-field-group="${group}"] .invalid-feedback`).textContent).toBe(message);
    expect(groupInputs(group)[0].validity.customError).toBe(true);
    expect($('#manualForm').classList.contains('was-validated')).toBe(true);
  });

  it('adds and removes inputs', () => {
    chooseMethod('manualMethod');
    const removeButton = $('[data-field-group="hCode"] [data-action="remove"]');
    expect(removeButton.hidden).toBe(true);

    $('[data-field-group="hCode"] [data-action="add"]').click();
    expect(groupInputs('hCode')).toHaveLength(2);
    expect(removeButton.hidden).toBe(false);

    removeButton.click();
    expect(groupInputs('hCode')).toHaveLength(1);
    expect(removeButton.hidden).toBe(true);
  });
});

describe('file input', () => {
  it.each(['64-17-5', '7240-90-6', '7758-99-8'])(
    'reports the identifiers found in the text of %s.pdf',
    async (name) => {
      pdfTexts.set(`${name}.pdf`, readText(fixturesDir, 'sds-text', `${name}.txt`));
      await submitFile(`${name}.pdf`);

      const [report] = reports();
      expect(report.querySelector('.report-source').textContent).toContain(`${name}.pdf`);
      expect(rowCodes(report, 'casrns')).toEqual([name]);
      expect(verdictText(report)).toBe('This substance is not forbidden.');
      expect($('#fileForm').hidden).toBe(true);
    },
  );

  it('mentions the kinds of identifiers that were not found', async () => {
    pdfTexts.set('h-only.pdf', 'H350');
    await submitFile('h-only.pdf');

    const [report] = reports();
    expect(report.querySelector('[data-section="casrns"]').textContent).toContain(
      'No CAS RN found.',
    );
    expect(report.querySelector('[data-section="pCodes"]').textContent).toContain(
      'No P code found.',
    );
  });

  it('shows file names as text, not as markup', async () => {
    pdfTexts.set('<img src=x onerror=alert(1)>.pdf', 'H302');
    await submitFile('<img src=x onerror=alert(1)>.pdf');

    const source = reports()[0].querySelector('.report-source');
    expect(source.querySelector('img')).toBeNull();
    expect(source.textContent).toContain('<img src=x onerror=alert(1)>.pdf');
  });

  it.each([
    ['a file that is not a PDF', 'notes.txt', 'text/plain', null, 'This is not a PDF…'],
    ['an unreadable PDF', 'broken.pdf', 'application/pdf', null, 'This PDF could not be read…'],
    ['a PDF without text', 'scan.pdf', 'application/pdf', '', 'No text in this PDF…'],
    [
      'a PDF without identifiers',
      'letter.pdf',
      'application/pdf',
      'Dear reader',
      'No valid CAS RN or H code found in this PDF…',
    ],
  ])('rejects %s', async (_description, name, mimeType, text, message) => {
    if (text !== null) {
      pdfTexts.set(name, text);
    }
    await submitFile(name, mimeType);

    expect(reports()).toHaveLength(0);
    expect($('#fileForm .invalid-feedback').textContent).toBe(message);
    expect($('#fileForm').classList.contains('was-validated')).toBe(true);
    expect($('#fileForm').hidden).toBe(false);
  });

  it('asks for a file when none was selected', () => {
    chooseMethod('fileMethod');
    submit('fileForm');
    expect($('#fileForm .invalid-feedback').textContent).toBe('Select a file…');
  });

  it('clears the error when another file is selected', async () => {
    await submitFile('notes.txt', 'text/plain');
    $('#sdsFile').dispatchEvent(new Event('input', { bubbles: true }));

    expect($('#fileForm .invalid-feedback').textContent).toBe('');
    expect($('#fileForm').classList.contains('was-validated')).toBe(false);
  });
});

describe('reports', () => {
  it('are stacked and can be removed one by one', () => {
    submitManualInput({ casrns: ['7732-18-5'] });
    submitManualInput({ casrns: ['132-32-1'] });
    expect(reports().map((report) => report.dataset.verdict)).toEqual(['allowed', 'forbidden']);

    reports()[0].querySelector('[data-action="remove-report"]').click();
    expect(reports().map((report) => report.dataset.verdict)).toEqual(['forbidden']);
  });
});

describe('language', () => {
  it('switches the page, existing reports and visible errors to Dutch and back', () => {
    submitManualInput({ casrns: ['132-32-1'], hCodes: ['H350'] });
    chooseMethod('manualMethod');
    submit('manualForm');

    $('[data-locale="nl"]').click();

    expect(document.documentElement.lang).toBe('nl-NL');
    expect($('legend[data-i18n="input.heading"]').textContent).toBe('Selecteer invoermethode:');
    expect($('[data-locale="nl"]').getAttribute('aria-pressed')).toBe('true');
    expect($('[data-locale="en"]').classList.contains('active')).toBe(false);
    expect($('[data-field-group="casrn"] .invalid-feedback').textContent).toBe(
      'Verplicht als H code leeg is…',
    );
    expect($('#pCodeOptions option[value="P102"]').label).toBe(
      'Buiten het bereik van kinderen houden.',
    );

    const [report] = reports();
    expect(report.querySelector('.report-source').textContent).toBe(
      'Invoer: handmatig (SZW-lijst van 2 jan 2025, 09:00)',
    );
    expect(report.querySelector('[data-section="hCodes"]').textContent).toContain(
      'Kan kanker veroorzaken',
    );
    expect(verdictText(report)).toBe('Deze stof is verboden op basis van CAS RN.');

    $('[data-locale="en"]').click();
    expect(verdictText(reports()[0])).toBe('This substance is forbidden based on its CAS RN.');
  });
});
