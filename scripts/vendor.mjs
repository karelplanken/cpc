#!/usr/bin/env node
/**
 * Copies the browser builds of the runtime dependencies from node_modules into
 * docs/vendor so the app can be served statically without a build step.
 *
 * Run `npm run vendor` after changing the version of bootstrap or pdfjs-dist.
 */
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulesDir = path.join(rootDir, 'node_modules');
const vendorDir = path.join(rootDir, 'docs', 'vendor');

/** Per package: the files to copy, as [path inside the package, file name in docs/vendor/<dir>]. */
const PACKAGES = [
  {
    name: 'bootstrap',
    dir: 'bootstrap',
    files: [
      ['dist/css/bootstrap.min.css', 'bootstrap.min.css'],
      ['dist/js/bootstrap.bundle.min.js', 'bootstrap.bundle.min.js'],
      ['LICENSE', 'LICENSE'],
    ],
  },
  {
    name: 'pdfjs-dist',
    dir: 'pdfjs',
    files: [
      ['legacy/build/pdf.min.mjs', 'pdf.min.mjs'],
      ['legacy/build/pdf.worker.min.mjs', 'pdf.worker.min.mjs'],
      ['LICENSE', 'LICENSE'],
    ],
  },
];

async function vendorPackage({ name, dir, files }) {
  const packageDir = path.join(modulesDir, name);
  const targetDir = path.join(vendorDir, dir);
  const { version } = JSON.parse(await readFile(path.join(packageDir, 'package.json'), 'utf8'));

  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await Promise.all(
    files.map(([source, target]) =>
      copyFile(path.join(packageDir, source), path.join(targetDir, target)),
    ),
  );
  return [name, version];
}

const versions = Object.fromEntries(await Promise.all(PACKAGES.map(vendorPackage)));
await writeFile(path.join(vendorDir, 'manifest.json'), `${JSON.stringify(versions, null, 2)}\n`);

for (const [name, version] of Object.entries(versions)) {
  console.log(`vendored ${name}@${version}`);
}
