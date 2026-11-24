/**
 * Levenshtein distance and fuzzy matching utilities for tool discovery.
 */

export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function fuzzyMatch(text: string, query: string): boolean {
  if (!text || !query) return false;
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return false;
  if (t.includes(q)) return true;

  const qTokens = q.split(/\s+/).filter(Boolean);
  const tTokens = t.split(/\s+/).filter(Boolean);

  return qTokens.every(qt => {
    if (qt.length <= 2) {
      return tTokens.some(tt => tt.includes(qt) || t.includes(qt));
    }
    return tTokens.some(tt => {
      if (tt.includes(qt)) return true;
      const maxDist = qt.length > 5 ? 2 : 1;
      return levenshteinDistance(qt, tt) <= maxDist;
    });
  });
}
