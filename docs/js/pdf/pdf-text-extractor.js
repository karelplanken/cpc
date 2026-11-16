/**
 * Adapter around PDF.js that turns a PDF file into plain text.
 *
 * PDF.js is large, so it is only loaded when the first PDF is processed.
 */

/** A text item that is exactly one CAS RN; see {@link joinTextItems}. */
const WHOLE_CASRN = /^\d{2,8}-\d{2}-\d$/;

/**
 * Joins the text items of a PDF page into one string.
 *
 * PDF.js returns the text of a page as separate items without the whitespace
 * that visually separates them. Items are glued together, so codes that are
 * split over several items stay intact, with two exceptions that keep
 * identifiers apart:
 *
 * - a space follows empty items and items that are exactly one CAS RN, so the
 *   CAS RN is not fused with digits that come next;
 * - a line break follows the last item of a line.
 *
 * @param {{ str: string, hasEOL?: boolean }[]} items
 * @returns {string}
 */
export function joinTextItems(items) {
  return items
    .map(({ str, hasEOL }) => {
      const separator = str.length === 0 || WHOLE_CASRN.test(str) ? ' ' : '';
      return str + separator + (hasEOL ? '\n' : '');
    })
    .join('');
}

export class PdfTextExtractor {
  #libraryUrl;
  #workerUrl;
  #importModule;
  #library = null;

  /**
   * @param {object} options
   * @param {string|URL} options.libraryUrl  URL of the PDF.js module.
   * @param {string|URL} options.workerUrl   URL of the PDF.js worker module.
   * @param {(url: string) => Promise<any>} [options.importModule]  Replaceable for tests.
   */
  constructor({ libraryUrl, workerUrl, importModule = (url) => import(url) }) {
    this.#libraryUrl = String(libraryUrl);
    this.#workerUrl = String(workerUrl);
    this.#importModule = importModule;
  }

  /**
   * Extracts the text of all pages. Rejects when the file is not a readable PDF.
   *
   * @param {Blob} file
   * @returns {Promise<string>}
   */
  async extractText(file) {
    const pdfjs = await this.#loadLibrary();
    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({ data, isEvalSupported: false });
    try {
      const pdf = await loadingTask.promise;
      const pageTexts = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const { items } = await page.getTextContent();
        pageTexts.push(joinTextItems(items));
      }
      return pageTexts.join('\n');
    } finally {
      await loadingTask.destroy();
    }
  }

  #loadLibrary() {
    this.#library ??= this.#importModule(this.#libraryUrl).then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = this.#workerUrl;
      return pdfjs;
    });
    return this.#library;
  }
}
