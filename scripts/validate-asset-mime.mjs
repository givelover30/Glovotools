import fs from 'node:fs';
import path from 'node:path';
import { preview } from 'vite';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');
const HTACCESS_PATH = path.join(DIST_DIR, '.htaccess');

function fail(message) {
  console.error(`\n[Asset Mime Type Validation] FAILED: ${message}`);
  process.exit(1);
}

async function run() {
  console.log('\n[Asset Mime Type Validation] Starting production build MIME validation...');

  if (!fs.existsSync(DIST_DIR)) {
    fail(`Production dist directory not found at ${DIST_DIR}`);
  }

  // 1. Discover PDF.js worker files in dist/ and dist/assets/
  const workerPaths = [];

  const rootWorker = path.join(DIST_DIR, 'pdf.worker.min.mjs');
  if (fs.existsSync(rootWorker)) {
    workerPaths.push('/pdf.worker.min.mjs');
  } else {
    fail('Expected dist/pdf.worker.min.mjs to exist in production output');
  }

  if (!fs.existsSync(ASSETS_DIR)) {
    fail(`Expected dist/assets directory at ${ASSETS_DIR}`);
  }

  const assetFiles = fs.readdirSync(ASSETS_DIR);
  const hashedWorkers = assetFiles.filter((f) => /^pdf\.worker\.min.*\.mjs$/i.test(f));
  if (hashedWorkers.length === 0) {
    fail('Expected hashed PDF.js worker asset (pdf.worker.min-*.mjs) in dist/assets/');
  }
  for (const file of hashedWorkers) {
    workerPaths.push(`/assets/${file}`);
  }

  // 2. Verify Hostinger .htaccess MIME configuration
  if (!fs.existsSync(HTACCESS_PATH)) {
    fail('dist/.htaccess is missing; Hostinger requires .htaccess MIME rules for .mjs files');
  }

  const htaccessContent = fs.readFileSync(HTACCESS_PATH, 'utf8');
  if (!/AddType\s+application\/javascript\b[^\n]*\.mjs\b/i.test(htaccessContent)) {
    fail('dist/.htaccess is missing "AddType application/javascript ... .mjs" directive');
  }
  if (!/RewriteCond\s+%\{REQUEST_FILENAME\}\s+-f/i.test(htaccessContent)) {
    fail('dist/.htaccess is missing static file bypass (RewriteCond %{REQUEST_FILENAME} -f)');
  }
  console.log('[Asset Mime Type Validation] Verified dist/.htaccess (.mjs -> application/javascript, static file bypass active)');

  // 3. Verify live HTTP headers served by Vite production preview server
  const server = await preview({
    preview: {
      port: 0,
      host: '127.0.0.1',
    },
  });

  try {
    const address = server.httpServer.address();
    if (!address || typeof address === 'string') {
      fail('Failed to resolve Vite preview server port');
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

      console.log(`[Asset Mime Type Validation] OK ${workerPath} -> HTTP ${res.status}, Content-Type: ${contentType}`);
    }
  } finally {
    if (typeof server.httpServer.closeAllConnections === 'function') {
      server.httpServer.closeAllConnections();
    }
    await new Promise((resolve) => server.httpServer.close(resolve));
  }

  console.log('[Asset Mime Type Validation] Passed for all PDF.js worker assets.\n');
}

run().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
