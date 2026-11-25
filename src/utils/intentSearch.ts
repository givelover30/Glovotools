import { CalculatorMeta, CategoryId } from '../types.ts';
import Fuse from 'fuse.js';

export function intentSearch(query: string, calculators: CalculatorMeta[]): CalculatorMeta[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const seenIds = new Set<string>();
  const uniqueCalculators = calculators.filter((calc) => {
    if (!calc?.id || seenIds.has(calc.id)) return false;
    seenIds.add(calc.id);
    return true;
  });

  const qWords = q.split(/\s+/).filter(Boolean);

  // Intent guardrails & strict filters for specific common queries
  const isPdfQuery = /\bpdf\b/.test(q) || q.includes('sign') || q.includes('ocr') || q.includes('merge') || q.includes('compress') || q.includes('watermark') || q.includes('extract');
  const isPasswordQuery = q.includes('password') && !q.includes('pdf');
  const isQrQuery = q.includes('qr') || q.includes('barcode') || q.includes('matrix');
  const isMortgageQuery = q.includes('mortgage') || q.includes('auto loan') || (q.includes('loan') && !q.includes('student') && !q.includes('personal'));
  const isPercentageQuery = q.includes('percentage') || q.includes('porcentaje');
  const isAlgebraQuery = q.includes('algebra') || q.includes('equation') || q.includes('quadratic');
  const isGeometryQuery = q.includes('geometry') || q.includes('area') || q.includes('perimeter') || q.includes('volume');
  const isUnitConverterQuery = q.includes('unit') || q.includes('length') || q.includes('converter') || q.includes('measurement');
  const isImageQuery = q.includes('image') || q.includes('photo') || q.includes('favicon') || q.includes('svg');

  // Filter pool based on strict intent guardrails
  let candidatePool = uniqueCalculators.filter((calc) => {
    const cat = calc.category as CategoryId;
    const id = calc.id.toLowerCase();
    const name = calc.name.toLowerCase();
    const tags = (calc.tags || []).map(t => t.toLowerCase());

    if (isPasswordQuery) {
      const isPassTool = id.includes('password') || id.includes('passphrase') || name.includes('password') || name.includes('passphrase');
      const isPdfTool = cat === 'pdf-tools' || id.includes('pdf');
      return isPassTool && !isPdfTool;
    }

    if (isPdfQuery) {
      const isPdfCat = cat === 'pdf-tools' || cat === 'e-signature' || cat === 'document-converters';
      const hasPdfToken = id.includes('pdf') || name.includes('pdf') || id.includes('sign') || name.includes('sign') || id.includes('ocr') || name.includes('ocr') || id.includes('merge') || name.includes('merge') || id.includes('compress') || name.includes('compress') || id.includes('watermark') || id.includes('extract');
      const isUnrelated = cat === 'basic-math' || cat === 'statistics' || cat === 'financial' || cat === 'geometry' || id.includes('password-generator');
      return (isPdfCat || hasPdfToken) && !isUnrelated;
    }

    if (isQrQuery) {
      return id.includes('qr') || name.includes('qr') || tags.some(t => t.includes('qr'));
    }

    if (isMortgageQuery) {
      const isMortgageCat = cat === 'real-estate' || cat === 'financial';
      const hasMortgageToken = id.includes('mortgage') || name.includes('mortgage') || id.includes('loan') || name.includes('loan');
      return isMortgageCat && hasMortgageToken;
    }

    if (isPercentageQuery) {
      return id.includes('percentage') || name.includes('percentage') || tags.includes('percentage');
    }

    if (isAlgebraQuery) {
      return cat === 'algebra' || id.includes('algebra') || id.includes('equation') || name.includes('algebra');
    }

    if (isGeometryQuery) {
      return cat === 'geometry' || id.includes('geometry') || id.includes('area') || id.includes('perimeter');
    }

    if (isUnitConverterQuery) {
      return cat === 'converter' || cat === 'document-converters' || id.includes('converter') || name.includes('converter');
    }

    if (isImageQuery && !q.includes('pdf')) {
      return (cat === 'generators' && (id.includes('image') || id.includes('favicon') || id.includes('svg') || id.includes('color'))) || id.includes('image') || name.includes('image');
    }

    return true;
  });

  // Fuse.js scoring on candidate pool
  const fuse = new Fuse(candidatePool, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'id', weight: 0.2 },
      { name: 'tags', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const fuseResults = fuse.search(q);

  // Stricter weighting system prioritizing exact canonical category matches over general descriptions
  const scoredResults: { item: CalculatorMeta; score: number }[] = [];

  for (const result of fuseResults) {
    const item = result.item;
    let baseScore = 1 - (result.score || 0); // higher is better

    const id = item.id.toLowerCase();
    const name = item.name.toLowerCase();
    const cat = item.category as CategoryId;

    // Canonical Category Priority Weighting
    if (isPdfQuery) {
      if (cat === 'pdf-tools' || cat === 'e-signature' || cat === 'document-converters') {
        baseScore += 3.5; // Heavy priority for PDF/Signature/Converter canonical categories
      }
    } else if (isMortgageQuery) {
      if (cat === 'real-estate' || cat === 'financial') {
        baseScore += 3.0;
      }
    } else if (isAlgebraQuery || isGeometryQuery || isPercentageQuery) {
      if (cat === 'algebra' || cat === 'geometry' || cat === 'basic-math') {
        baseScore += 3.0;
      }
    } else if (isUnitConverterQuery) {
      if (cat === 'converter' || cat === 'document-converters') {
        baseScore += 3.0;
      }
    }

    // Exact matches & title weighting
    if (name === q || id === q) {
      baseScore += 4.0;
    } else if (name.startsWith(q) || id.startsWith(q)) {
      baseScore += 2.0;
    } else if (qWords.every(w => name.includes(w) || id.includes(w))) {
      baseScore += 1.0;
    }

    scoredResults.push({ item, score: baseScore });
  }

  // Fallback direct substring matches if fuse returns too few
  if (scoredResults.length < 4) {
    for (const item of candidatePool) {
      if (scoredResults.some(r => r.item.id === item.id)) continue;
      const name = item.name.toLowerCase();
      const id = item.id.toLowerCase();
      const cat = item.category as CategoryId;
      let fallbackScore = 0.5;
      if (isPdfQuery && (cat === 'pdf-tools' || cat === 'e-signature')) {
        fallbackScore += 2.0;
      }
      if (qWords.every(w => name.includes(w) || id.includes(w))) {
        scoredResults.push({ item, score: fallbackScore });
      }
    }
  }

  scoredResults.sort((a, b) => b.score - a.score);

  // Return top unique results (max 16) with minimum threshold
  const finalOut: CalculatorMeta[] = [];
  const addedIds = new Set<string>();

  for (const r of scoredResults) {
    if (r.score < 0.3 && scoredResults.length > 3) continue; // Minimum relevance threshold
    if (!addedIds.has(r.item.id)) {
      addedIds.add(r.item.id);
      finalOut.push(r.item);
    }
    if (finalOut.length >= 16) break;
  }

  return finalOut;
}
