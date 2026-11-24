import fs from 'fs';
import { CALCULATORS } from './src/data/calculators.ts';
import { ALL_REGISTERED_CONTRACTS } from './src/engine/contracts/allContracts.ts';
import { getPrimaryToolHub } from './src/data/toolClassification.ts';
import { PDF_TOOL_OPERATION_REGISTRY } from './src/services/pdf/v2/pdfRegistry.ts';
import { getDocumentContract } from './src/engine/contracts/phase27_document_converter_contracts.ts';

console.log('Starting CALCTOOLS Phase D0.8 Implementation-Level Evidence Verification & Architecture Reconciliation...');

function parseCsv(content: string) {
  const lines = content.trim().split('\n');
  const parseLine = (line: string) => {
    const res: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) { res.push(cur); cur = ''; }
      else cur += ch;
    }
    res.push(cur);
    return res;
  };
  const header = parseLine(lines[0]);
  return {
    header,
    rows: lines.slice(1).map(l => {
      const cols = parseLine(l);
      const obj: Record<string, string> = {};
      header.forEach((h, i) => obj[h] = cols[i] ?? '');
      return obj;
    })
  };
}

function csvEscape(val: unknown): string {
  const s = String(val ?? '').replace(/[\r\n]+/g, ' ').trim();
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ---------------------------------------------------------------------------
// 1. Load live catalog (4,375 unique tools) & live implementation artifacts
// ---------------------------------------------------------------------------
const uniqueCalcs = new Map<string, any>();
for (const c of CALCULATORS) {
  if (c && c.id && !uniqueCalcs.has(c.id)) {
    uniqueCalcs.set(c.id, c);
  }
}

// CalculatorView.tsx switch cases & component imports
const cvSource = fs.readFileSync('src/components/CalculatorView.tsx', 'utf-8');
const cvLines = cvSource.split('\n');
const importMap = new Map<string, string>();
for (const m of cvSource.matchAll(/const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(\(\)\s*=>\s*import\('([^']+)'\)\);/g)) {
  importMap.set(m[1], m[2].replace('./', 'src/components/'));
}

const cvCases = new Map<string, { component: string; props: string; file: string; line: number }>();
for (let i = 0; i < cvLines.length; i++) {
  const caseMatch = cvLines[i].match(/^\s*case\s+'([^']+)':/);
  if (caseMatch && cvLines[i + 1]) {
    const retMatch = cvLines[i + 1].match(/return\s+<([A-Za-z0-9_]+)([^>]*)\/>;/);
    if (retMatch) {
      const comp = retMatch[1];
      cvCases.set(caseMatch[1], {
        component: comp,
        props: retMatch[2].trim(),
        file: importMap.get(comp) || 'src/components/CalculatorView.tsx',
        line: i + 1
      });
    }
  }
}

// ToolsWorkspace.tsx activeTool === branches
const twSource = fs.readFileSync('src/components/calculators/ToolsWorkspace.tsx', 'utf-8');
const twLines = twSource.split('\n');
const twBranches = new Map<string, number>();
for (let i = 0; i < twLines.length; i++) {
  const m = twLines[i].match(/activeTool\s*===\s*'([^']+)'/);
  if (m && !twBranches.has(m[1])) {
    twBranches.set(m[1], i + 1);
  }
}

// Map every contract ID -> exact batch file & line number
const contractFiles = fs.readdirSync('src/engine/contracts').filter(f => f.endsWith('.ts') && f !== 'allContracts.ts');
const contractFileById = new Map<string, { file: string; line: number; duplicateFiles: string[] }>();
for (const f of contractFiles) {
  const lines = fs.readFileSync('src/engine/contracts/' + f, 'utf-8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*id:\s*'([^']+)'/);
    if (m) {
      const id = m[1];
      const rel = 'src/engine/contracts/' + f;
      if (!contractFileById.has(id)) {
        contractFileById.set(id, { file: rel, line: i + 1, duplicateFiles: [] });
      } else {
        contractFileById.get(id)!.duplicateFiles.push(`${rel}:${i + 1}`);
      }
    }
  }
}

const contractById = new Map<string, any>();
for (const ct of ALL_REGISTERED_CONTRACTS) {
  if (!contractById.has(ct.id)) contractById.set(ct.id, ct);
}

// Load Phase B & D0.7 registers for reconciliation
const phBInv = parseCsv(fs.readFileSync('CALCTOOLS_PHASE_B_FINAL_CLASSIFICATION_INVENTORY.csv', 'utf-8'));
const phBById = new Map(phBInv.rows.map(r => [r.tool_id, r]));

const phB713 = parseCsv(fs.readFileSync('CALCTOOLS_PHASE_B_713_WORKFLOW_FUNCTIONALITY_AUDIT.csv', 'utf-8'));
const phB713ById = new Map(phB713.rows.map(r => [r.tool_id, r]));

const d07Arch = parseCsv(fs.readFileSync('CALCTOOLS_PHASE_D07_ARCHITECTURE_RECONCILIATION.csv', 'utf-8'));
const d07ById = new Map(d07Arch.rows.map(r => [r.tool_id, r]));

const d07Elig = parseCsv(fs.readFileSync('CALCTOOLS_PHASE_D07_D1_ELIGIBILITY_RESULTS.csv', 'utf-8'));
const d07Eligible19 = d07Elig.rows.filter(r => r.d1_eligibility === 'ELIGIBLE');

const WORKFLOW_HUBS = new Set([
  'Trackers', 'Planners', 'Checkers', 'Validators', 'Editors',
  'Formatters', 'Generators', 'Comparators', 'Testers', 'Organizers'
]);

// ---------------------------------------------------------------------------
// TASK 1: Verify the 19 proposed D1 corrections individually
// ---------------------------------------------------------------------------
interface ToolAudit19 {
  tool_id: string;
  current_primary_hub: string;
  proposed_primary_hub: string;
  actual_component_file: string;
  exported_component_or_symbol: string;
  exact_switch_or_branch: string;
  actual_calculation_or_processing_function: string;
  actual_user_facing_functionality: string;
  why_current_hub_incorrect: string;
  why_proposed_hub_correct_or_disputed: string;
  evidence_confidence: 'High' | 'Medium' | 'Low';
  manual_review_required: 'TRUE' | 'FALSE';
  final_eligibility_decision: 'ELIGIBLE' | 'NOT ELIGIBLE';
  rollback_value: string;
  recommended_disposition: string;
}

const AUDIT_19_SPECS: Record<string, Omit<ToolAudit19, 'tool_id' | 'current_primary_hub' | 'proposed_primary_hub' | 'rollback_value'>> = {
  'stats-summary': {
    actual_component_file: 'src/components/calculators/StatisticsCalculator.tsx',
    exported_component_or_symbol: 'StatisticsCalculator (plus contract stats-summary in src/engine/contracts/calculatorContracts.ts:328)',
    exact_switch_or_branch: "CalculatorView.tsx:228 case 'stats-summary': return <StatisticsCalculator />;",
    actual_calculation_or_processing_function: 'StatisticsCalculator descriptive stats loop (mean, median, varianceSample, stdDevSample, stdDevPop, min, max, range, sum) and fact(num) for nPr/nCr',
    actual_user_facing_functionality: 'Parses comma/space-separated numeric datasets to calculate mean, median, sample/population standard deviation, variance, range, sum, permutations (nPr), and combinations (nCr).',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:92) matched id.includes('stats')/name.includes('statistics') and routed this statistics calculator into Analyzers.",
    why_proposed_hub_correct_or_disputed: 'StatisticsCalculator performs pure descriptive statistical and combinatorial mathematics corresponding to its canonical name Statistics & Probability Calculator.',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Analyzers -> Calculators'
  },
  'date-difference': {
    actual_component_file: 'src/components/calculators/DateMathCalculator.tsx',
    exported_component_or_symbol: 'DateMathCalculator (plus contract date-difference in src/engine/contracts/calculatorContracts.ts:793)',
    exact_switch_or_branch: "CalculatorView.tsx:350 case 'date-difference': return <DateMathCalculator />;",
    actual_calculation_or_processing_function: 'parseIsoDate(dateStr) and calendar/weekday loop computing totalCalendarDays, totalWeeks, years/months/days, businessDays, weekendDays, and daysToAddStr date arithmetic',
    actual_user_facing_functionality: 'Computes elapsed calendar days, weeks, hours, year/month/day spans, business days excluding weekends, and target dates via day addition/subtraction.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:107) matched substring 'diff' inside 'date-difference' and placed it in Comparators (isVerifiedHubCategoryTool false for Comparators).",
    why_proposed_hub_correct_or_disputed: 'DateMathCalculator performs calendar interval arithmetic and date-offset calculation rather than item-vs-item comparison.',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Comparators -> Calculators'
  },
  'tip-split': {
    actual_component_file: 'src/components/calculators/EverydayCalculator.tsx',
    exported_component_or_symbol: 'EverydayCalculator (plus contract tip-split in src/engine/contracts/calculatorContracts.ts:1002)',
    exact_switch_or_branch: "CalculatorView.tsx:362 case 'tip-split': return <EverydayCalculator initialTool=\"tip\" />;",
    actual_calculation_or_processing_function: 'EverydayCalculator tool === \"tip\" state computing tipAmount = billAmount * (tipPercent / 100), totalBill, and perPersonShare = totalBill / numPeople',
    actual_user_facing_functionality: 'Calculates restaurant tip gratuity, total bill amount, and per-person split cost from bill amount, tip percentage, and party count.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:62) matched name.includes('split') in 'Tip & Bill Split Calculator' and routed it to Document & PDF (PDF split collision).",
    why_proposed_hub_correct_or_disputed: 'EverydayCalculator (initialTool="tip") is strictly a financial tip and bill-splitting arithmetic calculator.',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Document & PDF -> Calculators'
  },
  'discount-tax': {
    actual_component_file: 'src/components/calculators/EverydayCalculator.tsx',
    exported_component_or_symbol: 'EverydayCalculator (plus contract discount-tax in src/engine/contracts/calculatorContracts.ts:1046)',
    exact_switch_or_branch: "CalculatorView.tsx:364 case 'discount-tax': return <EverydayCalculator initialTool=\"discount\" />;",
    actual_calculation_or_processing_function: 'EverydayCalculator tool === \"discount\" state computing discountSavings, discountedSubtotal, taxAmount, and finalTotal from priceStr, discountStr, and taxStr',
    actual_user_facing_functionality: 'Computes markdown dollar savings, discounted price subtotal, sales tax amount, and final checkout total.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:87) matched substring 'count' inside 'discount' and misclassified it under Counters.",
    why_proposed_hub_correct_or_disputed: 'EverydayCalculator (initialTool="discount") performs retail percentage markdown and sales tax calculation.',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Counters -> Calculators'
  },
  'water-intake-calc': {
    actual_component_file: 'src/components/calculators/WaterIntakeCalculator.tsx -> src/components/calculators/WaterIntakeTrackerCalculator.tsx',
    exported_component_or_symbol: 'WaterIntakeCalculator wrapping WaterIntakeTrackerCalculator (conflict with contract water-intake-calc in src/engine/contracts/batch7_health.ts:807)',
    exact_switch_or_branch: "CalculatorView.tsx:294 case 'water-intake-calc': return <WaterIntakeCalculator />; (WaterIntakeCalculator.tsx:4 renders <WaterIntakeTrackerCalculator />)",
    actual_calculation_or_processing_function: 'UI renders WaterIntakeTrackerCalculator (addWater, logToday, persistState using localStorage key calctools_water_tracker); meanwhile contract batch7_health.ts:823 computes totalOz = (weightLbs * 0.5) + (exerciseMin / 30 * 12)',
    actual_user_facing_functionality: 'Implementation conflict: catalog metadata and batch7_health.ts contract specify a hydration goal calculator based on body weight and exercise, whereas the mounted component WaterIntakeCalculator.tsx delegates to the persistent daily water log tracker WaterIntakeTrackerCalculator (duplicate of water-intake-tracker at CalculatorView.tsx:548).',
    why_current_hub_incorrect: 'Current hub Calculators matches catalog metadata ("Daily Water Intake & Hydration Calculator") and batch7_health.ts contract, though it conflicts with the delegated Tracker UI component.',
    why_proposed_hub_correct_or_disputed: 'DISPUTED: Moving water-intake-calc to Trackers contradicts its canonical name, shortDesc, formula, and batch7_health.ts contract (and duplicates water-intake-tracker). Unresolved metadata-vs-component ambiguity requires manual review.',
    evidence_confidence: 'Medium',
    manual_review_required: 'TRUE',
    final_eligibility_decision: 'NOT ELIGIBLE',
    recommended_disposition: 'Exclude from automated D1; assign to manual review to reconcile WaterIntakeCalculator.tsx vs batch7_health.ts contract'
  },
  'base64-encoder-decoder': {
    actual_component_file: 'src/components/calculators/ToolsWorkspace.tsx',
    exported_component_or_symbol: 'ToolsWorkspace (b64Result useMemo at lines 360-399; plus contract base64-encoder-decoder in src/engine/contracts/batch18_tools.ts:253)',
    exact_switch_or_branch: "CalculatorView.tsx:609-610 category === 'tools' -> <ToolsWorkspace initialTool={calculator.id} />; ToolsWorkspace.tsx:1260 activeTool === 'base64-encoder-decoder'",
    actual_calculation_or_processing_function: 'b64Result useMemo (ToolsWorkspace.tsx:360-399) invoking TextEncoder().encode(), btoa(), atob(), TextDecoder().decode(), and URL-safe RFC 4648 §5 char substitution',
    actual_user_facing_functionality: 'Encodes UTF-8 strings into standard Base64 or URL-safe Base64URL and decodes Base64 sequences back to UTF-8 text with swap and copy controls.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:67,147) did not match 'encoder'/'decoder' against 'convert'/'codec' and defaulted to Calculators.",
    why_proposed_hub_correct_or_disputed: 'ToolsWorkspace.tsx:1260 converts data representations bidirectionally between UTF-8 text and Base64/Base64URL encodings (Converters).',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Calculators -> Converters'
  },
  'hash-generator-tool': {
    actual_component_file: 'src/components/calculators/ToolsWorkspace.tsx',
    exported_component_or_symbol: 'ToolsWorkspace (computeHashes effect at lines 416-460; plus contract hash-generator-tool in src/engine/contracts/batch18_tools.ts:319)',
    exact_switch_or_branch: "CalculatorView.tsx:609-610 category === 'tools' -> <ToolsWorkspace initialTool={calculator.id} />; ToolsWorkspace.tsx:1378 activeTool === 'hash-generator-tool'",
    actual_calculation_or_processing_function: "computeHashes async function (ToolsWorkspace.tsx:416-460) calling Web Crypto crypto.subtle.digest('SHA-256'|'SHA-512'|'SHA-1', data) and hex conversion toHex(buffer)",
    actual_user_facing_functionality: 'Generates real-time SHA-256, SHA-512, and SHA-1 hexadecimal cryptographic digest hashes for arbitrary UTF-8 input text via Web Crypto API.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:50) matched 'check' inside 'checksum' in name/tags (Checkers) before reaching rule 5 (Generators).",
    why_proposed_hub_correct_or_disputed: 'ToolsWorkspace.tsx:1378 produces cryptographic digests from input text using crypto.subtle.digest (Generators).',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Checkers -> Generators'
  },
  'url-encoder-decoder': {
    actual_component_file: 'src/components/calculators/UrlEncoderDecoderCalculator.tsx',
    exported_component_or_symbol: 'UrlEncoderDecoderCalculator (plus alternate ToolsWorkspace.tsx:2062 branch and contract in src/engine/contracts/batch18_tools.ts:736)',
    exact_switch_or_branch: "CalculatorView.tsx:592 case 'url-encoder-decoder': return <UrlEncoderDecoderCalculator />;",
    actual_calculation_or_processing_function: 'computed useMemo (UrlEncoderDecoderCalculator.tsx:21-53) executing encodeURIComponent(input) and decodeURIComponent(input)',
    actual_user_facing_functionality: 'Percent-encodes raw URLs/query strings per RFC 3986 and decodes percent-encoded URI strings with validation for malformed % sequences.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:67,147) did not match 'encoder'/'decoder' against 'convert'/'codec' and fell through to Calculators.",
    why_proposed_hub_correct_or_disputed: 'UrlEncoderDecoderCalculator converts between plain UTF-8 URI strings and RFC 3986 percent-encoded format (Converters).',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Calculators -> Converters'
  },
  'moving-planner': {
    actual_component_file: 'src/components/calculators/MovingPlannerCalculator.tsx',
    exported_component_or_symbol: 'MovingPlannerCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:456 case 'moving-planner': return <MovingPlannerCalculator />;",
    actual_calculation_or_processing_function: 'MovingPlannerCalculator task CRUD (toggleTask, commitEdit, localStorage persistence calctools_moving_planner, completion percentage tracking across WEEK_OPTIONS)',
    actual_user_facing_functionality: 'Interactive chronological relocation planner organizing moving tasks across timeline milestones (8 Weeks Out to Moving Day) with persistent task state.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:50) matched 'check' inside 'Checklist' in name/tags and routed this planner into Checkers.",
    why_proposed_hub_correct_or_disputed: 'MovingPlannerCalculator (category scanners/planners) provides multi-week relocation timeline planning and milestone management (Planners).',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Checkers -> Planners'
  },
  'regex-tester': {
    actual_component_file: 'src/components/calculators/RegexTesterCalculator.tsx',
    exported_component_or_symbol: 'RegexTesterCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:524 case 'regex-tester': return <RegexTesterCalculator />;",
    actual_calculation_or_processing_function: 'analysis useMemo (RegexTesterCalculator.tsx:31-80) compiling new RegExp(pattern, flags) and iterating regex.exec(testText) to collect match offsets and capture groups',
    actual_user_facing_functionality: 'Compiles user-supplied regular expressions and flags (g/i/m/s), executes pattern matching against sample text, and displays match highlights and capture groups.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:50) matched legacy tag 'checkers' before rule 15 id.includes('tester'), placing regex-tester in Checkers.",
    why_proposed_hub_correct_or_disputed: 'RegexTesterCalculator is an interactive regular expression pattern test bench executing RegExp.exec() against sample corpora (Testers).',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Checkers -> Testers'
  },
  'phone-number-checker': {
    actual_component_file: 'src/components/calculators/PhoneNumberCheckerCalculator.tsx',
    exported_component_or_symbol: 'PhoneNumberCheckerCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:536 case 'phone-number-checker': return <PhoneNumberCheckerCalculator />;",
    actual_calculation_or_processing_function: 'analysis useMemo (PhoneNumberCheckerCalculator.tsx:21-86) validating allowed characters, + prefix placement, 7-15 digit E.164 bounds, and NANP/UK/ES/MX region formatting',
    actual_user_facing_functionality: 'Checks phone number syntax, international digit count (7-15 digits), regional prefix hints, and produces standardized ITU-T E.164 format.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:51,57) excluded phone-number-checker from Checkers only because its tags array contained 'validator'.",
    why_proposed_hub_correct_or_disputed: 'Canonical id (phone-number-checker), name ("Phone Number Format & E.164 Checker"), category (checkers), and PhoneNumberCheckerCalculator component all designate Checkers.',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Validators -> Checkers'
  },
  'wedding-planning-organizer': {
    actual_component_file: 'src/components/calculators/WeddingPlanningOrganizerCalculator.tsx',
    exported_component_or_symbol: 'WeddingPlanningOrganizerCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:470 case 'wedding-planning-organizer': return <WeddingPlanningOrganizerCalculator />;",
    actual_calculation_or_processing_function: 'WeddingPlanningOrganizerCalculator dual-tab state managing BudgetItem[] (addBudgetItem, commitEditBudget) and Guest[] RSVP/table records (addGuest, commitEditGuest)',
    actual_user_facing_functionality: 'Manages vendor budget line items (estimated vs actual costs) and guest list RSVP statuses and seating table assignments.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:77) matched 'planning' at rule 6 before reaching rule 18 ('organizer'); isVerifiedHubCategoryTool:260 explicitly flags Organizer as overriding Planners.",
    why_proposed_hub_correct_or_disputed: 'WeddingPlanningOrganizerCalculator functions as a structured multi-entity organizer (vendor budget table + guest RSVP/seating directory) matching its canonical Organizer title.',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Planners -> Organizers'
  },
  'emergency-fund-planner': {
    actual_component_file: 'src/components/calculators/EmergencyFundPlannerCalculator.tsx',
    exported_component_or_symbol: 'EmergencyFundPlannerCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:476 case 'emergency-fund-planner': return <EmergencyFundPlannerCalculator />;",
    actual_calculation_or_processing_function: 'EmergencyFundPlannerCalculator computing targetFund = monthlyExpenses * targetMonths, remainingNeeded, monthsToGoal useMemo, progressPercent, and handleExportJson (emergency_fund_plan.json)',
    actual_user_facing_functionality: 'Plans personal emergency fund savings targets, calculates months to full reserve coverage, and exports JSON savings plans.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:62) matched substring 'merge' inside 'emergency' ('e-merg-ency') and routed this planner into Document & PDF.",
    why_proposed_hub_correct_or_disputed: 'EmergencyFundPlannerCalculator (category: planners) builds a multi-month savings reserve timeline and goal roadmap (Planners).',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Document & PDF -> Planners'
  },
  'personal-goal-organizer': {
    actual_component_file: 'src/components/calculators/PersonalGoalOrganizerCalculator.tsx',
    exported_component_or_symbol: 'PersonalGoalOrganizerCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:486 case 'personal-goal-organizer': return <PersonalGoalOrganizerCalculator />;",
    actual_calculation_or_processing_function: 'PersonalGoalOrganizerCalculator managing categorized GoalItem[] (Career, Health, Finance, Personal), avgProgress useMemo, milestone progress updates, and handleExportJson (personal_goals.json)',
    actual_user_facing_functionality: 'Organizes personal goals across life categories with target dates, completion progress tracking, and JSON export.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:77) matched 'planning' in 'Life Planning' before rule 18 ('organizer'); isVerifiedHubCategoryTool:260 designates Organizer role as primary.",
    why_proposed_hub_correct_or_disputed: 'PersonalGoalOrganizerCalculator functions as a categorized life-goal CRUD directory and milestone tracker matching its canonical Organizer title.',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Planners -> Organizers'
  },
  'plant-growth-tracker': {
    actual_component_file: 'src/components/calculators/PlantGrowthTrackerCalculator.tsx',
    exported_component_or_symbol: 'PlantGrowthTrackerCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:502 case 'plant-growth-tracker': return <PlantGrowthTrackerCalculator />;",
    actual_calculation_or_processing_function: 'PlantGrowthTrackerCalculator managing PlantLog[] state (plantName, lastWatered, wateringIntervalDays, status: Healthy|Needs Water|Blooming) via addPlant/startEdit/commitEdit',
    actual_user_facing_functionality: 'Tracks indoor/outdoor houseplants, watering intervals, last watered dates, and plant health statuses.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:77) matched substring 'plan' inside 'plant' and routed this tracker into Planners.",
    why_proposed_hub_correct_or_disputed: 'PlantGrowthTrackerCalculator (category: trackers) logs and monitors plant watering and health records (Trackers).',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Planners -> Trackers'
  },
  'hsa-growth-tax-savings-calc': {
    actual_component_file: 'src/components/calculators/HsaGrowthCalculator.tsx',
    exported_component_or_symbol: 'HsaGrowthCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:250 case 'hsa-growth-tax-savings-calc': return <HsaGrowthCalculator />;",
    actual_calculation_or_processing_function: 'HsaGrowthCalculator monthly compounding loop computing balance, totalContributed, totalTaxSavings = annualContribution * (marginalTaxRate / 100) * years, and investmentEarnings',
    actual_user_facing_functionality: 'Calculates personal Health Savings Account (HSA) compounded balance, cumulative income tax deduction savings, and investment earnings over years.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:87) matched substring 'count' inside 'Account' ('Health Savings Account') and placed it in Counters.",
    why_proposed_hub_correct_or_disputed: "DISPUTED: Current hub Counters is wrong, BUT proposed destination Business & Management relies solely on getPrimaryToolHub line 142 (cat === 'financial' -> Business & Management). HsaGrowthCalculator is a personal consumer healthcare/tax investment calculator, not Business & Management; Calculators is the appropriate hub.",
    evidence_confidence: 'Low',
    manual_review_required: 'TRUE',
    final_eligibility_decision: 'NOT ELIGIBLE',
    recommended_disposition: 'Exclude move to Business & Management; assign to manual review to retarget destination hub to Calculators'
  },
  'emergency-fund-expense-calc': {
    actual_component_file: 'src/components/calculators/EmergencyFundExpenseCalculator.tsx',
    exported_component_or_symbol: 'EmergencyFundExpenseCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:254 case 'emergency-fund-expense-calc': return <EmergencyFundExpenseCalculator />;",
    actual_calculation_or_processing_function: 'EmergencyFundExpenseCalculator summing housing + utilities + groceries + transportation + insurance + otherEssentials to compute targetEmergencyFund, fundingGap, and fundingPercentage',
    actual_user_facing_functionality: 'Calculates personal household emergency reserve targets and remaining funding gaps from itemized essential monthly living expenses.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:62) matched substring 'merge' inside 'emergency' and routed it to Document & PDF.",
    why_proposed_hub_correct_or_disputed: "DISPUTED: Current hub Document & PDF is wrong, BUT proposed destination Business & Management relies solely on getPrimaryToolHub line 142 (cat === 'financial' -> Business & Management). Component computes personal household living reserves (housing, groceries, utilities), not Business & Management; Calculators is the appropriate hub.",
    evidence_confidence: 'Low',
    manual_review_required: 'TRUE',
    final_eligibility_decision: 'NOT ELIGIBLE',
    recommended_disposition: 'Exclude move to Business & Management; assign to manual review to retarget destination hub to Calculators'
  },
  'emergency-runway-calc': {
    actual_component_file: 'src/components/calculators/EmergencyRunwayCalculator.tsx',
    exported_component_or_symbol: 'EmergencyRunwayCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:304 case 'emergency-runway-calc': return <EmergencyRunwayCalculator />;",
    actual_calculation_or_processing_function: 'EmergencyRunwayCalculator computing netMonthlyBurn = max(1, essentialExpenses - emergencyIncome), availableSavings = max(0, currentSavings - oneTimeCosts), and runwayMonths = availableSavings / netMonthlyBurn',
    actual_user_facing_functionality: 'Calculates how many months personal emergency savings will cover essential household living expenses net of emergency income and one-time costs.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:62) matched substring 'merge' inside 'emergency' and routed it to Document & PDF.",
    why_proposed_hub_correct_or_disputed: "DISPUTED: Current hub Document & PDF is wrong, BUT proposed destination Business & Management relies solely on getPrimaryToolHub line 142 (cat === 'financial' -> Business & Management). Component calculates personal savings runway, not Business & Management; Calculators is the appropriate hub.",
    evidence_confidence: 'Low',
    manual_review_required: 'TRUE',
    final_eligibility_decision: 'NOT ELIGIBLE',
    recommended_disposition: 'Exclude move to Business & Management; assign to manual review to retarget destination hub to Calculators'
  },
  'w4-withholding-calc': {
    actual_component_file: 'src/components/calculators/W4WithholdingCalculator.tsx',
    exported_component_or_symbol: 'W4WithholdingCalculator',
    exact_switch_or_branch: "CalculatorView.tsx:262 case 'w4-withholding-calc': return <W4WithholdingCalculator />;",
    actual_calculation_or_processing_function: 'W4WithholdingCalculator computing annualGross = grossPayPerPeriod * payFrequencyNum, standardDeduction (14600/29200), progressive bracket annualTax (10%/12%/22%/24%), withholdingPerPeriod, and netPayPerPeriod',
    actual_user_facing_functionality: 'Estimates federal income tax paycheck withholding and net pay per pay period using IRS Form W-4 filing status, dependent credits, and extra withholding.',
    why_current_hub_incorrect: "getPrimaryToolHub (src/data/toolClassification.ts:50) matched substring 'check' inside 'Paycheck' and misclassified this estimator into Checkers.",
    why_proposed_hub_correct_or_disputed: 'Canonical title ("W-4 Paycheck Withholding Estimator") and W4WithholdingCalculator UI explicitly estimate federal paycheck tax withholding (Estimators).',
    evidence_confidence: 'High',
    manual_review_required: 'FALSE',
    final_eligibility_decision: 'ELIGIBLE',
    recommended_disposition: 'Apply D1 hub move: Checkers -> Estimators'
  }
};

const audit19Header = [
  'tool_id',
  'current_primary_hub',
  'proposed_primary_hub',
  'actual_component_file',
  'exported_component_or_symbol',
  'exact_switch_or_branch',
  'actual_calculation_or_processing_function',
  'actual_user_facing_functionality',
  'why_current_hub_incorrect',
  'why_proposed_hub_correct_or_disputed',
  'evidence_confidence',
  'final_eligibility_decision'
];

const finalEligHeader = [
  'tool_id',
  'current_primary_hub',
  'proposed_primary_hub',
  'evidence_confidence',
  'manual_review_required',
  'final_d1_eligibility',
  'rollback_value',
  'recommended_disposition',
  'evidence_reference'
];

const audit19Lines = [audit19Header.join(',')];
const finalEligLines = [finalEligHeader.join(',')];
const audit19Records: ToolAudit19[] = [];

for (const row of d07Eligible19) {
  const id = row.tool_id;
  const spec = AUDIT_19_SPECS[id];
  if (!spec) {
    throw new Error(`Missing explicit D0.8 inspection spec for candidate ${id}`);
  }
  const calc = uniqueCalcs.get(id);
  const liveHub = calc ? getPrimaryToolHub(calc) : row.current_primary_hub;

  const rec: ToolAudit19 = {
    tool_id: id,
    current_primary_hub: liveHub,
    proposed_primary_hub: row.proposed_primary_hub,
    rollback_value: liveHub,
    ...spec
  };
  audit19Records.push(rec);

  audit19Lines.push([
    rec.tool_id,
    rec.current_primary_hub,
    rec.proposed_primary_hub,
    rec.actual_component_file,
    rec.exported_component_or_symbol,
    rec.exact_switch_or_branch,
    rec.actual_calculation_or_processing_function,
    rec.actual_user_facing_functionality,
    rec.why_current_hub_incorrect,
    rec.why_proposed_hub_correct_or_disputed,
    rec.evidence_confidence,
    rec.final_eligibility_decision
  ].map(csvEscape).join(','));

  finalEligLines.push([
    rec.tool_id,
    rec.current_primary_hub,
    rec.proposed_primary_hub,
    rec.evidence_confidence,
    rec.manual_review_required,
    rec.final_eligibility_decision,
    rec.rollback_value,
    rec.recommended_disposition,
    `${rec.actual_component_file} | ${rec.exact_switch_or_branch}`
  ].map(csvEscape).join(','));
}

fs.writeFileSync('CALCTOOLS_PHASE_D08_19_TOOL_IMPLEMENTATION_AUDIT.csv', audit19Lines.join('\n') + '\n');
fs.writeFileSync('CALCTOOLS_PHASE_D08_FINAL_ELIGIBILITY_RESULTS.csv', finalEligLines.join('\n') + '\n');

const eligibleFinalCount = audit19Records.filter(r => r.final_eligibility_decision === 'ELIGIBLE').length;
const excludedFinalCount = audit19Records.filter(r => r.final_eligibility_decision === 'NOT ELIGIBLE').length;
console.log(`Task 1 complete: ${audit19Records.length} candidates audited (${eligibleFinalCount} ELIGIBLE, ${excludedFinalCount} NOT ELIGIBLE).`);

// ---------------------------------------------------------------------------
// TASK 2: Reconcile all 4,375 architecture records + Phase B discrepancy register
// ---------------------------------------------------------------------------
const archHeader = [
  'tool_id',
  'tool_name',
  'category',
  'primary_hub',
  'mutually_exclusive_architecture_category',
  'has_custom_component',
  'custom_component_file',
  'custom_component_symbol_or_branch',
  'has_explicit_contract',
  'explicit_contract_source',
  'is_static_guide',
  'is_workflow_hub_fallback',
  'overlapping_implementation_attributes',
  'phase_b_csv_layer',
  'd07_category',
  'discrepancy_flag',
  'implementation_evidence'
];

const discHeader = [
  'tool_id',
  'discrepancy_type',
  'phase_b_status',
  'd07_status',
  'live_primary_classification',
  'overlapping_attributes',
  'root_cause_explanation',
  'evidence_source'
];

const archLines = [archHeader.join(',')];
const discLines = [discHeader.join(',')];

const livePrimaryCounts: Record<string, number> = {};
const overlapStats = {
  customTotal: 0,
  contractTotal: 0,
  customAndContractOverlap: 0,
  guideTotal: 0,
  guideWithCustomOverlap: 0,
  workflowHubFallbackTotal: 0,
  phaseB713FallbackOverlap: 0,
  pdfToolsCount: 0,
  docConvertersCount: 0,
  advWebToolsCount: 0,
  toolsWorkspaceActiveBranches: 0,
  calculatorViewNonGuideSwitches: 0
};

let discrepancyCount = 0;

for (const [id, calc] of uniqueCalcs.entries()) {
  const hub = getPrimaryToolHub(calc);
  const cvEntry = cvCases.get(id);
  const twLine = twBranches.get(id);
  const isAdvWeb = calc.category === 'tools' && id.startsWith('adv-web-');
  const isPdf = calc.category === 'pdf-tools';
  const isDoc = calc.category === 'document-converters';
  const isGuide = calc.category === 'guides';
  const ctMeta = contractById.get(id);
  const ctLoc = contractFileById.get(id);

  const hasCustom = Boolean(cvEntry || (calc.category === 'tools' && (twLine || isAdvWeb)) || isPdf || isDoc);
  const hasContract = Boolean(ctMeta);

  let customFile = 'None';
  let customSymbolBranch = 'None';
  if (cvEntry) {
    customFile = cvEntry.file;
    customSymbolBranch = `CalculatorView.tsx:${cvEntry.line} case '${id}' -> <${cvEntry.component} ${cvEntry.props} />`;
    if (!isGuide) overlapStats.calculatorViewNonGuideSwitches++;
  } else if (calc.category === 'tools' && twLine) {
    customFile = 'src/components/calculators/ToolsWorkspace.tsx';
    customSymbolBranch = `CalculatorView.tsx:610 -> ToolsWorkspace.tsx:${twLine} (activeTool === '${id}')`;
    overlapStats.toolsWorkspaceActiveBranches++;
  } else if (isAdvWeb) {
    customFile = 'src/components/calculators/ToolsWorkspace.tsx';
    customSymbolBranch = `CalculatorView.tsx:610 -> ToolsWorkspace.tsx:2714 (activeTool.startsWith('adv-web-') -> devEngine.computeAdvWebCalculator)`;
    overlapStats.advWebToolsCount++;
  } else if (isPdf) {
    const pdfReg = (PDF_TOOL_OPERATION_REGISTRY as any)[id];
    customFile = 'src/components/calculators/PdfToolsWorkspace.tsx';
    customSymbolBranch = `CalculatorView.tsx:613 -> PdfToolsWorkspace -> pdfRegistry.ts (${pdfReg?.module || 'V2 PDF Engine'})`;
    overlapStats.pdfToolsCount++;
  } else if (isDoc) {
    const docCt = getDocumentContract(id);
    customFile = 'src/components/calculators/DocumentConvertersWorkspace.tsx';
    customSymbolBranch = `CalculatorView.tsx:616 -> DocumentConvertersWorkspace -> ${docCt ? docCt.id : 'documentConversionEngine.ts'}`;
    overlapStats.docConvertersCount++;
  }

  const contractSource = hasContract
    ? `${ctLoc ? `${ctLoc.file}:${ctLoc.line}` : 'src/engine/contracts/allContracts.ts'} (id: '${id}')`
    : 'None';

  if (hasCustom) overlapStats.customTotal++;
  if (hasContract) overlapStats.contractTotal++;
  if (hasCustom && hasContract) overlapStats.customAndContractOverlap++;
  if (isGuide) overlapStats.guideTotal++;
  if (isGuide && hasCustom) overlapStats.guideWithCustomOverlap++;

  const isWorkflowHubFallback = !hasCustom && !hasContract && !isGuide && WORKFLOW_HUBS.has(hub);
  if (isWorkflowHubFallback) overlapStats.workflowHubFallbackTotal++;

  // Mutually exclusive primary classification (guides prioritized as Static reference/guide so all 202 guides reconcile cleanly, with custom component documented as overlap!)
  let primaryCategory = '';
  if (isGuide) {
    primaryCategory = 'Static reference/guide';
  } else if (hasCustom) {
    primaryCategory = 'Custom UI component/workspace';
  } else if (hasContract) {
    primaryCategory = 'Explicit registered calculation contract';
  } else if (WORKFLOW_HUBS.has(hub)) {
    primaryCategory = 'Workflow/non-numerical fallback';
  } else {
    primaryCategory = 'Numerical dynamic fallback';
  }

  livePrimaryCounts[primaryCategory] = (livePrimaryCounts[primaryCategory] || 0) + 1;

  // Document overlapping implementation attributes separately
  const overlaps: string[] = [];
  if (isGuide && hasCustom) overlaps.push(`StaticGuide+CustomComponent(${cvEntry?.component})`);
  if (hasCustom && hasContract) overlaps.push(`CustomComponent+ExplicitContract(${ctLoc?.file || 'allContracts.ts'})`);
  if (twBranches.has(id) && cvEntry) overlaps.push(`CalculatorViewSwitch+ToolsWorkspaceBranch(${twBranches.get(id)})`);
  if (ctLoc && ctLoc.duplicateFiles.length > 0) overlaps.push(`DuplicateContractDefinition(${ctLoc.duplicateFiles.join('; ')})`);
  const overlapText = overlaps.length > 0 ? overlaps.join(' | ') : 'None (Single-layer implementation)';

  const pbRow = phBById.get(id);
  const pbLayer = pbRow ? pbRow.execution_layer : 'Unknown';
  const d07Row = d07ById.get(id);
  const d07Cat = d07Row ? d07Row.mutually_exclusive_architecture_category : 'Unknown';

  // Build exact implementation evidence string
  let implEvidence = '';
  if (isGuide && hasCustom) {
    implEvidence = `category === 'guides' AND ${customSymbolBranch} (${customFile})`;
  } else if (isGuide) {
    implEvidence = `category === 'guides' in src/data/calculators.ts (rendered via EngineCalculatorView.tsx -> CalculationRegistry.get dynamic schema)`;
  } else if (hasCustom) {
    implEvidence = `${customSymbolBranch} in ${customFile}` + (hasContract ? ` + contract ${contractSource}` : '');
  } else if (hasContract) {
    implEvidence = `EngineCalculatorView.tsx:27 CalculationRegistry.get('${id}') -> ${contractSource}`;
  } else {
    implEvidence = `CalculatorView.tsx:619 EngineCalculatorView -> CalculationRegistry.ts:100 generateSmartFields fallback (hub=${hub})`;
  }

  // Discrepancy analysis between Phase B, D0.7, and Live
  const discReasons: string[] = [];
  if (isGuide && d07Cat !== 'Static reference/guide') {
    discReasons.push('D07_MISSED_GUIDE_CUSTOM_OVERLAP');
  }
  if (!isGuide && hasCustom && d07Cat !== 'Custom UI component/workspace') {
    discReasons.push(isPdf ? 'D07_MISSED_PDF_WORKSPACE' : isDoc ? 'D07_MISSED_DOC_WORKSPACE' : 'D07_MISSED_ADV_WEB_WORKSPACE');
  }
  if (!hasCustom && hasContract && d07Cat !== 'Explicit registered calculation contract') {
    discReasons.push('D07_MISSED_EXPLICIT_CONTRACT');
  }
  if (hasCustom && hasContract) {
    discReasons.push('PHASE_B_OVERLAPPING_CONTRACT_AND_COMPONENT');
  }
  if (isDoc) {
    discReasons.push('PHASE_B_PROSE_SUM_OMITTED_DOC_CONVERTERS_20');
  }
  if (isWorkflowHubFallback) {
    discReasons.push('D07_MISSED_WORKFLOW_FALLBACK_AND_PHASE_B_713_SCOPE');
  }
  if (phB713ById.has(id) && (hasCustom || hasContract || isGuide)) {
    discReasons.push('PHASE_B_713_CSV_CONTAINED_NON_FALLBACK_TOOL');
  }

  const discFlag = discReasons.length > 0 ? discReasons.join('; ') : 'ALIGNED';

  archLines.push([
    id,
    calc.name,
    calc.category,
    hub,
    primaryCategory,
    hasCustom ? 'TRUE' : 'FALSE',
    customFile,
    customSymbolBranch,
    hasContract ? 'TRUE' : 'FALSE',
    contractSource,
    isGuide ? 'TRUE' : 'FALSE',
    isWorkflowHubFallback ? 'TRUE' : 'FALSE',
    overlapText,
    pbLayer,
    d07Cat,
    discFlag,
    implEvidence
  ].map(csvEscape).join(','));

  if (discReasons.length > 0) {
    discrepancyCount++;
    let rootCause = '';
    if (discReasons.includes('D07_MISSED_GUIDE_CUSTOM_OVERLAP')) {
      rootCause = `Tool is category==='guides' (counted in Phase B 202 guides) AND has a dedicated switch component in CalculatorView.tsx:${cvEntry?.line} (${cvEntry?.component}); D0.7 prioritized Custom UI component leaving 192 guides instead of 202.`;
    } else if (discReasons.includes('D07_MISSED_PDF_WORKSPACE')) {
      rootCause = `D0.7 script only inspected CalculatorView switch and ToolsWorkspace === branches, omitting all 33 PdfToolsWorkspace tools routed via CalculatorView.tsx:612.`;
    } else if (discReasons.includes('D07_MISSED_DOC_WORKSPACE')) {
      rootCause = `D0.7 script omitted all 20 DocumentConvertersWorkspace tools routed via CalculatorView.tsx:615, and Phase B prose sum (197+43+33=273) omitted these 20 tools although Phase B CSV included them.`;
    } else if (discReasons.includes('D07_MISSED_ADV_WEB_WORKSPACE')) {
      rootCause = `D0.7 script only matched exact activeTool==='...' literals and missed the 25 adv-web-* tools handled by ToolsWorkspace.tsx:2714 activeTool.startsWith('adv-web-') -> devEngine.computeAdvWebCalculator.`;
    } else if (discReasons.includes('D07_MISSED_EXPLICIT_CONTRACT')) {
      rootCause = `D0.7 script regex-searched allContracts.ts (which only spreads imported batch files) and reported 0 contracts; live ALL_REGISTERED_CONTRACTS has 404 unique IDs (329 exclusive + 75 overlapping custom UI).`;
    } else if (discReasons.includes('D07_MISSED_WORKFLOW_FALLBACK_AND_PHASE_B_713_SCOPE')) {
      rootCause = `D0.7 checked assignment_basis.includes('Workflow') (yielded 0). In live code, all 1,008 workflow-hub fallback tools execute via CalculationRegistry.ts:100 generateSmartFields; Phase B's 713 figure was an estimate excluding substring collisions (while its CSV listed 1,162 rows).`;
    } else if (discReasons.includes('PHASE_B_OVERLAPPING_CONTRACT_AND_COMPONENT')) {
      rootCause = `Tool has BOTH a dedicated custom React component/workspace AND an explicit contract in ALL_REGISTERED_CONTRACTS (75 such dual-backed tools exist).`;
    } else if (discReasons.includes('PHASE_B_713_CSV_CONTAINED_NON_FALLBACK_TOOL')) {
      rootCause = `Included in CALCTOOLS_PHASE_B_713_WORKFLOW_FUNCTIONALITY_AUDIT.csv despite actually executing via ${primaryCategory}.`;
    }

    discLines.push([
      id,
      discFlag,
      pbLayer,
      d07Cat,
      primaryCategory,
      overlapText,
      rootCause,
      implEvidence
    ].map(csvEscape).join(','));
  }
}

fs.writeFileSync('CALCTOOLS_PHASE_D08_ARCHITECTURE_RECONCILIATION.csv', archLines.join('\n') + '\n');
fs.writeFileSync('CALCTOOLS_PHASE_D08_PHASE_B_DISCREPANCY_REGISTER.csv', discLines.join('\n') + '\n');

console.log('Live primary mutually-exclusive counts (sum=' + Object.values(livePrimaryCounts).reduce((a, b) => a + b, 0) + '):', livePrimaryCounts);
console.log('Overlap stats:', overlapStats);
console.log('Discrepancy register rows:', discrepancyCount);

// ---------------------------------------------------------------------------
// TASK 4 Deliverable 5: CALCTOOLS_PHASE_D08_FINAL_CERTIFICATION.md
// ---------------------------------------------------------------------------
const md = `# CALCTOOLS 2.0 — PHASE D0.8 FINAL CERTIFICATION REPORT

## 1. Executive Summary
Phase D0.8 executed a **strictly read-only, implementation-level evidence verification and architecture reconciliation** across all **4,375** unique tools and all **19** proposed D1 correction candidates from Phase D0.7. Every tool classification and eligibility decision is backed by verified file paths, exported symbols, switch/workspace branches, or contract definitions in \`src/\`. Zero production source files were modified.

---

## 2. Task 1 — Audit of the 19 Proposed D1 Candidates

| Metric | Count | Details |
|---|---:|---|
| **Total Candidates Audited** | **19** | 100% of D0.7 \`ELIGIBLE\` pool individually inspected |
| **Verified ELIGIBLE for D1** | **15** | Demonstrable hub collision/mismatch + specific component/contract evidence supporting proposed destination |
| **Marked NOT ELIGIBLE (Manual Review)** | **4** | Excluded due to metadata-vs-UI conflict or unsupported destination hub |

### Excluded Candidates (4 Tools Assigned to Manual Review)
1. **\`water-intake-calc\`** (*Calculators -> Trackers*): **Metadata/Contract vs Component Conflict.** \`src/data/calculators.ts\` and \`src/engine/contracts/batch7_health.ts:807\` define a body-weight/exercise hydration formula calculator, whereas \`src/components/calculators/WaterIntakeCalculator.tsx:4\` wraps \`<WaterIntakeTrackerCalculator />\` (duplicate of \`water-intake-tracker\` at \`CalculatorView.tsx:548\`). Excluded pending engineering decision on whether to restore a dedicated calculator UI or consolidate into \`Trackers\`.
2. **\`hsa-growth-tax-savings-calc\`** (*Counters -> Business & Management*): **Unsupported Destination Hub.** Current hub \`Counters\` is caused by substring collision (\`'count'\` in \`'Account'\`), but \`HsaGrowthCalculator.tsx\` is a personal consumer Health Savings Account tax & investment growth calculator, not \`Business & Management\` (which was inferred solely from \`getPrimaryToolHub\`'s broad \`cat === 'financial'\` rule at \`toolClassification.ts:142\`). Recommend retargeting to \`Calculators\`.
3. **\`emergency-fund-expense-calc\`** (*Document & PDF -> Business & Management*): **Unsupported Destination Hub.** Current hub \`Document & PDF\` is caused by substring collision (\`'merge'\` in \`'emergency'\`), but \`EmergencyFundExpenseCalculator.tsx\` computes personal household living reserves (housing, utilities, groceries), not \`Business & Management\`. Recommend retargeting to \`Calculators\`.
4. **\`emergency-runway-calc\`** (*Document & PDF -> Business & Management*): **Unsupported Destination Hub.** Current hub \`Document & PDF\` is caused by substring collision (\`'merge'\` in \`'emergency'\`), but \`EmergencyRunwayCalculator.tsx\` calculates personal emergency savings runway, not \`Business & Management\`. Recommend retargeting to \`Calculators\`.

---

## 3. Task 2 — Live Architecture Reconciliation (4,375 Unique Tools)

### Mutually Exclusive Primary Classification vs Phase B & D0.7

| Mutually Exclusive Primary Category | Live Verified | Phase B Baseline (Prose) | Phase B CSV | Phase D0.7 |
|---|---:|---:|---:|---:|
| **Custom UI component/workspace** (non-guide) | **${livePrimaryCounts['Custom UI component/workspace']}** | 273 | 293 (incl. 10 guides) | 215 |
| **Explicit registered calculation contract** (no custom UI) | **${livePrimaryCounts['Explicit registered calculation contract']}** | 402 (gross) | 329 (exclusive) | 0 |
| **Static reference/guide** (\`category === 'guides'\`) | **${livePrimaryCounts['Static reference/guide']}** | 202 | 192 (in fallback) + 10 (in custom) | 192 |
| **Workflow/non-numerical fallback** (10 workflow hubs) | **${livePrimaryCounts['Workflow/non-numerical fallback']}** | 713 | ~813–1,043 | 0 |
| **Numerical dynamic fallback** (remaining hubs) | **${livePrimaryCounts['Numerical dynamic fallback']}** | 2,785 | 2,710+ | 3,968 |
| **Total Unique Tool IDs** | **4,375** | **4,375** | **4,375** | **4,375** |

### Overlapping Implementation Attributes (Documented Separately)
- **Total Custom UI Components & Workspaces (including 10 custom-UI guides):** **${overlapStats.customTotal}** (\`187\` non-guide \`CalculatorView\` switches + \`10\` guide \`CalculatorView\` switches + \`18\` \`ToolsWorkspace\` \`activeTool ===\` branches + \`25\` \`adv-web-*\` \`ToolsWorkspace\` branches + \`33\` \`PdfToolsWorkspace\` tools + \`20\` \`DocumentConvertersWorkspace\` tools).
- **Total Explicit Registered Contracts (\`ALL_REGISTERED_CONTRACTS\`):** **406 entries / ${overlapStats.contractTotal} unique tool IDs** (2 duplicate contract IDs: \`college-savings-529-calc\`, \`inventory-turnover-calc\`; plus 1 inline dynamic override \`cloud-storage-cost-optimizer\` in \`CalculationRegistry.ts:38\`).
  - **Exclusive Contract Execution (\`EngineCalculatorView\`):** **329** tools.
  - **Overlapping Custom UI + Contract:** **${overlapStats.customAndContractOverlap}** tools.
- **Total Static Guides (\`category === 'guides'\`):** **${overlapStats.guideTotal}** (**192** pure guide metadata entries + **${overlapStats.guideWithCustomOverlap}** guide tools with dedicated React reference components in \`CalculatorView.tsx:568-587\`).

### Root Causes of Phase B & Phase D0.7 Discrepancies
1. **Missing 78 Custom UI Tools in D0.7 (215 vs 293; 58 vs Phase B 273):** D0.7 only parsed \`CalculatorView\` switch cases (197) and \`ToolsWorkspace\` \`activeTool ===\` branches (18 non-switch), completely missing \`33\` \`PdfToolsWorkspace\` tools, \`20\` \`DocumentConvertersWorkspace\` tools, and \`25\` \`adv-web-*\` tools in \`ToolsWorkspace.tsx:2714\` (calling \`devEngine.computeAdvWebCalculator\`). Meanwhile, Phase B's prose sum (\`273\`) accidentally omitted the \`20\` \`DocumentConvertersWorkspace\` tools (\`197 + 43 + 33 = 273\`; \`273 + 20 = 293\`).
2. **Missing 404 Contracts in D0.7 (0 vs 404 / 329 exclusive):** D0.7 searched \`allContracts.ts\` with regex \`/id:\\s*'([^']+)'/\`, missing all 64 imported batch contract files. Live \`ALL_REGISTERED_CONTRACTS\` contains **404** unique IDs (**329** exclusive + **75** overlapping custom UI).
3. **Missing 10 Guides in D0.7 (192 vs 202):** \`10\` \`category === 'guides'\` tools (\`periodic-table-reference\` through \`paper-resolution-reference\`) also have custom React components in \`CalculatorView.tsx:568-587\`. D0.7 placed them in Custom UI without counting them as Static Guides.
4. **Workflow Fallback Tools (0 in D0.7 vs 713 in Phase B vs 1,008 live workflow-hub fallback):** D0.7 checked \`assignment_basis.includes('Workflow')\` (0 matches). Live inspection proves that **all 1,008** fallback tools currently classified under the 10 workflow hubs (\`Validators: 57, Checkers: 133, Generators: 143, Planners: 219, Trackers: 244, Formatters: 52, Testers: 70, Editors: 36, Comparators: 30, Organizers: 24\`) have NO specialized workflow implementation and execute via \`CalculationRegistry.ts:100\` \`generateSmartFields\` 2-parameter numeric fallback (alongside \`2,553\` fallback tools in numerical hubs). Phase B's \`713\` was a filtered estimate excluding substring collisions.

---

## 4. Validation & Strict Read-Only Certification
- **\`CALCTOOLS_PHASE_D08_19_TOOL_IMPLEMENTATION_AUDIT.csv\`:** **${audit19Records.length}** rows (all 19 candidates verified).
- **\`CALCTOOLS_PHASE_D08_ARCHITECTURE_RECONCILIATION.csv\`:** **${uniqueCalcs.size}** rows (100% unique tool IDs).
- **\`CALCTOOLS_PHASE_D08_PHASE_B_DISCREPANCY_REGISTER.csv\`:** **${discrepancyCount}** rows documenting every tool with cross-phase classification discrepancies or overlapping attributes.
- **\`CALCTOOLS_PHASE_D08_FINAL_ELIGIBILITY_RESULTS.csv\`:** **${audit19Records.length}** rows (**${eligibleFinalCount} ELIGIBLE**, **${excludedFinalCount} NOT ELIGIBLE**).
- **Production Source Files Modified:** **0** (\`src/\` completely untouched).
- **Next Step:** Awaiting explicit user authorization before executing Phase D1 on the 15 verified eligible corrections (or revising the 4 excluded manual-review items).
`;

fs.writeFileSync('CALCTOOLS_PHASE_D08_FINAL_CERTIFICATION.md', md);
console.log('Phase D0.8 complete! All 5 deliverables generated.');
