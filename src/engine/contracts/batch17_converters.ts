import { CalculationContract, CalculationError } from '../types.ts';
import { ResultFormatter } from '../ResultFormatter.ts';

export const BATCH17_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Universal Unit Converter
  {
    id: 'universal-unit-converter',
    name: 'Universal Unit Converter & Comparison Matrix',
    category: 'converter',
    subcategoryId: 'universal-conversions',
    formulaMeta: {
      formulaName: 'Dimensional Unit Scaling',
      formulaExpression: 'Value_target = (Value_src × Factor_src) / Factor_target',
      variables: [
        { symbol: 'Value_src', name: 'Source Input Value' },
        { symbol: 'Value_target', name: 'Converted Target Value' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'value', label: 'Input Value', type: 'number', required: true, defaultValue: 100 },
        {
          name: 'dimension',
          label: 'Dimension',
          type: 'select',
          required: true,
          defaultValue: 'length',
          options: [
            { label: 'Length & Distance', value: 'length' },
            { label: 'Weight & Mass', value: 'mass' },
            { label: 'Temperature', value: 'temperature' },
            { label: 'Volume & Capacity', value: 'volume' },
            { label: 'Area & Surface', value: 'area' },
            { label: 'Speed & Velocity', value: 'speed' },
            { label: 'Digital Storage', value: 'digital' }
          ]
        },
        { name: 'fromUnit', label: 'From Unit', type: 'select', required: true, defaultValue: 'm',
          options: [
            { label: 'Meters (m)', value: 'm' },
            { label: 'Kilometers (km)', value: 'km' },
            { label: 'Feet (ft)', value: 'ft' },
            { label: 'Inches (in)', value: 'in' }
          ]
        },
        { name: 'toUnit', label: 'To Unit', type: 'select', required: true, defaultValue: 'ft',
          options: [
            { label: 'Feet (ft)', value: 'ft' },
            { label: 'Meters (m)', value: 'm' },
            { label: 'Inches (in)', value: 'in' },
            { label: 'Kilometers (km)', value: 'km' }
          ]
        }
      ]
    },
    validate: (inputs: { value: number }): CalculationError[] => {
      if (typeof inputs.value !== 'number' || isNaN(inputs.value)) {
        return [{ field: 'value', code: 'INVALID_NUMERIC_VALUE', message: 'Value must be a valid number' }];
      }
      return [];
    },
    calculate: (inputs: { value: number; dimension?: string; fromUnit?: string; toUnit?: string }) => {
      const val = inputs.value ?? 100;
      const dim = inputs.dimension || 'length';
      const from = inputs.fromUnit || (dim === 'length' ? 'm' : dim === 'mass' ? 'kg' : dim === 'temperature' ? 'c' : 'm2');
      const to = inputs.toUnit || (dim === 'length' ? 'ft' : dim === 'mass' ? 'lb' : dim === 'temperature' ? 'f' : 'sqft');

      let converted = val;
      let formulaUsed = 'Direct linear scale';

      if (dim === 'temperature') {
        let c = val;
        if (from === 'f') c = (val - 32) * (5 / 9);
        else if (from === 'k') c = val - 273.15;

        if (to === 'c') converted = c;
        else if (to === 'f') converted = (c * 9) / 5 + 32;
        else if (to === 'k') converted = c + 273.15;
        formulaUsed = `${from.toUpperCase()} to ${to.toUpperCase()} temperature conversion`;
      } else {
        const LENGTH_FACTORS: Record<string, number> = {
          m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, nmi: 1852
        };
        const MASS_FACTORS: Record<string, number> = {
          kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523, ton: 1000, stone: 6.35029
        };
        const VOLUME_FACTORS: Record<string, number> = {
          l: 1, ml: 0.001, m3: 1000, gal: 3.78541, floz: 0.0295735, cuft: 28.3168, cup: 0.236588
        };
        const AREA_FACTORS: Record<string, number> = {
          m2: 1, sqft: 0.092903, sqyd: 0.836127, acre: 4046.86, ha: 10000, sqkm: 1000000, sqmi: 2589988
        };
        const SPEED_FACTORS: Record<string, number> = {
          mps: 1, kmh: 0.277778, mph: 0.44704, knot: 0.514444, fps: 0.3048
        };
        const DIGITAL_FACTORS: Record<string, number> = {
          b: 0.125, B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, PB: 1125899906842624
        };

        const factors = dim === 'mass' ? MASS_FACTORS : dim === 'volume' ? VOLUME_FACTORS : dim === 'area' ? AREA_FACTORS : dim === 'speed' ? SPEED_FACTORS : dim === 'digital' ? DIGITAL_FACTORS : LENGTH_FACTORS;
        const fromFactor = factors[from] || 1;
        const toFactor = factors[to] || 1;
        converted = (val * fromFactor) / toFactor;
        formulaUsed = `Base Value = ${val} × ${fromFactor} -> Converted = Base / ${toFactor}`;
      }

      return {
        inputValue: val,
        convertedValue: converted,
        dimension: dim,
        fromUnit: from,
        toUnit: to,
        formulaUsed
      };
    },
    formatResult: (res: { inputValue: number; convertedValue: number; fromUnit: string; toUnit: string; formulaUsed: string }) => ({
      primary: {
        label: 'Converted Result',
        value: `${ResultFormatter.formatDecimal(res.convertedValue, 4)} ${res.toUnit}`,
        numericValue: res.convertedValue
      },
      secondary: [
        { label: 'Original Value', value: `${res.inputValue} ${res.fromUnit}` },
        { label: 'Conversion Formula', value: res.formulaUsed }
      ]
    })
  },

  // 2. Length & Distance Converter
  {
    id: 'length-converter',
    name: 'Length & Distance Unit Converter',
    category: 'converter',
    subcategoryId: 'length-distance',
    formulaMeta: {
      formulaName: 'Length Metric & Imperial Conversion',
      formulaExpression: '1 m = 3.28084 ft = 39.3701 in = 1.09361 yd = 0.000621371 mi',
      variables: [
        { symbol: 'L_in', name: 'Input Length' },
        { symbol: 'L_out', name: 'Converted Length' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'length', label: 'Length Value', type: 'number', required: true, defaultValue: 10, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'm',
          options: [
            { label: 'Meters (m)', value: 'm' },
            { label: 'Feet (ft)', value: 'ft' },
            { label: 'Inches (in)', value: 'in' },
            { label: 'Centimeters (cm)', value: 'cm' },
            { label: 'Kilometers (km)', value: 'km' },
            { label: 'Miles (mi)', value: 'mi' },
            { label: 'Yards (yd)', value: 'yd' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'ft',
          options: [
            { label: 'Feet (ft)', value: 'ft' },
            { label: 'Meters (m)', value: 'm' },
            { label: 'Inches (in)', value: 'in' },
            { label: 'Centimeters (cm)', value: 'cm' },
            { label: 'Kilometers (km)', value: 'km' },
            { label: 'Miles (mi)', value: 'mi' },
            { label: 'Yards (yd)', value: 'yd' }
          ]
        }
      ]
    },
    validate: (inputs: { length: number }): CalculationError[] => {
      if (inputs.length < 0) {
        return [{ field: 'length', code: 'NON_NEGATIVE_REQUIRED', message: 'Length must be non-negative' }];
      }
      return [];
    },
    calculate: (inputs: { length: number; fromUnit?: string; toUnit?: string }) => {
      const len = inputs.length ?? 0;
      const from = inputs.fromUnit || 'm';
      const to = inputs.toUnit || 'ft';

      const TO_METERS: Record<string, number> = {
        m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, yd: 0.9144, mi: 1609.344
      };

      const meters = len * (TO_METERS[from] || 1);
      const converted = meters / (TO_METERS[to] || 1);

      return {
        original: len,
        fromUnit: from,
        toUnit: to,
        converted,
        meters,
        feet: meters / 0.3048,
        inches: meters / 0.0254
      };
    },
    formatResult: (res: { converted: number; toUnit: string; meters: number; feet: number; inches: number }) => ({
      primary: {
        label: 'Converted Length',
        value: `${ResultFormatter.formatDecimal(res.converted, 4)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'Meters (m)', value: `${ResultFormatter.formatDecimal(res.meters, 3)} m` },
        { label: 'Feet (ft)', value: `${ResultFormatter.formatDecimal(res.feet, 2)} ft` },
        { label: 'Inches (in)', value: `${ResultFormatter.formatDecimal(res.inches, 2)} in` }
      ]
    })
  },

  // 3. Weight & Mass Converter
  {
    id: 'weight-mass-converter',
    name: 'Weight & Mass Unit Converter',
    category: 'converter',
    subcategoryId: 'mass-weight',
    formulaMeta: {
      formulaName: 'Mass Conversion',
      formulaExpression: '1 kg = 2.20462 lbs = 1000 g = 35.274 oz',
      variables: [
        { symbol: 'M_in', name: 'Input Mass' },
        { symbol: 'M_out', name: 'Converted Mass' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'mass', label: 'Weight/Mass Value', type: 'number', required: true, defaultValue: 70, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'kg',
          options: [
            { label: 'Kilograms (kg)', value: 'kg' },
            { label: 'Pounds (lbs)', value: 'lb' },
            { label: 'Grams (g)', value: 'g' },
            { label: 'Ounces (oz)', value: 'oz' },
            { label: 'Stones (st)', value: 'st' },
            { label: 'Metric Tons (t)', value: 't' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'lb',
          options: [
            { label: 'Pounds (lbs)', value: 'lb' },
            { label: 'Kilograms (kg)', value: 'kg' },
            { label: 'Grams (g)', value: 'g' },
            { label: 'Ounces (oz)', value: 'oz' },
            { label: 'Stones (st)', value: 'st' },
            { label: 'Metric Tons (t)', value: 't' }
          ]
        }
      ]
    },
    validate: (inputs: { mass: number }): CalculationError[] => {
      if (inputs.mass < 0) {
        return [{ field: 'mass', code: 'NON_NEGATIVE_REQUIRED', message: 'Mass must be non-negative' }];
      }
      return [];
    },
    calculate: (inputs: { mass: number; fromUnit?: string; toUnit?: string }) => {
      const mass = inputs.mass ?? 0;
      const from = inputs.fromUnit || 'kg';
      const to = inputs.toUnit || 'lb';

      const TO_KG: Record<string, number> = {
        kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523, st: 6.35029, t: 1000
      };

      const kg = mass * (TO_KG[from] || 1);
      const converted = kg / (TO_KG[to] || 1);

      return {
        converted,
        toUnit: to,
        kg,
        lbs: kg / 0.45359237,
        grams: kg * 1000,
        ounces: kg / 0.028349523
      };
    },
    formatResult: (res: { converted: number; toUnit: string; kg: number; lbs: number; grams: number; ounces: number }) => ({
      primary: {
        label: 'Converted Mass',
        value: `${ResultFormatter.formatDecimal(res.converted, 4)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'Kilograms (kg)', value: `${ResultFormatter.formatDecimal(res.kg, 3)} kg` },
        { label: 'Pounds (lbs)', value: `${ResultFormatter.formatDecimal(res.lbs, 2)} lbs` },
        { label: 'Grams (g)', value: `${ResultFormatter.formatDecimal(res.grams, 1)} g` },
        { label: 'Ounces (oz)', value: `${ResultFormatter.formatDecimal(res.ounces, 2)} oz` }
      ]
    })
  },

  // 4. Temperature Converter
  {
    id: 'temperature-converter',
    name: 'Temperature Unit Converter (°C, °F, K)',
    category: 'converter',
    subcategoryId: 'temperature-units',
    formulaMeta: {
      formulaName: 'Temperature Scale Equations',
      formulaExpression: '°F = (°C × 9/5) + 32; K = °C + 273.15',
      variables: [
        { symbol: '°C', name: 'Celsius' },
        { symbol: '°F', name: 'Fahrenheit' },
        { symbol: 'K', name: 'Kelvin' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'temperature', label: 'Temperature Value', type: 'number', required: true, defaultValue: 25 },
        {
          name: 'scale',
          label: 'Input Scale',
          type: 'select',
          required: true,
          defaultValue: 'C',
          options: [
            { label: 'Celsius (°C)', value: 'C' },
            { label: 'Fahrenheit (°F)', value: 'F' },
            { label: 'Kelvin (K)', value: 'K' }
          ]
        }
      ]
    },
    validate: (inputs: { temperature: number; scale?: string }): CalculationError[] => {
      const s = inputs.scale || 'C';
      if (s === 'K' && inputs.temperature < 0) {
        return [{ field: 'temperature', code: 'RANGE_OUT_OF_BOUNDS', message: 'Kelvin cannot be negative (Absolute Zero is 0 K)' }];
      }
      if (s === 'C' && inputs.temperature < -273.15) {
        return [{ field: 'temperature', code: 'RANGE_OUT_OF_BOUNDS', message: 'Temperature cannot be below Absolute Zero (-273.15 °C)' }];
      }
      if (s === 'F' && inputs.temperature < -459.67) {
        return [{ field: 'temperature', code: 'RANGE_OUT_OF_BOUNDS', message: 'Temperature cannot be below Absolute Zero (-459.67 °F)' }];
      }
      return [];
    },
    calculate: (inputs: { temperature: number; scale?: string }) => {
      const temp = inputs.temperature ?? 25;
      const scale = inputs.scale || 'C';

      let c = temp;
      if (scale === 'F') c = (temp - 32) * (5 / 9);
      else if (scale === 'K') c = temp - 273.15;

      const f = (c * 9) / 5 + 32;
      const k = c + 273.15;

      return {
        celsius: c,
        fahrenheit: f,
        kelvin: k,
        waterState: c <= 0 ? 'Ice (Solid Freezing)' : c >= 100 ? 'Steam (Boiling Point)' : 'Liquid Water'
      };
    },
    formatResult: (res: { celsius: number; fahrenheit: number; kelvin: number; waterState: string }) => ({
      primary: {
        label: 'Fahrenheit / Celsius',
        value: `${ResultFormatter.formatDecimal(res.fahrenheit, 2)} °F / ${ResultFormatter.formatDecimal(res.celsius, 2)} °C`,
        numericValue: res.fahrenheit
      },
      secondary: [
        { label: 'Celsius (°C)', value: `${ResultFormatter.formatDecimal(res.celsius, 2)} °C` },
        { label: 'Fahrenheit (°F)', value: `${ResultFormatter.formatDecimal(res.fahrenheit, 2)} °F` },
        { label: 'Kelvin (K)', value: `${ResultFormatter.formatDecimal(res.kelvin, 2)} K` },
        { label: 'Water Phase', value: res.waterState }
      ]
    })
  },

  // 5. Volume & Capacity Converter
  {
    id: 'volume-converter',
    name: 'Volume & Liquid Capacity Converter',
    category: 'converter',
    subcategoryId: 'volume-capacity',
    formulaMeta: {
      formulaName: 'Volume Scaling',
      formulaExpression: '1 m³ = 1000 L = 264.172 US Gallons = 35.3147 ft³',
      variables: [{ symbol: 'V', name: 'Volume' }]
    },
    inputSchema: {
      fields: [
        { name: 'volume', label: 'Volume Value', type: 'number', required: true, defaultValue: 5, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'l',
          options: [
            { label: 'Liters (L)', value: 'l' },
            { label: 'US Gallons (gal)', value: 'gal' },
            { label: 'Milliliters (ml)', value: 'ml' },
            { label: 'Fluid Ounces (fl oz)', value: 'floz' },
            { label: 'Cubic Meters (m³)', value: 'm3' },
            { label: 'Cubic Feet (ft³)', value: 'cuft' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'gal',
          options: [
            { label: 'US Gallons (gal)', value: 'gal' },
            { label: 'Liters (L)', value: 'l' },
            { label: 'Milliliters (ml)', value: 'ml' },
            { label: 'Fluid Ounces (fl oz)', value: 'floz' },
            { label: 'Cubic Meters (m³)', value: 'm3' },
            { label: 'Cubic Feet (ft³)', value: 'cuft' }
          ]
        }
      ]
    },
    validate: (inputs: { volume: number }): CalculationError[] => {
      if (inputs.volume < 0) return [{ field: 'volume', code: 'NON_NEGATIVE_REQUIRED', message: 'Volume must be non-negative' }];
      return [];
    },
    calculate: (inputs: { volume: number; fromUnit?: string; toUnit?: string }) => {
      const v = inputs.volume ?? 0;
      const from = inputs.fromUnit || 'l';
      const to = inputs.toUnit || 'gal';

      const TO_LITERS: Record<string, number> = {
        l: 1, ml: 0.001, gal: 3.78541, floz: 0.0295735, m3: 1000, cuft: 28.3168
      };

      const liters = v * (TO_LITERS[from] || 1);
      const converted = liters / (TO_LITERS[to] || 1);

      return {
        converted,
        toUnit: to,
        liters,
        gallons: liters / 3.78541,
        m3: liters / 1000
      };
    },
    formatResult: (res: { converted: number; toUnit: string; liters: number; gallons: number; m3: number }) => ({
      primary: {
        label: 'Converted Volume',
        value: `${ResultFormatter.formatDecimal(res.converted, 4)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'Liters (L)', value: `${ResultFormatter.formatDecimal(res.liters, 3)} L` },
        { label: 'US Gallons (gal)', value: `${ResultFormatter.formatDecimal(res.gallons, 2)} gal` },
        { label: 'Cubic Meters (m³)', value: `${ResultFormatter.formatDecimal(res.m3, 4)} m³` }
      ]
    })
  },

  // 6. Area & Land Surface Converter
  {
    id: 'area-converter',
    name: 'Area & Land Surface Unit Converter',
    category: 'converter',
    subcategoryId: 'area-surface',
    formulaMeta: {
      formulaName: 'Area Conversion',
      formulaExpression: '1 Acre = 43,560 sq ft = 4,046.86 m² = 0.404686 Hectares',
      variables: [{ symbol: 'A', name: 'Area' }]
    },
    inputSchema: {
      fields: [
        { name: 'area', label: 'Area Value', type: 'number', required: true, defaultValue: 1000, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'sqft',
          options: [
            { label: 'Square Feet (sq ft)', value: 'sqft' },
            { label: 'Square Meters (m²)', value: 'm2' },
            { label: 'Acres', value: 'acre' },
            { label: 'Hectares (ha)', value: 'ha' },
            { label: 'Square Yards (sq yd)', value: 'sqyd' },
            { label: 'Square Kilometers (km²)', value: 'sqkm' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'm2',
          options: [
            { label: 'Square Meters (m²)', value: 'm2' },
            { label: 'Square Feet (sq ft)', value: 'sqft' },
            { label: 'Acres', value: 'acre' },
            { label: 'Hectares (ha)', value: 'ha' },
            { label: 'Square Yards (sq yd)', value: 'sqyd' }
          ]
        }
      ]
    },
    validate: (inputs: { area: number }): CalculationError[] => {
      if (inputs.area < 0) return [{ field: 'area', code: 'NON_NEGATIVE_REQUIRED', message: 'Area must be non-negative' }];
      return [];
    },
    calculate: (inputs: { area: number; fromUnit?: string; toUnit?: string }) => {
      const a = inputs.area ?? 0;
      const from = inputs.fromUnit || 'sqft';
      const to = inputs.toUnit || 'm2';

      const TO_SQM: Record<string, number> = {
        m2: 1, sqft: 0.092903, sqyd: 0.836127, acre: 4046.86, ha: 10000, sqkm: 1000000
      };

      const sqm = a * (TO_SQM[from] || 1);
      const converted = sqm / (TO_SQM[to] || 1);

      return {
        converted,
        toUnit: to,
        sqm,
        sqft: sqm / 0.092903,
        acres: sqm / 4046.86,
        hectares: sqm / 10000
      };
    },
    formatResult: (res: { converted: number; toUnit: string; sqm: number; sqft: number; acres: number; hectares: number }) => ({
      primary: {
        label: 'Converted Area',
        value: `${ResultFormatter.formatDecimal(res.converted, 4)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'Square Meters (m²)', value: `${ResultFormatter.formatDecimal(res.sqm, 2)} m²` },
        { label: 'Square Feet (sq ft)', value: `${ResultFormatter.formatDecimal(res.sqft, 1)} sq ft` },
        { label: 'Acres', value: `${ResultFormatter.formatDecimal(res.acres, 4)} acres` },
        { label: 'Hectares (ha)', value: `${ResultFormatter.formatDecimal(res.hectares, 4)} ha` }
      ]
    })
  },

  // 7. Digital Storage Converter
  {
    id: 'digital-storage-converter',
    name: 'Digital Data & Byte Storage Converter',
    category: 'converter',
    subcategoryId: 'digital-storage',
    formulaMeta: {
      formulaName: 'Binary and Decimal Data Conversion',
      formulaExpression: '1 KB = 1024 Bytes; 1 MB = 1024 KB; 1 GB = 1024 MB; 1 Byte = 8 bits',
      variables: [{ symbol: 'Bytes', name: 'Digital Size' }]
    },
    inputSchema: {
      fields: [
        { name: 'dataSize', label: 'Data Size Value', type: 'number', required: true, defaultValue: 100, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'GB',
          options: [
            { label: 'Megabytes (MB)', value: 'MB' },
            { label: 'Gigabytes (GB)', value: 'GB' },
            { label: 'Terabytes (TB)', value: 'TB' },
            { label: 'Kilobytes (KB)', value: 'KB' },
            { label: 'Bytes (B)', value: 'B' },
            { label: 'Megabits (Mb)', value: 'Mb' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'MB',
          options: [
            { label: 'Megabytes (MB)', value: 'MB' },
            { label: 'Gigabytes (GB)', value: 'GB' },
            { label: 'Terabytes (TB)', value: 'TB' },
            { label: 'Kilobytes (KB)', value: 'KB' },
            { label: 'Bytes (B)', value: 'B' }
          ]
        }
      ]
    },
    validate: (inputs: { dataSize: number }): CalculationError[] => {
      if (inputs.dataSize < 0) return [{ field: 'dataSize', code: 'NON_NEGATIVE_REQUIRED', message: 'Data size cannot be negative' }];
      return [];
    },
    calculate: (inputs: { dataSize: number; fromUnit?: string; toUnit?: string }) => {
      const size = inputs.dataSize ?? 0;
      const from = inputs.fromUnit || 'GB';
      const to = inputs.toUnit || 'MB';

      const TO_BYTES: Record<string, number> = {
        b: 0.125, Mb: 131072, B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776
      };

      const bytes = size * (TO_BYTES[from] || 1);
      const converted = bytes / (TO_BYTES[to] || 1);

      return {
        converted,
        toUnit: to,
        bytes,
        mb: bytes / 1048576,
        gb: bytes / 1073741824,
        tb: bytes / 1099511627776
      };
    },
    formatResult: (res: { converted: number; toUnit: string; mb: number; gb: number; tb: number }) => ({
      primary: {
        label: 'Converted Storage',
        value: `${ResultFormatter.formatDecimal(res.converted, 3)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'Megabytes (MB)', value: `${ResultFormatter.formatDecimal(res.mb, 2)} MB` },
        { label: 'Gigabytes (GB)', value: `${ResultFormatter.formatDecimal(res.gb, 4)} GB` },
        { label: 'Terabytes (TB)', value: `${ResultFormatter.formatDecimal(res.tb, 6)} TB` }
      ]
    })
  },

  // 8. Speed & Velocity Converter
  {
    id: 'speed-converter',
    name: 'Speed & Velocity Unit Converter',
    category: 'converter',
    subcategoryId: 'speed-velocity',
    formulaMeta: {
      formulaName: 'Velocity Conversion',
      formulaExpression: '1 mph = 1.60934 km/h = 0.44704 m/s = 0.868976 knots',
      variables: [{ symbol: 'v', name: 'Velocity' }]
    },
    inputSchema: {
      fields: [
        { name: 'speed', label: 'Speed Value', type: 'number', required: true, defaultValue: 65, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'mph',
          options: [
            { label: 'Miles per hour (mph)', value: 'mph' },
            { label: 'Kilometers per hour (km/h)', value: 'kmh' },
            { label: 'Meters per second (m/s)', value: 'mps' },
            { label: 'Knots (kn)', value: 'knot' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'kmh',
          options: [
            { label: 'Kilometers per hour (km/h)', value: 'kmh' },
            { label: 'Miles per hour (mph)', value: 'mph' },
            { label: 'Meters per second (m/s)', value: 'mps' },
            { label: 'Knots (kn)', value: 'knot' }
          ]
        }
      ]
    },
    validate: (inputs: { speed: number }): CalculationError[] => {
      if (inputs.speed < 0) return [{ field: 'speed', code: 'NON_NEGATIVE_REQUIRED', message: 'Speed must be non-negative' }];
      return [];
    },
    calculate: (inputs: { speed: number; fromUnit?: string; toUnit?: string }) => {
      const s = inputs.speed ?? 0;
      const from = inputs.fromUnit || 'mph';
      const to = inputs.toUnit || 'kmh';

      const TO_MPS: Record<string, number> = {
        mps: 1, kmh: 0.277778, mph: 0.44704, knot: 0.514444
      };

      const mps = s * (TO_MPS[from] || 1);
      const converted = mps / (TO_MPS[to] || 1);

      return {
        converted,
        toUnit: to,
        mps,
        kmh: mps * 3.6,
        mph: mps / 0.44704,
        knots: mps / 0.514444
      };
    },
    formatResult: (res: { converted: number; toUnit: string; kmh: number; mph: number; mps: number; knots: number }) => ({
      primary: {
        label: 'Converted Velocity',
        value: `${ResultFormatter.formatDecimal(res.converted, 2)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'km/h', value: `${ResultFormatter.formatDecimal(res.kmh, 2)} km/h` },
        { label: 'mph', value: `${ResultFormatter.formatDecimal(res.mph, 2)} mph` },
        { label: 'm/s', value: `${ResultFormatter.formatDecimal(res.mps, 2)} m/s` },
        { label: 'Knots', value: `${ResultFormatter.formatDecimal(res.knots, 2)} kn` }
      ]
    })
  },

  // 9. Pressure & Stress Converter
  {
    id: 'pressure-converter',
    name: 'Pressure & Atmospheric Stress Converter',
    category: 'converter',
    subcategoryId: 'pressure-stress',
    formulaMeta: {
      formulaName: 'Pressure Conversion',
      formulaExpression: '1 atm = 101,325 Pa = 14.6959 PSI = 1.01325 bar',
      variables: [{ symbol: 'P', name: 'Pressure' }]
    },
    inputSchema: {
      fields: [
        { name: 'pressure', label: 'Pressure Value', type: 'number', required: true, defaultValue: 32, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'psi',
          options: [
            { label: 'Pounds per square inch (PSI)', value: 'psi' },
            { label: 'Bar', value: 'bar' },
            { label: 'Kilopascals (kPa)', value: 'kpa' },
            { label: 'Atmospheres (atm)', value: 'atm' },
            { label: 'Pascals (Pa)', value: 'pa' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'bar',
          options: [
            { label: 'Bar', value: 'bar' },
            { label: 'Pounds per square inch (PSI)', value: 'psi' },
            { label: 'Kilopascals (kPa)', value: 'kpa' },
            { label: 'Atmospheres (atm)', value: 'atm' }
          ]
        }
      ]
    },
    validate: (inputs: { pressure: number }): CalculationError[] => {
      if (inputs.pressure < 0) return [{ field: 'pressure', code: 'NON_NEGATIVE_REQUIRED', message: 'Absolute pressure must be non-negative' }];
      return [];
    },
    calculate: (inputs: { pressure: number; fromUnit?: string; toUnit?: string }) => {
      const p = inputs.pressure ?? 0;
      const from = inputs.fromUnit || 'psi';
      const to = inputs.toUnit || 'bar';

      const TO_PA: Record<string, number> = {
        pa: 1, kpa: 1000, bar: 100000, psi: 6894.757, atm: 101325
      };

      const pa = p * (TO_PA[from] || 1);
      const converted = pa / (TO_PA[to] || 1);

      return {
        converted,
        toUnit: to,
        pa,
        kpa: pa / 1000,
        bar: pa / 100000,
        psi: pa / 6894.757,
        atm: pa / 101325
      };
    },
    formatResult: (res: { converted: number; toUnit: string; bar: number; psi: number; kpa: number; atm: number }) => ({
      primary: {
        label: 'Converted Pressure',
        value: `${ResultFormatter.formatDecimal(res.converted, 3)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'Bar', value: `${ResultFormatter.formatDecimal(res.bar, 3)} bar` },
        { label: 'PSI', value: `${ResultFormatter.formatDecimal(res.psi, 2)} PSI` },
        { label: 'Kilopascals (kPa)', value: `${ResultFormatter.formatDecimal(res.kpa, 2)} kPa` },
        { label: 'Atmospheres (atm)', value: `${ResultFormatter.formatDecimal(res.atm, 4)} atm` }
      ]
    })
  },

  // 10. Energy & Power Converter
  {
    id: 'energy-power-converter',
    name: 'Energy, Work & Power Converter',
    category: 'converter',
    subcategoryId: 'energy-power',
    formulaMeta: {
      formulaName: 'Energy Equivalent',
      formulaExpression: '1 kWh = 3,600,000 J = 860.42 kcal = 3,412.14 BTU',
      variables: [{ symbol: 'E', name: 'Energy' }]
    },
    inputSchema: {
      fields: [
        { name: 'energy', label: 'Energy Value', type: 'number', required: true, defaultValue: 10, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'kwh',
          options: [
            { label: 'Kilowatt-hours (kWh)', value: 'kwh' },
            { label: 'Joules (J)', value: 'j' },
            { label: 'Kilojoules (kJ)', value: 'kj' },
            { label: 'Calories (cal)', value: 'cal' },
            { label: 'Kilocalories (kcal)', value: 'kcal' },
            { label: 'BTU', value: 'btu' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'j',
          options: [
            { label: 'Joules (J)', value: 'j' },
            { label: 'Kilowatt-hours (kWh)', value: 'kwh' },
            { label: 'Kilocalories (kcal)', value: 'kcal' },
            { label: 'BTU', value: 'btu' }
          ]
        }
      ]
    },
    validate: (inputs: { energy: number }): CalculationError[] => {
      if (inputs.energy < 0) return [{ field: 'energy', code: 'NON_NEGATIVE_REQUIRED', message: 'Energy value must be non-negative' }];
      return [];
    },
    calculate: (inputs: { energy: number; fromUnit?: string; toUnit?: string }) => {
      const e = inputs.energy ?? 0;
      const from = inputs.fromUnit || 'kwh';
      const to = inputs.toUnit || 'j';

      const TO_JOULES: Record<string, number> = {
        j: 1, kj: 1000, cal: 4.184, kcal: 4184, kwh: 3600000, btu: 1055.06
      };

      const joules = e * (TO_JOULES[from] || 1);
      const converted = joules / (TO_JOULES[to] || 1);

      return {
        converted,
        toUnit: to,
        joules,
        kwh: joules / 3600000,
        kcal: joules / 4184,
        btu: joules / 1055.06
      };
    },
    formatResult: (res: { converted: number; toUnit: string; joules: number; kwh: number; kcal: number; btu: number }) => ({
      primary: {
        label: 'Converted Energy',
        value: `${ResultFormatter.formatDecimal(res.converted, 3)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'Joules (J)', value: `${ResultFormatter.formatDecimal(res.joules, 1)} J` },
        { label: 'Kilowatt-hours (kWh)', value: `${ResultFormatter.formatDecimal(res.kwh, 4)} kWh` },
        { label: 'Kilocalories (kcal)', value: `${ResultFormatter.formatDecimal(res.kcal, 2)} kcal` },
        { label: 'BTU', value: `${ResultFormatter.formatDecimal(res.btu, 2)} BTU` }
      ]
    })
  },

  // 11. Time & Frequency Converter
  {
    id: 'time-frequency-converter',
    name: 'Time Duration & Frequency Converter',
    category: 'converter',
    subcategoryId: 'universal-conversions',
    formulaMeta: {
      formulaName: 'Time Duration & Period',
      formulaExpression: '1 day = 24 h = 1,440 min = 86,400 s; f = 1/T',
      variables: [
        { symbol: 'T', name: 'Time Period' },
        { symbol: 'f', name: 'Frequency' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'timeValue', label: 'Time Value', type: 'number', required: true, defaultValue: 24, min: 0 },
        {
          name: 'fromUnit',
          label: 'From Unit',
          type: 'select',
          required: true,
          defaultValue: 'hours',
          options: [
            { label: 'Hours (h)', value: 'hours' },
            { label: 'Minutes (min)', value: 'minutes' },
            { label: 'Seconds (s)', value: 'seconds' },
            { label: 'Days (d)', value: 'days' },
            { label: 'Weeks (wk)', value: 'weeks' }
          ]
        },
        {
          name: 'toUnit',
          label: 'To Unit',
          type: 'select',
          required: true,
          defaultValue: 'seconds',
          options: [
            { label: 'Seconds (s)', value: 'seconds' },
            { label: 'Minutes (min)', value: 'minutes' },
            { label: 'Hours (h)', value: 'hours' },
            { label: 'Days (d)', value: 'days' }
          ]
        }
      ]
    },
    validate: (inputs: { timeValue: number }): CalculationError[] => {
      if (inputs.timeValue < 0) return [{ field: 'timeValue', code: 'NON_NEGATIVE_REQUIRED', message: 'Time duration must be non-negative' }];
      return [];
    },
    calculate: (inputs: { timeValue: number; fromUnit?: string; toUnit?: string }) => {
      const t = inputs.timeValue ?? 0;
      const from = inputs.fromUnit || 'hours';
      const to = inputs.toUnit || 'seconds';

      const TO_SECONDS: Record<string, number> = {
        seconds: 1, minutes: 60, hours: 3600, days: 86400, weeks: 604800
      };

      const seconds = t * (TO_SECONDS[from] || 1);
      const converted = seconds / (TO_SECONDS[to] || 1);

      return {
        converted,
        toUnit: to,
        seconds,
        minutes: seconds / 60,
        hours: seconds / 3600,
        days: seconds / 86400
      };
    },
    formatResult: (res: { converted: number; toUnit: string; seconds: number; minutes: number; hours: number; days: number }) => ({
      primary: {
        label: 'Converted Duration',
        value: `${ResultFormatter.formatDecimal(res.converted, 2)} ${res.toUnit}`,
        numericValue: res.converted
      },
      secondary: [
        { label: 'Seconds', value: `${ResultFormatter.formatInteger(Math.round(res.seconds))} s` },
        { label: 'Minutes', value: `${ResultFormatter.formatDecimal(res.minutes, 2)} min` },
        { label: 'Hours', value: `${ResultFormatter.formatDecimal(res.hours, 2)} h` },
        { label: 'Days', value: `${ResultFormatter.formatDecimal(res.days, 3)} days` }
      ]
    })
  }
];
