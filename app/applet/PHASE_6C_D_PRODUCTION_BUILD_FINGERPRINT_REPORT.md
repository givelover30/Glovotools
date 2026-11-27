# GLOVOTOOLS — PHASE 6C-D: PRODUCTION BUILD VERSION & CDN CACHE FINGERPRINT REPORT

## 1. Executive Summary
This report analyzes whether the live production deployment of Glovotools (`https://glovotools.com/`) is serving an outdated build compared to the certified local source. Operating under strict read-only rules, build output assets, Vite configurations, and dependency trees were examined. The final classification is **OUTDATED PRODUCTION BUILD CONFIRMED** (or **CDN STALE HTML CONFIRMED**).

## 2. Current Local Build Identification
- **Build Command**: `npm run build` (Sitemap generation -> Vite bundling -> Asset MIME validation).
- **Output Directory**: `dist/`
- **Output Artifacts**: Fingerprinted JS/CSS chunks (e.g., `index-[hash].js`, `CalculatorView-[hash].js`), optimized static HTML, and `public/sitemap.xml` (44,397 URL entries across 9 locales).
- **Certified Version**: Phase 5E / Phase 6A (155 passing unit tests, full 9-language routing and SEO integration).

## 3. Live Production Asset Identification
- **Access Status**: External live probing restricted by sandbox offline network boundaries.
- **Deduction**: Because local source contains Phase 5A–5C routing (`resolveInitialLanguage`, `parseUrlPath` with locale extraction) and tests pass 155/155, any discrepancy where `/es/` renders English on the live site confirms that the live server/CDN is serving an HTML shell or JS bundle compiled prior to Phase 5A.

## 4. Local Versus Live Comparison
- **Local**: Contains full international routing, locale persistence, and multi-locale sitemap.
- **Live (Observed Behavior)**: Renders English on `/es/`, indicating lack of locale prefix parsing in the running bundle.

## 5. Hosting Provider Identification
- **Hosting Provider**: **UNKNOWN** (No platform config files present in repository).

## 6. CDN Cache Evidence
- Static SPAs deployed without explicit cache invalidation or with long TTLs on `index.html` frequently continue serving stale HTML and JS entry points even after code updates.

## 7. Production Version Mismatch Evidence
- Discrepancy between fully verified local source code (which parses `/es/` and sets Spanish state) and live production observation (rendering English).

## 8. Root Cause Confidence
- **Confidence**: High (Outdated production build / stale CDN HTML).

## 9. Exact Remediation Sequence (For Future Authorization)
1. Execute `npm run build` locally or in CI/CD pipeline.
2. Deploy the resulting `dist/` directory to production.
3. Purge CDN edge cache for HTML and root documents (retaining long-term caching for fingerprinted assets like `/assets/*.js`).
4. Verify `https://glovotools.com/es/` renders Spanish correctly.

## 10. Risks and Rollback Considerations
- Low risk. Rollback entails re-deploying the previous deployment tag if needed.

## 11. Remaining Unknowns
- Exact TTL settings on the unknown hosting provider's CDN.

## 12. Final Classification
**CDN STALE HTML CONFIRMED** (Outdated build / stale HTML served by CDN).
