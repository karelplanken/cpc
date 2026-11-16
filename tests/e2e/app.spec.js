/**
 * End-to-end tests: the app as served to a real browser, including real PDF
 * parsing with PDF.js.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import expectedIdentifiers from '../fixtures/sds-expected.json' with { type: 'json' };

const sdsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'sds');

/** Fails a test when the page logs an error, throws, or requests a missing file. */
test.beforeEach(async ({ page }, testInfo) => {
  const problems = [];
  page.on('pageerror', (error) => problems.push(`uncaught: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      problems.push(`console: ${message.text()}`);
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      problems.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  testInfo.problems = problems;
});

test.afterEach(async ({ page: _page }, testInfo) => {
  if (!testInfo.allowProblems) {
    expect(testInfo.problems).toEqual([]);
  }
});

async function openApp(page, url = './') {
  await page.goto(url);
  await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true');
}

async function checkSds(page, fileName) {
  await page.getByLabel(/SDS/).check();
  await page.locator('#sdsFile').setInputFiles(path.join(sdsDir, fileName));
  await page.locator('#fileForm button[type="submit"]').click();
}

async function checkManually(page, { casrns = [], hCodes = [], pCodes = [] }) {
  await page.locator('#manualMethod').check();
  for (const [group, values] of Object.entries({ casrn: casrns, hCode: hCodes, pCode: pCodes })) {
    const fieldGroup = page.locator(`[data-field-group="${group}"]`);
    for (const [index, value] of values.entries()) {
      if (index > 0) {
        await fieldGroup.locator('[data-action="add"]').click();
      }
      await fieldGroup.locator('input').nth(index).fill(value);
    }
  }
  await page.locator('#manualForm button[type="submit"]').click();
}

const reports = (page) => page.locator('#reports article');
const codesIn = (report, section) =>
  report.locator(`[data-section="${section}"] [data-row] > :first-child`).allTextContents();
const verdictOf = (report) => report.locator('[data-section="verdict"] strong');

test.describe('page', () => {
  test('loads in English by default', async ({ page }) => {
    await openApp(page);

    await expect(page).toHaveTitle('Compound Policy Check');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    await expect(page.getByText('Select input method:')).toBeVisible();
    await expect(page.locator('#fileForm')).toBeHidden();
    await expect(page.locator('#manualForm')).toBeHidden();
    await expect(page.locator('#appVersion')).toHaveText(/^CPC version \d+\.\d+\.\d+$/);
  });

  test('expands the information panels', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Legend' }).click();

    await expect(page.getByText('Cat 0:')).toBeVisible();
    await expect(page.getByText('Cat 3:')).toBeVisible();
  });
});

test.describe('SDS file input', () => {
  for (const [name, expected] of Object.entries(expectedIdentifiers)) {
    test(`extracts the identifiers of ${name}.pdf`, async ({ page }) => {
      await openApp(page);
      await checkSds(page, `${name}.pdf`);

      const report = reports(page).first();
      await expect(report.locator('.report-source')).toContainText(`${name}.pdf`);
      expect(await codesIn(report, 'casrns')).toEqual(expected.casrns);
      expect(await codesIn(report, 'hCodes')).toEqual(expected.hCodes);
      expect(await codesIn(report, 'pCodes')).toEqual(expected.pCodes);
      await expect(verdictOf(report)).toHaveText('This substance is not forbidden.');
      await expect(page.locator('#fileForm')).toBeHidden();
    });
  }

  test('marks a tolerated SZW substance and shows its pictograms', async ({ page }) => {
    await openApp(page);
    await checkSds(page, '64-17-5.pdf');

    const report = reports(page).first();
    await expect(report.locator('[data-category="2"]')).toContainText(
      'exposure must be registered',
    );
    const pictogram = report.getByAltText('Flame', { exact: true });
    await expect(pictogram).toBeVisible();
    expect(await pictogram.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  });

  test('rejects a file that is not a PDF', async ({ page }) => {
    await openApp(page);
    await page.locator('#fileMethod').check();
    await page.locator('#sdsFile').setInputFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('H350'),
    });
    await page.locator('#fileForm button[type="submit"]').click();

    await expect(page.getByText('This is not a PDF…')).toBeVisible();
    await expect(reports(page)).toHaveCount(0);
  });

  test('rejects a corrupt PDF', async ({ page }, testInfo) => {
    await openApp(page);
    await page.locator('#fileMethod').check();
    await page.locator('#sdsFile').setInputFiles({
      name: 'corrupt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('this is not really a PDF'),
    });
    await page.locator('#fileForm button[type="submit"]').click();

    await expect(page.getByText('This PDF could not be read…')).toBeVisible();
    await expect(reports(page)).toHaveCount(0);
    // PDF.js itself may log the parse failure; that is expected here.
    testInfo.allowProblems = true;
  });

  test('asks for a file when none is selected', async ({ page }) => {
    await openApp(page);
    await page.locator('#fileMethod').check();
    await page.locator('#fileForm button[type="submit"]').click();

    await expect(page.getByText('Select a file…')).toBeVisible();
  });
});

test.describe('manual input', () => {
  /** The inputs and verdicts of version 2 of the app, in English. */
  const cases = [
    [
      { casrns: ['64-19-7'], hCodes: ['H226', 'H314'], pCodes: ['P280', 'P305+P351+P338'] },
      'This substance is not forbidden.',
    ],
    [
      { casrns: ['865-49-6'], hCodes: ['H302', 'H315', 'H351', 'H373'], pCodes: ['P281'] },
      'This substance is not forbidden.',
    ],
    [
      { casrns: ['132-32-1'], hCodes: ['H350'], pCodes: ['P201'] },
      'This substance is forbidden based on its CAS RN.',
    ],
    [{ hCodes: ['H350'] }, 'This substance or mixture is forbidden based on one or more H codes.'],
    [
      { casrns: ['64-17-5', '7732-18-5'], hCodes: ['H225', 'H350'] },
      'This mixture is not forbidden.',
    ],
    [
      { casrns: ['7732-18-5', '7647-14-5'], hCodes: ['H350'] },
      'This mixture is forbidden based on one or more H codes.',
    ],
    [
      { casrns: ['7732-18-5', '132-32-1'] },
      'This mixture is forbidden based on one or more CAS RNs.',
    ],
  ];

  for (const [input, verdict] of cases) {
    test(`${JSON.stringify(input)} gives "${verdict}"`, async ({ page }) => {
      await openApp(page);
      await checkManually(page, input);

      const report = reports(page).first();
      await expect(verdictOf(report)).toHaveText(verdict);
      expect(await codesIn(report, 'casrns')).toEqual(input.casrns ?? []);
      expect(await codesIn(report, 'hCodes')).toEqual(input.hCodes ?? []);
      await expect(page.locator('#manualForm')).toBeHidden();
    });
  }

  test('validates the input before creating a report', async ({ page }) => {
    await openApp(page);
    await page.locator('#manualMethod').check();
    await page.locator('#manualForm button[type="submit"]').click();
    await expect(page.getByText('Required if H code is empty…')).toBeVisible();
    await expect(page.getByText('Required if CAS RN is empty…')).toBeVisible();

    await page.locator('[data-field-group="casrn"] input').fill('64-17-6');
    await expect(page.getByText('Invalid CAS RN…')).toBeVisible();
    await page.locator('#manualForm button[type="submit"]').click();
    await expect(reports(page)).toHaveCount(0);

    await page.locator('[data-field-group="casrn"] input').fill('64-17-5');
    await page.locator('#manualForm button[type="submit"]').click();
    await expect(reports(page)).toHaveCount(1);
  });

  test('stacks reports and removes them one by one', async ({ page }) => {
    await openApp(page);
    await checkManually(page, { casrns: ['7732-18-5'] });
    await checkManually(page, { casrns: ['132-32-1'] });
    await expect(reports(page)).toHaveCount(2);

    await reports(page).first().getByRole('button', { name: 'Remove' }).click();
    await expect(reports(page)).toHaveCount(1);
    await expect(reports(page).first()).toHaveAttribute('data-verdict', 'forbidden');
  });
});

test.describe('language', () => {
  test('switches to Dutch, including existing reports, and remembers the choice', async ({
    page,
  }) => {
    await openApp(page);
    await checkManually(page, { casrns: ['132-32-1'], hCodes: ['H350'] });

    await page.locator('[data-locale="nl"]').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'nl-NL');
    await expect(page.getByText('Selecteer invoermethode:')).toBeVisible();
    await expect(verdictOf(reports(page).first())).toHaveText(
      'Deze stof is verboden op basis van CAS RN.',
    );
    await expect(reports(page).first()).toContainText('Kan kanker veroorzaken');

    await page.reload();
    await expect(page.getByText('Selecteer invoermethode:')).toBeVisible();

    await page.locator('[data-locale="en"]').click();
    await expect(page.getByText('Select input method:')).toBeVisible();
  });

  test('can be chosen with the lang query parameter', async ({ page }) => {
    await openApp(page, './?lang=nl');

    await expect(page.locator('html')).toHaveAttribute('lang', 'nl-NL');
    await expect(page.getByText('Handmatige invoer', { exact: true })).toBeVisible();
  });

  test('shows tooltips in the chosen language', async ({ page }) => {
    await openApp(page, './?lang=nl');
    await page.locator('#manualMethod').check();
    await page.locator('[data-field-group="casrn"] [data-action="add"]').hover();

    await expect(page.getByRole('tooltip')).toHaveText('CAS RN toevoegen');
  });
});

test.describe('failure to load', () => {
  test('tells the user when the data cannot be loaded', async ({ page }, testInfo) => {
    await page.route('**/data/szw-cmr-list.json', (route) => route.abort());
    await page.goto('./');

    await expect(page.locator('#loadError')).toBeVisible();
    testInfo.allowProblems = true;
  });
});
