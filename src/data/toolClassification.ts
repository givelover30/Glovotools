import { CalculatorMeta, CategoryMeta } from '../types.ts';

export const TOOL_HUBS = [
  'Calculators',
  'Converters',
  'Generators',
  'Planners',
  'Trackers',
  'Counters',
  'Analyzers',
  'Checkers',
  'Validators',
  'Estimators',
  'Finders',
  'Comparators',
  'Optimizers',
  'Simulators',
  'Testers',
  'Document & PDF',
  'Editors',
  'Formatters',
  'Organizers',
  'Business & Management',
  'Guides & References'
] as const;

export type ToolHubTitle = typeof TOOL_HUBS[number];

export interface ToolClassification {
  toolId: string;
  primaryToolHub: ToolHubTitle;
  secondaryToolHubs?: ToolHubTitle[];
  subjectCategories: string[];
}

/**
 * Phase D1 Batch 1: Explicit verified primary hub assignments for 15 tools
 * whose functional implementation was audited and verified in Phase D0.8.
 * Applied prior to general keyword heuristics so unrelated tools remain unaffected.
 */
export const BATCH1_PRIMARY_HUB_OVERRIDES: Readonly<Partial<Record<string, ToolHubTitle>>> = {
  'stats-summary': 'Calculators',
  'date-difference': 'Calculators',
  'tip-split': 'Calculators',
  'discount-tax': 'Calculators',
  'base64-encoder-decoder': 'Converters',
  'hash-generator-tool': 'Generators',
  'url-encoder-decoder': 'Converters',
  'moving-planner': 'Planners',
  'regex-tester': 'Testers',
  'phone-number-checker': 'Checkers',
  'wedding-planning-organizer': 'Organizers',
  'emergency-fund-planner': 'Planners',
  'personal-goal-organizer': 'Organizers',
  'plant-growth-tracker': 'Trackers',
  'w4-withholding-calc': 'Estimators'
};

/**
 * Strictly classifies any calculator into its canonical primary Tool Hub.
 */
export function getPrimaryToolHub(calc: CalculatorMeta): ToolHubTitle {
  if (calc?.category === 'guides') {
    return 'Guides & References';
  }

  const batch1Override = calc?.id ? BATCH1_PRIMARY_HUB_OVERRIDES[calc.id] : undefined;
  if (batch1Override) {
    return batch1Override;
  }

  const id = (calc.id || '').toLowerCase();
  const name = (calc.name || '').toLowerCase();
  const cat = (calc.category || '').toLowerCase();
  const tags = (calc.tags || []).join(' ').toLowerCase();

  // 1. Checkers
  if (id.includes('checker') || name.includes('checker') || id.includes('check') || name.includes('check') || tags.includes('checker')) {
    if (!id.includes('validator') && !name.includes('validator') && !tags.includes('validator')) {
      return 'Checkers';
    }
  }

  // 2. Validators
  if (id.includes('validator') || name.includes('validator') || tags.includes('validator') || id.includes('validate') || name.includes('validate')) {
    return 'Validators';
  }

  // 3. Document & PDF
  if (cat === 'document-converters' || id.includes('pdf') || name.includes('pdf') || name.includes('document') || name.includes('merge') || name.includes('split') || name.includes('compress')) {
    return 'Document & PDF';
  }

  // 4. Converters
  if (cat === 'converters' || id.includes('convert') || name.includes('convert') || tags.includes('converter') || id.includes('codec') || name.includes('codec')) {
    return 'Converters';
  }

  // 5. Generators
  if (cat === 'generators' || id.includes('generator') || name.includes('generator') || id.includes('generate') || name.includes('generate') || tags.includes('generator')) {
    return 'Generators';
  }

  // 6. Planners
  if (cat === 'planners' || id.includes('planner') || name.includes('planner') || id.includes('plan') || name.includes('plan') || tags.includes('planner')) {
    return 'Planners';
  }

  // 7. Trackers
  if (cat === 'trackers' || id.includes('tracker') || name.includes('tracker') || id.includes('log') || name.includes('log') || tags.includes('tracker')) {
    return 'Trackers';
  }

  // 8. Counters
  if (id.includes('counter') || name.includes('counter') || id.includes('count') || name.includes('count')) {
    return 'Counters';
  }

  // 9. Analyzers
  if (id.includes('analyzer') || name.includes('analyzer') || id.includes('analyze') || name.includes('analyze') || id.includes('stats') || name.includes('statistics')) {
    return 'Analyzers';
  }

  // 10. Estimators
  if (id.includes('estimator') || name.includes('estimator') || id.includes('estimate') || name.includes('estimate')) {
    return 'Estimators';
  }

  // 11. Finders
  if (id.includes('finder') || name.includes('finder') || id.includes('lookup') || name.includes('lookup') || id.includes('find')) {
    return 'Finders';
  }

  // 12. Comparators
  if (id.includes('comparator') || name.includes('comparator') || id.includes('compare') || name.includes('compare') || id.includes('diff')) {
    return 'Comparators';
  }

  // 13. Optimizers
  if (id.includes('optimizer') || name.includes('optimizer') || id.includes('optimize') || name.includes('optimize')) {
    return 'Optimizers';
  }

  // 14. Simulators
  if (id.includes('simulator') || name.includes('simulator') || id.includes('simulate') || name.includes('simulate')) {
    return 'Simulators';
  }

  // 15. Testers
  if (id.includes('tester') || name.includes('tester') || id.includes('test') || name.includes('test')) {
    return 'Testers';
  }

  // 16. Editors
  if (id.includes('editor') || name.includes('editor') || id.includes('edit') || name.includes('edit')) {
    return 'Editors';
  }

  // 17. Formatters
  if (id.includes('formatter') || name.includes('formatter') || id.includes('format') || name.includes('format')) {
    return 'Formatters';
  }

  // 18. Organizers
  if (id.includes('organizer') || name.includes('organizer') || id.includes('organize') || name.includes('inventory')) {
    return 'Organizers';
  }

  // 19. Business & Management
  if (cat === 'business' || cat === 'financial' || id.includes('business') || name.includes('business') || id.includes('management') || name.includes('management') || id.includes('invoice') || name.includes('invoice') || id.includes('project') || name.includes('project') || id.includes('loan') || id.includes('mortgage') || id.includes('compound-interest')) {
    return 'Business & Management';
  }

  // 20. Calculators (Default)
  return 'Calculators';
}

/**
 * Returns a contextual display name for a tool based on the active Tool Hub.
 * Never modifies the underlying canonical registry name.
 */
export function getContextualToolName(name: string, hubTitle: string): string {
  if (!name || !hubTitle) return name;
  const suffixMap: Record<string, string> = {
    'Calculators': 'Calculator',
    'Converters': 'Converter',
    'Generators': 'Generator',
    'Planners': 'Planner',
    'Trackers': 'Tracker',
    'Counters': 'Counter',
    'Analyzers': 'Analyzer',
    'Checkers': 'Checker',
    'Validators': 'Validator',
    'Estimators': 'Estimator',
    'Finders': 'Finder',
    'Comparators': 'Comparator',
    'Optimizers': 'Optimizer',
    'Simulators': 'Simulator',
    'Testers': 'Tester',
    'Editors': 'Editor',
    'Formatters': 'Formatter',
    'Organizers': 'Organizer',
  };

  const desiredSuffix = suffixMap[hubTitle];
  if (!desiredSuffix) return name;

  if (name.endsWith(desiredSuffix)) return name;

  const commonSuffixes = [' Calculator', ' Calc', ' Planner', ' Tracker', ' Converter', ' Generator', ' Checker', ' Validator', ' Estimator', ' Finder', ' Comparator', ' Optimizer', ' Simulator', ' Tester', ' Editor', ' Formatter', ' Organizer', ' Counter', ' Analyzer'];
  
  let baseName = name;
  for (const suf of commonSuffixes) {
    if (baseName.endsWith(suf)) {
      baseName = baseName.slice(0, baseName.length - suf.length);
      break;
    }
  }

  return `${baseName} ${desiredSuffix}`;
}

export interface HubSubjectCategoryAssociation {
  category: CategoryMeta;
  count: number;
}

/**
 * Verifies whether a tool already assigned to `hubTitle` via `getPrimaryToolHub(calc)`
 * genuinely belongs to that Tool Hub's functional domain, filtering out substring collisions,
 * static educational references/guides, and generic default-fallback mismatches when
 * computing related subject categories for Tool Hub views.
 *
 * Does NOT modify `getPrimaryToolHub(calc)` or tool hub counts.
 */
export function isVerifiedHubCategoryTool(calc: CalculatorMeta, hubTitle: ToolHubTitle): boolean {
  const id = (calc.id || '').toLowerCase();
  const name = (calc.name || '').toLowerCase();
  const cat = (calc.category || '').toLowerCase();
  const tags = (calc.tags || []).join(' ').toLowerCase();
  const text = `${id.replace(/-/g, ' ')} ${name.replace(/-/g, ' ')} ${tags.replace(/-/g, ' ')}`;
  const nameClean = name.replace(/-/g, ' ');

  // Static educational guides, glossaries, and reference sheets are not operational hub tools
  if (cat === 'guides') {
    return false;
  }

  switch (hubTitle) {
    case 'Calculators': {
      // Exclude non-calculator tools (e.g., security/semantic auditors) that hit the default fallback
      if (/\bauditor\b/.test(text) && !/\b(calculator|calc|solver)\b/.test(text)) {
        return false;
      }
      return true;
    }

    case 'Converters': {
      // Exclude cap-table trackers matching 'convertible' note terminology
      if (/\bconvertible\b/.test(text) && /\btracker\b/.test(text)) {
        return false;
      }
      return (
        cat === 'converters' ||
        cat === 'converter' ||
        /\b(converter|convert|conversion|conversions|codec|encoder|decoder|transcoder)\b/.test(text)
      );
    }

    case 'Generators': {
      // Exclude physical hardware electrical/power generators (engines, MHD, piezoelectric, TEG, DC-OPF)
      if (
        /\b(standby generator|thermoelectric generator|mhd|magnetohydrodynamic|piezoelectric|microgrid|black start|dc opf|optimal power flow|wattage sizing)\b/.test(
          text
        )
      ) {
        return false;
      }
      return (
        cat === 'generators' ||
        /\b(generator|generate|visualizer|creator|maker|builder)\b/.test(text)
      );
    }

    case 'Planners': {
      if (cat === 'planners') return true;
      // Exclude tools whose primary role is Tracker, Comparator, Organizer, or RRT* convergence analysis
      if (/\b(tracker|comparator|organizer|convergence)\b/.test(nameClean)) {
        return false;
      }
      // Require whole-word planning/scheduling semantics (excludes 'plant', 'plank', 'implant', 'planetary', 'b-plane')
      return (
        /\b(planner|planners|planning|plan|plans|schedule|scheduling|itinerary)\b/.test(nameClean) ||
        /\b(planner|planners|planning)\b/.test(tags.replace(/-/g, ' '))
      );
    }

    case 'Trackers': {
      if (cat === 'trackers') return true;
      // Exclude 'log-' id prefix (logistics), logarithm, logistic, logic, parallelogram, DB undo/WAL logs, log-odds, log2
      if (
        /\b(logarithm|logarithmic|logistic|logic|parallelogram|undo log|write ahead log|log odds|log2|fold change|radiative forcing|spectral power)\b/.test(
          text
        )
      ) {
        return false;
      }
      return (
        /\b(tracker|trackers|tracking|log tracker|retention|audit tracker|rank tracker)\b/.test(
          text
        ) ||
        /\blog\b/.test(nameClean)
      );
    }

    case 'Counters': {
      // Exclude 'discount', 'account', 'accounting', 'countercurrent', 'rainflow counting', 'consumer'
      if (/\brainflow\b/.test(text)) {
        return false;
      }
      return /\b(counter|counters|count|counts|countdown)\b/.test(text);
    }

    case 'Analyzers': {
      if (/\bbatting average\b/.test(nameClean)) {
        return false;
      }
      return /\b(analyzer|analyzers|analyze|analysis|statistics|statistical|stats|readability)\b/.test(
        text
      );
    }

    case 'Checkers': {
      if (cat === 'checkers') return true;
      // Exclude 'paycheck', checklist planners/generators, aircraft 'heavy check', and luggage utilities
      if (/\b(paycheck|checklist|heavy check|luggage)\b/.test(text)) {
        return false;
      }
      return /\b(checker|checkers|check|verifier|checksum|check digit)\b/.test(text);
    }

    case 'Validators': {
      // Exclude PoS crypto staking validator commission calculators
      if (/\b(staking|proof of stake)\b/.test(text)) {
        return false;
      }
      return /\b(validator|validators|validate|validation)\b/.test(text);
    }

    case 'Estimators': {
      return /\b(estimator|estimators|estimate|estimated|estimation)\b/.test(text);
    }

    case 'Finders': {
      return /\b(finder|finders|finding|lookup|find)\b/.test(text);
    }

    case 'Comparators': {
      // Exclude 'difference', 'differential', 'differentiation', 'diffusion', 'diffuser', 'diffraction', 'diffie-hellman'
      return /\b(comparator|comparators|compare|comparison|diff)\b/.test(text);
    }

    case 'Optimizers': {
      return /\b(optimizer|optimizers|optimize|optimization)\b/.test(text);
    }

    case 'Simulators': {
      return /\b(simulator|simulators|simulate|simulation)\b/.test(text);
    }

    case 'Testers': {
      // Exclude 'contest', 'acid test', 'crush test', 'permeability', 'well test', and financial impairment testing
      if (/\b(contest|acid test|crush test|permeability|well test|impairment)\b/.test(text)) {
        return false;
      }
      return /\b(tester|testers|test|testing|test runner)\b/.test(text);
    }

    case 'Document & PDF': {
      if (cat === 'pdf-tools' || cat === 'document-converters') {
        return true;
      }
      // Exclude 'emergency', 'merger', 'bill split', 'workout split', physical compressors, web compression, NoSQL document stores
      if (
        /\b(emergency|merger|bill split|tip split|fuel|microservices|workout|running pace|compressible|compressor|vapor compression|axial compression|web image|javascript bundle|shannon|ipv6|json vs csv|caes|nosql|document store)\b/.test(
          text
        )
      ) {
        return false;
      }
      return /\b(pdf|document|documents|documentation)\b/.test(text);
    }

    case 'Editors': {
      // Exclude 'credit' card / tax credit substring collisions
      return /\b(editor|editors|edit|editing)\b/.test(text);
    }

    case 'Formatters': {
      // Exclude 'transformation', 'formation', 'information' collisions
      return /\b(formatter|formatters|format|formatting|beautifier|minifier)\b/.test(text);
    }

    case 'Organizers': {
      // Exclude industrial supply-chain/manufacturing inventory metrics & audits
      if (
        /\b(turnover|holding cost|meio|safety stock|newsvendor|master inventory|days sales|days inventory)\b/.test(
          text
        )
      ) {
        return false;
      }
      return /\b(organizer|organizers|organize|home inventory)\b/.test(text);
    }

    case 'Business & Management': {
      // Exclude physics 'projectile', robotics/CV null-space projection & reprojection, EV battery thermal management, hobby crafts
      if (
        /\b(projectile|null space projection|camera pose|reprojection|thermal management|battery pack|hobby)\b/.test(
          text
        )
      ) {
        return false;
      }
      return (
        cat === 'business' ||
        cat === 'financial' ||
        cat === 'business-operations' ||
        /\b(business|management|invoice|loan|mortgage|compound interest|project|yield management)\b/.test(
          text
        )
      );
    }

    default:
      return true;
  }
}

/**
 * Dynamically computes verified related subject categories and exact unique matching tool
 * counts for a given Tool Hub from the live catalog and canonical categories list.
 * Deduplicates by `calc.id`, skips inactive entries, and excludes zero-count categories.
 */
export function getHubSubjectCategoryAssociations(
  hubTitle: ToolHubTitle,
  calculators: readonly CalculatorMeta[],
  categories: readonly CategoryMeta[]
): HubSubjectCategoryAssociation[] {
  const categoryById = new Map<string, CategoryMeta>();
  for (const cat of categories) {
    if (cat.isActive !== false) {
      categoryById.set(cat.id, cat);
    }
  }

  const seenUniqueIds = new Set<string>();
  const verifiedCounts = new Map<string, number>();

  for (const calc of calculators) {
    if (!calc?.id) continue;
    if ((calc as { isActive?: boolean }).isActive === false) continue;
    if (seenUniqueIds.has(calc.id)) continue;
    seenUniqueIds.add(calc.id);

    if (getPrimaryToolHub(calc) !== hubTitle) continue;
    if (!categoryById.has(calc.category)) continue;
    if (!isVerifiedHubCategoryTool(calc, hubTitle)) continue;

    verifiedCounts.set(calc.category, (verifiedCounts.get(calc.category) || 0) + 1);
  }

  return Array.from(verifiedCounts.entries())
    .map(([catId, count]) => ({
      category: categoryById.get(catId)!,
      count
    }))
    .filter((item) => Boolean(item.category) && item.count > 0)
    .sort((a, b) => b.count - a.count || a.category.sortOrder - b.category.sortOrder);
}


