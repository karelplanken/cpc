import { describe, expect, it, vi } from 'vitest';
import { PdfTextExtractor, joinTextItems } from '../../docs/js/pdf/pdf-text-extractor.js';

describe('joinTextItems', () => {
  const items = (...strings) => strings.map((str) => ({ str }));

  it('glues items together so split codes stay intact', () => {
    expect(joinTextItems(items('H3', '02', ' Harmful'))).toBe('H302 Harmful');
  });

  it('separates a whole CAS RN from what follows', () => {
    expect(joinTextItems(items('64-17-5', '200-578-6'))).toBe('64-17-5 200-578-6');
  });

  it('turns empty items into spaces', () => {
    expect(joinTextItems(items('P280', '', 'P210'))).toBe('P280 P210');
  });

  it('breaks the line after the last item of a line', () => {
    expect(joinTextItems([{ str: 'P501', hasEOL: true }, { str: 'According to' }])).toBe(
      'P501\nAccording to',
    );
  });
});

describe('PdfTextExtractor', () => {
  function createFakePdfjs(pages) {
    const destroy = vi.fn();
    const pdf = {
      numPages: pages.length,
      getPage: async (pageNumber) => ({
        getTextContent: async () => ({ items: pages[pageNumber - 1].map((str) => ({ str })) }),
      }),
    };
    return {
      GlobalWorkerOptions: {},
      getDocument: vi.fn(() => ({ promise: Promise.resolve(pdf), destroy })),
      destroy,
    };
  }
  const file = new Blob(['%PDF']);

  it('returns the text of all pages and frees the document', async () => {
    const pdfjs = createFakePdfjs([['page ', 'one'], ['page two']]);
    const extractor = new PdfTextExtractor({
      libraryUrl: 'pdf.mjs',
      workerUrl: 'worker.mjs',
      importModule: async () => pdfjs,
    });

    await expect(extractor.extractText(file)).resolves.toBe('page one\npage two');
    expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe('worker.mjs');
    expect(pdfjs.destroy).toHaveBeenCalledOnce();
  });

  it('loads the library only once', async () => {
    const importModule = vi.fn(async () => createFakePdfjs([['text']]));
    const extractor = new PdfTextExtractor({ libraryUrl: 'pdf.mjs', workerUrl: 'w', importModule });

    await extractor.extractText(file);
    await extractor.extractText(file);
    expect(importModule).toHaveBeenCalledExactlyOnceWith('pdf.mjs');
  });

  it('rejects when the document cannot be parsed', async () => {
    const destroy = vi.fn();
    const pdfjs = {
      GlobalWorkerOptions: {},
      getDocument: () => ({ promise: Promise.reject(new Error('Invalid PDF')), destroy }),
    };
    const extractor = new PdfTextExtractor({
      libraryUrl: 'pdf.mjs',
      workerUrl: 'w',
      importModule: async () => pdfjs,
    });

    await expect(extractor.extractText(file)).rejects.toThrow('Invalid PDF');
    expect(destroy).toHaveBeenCalledOnce();
  });
});
