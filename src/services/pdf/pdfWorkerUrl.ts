/**
 * Browser PDF.js worker asset URL.
 * In Vite dev and production builds, the Vite plugin in `vite.config.ts` transforms
 * this module to import `pdfjs-dist/legacy/build/pdf.worker.min.mjs?url`, emitting
 * a version-matched `.js` asset (`/assets/pdf.worker.min-[hash].js`) in `dist/`.
 * In direct Node.js / `tsx` test execution, `pdfRuntime.ts` resolves the local
 * `node_modules` file URL directly.
 */
const pdfWorkerUrl = '';
export default pdfWorkerUrl;
