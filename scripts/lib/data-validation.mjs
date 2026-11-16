/**
 * Validation of the data files in docs/data: first against their JSON Schemas,
 * then against the rules a schema cannot express (check digits, references
 * between files). Used by `npm run validate:data` and by the test suite.
 */
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { isValidCasrn } from '../../docs/js/domain/casrn.js';
import { splitCode } from '../../docs/js/domain/statement-codes.js';

/** Every data file with the schema it has to satisfy. */
export const SCHEMA_BY_DATA_FILE = Object.freeze({
  'h-statements.json': 'h-statements.schema.json',
  'p-statements.json': 'p-statements.schema.json',
  'szw-cmr-list.json': 'casrn-list.schema.json',
  'tolerated-szw-casrns.json': 'casrn-list.schema.json',
  'tolerated-h-casrns.json': 'casrn-list.schema.json',
  'forbidden-h-codes.json': 'h-code-list.schema.json',
});

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

/**
 * @param {string} siteDir  The docs/ directory.
 * @returns {Promise<string[]>} Human readable problems; empty when the data is valid.
 */
export async function validateData(siteDir) {
  const dataDir = path.join(siteDir, 'data');
  const schemaDir = path.join(dataDir, 'schemas');

  const ajv = new Ajv2020({ allErrors: true });
  addFormats(ajv);
  for (const fileName of await readdir(schemaDir)) {
    ajv.addSchema(await readJson(path.join(schemaDir, fileName)));
  }

  const documents = {};
  const problems = [];
  for (const [fileName, schemaId] of Object.entries(SCHEMA_BY_DATA_FILE)) {
    documents[fileName] = await readJson(path.join(dataDir, fileName));
    const validate = ajv.getSchema(schemaId);
    if (!validate(documents[fileName])) {
      problems.push(
        ...validate.errors.map((error) => `${fileName}${error.instancePath}: ${error.message}`),
      );
    }
  }
  // The rules below assume the structure is right.
  return problems.length > 0 ? problems : checkConsistency(documents, siteDir);
}

function checkConsistency(documents, siteDir) {
  const problems = [];
  const hStatements = documents['h-statements.json'].statements;
  const pStatements = documents['p-statements.json'].statements;
  const szwCasrns = new Set(documents['szw-cmr-list.json'].casrns);

  for (const fileName of [
    'szw-cmr-list.json',
    'tolerated-szw-casrns.json',
    'tolerated-h-casrns.json',
  ]) {
    for (const casrn of documents[fileName].casrns) {
      if (!isValidCasrn(casrn)) {
        problems.push(`${fileName}: ${casrn} has a wrong check digit`);
      }
    }
  }
  if (!documents['szw-cmr-list.json'].meta.publishedAt) {
    problems.push('szw-cmr-list.json: meta.publishedAt is required');
  }
  for (const casrn of documents['tolerated-szw-casrns.json'].casrns) {
    if (!szwCasrns.has(casrn)) {
      problems.push(`tolerated-szw-casrns.json: ${casrn} is not on the SZW list`);
    }
  }
  for (const casrn of documents['tolerated-h-casrns.json'].casrns) {
    if (szwCasrns.has(casrn)) {
      problems.push(
        `tolerated-h-casrns.json: ${casrn} is on the SZW list; it belongs in tolerated-szw-casrns.json`,
      );
    }
  }
  for (const code of documents['forbidden-h-codes.json'].codes) {
    if (!Object.hasOwn(hStatements, code)) {
      problems.push(`forbidden-h-codes.json: ${code} is not in h-statements.json`);
    }
  }
  for (const [fileName, statements] of [
    ['h-statements.json', hStatements],
    ['p-statements.json', pStatements],
  ]) {
    for (const code of Object.keys(statements)) {
      const singles = splitCode(code);
      if (singles.length > 1 && new Set(singles).size !== singles.length) {
        problems.push(`${fileName}: ${code} repeats a code`);
      }
    }
  }
  const pictograms = new Set(Object.values(hStatements).flatMap((entry) => entry.pictograms));
  for (const pictogram of [...pictograms, 'none']) {
    if (!existsSync(path.join(siteDir, 'assets', 'pictograms', `${pictogram}.svg`))) {
      problems.push(`assets/pictograms/${pictogram}.svg is missing`);
    }
  }
  return problems;
}
