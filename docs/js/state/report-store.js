/**
 * Observable store holding the reports that are currently on screen.
 * Views subscribe to it and re-render when it changes.
 */
export class ReportStore {
  #reports = [];
  #listeners = new Set();
  #nextId = 0;

  /** The stored reports, oldest first. Each has a unique `id`. */
  get reports() {
    return [...this.#reports];
  }

  /**
   * @param {import('../services/assessment-service.js').Report} report
   * @returns {string} The id assigned to the report.
   */
  add(report) {
    const id = `report-${this.#nextId}`;
    this.#nextId += 1;
    this.#reports.push({ ...report, id });
    this.#notify();
    return id;
  }

  /** @param {string} id */
  remove(id) {
    const remaining = this.#reports.filter((report) => report.id !== id);
    if (remaining.length !== this.#reports.length) {
      this.#reports = remaining;
      this.#notify();
    }
  }

  /**
   * @param {(reports: object[]) => void} listener
   * @returns {() => void} Function that removes the listener again.
   */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notify() {
    const reports = this.reports;
    this.#listeners.forEach((listener) => listener(reports));
  }
}
