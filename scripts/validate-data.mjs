#!/usr/bin/env node
/**
 * Validates the data files in docs/data. Exits with status 1 when a problem
 * is found. Run it after every update of the lists: `npm run validate:data`.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateData } from './lib/data-validation.mjs';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const problems = await validateData(siteDir);

if (problems.length > 0) {
  console.error(`Found ${problems.length} problem(s) in docs/data:`);
  problems.forEach((problem) => console.error(`  - ${problem}`));
  process.exit(1);
}
console.log('docs/data is valid.');
