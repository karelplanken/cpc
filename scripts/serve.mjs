#!/usr/bin/env node
/**
 * Minimal static file server for local development and end-to-end tests.
 * It serves the docs/ directory exactly like GitHub Pages does: no build step,
 * no rewriting. Usage: `node scripts/serve.mjs [port]` (default port 8080).
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const port = Number(process.argv[2] ?? process.env.PORT ?? 8080);

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

/** Maps a request URL to a file inside siteDir, or null when it would escape it. */
function resolveFilePath(requestUrl) {
  const { pathname } = new URL(requestUrl, 'http://localhost');
  const relativePath = decodeURIComponent(pathname).replace(/\/$/, '/index.html');
  const filePath = path.join(siteDir, relativePath);
  return filePath.startsWith(siteDir + path.sep) ? filePath : null;
}

const server = createServer(async (request, response) => {
  try {
    const filePath = resolveFilePath(request.url);
    if (!filePath || !(await stat(filePath)).isFile()) {
      throw new Error('Not found');
    }
    const contentType = CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Serving docs/ at http://localhost:${port}/`);
});
