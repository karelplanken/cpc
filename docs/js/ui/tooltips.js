/**
 * Adapter around Bootstrap's tooltips. Bootstrap copies the `title` of an
 * element when a tooltip is created, so the tooltips are created anew
 * whenever the titles change, e.g. after switching language.
 */
const TOOLTIP_SELECTOR = '[data-bs-toggle="tooltip"]';

export class Tooltips {
  #bootstrap;
  #instances = [];

  /**
   * @param {{ Tooltip: Function }|undefined} bootstrap  The Bootstrap namespace. Without
   *   it the browser's native `title` tooltips remain in use.
   */
  constructor(bootstrap) {
    this.#bootstrap = bootstrap;
  }

  /** Removes all tooltips and restores the `title` attributes. */
  dispose() {
    this.#instances.forEach((tooltip) => tooltip.dispose());
    this.#instances = [];
  }

  /**
   * Creates tooltips for all elements below root that ask for one.
   *
   * @param {ParentNode} root
   */
  attach(root) {
    if (!this.#bootstrap) {
      return;
    }
    for (const element of root.querySelectorAll(TOOLTIP_SELECTOR)) {
      this.#instances.push(
        new this.#bootstrap.Tooltip(element, { trigger: 'hover', container: 'body' }),
      );
    }
  }
}
