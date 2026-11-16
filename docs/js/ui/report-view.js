/**
 * Renders a report as DOM. This is a pure view: everything it shows comes
 * from the report, the reference data and the translations.
 */
import { CasrnStatus, Category } from '../domain/policy.js';
import { SourceType } from '../services/assessment-service.js';
import { el } from './dom.js';

/** Bootstrap contextual colors used to signal how serious a result is. */
const Tone = Object.freeze({
  DANGER: 'danger',
  WARNING: 'warning',
  SUCCESS: 'success',
  NEUTRAL: 'dark',
});

const TONE_BY_CATEGORY = Object.freeze({
  [Category.FORBIDDEN]: Tone.DANGER,
  [Category.TOLERATED]: Tone.WARNING,
  [Category.NOT_FORBIDDEN]: Tone.SUCCESS,
});

/** From most to least serious; a section takes the most serious tone of its rows. */
const TONES_BY_SEVERITY = [Tone.DANGER, Tone.WARNING, Tone.NEUTRAL, Tone.SUCCESS];

/** Text classes per tone. Bootstrap's plain warning color is too light to read as text. */
const TEXT_CLASS_BY_TONE = Object.freeze({
  [Tone.DANGER]: 'text-danger',
  [Tone.WARNING]: 'text-warning-emphasis',
  [Tone.SUCCESS]: 'text-success',
  [Tone.NEUTRAL]: 'text-dark',
});

const NO_VALUE = '–';
const NO_PICTOGRAM = 'none';

/** Matches the `<fill in>` style placeholders that occur in statement texts. */
const PLACEHOLDER = /(<[^<>]+>)/;

/**
 * @typedef {object} ReportViewContext
 * @property {import('../i18n/i18n.js').I18n} i18n
 * @property {import('../data/reference-data.js').ReferenceData} referenceData
 * @property {string|URL} pictogramBaseUrl
 * @property {(id: string) => void} onRemove
 */

/**
 * @param {import('../services/assessment-service.js').Report & { id: string }} report
 * @param {ReportViewContext} context
 * @returns {HTMLElement}
 */
export function renderReport(report, context) {
  const { assessment, source } = report;
  // An SDS is expected to contain all three kinds of identifiers, so a missing
  // kind is reported. With manual input the user simply left the fields empty.
  const showEmptySections = source.type === SourceType.FILE;

  return el('article', {
    className: 'report border shadow-lg bg-white p-3 rounded-3 mb-3',
    attrs: { id: report.id },
    dataset: { verdict: assessment.verdict.allowed ? 'allowed' : 'forbidden' },
    children: [
      renderSource(report, context),
      renderCasrnSection(assessment.casrns, showEmptySections, context),
      renderHCodeSection(assessment.hCodes, showEmptySections, context),
      renderPCodeSection(assessment.pCodes, showEmptySections, context),
      renderVerdict(assessment.verdict, context),
      renderRemoveButton(report.id, context),
    ],
  });
}

function renderSource({ source, szwPublishedAt }, { i18n }) {
  const sourceName =
    source.type === SourceType.FILE ? source.fileName : i18n.t('report.source.manual');
  const listVersion = i18n.t('report.szwList', {
    date: i18n.formatDateTime(new Date(szwPublishedAt)),
  });

  return el('p', {
    className: 'report-source px-2 mb-3',
    children: [el('strong', { text: i18n.t('report.input') }), ` ${sourceName} (${listVersion})`],
  });
}

function renderCasrnSection(casrnResults, showWhenEmpty, context) {
  const { i18n } = context;
  if (casrnResults.length === 0 && !showWhenEmpty) {
    return null;
  }
  const rows = casrnResults.map((result) => ({
    tone: TONE_BY_CATEGORY[result.category],
    dataset: { category: String(result.category) },
    cells: [
      el('div', { className: 'col-12 col-sm-3 text-sm-end', text: result.casrn }),
      el('div', { className: 'col-12 col-sm-9', children: casrnStatusContent(result, i18n) }),
    ],
  }));
  return renderSection('casrns', 'report.casrn', rows, context);
}

function casrnStatusContent({ status }, i18n) {
  const content = [i18n.t(`report.casrn.status.${status}`)];
  if (status === CasrnStatus.SZW_TOLERATED) {
    content.push(
      el('br'),
      el('strong', { text: i18n.t('report.casrn.registrationNoteLabel') }),
      ` ${i18n.t('report.casrn.registrationNote')}`,
    );
  }
  return content;
}

function renderHCodeSection(hCodeResults, showWhenEmpty, context) {
  const { i18n, referenceData } = context;
  if (hCodeResults.length === 0 && !showWhenEmpty) {
    return null;
  }
  const rows = hCodeResults.map(({ code, allowed }) => {
    const { hazardClass, statement, pictograms } = referenceData.getHStatement(code);
    return {
      tone: allowed ? Tone.SUCCESS : Tone.DANGER,
      dataset: { allowed: String(allowed) },
      cells: [
        el('div', {
          className: 'col-12 col-sm-3 text-sm-end my-auto',
          text: code,
          attrs: { title: i18n.pick(hazardClass) },
        }),
        el('div', {
          className: 'col-9 col-sm-7 my-auto',
          children: statementContent(i18n.pick(statement)),
        }),
        el('div', {
          className: 'col-3 col-sm-2 my-auto text-end',
          children: renderPictograms(pictograms, context),
        }),
      ],
    };
  });
  return renderSection('hCodes', 'report.hCode', rows, context);
}

function renderPCodeSection(pCodes, showWhenEmpty, context) {
  const { i18n, referenceData } = context;
  if (pCodes.length === 0 && !showWhenEmpty) {
    return null;
  }
  const rows = pCodes.map((code) => ({
    tone: Tone.NEUTRAL,
    cells: [
      el('div', { className: 'col-12 col-sm-3 text-sm-end my-auto', text: code }),
      el('div', {
        className: 'col-12 col-sm-9 my-auto',
        text: i18n.pick(referenceData.getPStatement(code).statement),
      }),
    ],
  }));
  return renderSection('pCodes', 'report.pCode', rows, context);
}

/**
 * Renders a bordered section with a heading and one row per result, or a
 * single "none found" row when there are no results.
 *
 * @param {string} name       Identifies the section, e.g. for tests and styling.
 * @param {string} keyPrefix  Prefix of the `heading` and `none` message keys.
 * @param {{ tone: string, dataset?: object, cells: Node[] }[]} rows
 * @param {ReportViewContext} context
 */
function renderSection(name, keyPrefix, rows, { i18n }) {
  const visibleRows =
    rows.length > 0
      ? rows
      : [
          {
            tone: Tone.NEUTRAL,
            cells: [
              el('div', { className: 'col-12 col-sm-3 text-sm-end', text: NO_VALUE }),
              el('div', { className: 'col-12 col-sm-9', text: i18n.t(`${keyPrefix}.none`) }),
            ],
          },
        ];
  const sectionTone = TONES_BY_SEVERITY.find((tone) =>
    visibleRows.some((row) => row.tone === tone),
  );

  return el('section', {
    className: `report-section border border-${sectionTone} rounded-3 mb-3`,
    dataset: { section: name },
    children: [
      el('h3', { className: 'report-section-title m-2', text: i18n.t(`${keyPrefix}.heading`) }),
      ...visibleRows.map(({ tone, dataset, cells }) =>
        el('div', {
          className: `row ${TEXT_CLASS_BY_TONE[tone]} m-1`,
          dataset: { row: '', ...dataset },
          children: cells,
        }),
      ),
    ],
  });
}

/** Emphasizes `<fill in>` style placeholders in a statement text. */
function statementContent(text) {
  return text
    .split(PLACEHOLDER)
    .filter((part) => part !== '')
    .map((part) => (PLACEHOLDER.test(part) ? el('em', { text: part }) : part));
}

function renderPictograms(pictograms, { i18n, pictogramBaseUrl }) {
  const codes = pictograms.length > 0 ? pictograms : [NO_PICTOGRAM];
  return codes.map((code) =>
    el('img', {
      className: 'pictogram',
      attrs: {
        src: new URL(`${code}.svg`, pictogramBaseUrl).href,
        alt: i18n.t(`pictogram.${code}`),
        title: i18n.t(`pictogram.${code}`),
      },
    }),
  );
}

function renderVerdict({ allowed, basis, subject }, { i18n }) {
  const tone = allowed ? Tone.SUCCESS : Tone.DANGER;
  const messageKey = allowed
    ? `report.verdict.allowed.${subject}`
    : `report.verdict.forbidden.${basis}.${subject}`;

  return el('section', {
    className: `report-section border border-${tone} ${TEXT_CLASS_BY_TONE[tone]} rounded-3`,
    dataset: { section: 'verdict' },
    children: [
      el('div', {
        className: 'row m-1',
        children: [
          el('div', {
            className: 'col-12 col-sm-3 text-sm-end my-auto',
            text: i18n.t('report.verdict.label'),
          }),
          el('strong', { className: 'col-12 col-sm-9 my-auto', text: i18n.t(messageKey) }),
        ],
      }),
    ],
  });
}

function renderRemoveButton(reportId, { i18n, onRemove }) {
  const button = el('button', {
    className: 'btn btn-outline-secondary btn-sm',
    text: i18n.t('report.remove'),
    attrs: { type: 'button' },
    dataset: { action: 'remove-report' },
  });
  button.addEventListener('click', () => onRemove(reportId));

  return el('div', { className: 'mt-3 text-end d-print-none', children: [button] });
}
