import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { preview } from 'vite';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');
const HTACCESS_PATH = path.join(DIST_DIR, '.htaccess');
const SOURCE_WORKER_PATH = path.resolve(
  ROOT_DIR,
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs'
);

function fail(message) {
  console.error(`\n[Asset Validation] FAILED: ${message}`);
  process.exit(1);
}

function sha256(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

async function runStaticValidation() {
  console.log('\n[Asset Validation] Starting mandatory static build validation...');

  if (!fs.existsSync(DIST_DIR)) {
    fail(`Production dist directory not found at ${DIST_DIR}`);
  }
  if (!fs.existsSync(ASSETS_DIR)) {
    fail(`Expected dist/assets directory at ${ASSETS_DIR}`);
  }
  if (!fs.existsSync(SOURCE_WORKER_PATH)) {
    fail(`Expected installed PDF.js worker at ${SOURCE_WORKER_PATH}`);
  }

  const expectedHash = sha256(SOURCE_WORKER_PATH);

  // 1. Discover PDF.js worker files in dist/assets/ (must be .js for Hostinger MIME compatibility)
  const assetFiles = fs.readdirSync(ASSETS_DIR);
  const hashedJsWorkers = assetFiles.filter((f) => /^pdf\.worker\.min.*\.js$/i.test(f));
  if (hashedJsWorkers.length === 0) {
    fail('Expected emitted .js PDF.js worker asset (pdf.worker.min-*.js) in dist/assets/');
  }

  const workerPaths = [];
  for (const file of hashedJsWorkers) {
    const fullPath = path.join(ASSETS_DIR, file);
    const actualHash = sha256(fullPath);
    if (actualHash !== expectedHash) {
      fail(`Worker ${file} SHA-256 mismatch against installed pdfjs-dist@6.5.438 worker`);
    }
    workerPaths.push(`/assets/${file}`);
  }
  console.log(
    `[Asset Validation] Verified PDF.js 6.5.438 worker parity (SHA-256: ${expectedHash.slice(0, 12)}...) for ${workerPaths.join(', ')}`
  );

  // Ensure compiled bundle references the .js worker URL and not an .mjs worker URL
  const jsBundles = assetFiles.filter((f) => f.endsWith('.js') && !f.startsWith('pdf.worker.min'));
  let referencedWorkerUrl = null;
  for (const bundle of jsBundles) {
    const content = fs.readFileSync(path.join(ASSETS_DIR, bundle), 'utf8');
    const jsMatch = content.match(/\/assets\/pdf\.worker\.min-[A-Za-z0-9_-]+\.js/);
    if (jsMatch) {
      referencedWorkerUrl = jsMatch[0];
    }
    const mjsMatch = content.match(/\/assets\/pdf\.worker\.min-[A-Za-z0-9_-]+\.mjs/);
    if (mjsMatch) {
      fail(`Compiled bundle ${bundle} still references .mjs worker URL ${mjsMatch[0]}`);
    }
  }
  if (!referencedWorkerUrl || !workerPaths.includes(referencedWorkerUrl)) {
    fail(`Compiled bundle did not reference an emitted .js worker URL (found: ${referencedWorkerUrl})`);
  }
  console.log(`[Asset Validation] Verified bundle workerSrc URL: ${referencedWorkerUrl}`);

  const rootWorker = path.join(DIST_DIR, 'pdf.worker.min.mjs');
  if (fs.existsSync(rootWorker)) {
    workerPaths.push('/pdf.worker.min.mjs');
  }

  // 2. Verify Hostinger .htaccess MIME configuration
  if (!fs.existsSync(HTACCESS_PATH)) {
    fail('dist/.htaccess is missing; Hostinger requires .htaccess MIME rules');
  }

  const htaccessContent = fs.readFileSync(HTACCESS_PATH, 'utf8');
  if (!/AddType\s+application\/javascript\b[^\n]*\.js\b/i.test(htaccessContent)) {
    fail('dist/.htaccess is missing "AddType application/javascript ... .js" directive');
  }
  if (!/RewriteCond\s+%\{REQUEST_FILENAME\}\s+-f/i.test(htaccessContent)) {
    fail('dist/.htaccess is missing static file bypass (RewriteCond %{REQUEST_FILENAME} -f)');
  }
  console.log('[Asset Validation] Verified dist/.htaccess (.js/.mjs -> application/javascript, static file bypass active)');
  console.log('[Asset Validation] Mandatory static build validation PASSED.\n');
  return workerPaths;
}

async function runHttpValidation(workerPaths) {
  console.log('[HTTP MIME Validation] Starting explicit HTTP MIME test against local preview server...');
  try {
    const server = await preview({
      preview: {
        port: 0,
        host: '127.0.0.1',
      },
    });

    try {
      const address = server.httpServer.address();
      if (!address || typeof address === 'string') {
        console.log('[HTTP MIME Validation] NOT RUN: Failed to resolve preview server address.');
        return;
      }
      const baseUrl = `http://127.0.0.1:${address.port}`;

      for (const workerPath of workerPaths) {
        const url = `${baseUrl}${workerPath}`;
        const res = await fetch(url);
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const bodyPrefix = (await res.text()).slice(0, 128).trimStart();

        if (res.status !== 200) {
          fail(`${workerPath} returned HTTP ${res.status} (expected 200)`);
        }

        if (!contentType.includes('application/javascript')) {
          fail(`${workerPath} served with Content-Type "${contentType || '<missing>'}" (expected "application/javascript")`);
        }

        if (bodyPrefix.startsWith('<')) {
          fail(`${workerPath} returned HTML/XML content instead of JavaScript worker code`);
        }

        console.log(`[HTTP MIME Validation] OK ${workerPath} -> HTTP ${res.status}, Content-Type: ${contentType}`);
      }
      console.log('[HTTP MIME Validation] PASSED.\n');
    } finally {
      if (typeof server.httpServer.closeAllConnections === 'function') {
        server.httpServer.closeAllConnections();
      }
      await new Promise((resolve) => server.httpServer.close(resolve));
    }
  } catch (err) {
    console.log(`[HTTP MIME Validation] NOT RUN: Local network fetch unavailable or restricted in build environment (${err.message}).\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isHttpMode = args.includes('--http');
  const workerPaths = await runStaticValidation();

  if (isHttpMode) {
    await runHttpValidation(workerPaths);
  }
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
