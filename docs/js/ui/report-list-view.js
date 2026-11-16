/**
 * Shows all reports of the store, oldest first. The list is small, so it is
 * simply rendered anew whenever the reports or the language change.
 */
import { renderReport } from './report-view.js';

export class ReportListView {
  #container;
  #context;

  /**
   * @param {HTMLElement} container
   * @param {import('./report-view.js').ReportViewContext} context
   */
  constructor(container, context) {
    this.#container = container;
    this.#context = context;
  }

  /** @param {object[]} reports */
  render(reports) {
    this.#container.replaceChildren(
      ...reports.map((report) => renderReport(report, this.#context)),
    );
  }
}
