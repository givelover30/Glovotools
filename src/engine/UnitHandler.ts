export type Dimension = 
  | 'length'
  | 'area'
  | 'volume'
  | 'mass'
  | 'temperature'
  | 'time'
  | 'speed'
  | 'pressure'
  | 'energy'
  | 'power'
  | 'electrical_voltage'
  | 'electrical_current'
  | 'electrical_resistance';

export interface UnitDefinition {
  symbol: string;
  dimension: Dimension;
  name: string;
  baseMultiplier: number; // Multiplier to convert to SI base
  baseOffset?: number;    // Offset for non-zero origin (e.g. Celsius / Fahrenheit)
}

/**
 * Internal UnitHandler
 * Ensures internal mathematical calculations maintain dimensional consistency.
 * Strictly internal infrastructure: does not provide user-facing converter categories or endpoints.
 */
export class UnitHandler {
  private static readonly REGISTRY: Record<string, UnitDefinition> = {
    // Length (Base: meters)
    'm': { symbol: 'm', dimension: 'length', name: 'Meter', baseMultiplier: 1 },
    'cm': { symbol: 'cm', dimension: 'length', name: 'Centimeter', baseMultiplier: 0.01 },
    'mm': { symbol: 'mm', dimension: 'length', name: 'Millimeter', baseMultiplier: 0.001 },
    'km': { symbol: 'km', dimension: 'length', name: 'Kilometer', baseMultiplier: 1000 },
    'in': { symbol: 'in', dimension: 'length', name: 'Inch', baseMultiplier: 0.0254 },
    'ft': { symbol: 'ft', dimension: 'length', name: 'Foot', baseMultiplier: 0.3048 },
    'yd': { symbol: 'yd', dimension: 'length', name: 'Yard', baseMultiplier: 0.9144 },

    // Area (Base: square meters)
    'm2': { symbol: 'm²', dimension: 'area', name: 'Square Meter', baseMultiplier: 1 },
    'cm2': { symbol: 'cm²', dimension: 'area', name: 'Square Centimeter', baseMultiplier: 0.0001 },
    'sqft': { symbol: 'sq ft', dimension: 'area', name: 'Square Foot', baseMultiplier: 0.092903 },
    'sqyd': { symbol: 'sq yd', dimension: 'area', name: 'Square Yard', baseMultiplier: 0.836127 },

    // Volume (Base: cubic meters)
    'm3': { symbol: 'm³', dimension: 'volume', name: 'Cubic Meter', baseMultiplier: 1 },
    'L': { symbol: 'L', dimension: 'volume', name: 'Liter', baseMultiplier: 0.001 },
    'cuft': { symbol: 'cu ft', dimension: 'volume', name: 'Cubic Foot', baseMultiplier: 0.0283168 },
    'cuyd': { symbol: 'yd³', dimension: 'volume', name: 'Cubic Yard', baseMultiplier: 0.764555 },

    // Mass (Base: kilograms)
    'kg': { symbol: 'kg', dimension: 'mass', name: 'Kilogram', baseMultiplier: 1 },
    'g': { symbol: 'g', dimension: 'mass', name: 'Gram', baseMultiplier: 0.001 },
    'lb': { symbol: 'lb', dimension: 'mass', name: 'Pound', baseMultiplier: 0.45359237 },
    'oz': { symbol: 'oz', dimension: 'mass', name: 'Ounce', baseMultiplier: 0.0283495 },

    // Pressure (Base: Pascal)
    'Pa': { symbol: 'Pa', dimension: 'pressure', name: 'Pascal', baseMultiplier: 1 },
    'kPa': { symbol: 'kPa', dimension: 'pressure', name: 'Kilopascal', baseMultiplier: 1000 },
    'bar': { symbol: 'bar', dimension: 'pressure', name: 'Bar', baseMultiplier: 100000 },
    'psi': { symbol: 'PSI', dimension: 'pressure', name: 'Pound per square inch', baseMultiplier: 6894.76 },

    // Energy (Base: Joules)
    'J': { symbol: 'J', dimension: 'energy', name: 'Joule', baseMultiplier: 1 },
    'kJ': { symbol: 'kJ', dimension: 'energy', name: 'Kilojoule', baseMultiplier: 1000 },
    'kWh': { symbol: 'kWh', dimension: 'energy', name: 'Kilowatt-Hour', baseMultiplier: 3600000 },
    'cal': { symbol: 'cal', dimension: 'energy', name: 'Calorie', baseMultiplier: 4.184 },
    'kcal': { symbol: 'kcal', dimension: 'energy', name: 'Kilocalorie', baseMultiplier: 4184 },

    // Power (Base: Watts)
    'W': { symbol: 'W', dimension: 'power', name: 'Watt', baseMultiplier: 1 },
    'kW': { symbol: 'kW', dimension: 'power', name: 'Kilowatt', baseMultiplier: 1000 },
    'hp': { symbol: 'hp', dimension: 'power', name: 'Horsepower', baseMultiplier: 745.7 },

    // Electrical
    'V': { symbol: 'V', dimension: 'electrical_voltage', name: 'Volt', baseMultiplier: 1 },
    'A': { symbol: 'A', dimension: 'electrical_current', name: 'Ampere', baseMultiplier: 1 },
    'ohm': { symbol: 'Ω', dimension: 'electrical_resistance', name: 'Ohm', baseMultiplier: 1 }
  };

  /**
   * Check if two unit symbols share the exact same physical dimension
   */
  public static areCompatible(unitA: string, unitB: string): boolean {
    const defA = this.REGISTRY[unitA];
    const defB = this.REGISTRY[unitB];
    if (!defA || !defB) return false;
    return defA.dimension === defB.dimension;
  }

  /**
   * Internal dimensional conversion to SI base value for standardized calculation execution
   */
  public static toBase(value: number, fromUnit: string): number {
    const def = this.REGISTRY[fromUnit];
    if (!def) {
      throw new Error(`UnitHandler: Unsupported internal unit "${fromUnit}".`);
    }
    const offset = def.baseOffset || 0;
    return (value + offset) * def.baseMultiplier;
  }

  /**
   * Internal dimensional conversion from SI base value to desired output unit
   */
  public static fromBase(valueInBase: number, toUnit: string): number {
    const def = this.REGISTRY[toUnit];
    if (!def) {
      throw new Error(`UnitHandler: Unsupported internal unit "${toUnit}".`);
    }
    const offset = def.baseOffset || 0;
    return (valueInBase / def.baseMultiplier) - offset;
  }

  /**
   * Internal conversion between two compatible dimensional units
   */
  public static convertInternal(value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return value;
    if (!this.areCompatible(fromUnit, toUnit)) {
      throw new Error(`UnitHandler: Incompatible dimensional units "${fromUnit}" and "${toUnit}".`);
    }
    const baseValue = this.toBase(value, fromUnit);
    return this.fromBase(baseValue, toUnit);
  }

  public static convert(value: number, fromUnit: string, toUnit: string): number {
    return this.convertInternal(value, fromUnit, toUnit);
  }

  /**
   * Retrieve official display symbol for a unit
   */
  public static getDisplaySymbol(unit: string): string {
    return this.REGISTRY[unit]?.symbol || unit;
  }
}
