/**
 * The user interface as a whole: wires the views and forms to the services
 * and keeps everything in sync with the chosen language.
 */
import { translateDom } from '../i18n/dom-translator.js';
import { populateDatalist } from './datalist.js';
import { FileForm } from './file-form.js';
import { InputMethodSwitch } from './input-method-switch.js';
import { LanguageSwitcher } from './language-switcher.js';
import { ManualForm } from './manual-form.js';
import { ReportListView } from './report-list-view.js';

/**
 * @param {object} dependencies
 * @param {Document} dependencies.document
 * @param {import('../i18n/i18n.js').I18n} dependencies.i18n
 * @param {import('../data/reference-data.js').ReferenceData} dependencies.referenceData
 * @param {import('../services/assessment-service.js').AssessmentService} dependencies.assessmentService
 * @param {import('../state/report-store.js').ReportStore} dependencies.reportStore
 * @param {import('./tooltips.js').Tooltips} dependencies.tooltips
 * @param {string|URL} dependencies.pictogramBaseUrl
 * @param {string} dependencies.appVersion
 */
export function startApp({
  document,
  i18n,
  referenceData,
  assessmentService,
  reportStore,
  tooltips,
  pictogramBaseUrl,
  appVersion,
}) {
  const byId = (id) => document.getElementById(id);

  const reportListView = new ReportListView(byId('reports'), {
    i18n,
    referenceData,
    pictogramBaseUrl,
    onRemove: (id) => reportStore.remove(id),
  });
  reportStore.subscribe((reports) => reportListView.render(reports));

  let inputMethodSwitch = null;
  const showReport = (report) => {
    const id = reportStore.add(report);
    inputMethodSwitch.reset();
    byId(id).scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  };

  const fileForm = new FileForm({
    form: byId('fileForm'),
    i18n,
    onSubmit: async (file) => showReport(await assessmentService.assessSdsFile(file)),
  });
  const manualForm = new ManualForm({
    form: byId('manualForm'),
    i18n,
    isKnownHCode: referenceData.isKnownHCode,
    isKnownPCode: referenceData.isKnownPCode,
    onSubmit: (identifiers) => showReport(assessmentService.assessManualInput(identifiers)),
  });
  inputMethodSwitch = new InputMethodSwitch([
    { radio: byId('fileMethod'), form: fileForm },
    { radio: byId('manualMethod'), form: manualForm },
  ]);

  new LanguageSwitcher({ root: byId('languageSwitcher'), i18n });
  byId('appVersion').dataset.i18nParams = JSON.stringify({ version: appVersion });

  /** Brings everything that shows text in line with the current language. */
  const applyLanguage = () => {
    document.documentElement.lang = i18n.languageTag;
    tooltips.dispose();
    translateDom(document, i18n);
    tooltips.attach(document);
    populateDatalist(byId('hCodeOptions'), referenceData.hCodes, (code) =>
      i18n.pick(referenceData.getHStatement(code).statement),
    );
    populateDatalist(byId('pCodeOptions'), referenceData.pCodes, (code) =>
      i18n.pick(referenceData.getPStatement(code).statement),
    );
    reportListView.render(reportStore.reports);
  };
  i18n.onChange(applyLanguage);
  applyLanguage();
}
