import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ALL_REGISTERED_CONTRACTS } from '../src/engine/contracts/allContracts.ts';
import { CalculationRegistry } from '../src/engine/CalculationRegistry.ts';
import { CalculationExecutor } from '../src/engine/CalculationExecutor.ts';
import { CALCULATORS } from '../src/data/calculators.ts';
import { getToolStatusInfo } from '../src/engine/toolStatus.ts';
import { AuditRunner } from '../src/audit/AuditRunner.ts';
import { EngineTestSuite } from '../src/engine/test-suite.ts';
import { parseUrlPath } from '../src/App.tsx';
import { I18nProvider } from '../src/i18n/I18nContext.tsx';
import Sidebar from '../src/components/common/Sidebar.tsx';
import CalculatorRating from '../src/components/calculator/CalculatorRating.tsx';
import EngineCalculatorView from '../src/components/calculator/EngineCalculatorView.tsx';
import CalculatorHeader from '../src/components/calculator/CalculatorHeader.tsx';
import ErrorBoundary from '../src/components/common/ErrorBoundary.tsx';
import { CalculationHistoryService } from '../src/services/CalculationHistoryService.ts';

function runStage22RegressionTests() {
  let passed = 0;
  const check = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log(`PASS: ${name}`);
  };

  // 1. Duplicate contract collision resolution (F-04)
  check('1. ALL_REGISTERED_CONTRACTS has zero duplicate IDs (404/404)', () => {
    const ids = ALL_REGISTERED_CONTRACTS.map((c) => c.id);
    const unique = new Set(ids);
    assert.equal(ids.length, 404);
    assert.equal(unique.size, 404);
  });

  check('2. CalculationRegistry initializes with zero duplicate overwrite warnings', () => {
    const warnings: string[] = [];
    const origWarn = console.warn;
    console.warn = (...args: unknown[]) => warnings.push(args.map(String).join(' '));
    try {
      (CalculationRegistry as any).initialized = false;
      CalculationRegistry.initialize();
    } finally {
      console.warn = origWarn;
    }
    const dupWarnings = warnings.filter((w) => w.includes('Duplicate calculator contract'));
    assert.equal(dupWarnings.length, 0, `Unexpected duplicate warnings: ${dupWarnings.join('; ')}`);
    assert.equal(CalculationRegistry.getRegisteredCount(), 404);
  });

  check('3. college-savings-529-calc resolves to batch4 canonical financial contract and passes formula check', () => {
    const contract = CalculationRegistry.get('college-savings-529-calc');
    assert.ok(contract);
    assert.equal(contract.category, 'financial');
    const res = CalculationExecutor.execute('college-savings-529-calc', {
      targetTuition: 120000,
      current529: 15000,
      yearsUntilCollege: 12,
      expectedReturn: 6.5
    });
    assert.equal(res.success, true);
    const monthlyNeeded = Number((res.data as any).monthlyNeeded);
    assert.ok(Math.abs(monthlyNeeded - 395) < 30, `Expected ~395, got ${monthlyNeeded}`);
  });

  check('4. inventory-turnover-calc resolves to manufacturing-inventory and supports both averageInventory & avgInventory', () => {
    const contract = CalculationRegistry.get('inventory-turnover-calc');
    assert.ok(contract);
    assert.equal(contract.category, 'manufacturing-inventory');
    const uiRes = CalculationExecutor.execute('inventory-turnover-calc', {
      cogs: 1450000,
      averageInventory: 290000
    });
    assert.equal(uiRes.success, true);
    assert.equal((uiRes.data as any).turnoverRatio, 5);

    const oracleRes = contract.calculate({
      cogs: 400000,
      avgInventory: 80000
    });
    assert.equal((oracleRes as any).turnoverRatio, 5);
  });

  // 2. Catalog preservation & honest classification across all 4,375 unique tools
  const uniqueToolsMap = new Map<string, (typeof CALCULATORS)[number]>();
  for (const c of CALCULATORS) {
    if (!uniqueToolsMap.has(c.id)) uniqueToolsMap.set(c.id, c);
  }
  const uniqueTools = Array.from(uniqueToolsMap.values());

  check('5. Catalog preserves all 4,400 raw entries and 4,375 unique tool IDs', () => {
    assert.equal(CALCULATORS.length, 4400);
    assert.equal(uniqueTools.length, 4375);
  });

  check('6. Tool status classification matches exact code & passing test evidence', () => {
    const counts = {
      'explicit-tested': 0,
      'explicit-untested': 0,
      workspace: 0,
      'static-guide': 0,
      'generic-fallback': 0
    };
    for (const tool of uniqueTools) {
      const info = getToolStatusInfo(tool);
      counts[info.tier]++;
    }
    assert.equal(counts['explicit-tested'], 240);
    assert.equal(counts['explicit-untested'], 277);
    assert.equal(counts.workspace, 96);
    assert.equal(counts['static-guide'], 10);
    assert.equal(counts['generic-fallback'], 3752);
    assert.equal(
      counts['explicit-tested'] +
        counts['explicit-untested'] +
        counts.workspace +
        counts['static-guide'] +
        counts['generic-fallback'],
      4375
    );

    // Pre-existing failing oracles MUST remain explicit-untested
    for (const failingId of ['rhombus-area', 'geometric-mean', 'harmonic-mean']) {
      const meta = uniqueToolsMap.get(failingId)!;
      assert.equal(getToolStatusInfo(meta).tier, 'explicit-untested');
    }

    // Reference tools routed to generic fallback must be generic-fallback
    const gitRef = uniqueToolsMap.get('git-commands-reference')!;
    assert.equal(getToolStatusInfo(gitRef).tier, 'generic-fallback');
  });

  check('7. Generic fallback contract exposes isSyntheticFallback=true and honest status label', () => {
    const fallbackContract = CalculationRegistry.get('git-commands-reference');
    assert.ok(fallbackContract);
    assert.equal(fallbackContract.isSyntheticFallback, true);
    assert.equal(fallbackContract.implementationTier, 'generic-fallback');
    const res = CalculationExecutor.execute('git-commands-reference', {
      primaryParam: 100,
      secondaryParam: 1.15
    });
    assert.equal(res.success, true);
    assert.equal((res.data as any).evaluationStatus, 'Generic estimate (formula preview)');
    assert.notEqual((res.data as any).evaluationStatus, 'Ready and Operational');
  });

  check('8. cloud-storage-cost-optimizer preserves explicit calculation and isSyntheticFallback=false', () => {
    const contract = CalculationRegistry.get('cloud-storage-cost-optimizer');
    assert.ok(contract);
    assert.equal(contract.isSyntheticFallback, false);
    const res = CalculationExecutor.execute('cloud-storage-cost-optimizer', {
      storageCapacityGB: 1000,
      storageTierRate: 0.023,
      retrievalFees: 5,
      egressFees: 10
    });
    assert.equal(res.success, true);
    assert.equal((res.data as any).totalCost, 38);
  });

  // 3. Representative calculation suite & AuditRunner / EngineTestSuite verification
  check('9. Core EngineTestSuite passes 100% and AuditRunner defects resolved for duplicates', () => {
    const origLog = console.log;
    const origErr = console.error;
    console.log = () => {};
    console.error = () => {};
    let suiteRes: ReturnType<EngineTestSuite['runAll']>;
    let auditRes: ReturnType<typeof AuditRunner.executeFullAudit>;
    try {
      suiteRes = new EngineTestSuite().runAll();
      auditRes = AuditRunner.executeFullAudit();
    } finally {
      console.log = origLog;
      console.error = origErr;
    }
    assert.equal(suiteRes.failed, 0);
    assert.ok(suiteRes.passed >= 50);
    const defectIds = new Set(auditRes.defectsIdentified.map((d) => d.calculatorId));
    assert.equal(defectIds.has('college-savings-529-calc'), false);
    assert.equal(defectIds.has('inventory-turnover-calc'), false);
  });

  check('10. Representative explicit formulas across domains return accurate results', () => {
    const mort = CalculationExecutor.execute('loan-mortgage', { principal: 320000, rate: 6.5, years: 30 });
    assert.ok(Math.abs((mort.data as any).monthlyPayment - 2022.62) < 0.05);

    const bmi = CalculationExecutor.execute('bmi', { heightCm: 175, weightKg: 70 });
    assert.equal((bmi.data as any).category, 'Normal weight');

    const ohm = CalculationExecutor.execute('ohms-law', { voltage: 120, current: 5 });
    assert.equal((ohm.data as any).power, 600);

    const disc = CalculationExecutor.execute('discount-tax', { originalPrice: 80, discountPercent: 25, taxPercent: 8.25 });
    assert.equal((disc.data as any).finalPrice, 64.95);
  });

  // 4. F-05 Sidebar destination verification
  check('11. Sidebar Calculators item routes to /all-calculators and activates when view=all-calculators', () => {
    assert.equal(parseUrlPath('/all-calculators').view, 'all-calculators');
    const sidebarSource = fs.readFileSync('src/components/common/Sidebar.tsx', 'utf8');
    assert.ok(sidebarSource.includes("if (hub.id === 'calculators')"));
    assert.ok(sidebarSource.includes('onNavigateAllCalculators()'));

    const html = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(Sidebar, {
          isMobileOpen: false,
          onCloseMobile: () => {},
          isCollapsed: false,
          onToggleCollapse: () => {},
          currentView: 'all-calculators',
          activeSection: 'all-calculators',
          currentCategoryId: null,
          activeCalculatorId: null,
          theme: 'light',
          onToggleTheme: () => {},
          favoritesCount: 0,
          recentCalculators: [],
          onNavigateHome: () => {},
          onNavigateCategories: () => {},
          onNavigateAllCalculators: () => {},
          onNavigatePopular: () => {},
          onNavigateCategoryDetail: () => {},
          onNavigateFavorites: () => {},
          onSelectCalculator: () => {},
          onOpenGuidesModal: () => {},
          onNavigateAbout: () => {},
          onNavigatePrivacy: () => {},
          onNavigateTerms: () => {},
          onNavigateContact: () => {}
        })
      )
    );
    assert.ok(
      html.includes('aria-current="page" aria-label="Calculators"') ||
        html.includes('aria-label="Calculators"'),
      'Sidebar should render Calculators hub link'
    );
    assert.match(html, /aria-current="page"[^>]*aria-label="Calculators"|aria-label="Calculators"[^>]*aria-current="page"/);
  });

  // 5. F-08 CalculatorRating fabricated metrics removed
  check('12. CalculatorRating renders zero fabricated aggregate scores or fake vote counts', () => {
    const ratingSrc = fs.readFileSync('src/components/calculator/CalculatorRating.tsx', 'utf8');
    assert.equal(ratingSrc.includes('calctools_rating_stats_'), false);
    assert.equal(ratingSrc.includes('averageRating'), false);
    assert.equal(ratingSrc.includes('totalCount'), false);

    const html = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(CalculatorRating, { calculatorId: 'loan-mortgage' as any })
      )
    );
    assert.equal(html.includes('/ 5.0'), false);
    assert.equal(html.includes('ratings'), false);
    assert.equal(html.includes('votos'), false);
    assert.ok(html.includes('Rate 1 out of 5 stars'));
  });

  // 6. F-04 UI honesty rendering
  check('13. EngineCalculatorView & CalculatorHeader render explicit non-verified fallback warnings', () => {
    const fallbackMeta = uniqueToolsMap.get('git-commands-reference')!;
    const fallbackHtml = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(EngineCalculatorView, { calculator: fallbackMeta })
      )
    );
    assert.ok(fallbackHtml.includes('data-testid="synthetic-fallback-notice"'));
    assert.ok(fallbackHtml.includes('Generic Formula Preview'));

    const headerFallbackHtml = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(CalculatorHeader, { calculator: fallbackMeta })
      )
    );
    assert.ok(headerFallbackHtml.includes('data-tool-tier="generic-fallback"'));
    assert.ok(headerFallbackHtml.includes('Formula preview (generic estimate)'));

    const testedMeta = uniqueToolsMap.get('loan-mortgage')!;
    const headerTestedHtml = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(CalculatorHeader, { calculator: testedMeta })
      )
    );
    assert.ok(headerTestedHtml.includes('data-tool-tier="explicit-tested"'));
    assert.ok(headerTestedHtml.includes('Tested formula'));
  });

  // 7. F-09 ErrorBoundary protection & reset behavior
  check('14. ErrorBoundary transitions to friendly recovery UI without exposing stack/error message and resets on resetKey change', () => {
    assert.deepEqual(ErrorBoundary.getDerivedStateFromError(new Error('SECRET_INTERNAL_STACK')), {
      hasError: true
    });

    const instance = new ErrorBoundary({
      scope: 'calculator',
      resetKey: 'calc-a',
      children: React.createElement('div', null, 'Safe child')
    });
    (instance as any).state = { hasError: true };
    const recoveryEl = instance.render();
    const recoveryHtml = renderToStaticMarkup(recoveryEl as React.ReactElement);
    assert.ok(recoveryHtml.includes('Unable to display this tool'));
    assert.ok(recoveryHtml.includes('Try Again'));
    assert.ok(recoveryHtml.includes('All Tools'));
    assert.ok(recoveryHtml.includes('Go Home'));
    assert.equal(recoveryHtml.includes('SECRET_INTERNAL_STACK'), false);

    // Verify componentDidUpdate calls setState({ hasError: false }) when resetKey changes
    let resetStateApplied = false;
    (instance as any).setState = (next: { hasError: boolean }) => {
      if (next.hasError === false) resetStateApplied = true;
    };
    (instance as any).props = { scope: 'calculator', resetKey: 'calc-b', children: null };
    instance.componentDidUpdate({ scope: 'calculator', resetKey: 'calc-a', children: null });
    assert.equal(resetStateApplied, true);

    const appSrc = fs.readFileSync('src/App.tsx', 'utf8');
    const mainSrc = fs.readFileSync('src/main.tsx', 'utf8');
    const calcViewSrc = fs.readFileSync('src/components/CalculatorView.tsx', 'utf8');
    assert.ok(mainSrc.includes('<ErrorBoundary scope="app">'));
    assert.ok(appSrc.includes('<ErrorBoundary'));
    assert.ok(calcViewSrc.includes('<ErrorBoundary'));
  });

  check('15. CalculationHistoryService tracks last 5 calculations max and persists in localStorage', () => {
    CalculationHistoryService.clearHistory();
    for (let i = 1; i <= 7; i++) {
      CalculationHistoryService.addRecord({
        calculatorId: 'loan-mortgage',
        calculatorName: 'Loan Mortgage Calculator',
        inputs: { principal: i * 10000 },
        primaryResult: { label: 'Monthly Payment', value: `$${i * 100}` }
      });
    }
    const history = CalculationHistoryService.getHistory();
    assert.equal(history.length, 5);
    // Newest first (item 7 should be first)
    assert.equal(history[0].primaryResult.value, '$700');
    assert.equal(history[4].primaryResult.value, '$300');
    CalculationHistoryService.clearHistory();
    assert.equal(CalculationHistoryService.getHistory().length, 0);
  });

  console.log(`\nALL STAGE 2.2 REGRESSION CHECKS PASSED (${passed}/${passed})`);
}

runStage22RegressionTests();
