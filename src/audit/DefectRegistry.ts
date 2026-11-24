import { AuditDefect, DefectSeverity, DefectStatus } from './types.ts';

/**
 * Defect Registry for Phase 7 Independent Mathematical Accuracy Audit.
 * Tracks discovered defects, root causes, corrective actions, and verification status.
 */
export class DefectRegistry {
  private static defects: Map<string, AuditDefect> = new Map();
  private static defectCounter = 0;

  /**
   * Log a new defect into the registry
   */
  public static logDefect(defect: Omit<AuditDefect, 'id' | 'status' | 'dateReported'>): AuditDefect {
    this.defectCounter++;
    const id = `DEFECT-P7-${String(this.defectCounter).padStart(4, '0')}`;
    const newDefect: AuditDefect = {
      ...defect,
      id,
      status: 'OPEN',
      dateReported: new Date().toISOString()
    };
    this.defects.set(id, newDefect);
    return newDefect;
  }

  /**
   * Mark a defect as resolved with resolution notes and verification
   */
  public static resolveDefect(id: string, resolution: string): boolean {
    const defect = this.defects.get(id);
    if (!defect) return false;

    defect.status = 'RESOLVED';
    defect.resolution = resolution;
    defect.dateResolved = new Date().toISOString();
    return true;
  }

  /**
   * Mark a defect as verified through regression testing
   */
  public static verifyDefect(id: string): boolean {
    const defect = this.defects.get(id);
    if (!defect) return false;

    defect.status = 'VERIFIED';
    return true;
  }

  /**
   * Get all defects
   */
  public static getAllDefects(): AuditDefect[] {
    return Array.from(this.defects.values());
  }

  /**
   * Get open / unresolved defects
   */
  public static getUnresolvedDefects(): AuditDefect[] {
    return Array.from(this.defects.values()).filter(
      d => d.status === 'OPEN' || d.status === 'IN_PROGRESS'
    );
  }

  /**
   * Get defect summary statistics
   */
  public static getSummary(): {
    total: number;
    open: number;
    resolved: number;
    verified: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  } {
    const all = this.getAllDefects();
    return {
      total: all.length,
      open: all.filter(d => d.status === 'OPEN').length,
      resolved: all.filter(d => d.status === 'RESOLVED').length,
      verified: all.filter(d => d.status === 'VERIFIED').length,
      critical: all.filter(d => d.severity === 'CRITICAL').length,
      high: all.filter(d => d.severity === 'HIGH').length,
      medium: all.filter(d => d.severity === 'MEDIUM').length,
      low: all.filter(d => d.severity === 'LOW' || d.severity === 'COSMETIC').length
    };
  }

  /**
   * Reset registry (used between test runs if needed)
   */
  public static reset(): void {
    this.defects.clear();
    this.defectCounter = 0;
  }
}
