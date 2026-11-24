import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eraser,
  RotateCcw
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolPresetBar,
  ToolSegmentedControl
} from '../calculator/ToolWorkspacePrimitives.tsx';

type DimensionKey =
  | 'length'
  | 'mass'
  | 'temperature'
  | 'volume'
  | 'area'
  | 'digital'
  | 'speed'
  | 'pressure'
  | 'energy'
  | 'time'
  | 'angle'
  | 'fuel'
  | 'torque'
  | 'force'
  | 'cooking'
  | 'typography'
  | 'dataRate'
  | 'sound'
  | 'shoeSize'
  | 'clothingSize';

interface UnitOption {
  id: string;
  name: string;
  nameEs: string;
  symbol: string;
  factor: number;
  offset?: number;
}

const DIMENSIONS: Record<
  DimensionKey,
  {
    name: string;
    nameEs: string;
    iconName: string;
    units: UnitOption[];
    presets: Array<{ label: string; labelEs: string; val: number; from: string; to: string }>;
  }
> = {
  length: {
    name: 'Length & Distance',
    nameEs: 'Longitud y Distancia',
    iconName: 'Ruler',
    units: [
      { id: 'm', name: 'Meters', nameEs: 'Metros', symbol: 'm', factor: 1 },
      { id: 'km', name: 'Kilometers', nameEs: 'Kilómetros', symbol: 'km', factor: 1000 },
      { id: 'cm', name: 'Centimeters', nameEs: 'Centímetros', symbol: 'cm', factor: 0.01 },
      { id: 'mm', name: 'Millimeters', nameEs: 'Milímetros', symbol: 'mm', factor: 0.001 },
      { id: 'in', name: 'Inches', nameEs: 'Pulgadas', symbol: 'in', factor: 0.0254 },
      { id: 'ft', name: 'Feet', nameEs: 'Pies', symbol: 'ft', factor: 0.3048 },
      { id: 'yd', name: 'Yards', nameEs: 'Yardas', symbol: 'yd', factor: 0.9144 },
      { id: 'mi', name: 'Miles', nameEs: 'Millas', symbol: 'mi', factor: 1609.344 },
      { id: 'nmi', name: 'Nautical Miles', nameEs: 'Millas Náuticas', symbol: 'nmi', factor: 1852 }
    ],
    presets: [
      { label: '1 Meter to Feet', labelEs: '1 Metro a Pies', val: 1, from: 'm', to: 'ft' },
      { label: '5 Miles to Kilometers', labelEs: '5 Millas a Kilómetros', val: 5, from: 'mi', to: 'km' },
      { label: '100 cm to Inches', labelEs: '100 cm a Pulgadas', val: 100, from: 'cm', to: 'in' }
    ]
  },
  mass: {
    name: 'Weight & Mass',
    nameEs: 'Peso y Masa',
    iconName: 'Scale',
    units: [
      { id: 'kg', name: 'Kilograms', nameEs: 'Kilogramos', symbol: 'kg', factor: 1 },
      { id: 'g', name: 'Grams', nameEs: 'Gramos', symbol: 'g', factor: 0.001 },
      { id: 'mg', name: 'Milligrams', nameEs: 'Miligramos', symbol: 'mg', factor: 0.000001 },
      { id: 'lb', name: 'Pounds', nameEs: 'Libras', symbol: 'lbs', factor: 0.45359237 },
      { id: 'oz', name: 'Ounces', nameEs: 'Onzas', symbol: 'oz', factor: 0.028349523 },
      { id: 'st', name: 'Stones', nameEs: 'Piedras', symbol: 'st', factor: 6.35029 },
      { id: 't', name: 'Metric Tons', nameEs: 'Toneladas Métricas', symbol: 't', factor: 1000 }
    ],
    presets: [
      { label: '1 kg to Pounds', labelEs: '1 kg a Libras', val: 1, from: 'kg', to: 'lb' },
      { label: '150 lbs to Kilograms', labelEs: '150 lbs a Kilogramos', val: 150, from: 'lb', to: 'kg' },
      { label: '16 oz to Grams', labelEs: '16 oz a Gramos', val: 16, from: 'oz', to: 'g' }
    ]
  },
  temperature: {
    name: 'Temperature',
    nameEs: 'Temperatura',
    iconName: 'Flame',
    units: [
      { id: 'c', name: 'Celsius', nameEs: 'Celsius', symbol: '°C', factor: 1 },
      { id: 'f', name: 'Fahrenheit', nameEs: 'Fahrenheit', symbol: '°F', factor: 1 },
      { id: 'k', name: 'Kelvin', nameEs: 'Kelvin', symbol: 'K', factor: 1 }
    ],
    presets: [
      { label: 'Freezing Point (0 °C to °F)', labelEs: 'Punto de Congelación (0 °C a °F)', val: 0, from: 'c', to: 'f' },
      { label: 'Room Temp (72 °F to °C)', labelEs: 'Temperatura Ambiente (72 °F a °C)', val: 72, from: 'f', to: 'c' },
      { label: 'Boiling Point (100 °C to °F)', labelEs: 'Punto de Ebullición (100 °C a °F)', val: 100, from: 'c', to: 'f' }
    ]
  },
  volume: {
    name: 'Volume & Capacity',
    nameEs: 'Volumen y Capacidad',
    iconName: 'Droplet',
    units: [
      { id: 'l', name: 'Liters', nameEs: 'Litros', symbol: 'L', factor: 1 },
      { id: 'ml', name: 'Milliliters', nameEs: 'Mililitros', symbol: 'mL', factor: 0.001 },
      { id: 'gal', name: 'US Gallons', nameEs: 'Galones EE.UU.', symbol: 'gal', factor: 3.78541 },
      { id: 'floz', name: 'Fluid Ounces', nameEs: 'Onzas Líquidas', symbol: 'fl oz', factor: 0.0295735 },
      { id: 'm3', name: 'Cubic Meters', nameEs: 'Metros Cúbicos', symbol: 'm³', factor: 1000 },
      { id: 'cuft', name: 'Cubic Feet', nameEs: 'Pies Cúbicos', symbol: 'ft³', factor: 28.3168 },
      { id: 'cup', name: 'Cups', nameEs: 'Tazas', symbol: 'cup', factor: 0.236588 }
    ],
    presets: [
      { label: '1 Gallon to Liters', labelEs: '1 Galón a Litros', val: 1, from: 'gal', to: 'l' },
      { label: '500 mL to Fluid Ounces', labelEs: '500 mL a Onzas Líquidas', val: 500, from: 'ml', to: 'floz' },
      { label: '1 m³ to Liters', labelEs: '1 m³ a Litros', val: 1, from: 'm3', to: 'l' }
    ]
  },
  area: {
    name: 'Area & Land',
    nameEs: 'Área y Terreno',
    iconName: 'Shapes',
    units: [
      { id: 'm2', name: 'Square Meters', nameEs: 'Metros Cuadrados', symbol: 'm²', factor: 1 },
      { id: 'sqft', name: 'Square Feet', nameEs: 'Pies Cuadrados', symbol: 'sq ft', factor: 0.092903 },
      { id: 'sqyd', name: 'Square Yards', nameEs: 'Yardas Cuadradas', symbol: 'sq yd', factor: 0.836127 },
      { id: 'acre', name: 'Acres', nameEs: 'Acres', symbol: 'ac', factor: 4046.86 },
      { id: 'ha', name: 'Hectares', nameEs: 'Hectáreas', symbol: 'ha', factor: 10000 },
      { id: 'sqkm', name: 'Square Kilometers', nameEs: 'Kilómetros Cuadrados', symbol: 'km²', factor: 1000000 }
    ],
    presets: [
      { label: '1 Acre to Square Feet', labelEs: '1 Acre a Pies Cuadrados', val: 1, from: 'acre', to: 'sqft' },
      { label: '100 m² to Square Feet', labelEs: '100 m² a Pies Cuadrados', val: 100, from: 'm2', to: 'sqft' },
      { label: '1 Hectare to Acres', labelEs: '1 Hectárea a Acres', val: 1, from: 'ha', to: 'acre' }
    ]
  },
  digital: {
    name: 'Digital Storage',
    nameEs: 'Almacenamiento Digital',
    iconName: 'Binary',
    units: [
      { id: 'b', name: 'Bits', nameEs: 'Bits', symbol: 'bits', factor: 0.125 },
      { id: 'B', name: 'Bytes', nameEs: 'Bytes', symbol: 'B', factor: 1 },
      { id: 'KB', name: 'Kilobytes', nameEs: 'Kilobytes', symbol: 'KB', factor: 1024 },
      { id: 'MB', name: 'Megabytes', nameEs: 'Megabytes', symbol: 'MB', factor: 1048576 },
      { id: 'GB', name: 'Gigabytes', nameEs: 'Gigabytes', symbol: 'GB', factor: 1073741824 },
      { id: 'TB', name: 'Terabytes', nameEs: 'Terabytes', symbol: 'TB', factor: 1099511627776 },
      { id: 'PB', name: 'Petabytes', nameEs: 'Petabytes', symbol: 'PB', factor: 1125899906842624 }
    ],
    presets: [
      { label: '1 GB to Megabytes', labelEs: '1 GB a Megabytes', val: 1, from: 'GB', to: 'MB' },
      { label: '1 TB to Gigabytes', labelEs: '1 TB a Gigabytes', val: 1, from: 'TB', to: 'GB' },
      { label: '500 MB to Kilobytes', labelEs: '500 MB a Kilobytes', val: 500, from: 'MB', to: 'KB' }
    ]
  },
  speed: {
    name: 'Speed & Velocity',
    nameEs: 'Velocidad',
    iconName: 'Gauge',
    units: [
      { id: 'kmh', name: 'Kilometers per Hour', nameEs: 'Kilómetros por Hora', symbol: 'km/h', factor: 0.277778 },
      { id: 'mph', name: 'Miles per Hour', nameEs: 'Millas por Hora', symbol: 'mph', factor: 0.44704 },
      { id: 'mps', name: 'Meters per Second', nameEs: 'Metros por Segundo', symbol: 'm/s', factor: 1 },
      { id: 'knot', name: 'Knots', nameEs: 'Nudos', symbol: 'kn', factor: 0.514444 },
      { id: 'fps', name: 'Feet per Second', nameEs: 'Pies por Segundo', symbol: 'ft/s', factor: 0.3048 }
    ],
    presets: [
      { label: '65 mph to km/h', labelEs: '65 mph a km/h', val: 65, from: 'mph', to: 'kmh' },
      { label: '100 km/h to mph', labelEs: '100 km/h a mph', val: 100, from: 'kmh', to: 'mph' },
      { label: '20 knots to km/h', labelEs: '20 nudos a km/h', val: 20, from: 'knot', to: 'kmh' }
    ]
  },
  pressure: {
    name: 'Pressure & Stress',
    nameEs: 'Presión y Tensión',
    iconName: 'Minimize2',
    units: [
      { id: 'psi', name: 'Pounds per Sq Inch', nameEs: 'Libras por Pulg² (PSI)', symbol: 'PSI', factor: 6894.757 },
      { id: 'bar', name: 'Bar', nameEs: 'Bar', symbol: 'bar', factor: 100000 },
      { id: 'kpa', name: 'Kilopascals', nameEs: 'Kilopascales', symbol: 'kPa', factor: 1000 },
      { id: 'atm', name: 'Atmospheres', nameEs: 'Atmósferas', symbol: 'atm', factor: 101325 },
      { id: 'pa', name: 'Pascals', nameEs: 'Pascales', symbol: 'Pa', factor: 1 }
    ],
    presets: [
      { label: '32 PSI (Tire) to Bar', labelEs: '32 PSI (Neumático) a Bar', val: 32, from: 'psi', to: 'bar' },
      { label: '1 atm to PSI', labelEs: '1 atm a PSI', val: 1, from: 'atm', to: 'psi' },
      { label: '2.2 Bar to PSI', labelEs: '2.2 Bar a PSI', val: 2.2, from: 'bar', to: 'psi' }
    ]
  },
  energy: {
    name: 'Energy & Power',
    nameEs: 'Energía y Potencia',
    iconName: 'Zap',
    units: [
      { id: 'kwh', name: 'Kilowatt-hours', nameEs: 'Kilovatios-hora', symbol: 'kWh', factor: 3600000 },
      { id: 'j', name: 'Joules', nameEs: 'Julios', symbol: 'J', factor: 1 },
      { id: 'kj', name: 'Kilojoules', nameEs: 'Kilojulios', symbol: 'kJ', factor: 1000 },
      { id: 'cal', name: 'Calories', nameEs: 'Calorías', symbol: 'cal', factor: 4.184 },
      { id: 'kcal', name: 'Kilocalories', nameEs: 'Kilocalorías', symbol: 'kcal', factor: 4184 },
      { id: 'btu', name: 'British Thermal Units', nameEs: 'BTU', symbol: 'BTU', factor: 1055.06 }
    ],
    presets: [
      { label: '1 kWh to Joules', labelEs: '1 kWh a Julios', val: 1, from: 'kwh', to: 'j' },
      { label: '2000 kcal to kJ', labelEs: '2000 kcal a kJ', val: 2000, from: 'kcal', to: 'kj' },
      { label: '10,000 BTU to kWh', labelEs: '10,000 BTU a kWh', val: 10000, from: 'btu', to: 'kwh' }
    ]
  },
  time: {
    name: 'Time & Duration',
    nameEs: 'Tiempo y Duración',
    iconName: 'Clock',
    units: [
      { id: 's', name: 'Seconds', nameEs: 'Segundos', symbol: 's', factor: 1 },
      { id: 'min', name: 'Minutes', nameEs: 'Minutos', symbol: 'min', factor: 60 },
      { id: 'h', name: 'Hours', nameEs: 'Horas', symbol: 'h', factor: 3600 },
      { id: 'd', name: 'Days', nameEs: 'Días', symbol: 'd', factor: 86400 },
      { id: 'wk', name: 'Weeks', nameEs: 'Semanas', symbol: 'wk', factor: 604800 },
      { id: 'mo', name: 'Months (30d)', nameEs: 'Meses (30d)', symbol: 'mo', factor: 2592000 },
      { id: 'yr', name: 'Years (365d)', nameEs: 'Años (365d)', symbol: 'yr', factor: 31536000 }
    ],
    presets: [
      { label: '24 Hours to Minutes', labelEs: '24 Horas a Minutos', val: 24, from: 'h', to: 'min' },
      { label: '7 Days to Seconds', labelEs: '7 Días a Segundos', val: 7, from: 'd', to: 's' },
      { label: '1 Year to Hours', labelEs: '1 Año a Horas', val: 1, from: 'yr', to: 'h' }
    ]
  },
  angle: {
    name: 'Angle',
    nameEs: 'Ángulo',
    iconName: 'Compass',
    units: [
      { id: 'deg', name: 'Degrees', nameEs: 'Grados', symbol: '°', factor: 1 },
      { id: 'rad', name: 'Radians', nameEs: 'Radianes', symbol: 'rad', factor: 57.2957795 },
      { id: 'grad', name: 'Gradians', nameEs: 'Gradianes', symbol: 'gon', factor: 0.9 },
      { id: 'arcmin', name: 'Arcminutes', nameEs: 'Minutos de Arco', symbol: '′', factor: 1 / 60 },
      { id: 'arcsec', name: 'Arcseconds', nameEs: 'Segundos de Arco', symbol: '″', factor: 1 / 3600 }
    ],
    presets: [
      { label: '180 Degrees to Radians', labelEs: '180 Grados a Radianes', val: 180, from: 'deg', to: 'rad' },
      { label: '360 Degrees to Gradians', labelEs: '360 Grados a Gradianes', val: 360, from: 'deg', to: 'grad' },
      { label: '90 Degrees to Arcminutes', labelEs: '90 Grados a Minutos', val: 90, from: 'deg', to: 'arcmin' }
    ]
  },
  fuel: {
    name: 'Fuel Economy',
    nameEs: 'Consumo de Combustible',
    iconName: 'Gauge',
    units: [
      { id: 'kml', name: 'Kilometers per Liter', nameEs: 'Kilómetros por Litro', symbol: 'km/L', factor: 1 },
      { id: 'l100km', name: 'Liters per 100km', nameEs: 'Litros cada 100km', symbol: 'L/100km', factor: 1 },
      { id: 'mpg_us', name: 'Miles per Gallon (US)', nameEs: 'Millas por Galón (EE.UU.)', symbol: 'MPG (US)', factor: 0.425144 },
      { id: 'mpg_imp', name: 'Miles per Gallon (Imp)', nameEs: 'Millas por Galón (Imp.)', symbol: 'MPG (Imp)', factor: 0.354006 }
    ],
    presets: [
      { label: '15 km/L to MPG (US)', labelEs: '15 km/L a MPG (EE.UU.)', val: 15, from: 'kml', to: 'mpg_us' },
      { label: '8 L/100km to km/L', labelEs: '8 L/100km a km/L', val: 8, from: 'l100km', to: 'kml' },
      { label: '30 MPG (US) to L/100km', labelEs: '30 MPG a L/100km', val: 30, from: 'mpg_us', to: 'l100km' }
    ]
  },
  torque: {
    name: 'Torque',
    nameEs: 'Torque y Par Motor',
    iconName: 'Wrench',
    units: [
      { id: 'nm', name: 'Newton-meters', nameEs: 'Newton-metros', symbol: 'N·m', factor: 1 },
      { id: 'lbft', name: 'Pound-feet', nameEs: 'Libra-pies', symbol: 'lb·ft', factor: 1.355818 },
      { id: 'lbin', name: 'Pound-inches', nameEs: 'Libra-pulgadas', symbol: 'lb·in', factor: 0.1129848 },
      { id: 'kgfm', name: 'Kilogram-force meters', nameEs: 'Kilogramo-fuerza metro', symbol: 'kgf·m', factor: 9.80665 }
    ],
    presets: [
      { label: '200 N·m to Pound-feet', labelEs: '200 N·m a Libra-pies', val: 200, from: 'nm', to: 'lbft' },
      { label: '150 lb·ft to N·m', labelEs: '150 lb·ft a N·m', val: 150, from: 'lbft', to: 'nm' }
    ]
  },
  force: {
    name: 'Force',
    nameEs: 'Fuerza',
    iconName: 'Zap',
    units: [
      { id: 'n', name: 'Newtons', nameEs: 'Newtons', symbol: 'N', factor: 1 },
      { id: 'kn', name: 'Kilonewtons', nameEs: 'Kilonewtons', symbol: 'kN', factor: 1000 },
      { id: 'lbf', name: 'Pound-force', nameEs: 'Libra-fuerza', symbol: 'lbf', factor: 4.448222 },
      { id: 'kgf', name: 'Kilogram-force', nameEs: 'Kilogramo-fuerza', symbol: 'kgf', factor: 9.80665 },
      { id: 'dyn', name: 'Dynes', nameEs: 'Dinas', symbol: 'dyn', factor: 0.00001 }
    ],
    presets: [
      { label: '100 Newtons to Pound-force', labelEs: '100 Newtons a Libra-fuerza', val: 100, from: 'n', to: 'lbf' },
      { label: '5 kN to Newtons', labelEs: '5 kN a Newtons', val: 5, from: 'kn', to: 'n' }
    ]
  },
  cooking: {
    name: 'Cooking Measurement',
    nameEs: 'Medidas de Cocina',
    iconName: 'Utensils',
    units: [
      { id: 'ml', name: 'Milliliters', nameEs: 'Mililitros', symbol: 'mL', factor: 1 },
      { id: 'cup', name: 'Cups (US)', nameEs: 'Tazas', symbol: 'cup', factor: 236.588 },
      { id: 'tbsp', name: 'Tablespoons', nameEs: 'Cucharadas', symbol: 'tbsp', factor: 14.7868 },
      { id: 'tsp', name: 'Teaspoons', nameEs: 'Cucharaditas', symbol: 'tsp', factor: 4.92892 },
      { id: 'floz', name: 'Fluid Ounces', nameEs: 'Onzas Líquidas', symbol: 'fl oz', factor: 29.5735 },
      { id: 'l', name: 'Liters', nameEs: 'Litros', symbol: 'L', factor: 1000 },
      { id: 'pt', name: 'Pints', nameEs: 'Pintas', symbol: 'pt', factor: 473.176 },
      { id: 'qt', name: 'Quarts', nameEs: 'Cuartos', symbol: 'qt', factor: 946.353 }
    ],
    presets: [
      { label: '1 Cup to Milliliters', labelEs: '1 Taza a Mililitros', val: 1, from: 'cup', to: 'ml' },
      { label: '3 Tablespoons to Teaspoons', labelEs: '3 Cucharadas a Cucharaditas', val: 3, from: 'tbsp', to: 'tsp' },
      { label: '500 mL to Cups', labelEs: '500 mL a Tazas', val: 500, from: 'ml', to: 'cup' }
    ]
  },
  typography: {
    name: 'Typography (PX, REM, EM, PT)',
    nameEs: 'Tipografía (PX, REM, EM, PT)',
    iconName: 'Type',
    units: [
      { id: 'px', name: 'Pixels', nameEs: 'Píxeles', symbol: 'px', factor: 1 },
      { id: 'rem', name: 'REM (Base 16px)', nameEs: 'REM (Base 16px)', symbol: 'rem', factor: 16 },
      { id: 'em', name: 'EM', nameEs: 'EM', symbol: 'em', factor: 16 },
      { id: 'pt', name: 'Points (1/72 in)', nameEs: 'Puntos (pt)', symbol: 'pt', factor: 1.333333 },
      { id: 'pct', name: 'Percent (%)', nameEs: 'Porcentaje (%)', symbol: '%', factor: 0.16 }
    ],
    presets: [
      { label: '16px to REM', labelEs: '16px a REM', val: 16, from: 'px', to: 'rem' },
      { label: '2 REM to Pixels', labelEs: '2 REM a Píxeles', val: 2, from: 'rem', to: 'px' },
      { label: '12pt to Pixels', labelEs: '12pt a Píxeles', val: 12, from: 'pt', to: 'px' }
    ]
  },
  dataRate: {
    name: 'Data Transfer Rate',
    nameEs: 'Tasa de Transferencia de Datos',
    iconName: 'Wifi',
    units: [
      { id: 'bps', name: 'Bits per second', nameEs: 'Bits por segundo', symbol: 'bps', factor: 1 },
      { id: 'kbps', name: 'Kilobits per second', nameEs: 'Kilobits por segundo', symbol: 'Kbps', factor: 1000 },
      { id: 'mbps', name: 'Megabits per second', nameEs: 'Megabits por segundo', symbol: 'Mbps', factor: 1000000 },
      { id: 'gbps', name: 'Gigabits per second', nameEs: 'Gigabits por segundo', symbol: 'Gbps', factor: 1000000000 },
      { id: 'kbps_b', name: 'Kilobytes per second', nameEs: 'Kilobytes por segundo', symbol: 'KB/s', factor: 8000 },
      { id: 'mbps_b', name: 'Megabytes per second', nameEs: 'Megabytes por segundo', symbol: 'MB/s', factor: 8000000 }
    ],
    presets: [
      { label: '100 Mbps to MB/s', labelEs: '100 Mbps a MB/s', val: 100, from: 'mbps', to: 'mbps_b' },
      { label: '1 Gbps to Mbps', labelEs: '1 Gbps a Mbps', val: 1, from: 'gbps', to: 'mbps' }
    ]
  },
  sound: {
    name: 'Sound Level',
    nameEs: 'Nivel de Sonido',
    iconName: 'Volume2',
    units: [
      { id: 'db', name: 'Decibels', nameEs: 'Decibelios', symbol: 'dB', factor: 1 },
      { id: 'b', name: 'Bels', nameEs: 'Beles', symbol: 'B', factor: 10 },
      { id: 'np', name: 'Nepers', nameEs: 'Nepers', symbol: 'Np', factor: 8.68589 },
      { id: 'ubar', name: 'Microbar', nameEs: 'Microbar', symbol: 'µbar', factor: 0.001 }
    ],
    presets: [
      { label: '60 dB to Bels', labelEs: '60 dB a Beles', val: 60, from: 'db', to: 'b' },
      { label: '85 dB to Nepers', labelEs: '85 dB a Nepers', val: 85, from: 'db', to: 'np' }
    ]
  },
  shoeSize: {
    name: 'Shoe Size',
    nameEs: 'Talla de Calzado',
    iconName: 'Footprints',
    units: [
      { id: 'cm', name: 'Centimeters (Foot Length)', nameEs: 'Centímetros (Longitud)', symbol: 'cm', factor: 1 },
      { id: 'us_m', name: 'US Men', nameEs: 'EE.UU. Hombre', symbol: 'US M', factor: 1 },
      { id: 'us_w', name: 'US Women', nameEs: 'EE.UU. Mujer', symbol: 'US W', factor: 1 },
      { id: 'uk', name: 'UK Size', nameEs: 'Reino Unido (UK)', symbol: 'UK', factor: 1 },
      { id: 'eu', name: 'European Size', nameEs: 'Europa (EU)', symbol: 'EU', factor: 1 }
    ],
    presets: [
      { label: 'US Men 9.5 to EU Size', labelEs: 'US 9.5 a Talla EU', val: 9.5, from: 'us_m', to: 'eu' },
      { label: '27 cm Foot to US Men', labelEs: 'Pie de 27 cm a US Hombre', val: 27, from: 'cm', to: 'us_m' },
      { label: 'EU 42 to UK Size', labelEs: 'EU 42 a UK', val: 42, from: 'eu', to: 'uk' }
    ]
  },
  clothingSize: {
    name: 'Clothing Size',
    nameEs: 'Talla de Ropa',
    iconName: 'Shirt',
    units: [
      { id: 'intl', name: 'International (XS-XXL)', nameEs: 'Internacional (XS-XXL)', symbol: 'Intl', factor: 1 },
      { id: 'us', name: 'US Size', nameEs: 'EE.UU. (US)', symbol: 'US', factor: 1 },
      { id: 'uk', name: 'UK / AU Size', nameEs: 'Reino Unido (UK)', symbol: 'UK/AU', factor: 1 },
      { id: 'eu', name: 'European Size', nameEs: 'Europa (EU)', symbol: 'EU', factor: 1 }
    ],
    presets: [
      { label: 'Medium (M) to US Size', labelEs: 'Mediano (M) a US', val: 2, from: 'intl', to: 'us' },
      { label: 'US Size 8 to EU Size', labelEs: 'US 8 a EU', val: 8, from: 'us', to: 'eu' }
    ]
  }
};

interface UnitConverterCalculatorProps {
  initialDimension?: DimensionKey;
}

export default function UnitConverterCalculator({
  initialDimension = 'length'
}: UnitConverterCalculatorProps) {
  const { language } = useTranslation();
  const [dimension, setDimension] = useState<DimensionKey>(initialDimension);
  const currentDimData = DIMENSIONS[dimension];

  const [fromUnitId, setFromUnitId] = useState<string>(() => currentDimData.units[0].id);
  const [toUnitId, setToUnitId] = useState<string>(
    () => currentDimData.units[1]?.id || currentDimData.units[0].id
  );
  const [inputText, setInputText] = useState<string>('10');
  const [copied, setCopied] = useState<boolean>(false);
  const [precision, setPrecision] = useState<'2' | '4' | '6'>('4');

  const fromInputId = useId();
  const fromSelectId = useId();
  const toSelectId = useId();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  // Sync with initialDimension prop when navigating between specialized converters
  useEffect(() => {
    if (initialDimension && DIMENSIONS[initialDimension]) {
      setDimension(initialDimension);
      const newDimData = DIMENSIONS[initialDimension];
      setFromUnitId(newDimData.units[0].id);
      setToUnitId(newDimData.units[1]?.id || newDimData.units[0].id);
    }
  }, [initialDimension]);

  // Auto-scroll active dimension tab into view when selection changes
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest',
      block: 'nearest'
    });
    const timer = setTimeout(updateScrollState, 300);
    return () => clearTimeout(timer);
  }, [dimension]);

  const dimensionKeys = useMemo(() => Object.keys(DIMENSIONS) as DimensionKey[], []);

  const handleDimensionChange = (newDim: DimensionKey) => {
    setDimension(newDim);
    const newDimData = DIMENSIONS[newDim];
    setFromUnitId(newDimData.units[0].id);
    setToUnitId(newDimData.units[1]?.id || newDimData.units[0].id);
  };

  const handleScrollTabs = (direction: 'left' | 'right') => {
    scrollerRef.current?.scrollBy({
      left: direction === 'right' ? 240 : -240,
      behavior: 'smooth'
    });
  };

  const handleSwap = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const handleReset = () => {
    const dimData = DIMENSIONS[dimension];
    setInputText('10');
    setFromUnitId(dimData.units[0].id);
    setToUnitId(dimData.units[1]?.id || dimData.units[0].id);
    setPrecision('4');
  };

  const handleClear = () => {
    setInputText('');
  };

  // Exact conversion math preserved identically
  const convertValue = (val: number, fromId: string, toId: string): number => {
    if (fromId === toId) return val;

    if (dimension === 'temperature') {
      let c = val;
      if (fromId === 'f') c = (val - 32) * (5 / 9);
      else if (fromId === 'k') c = val - 273.15;

      if (toId === 'c') return c;
      if (toId === 'f') return (c * 9) / 5 + 32;
      if (toId === 'k') return c + 273.15;
      return c;
    }

    if (dimension === 'fuel') {
      let kml = val;
      if (fromId === 'l100km') kml = val === 0 ? 0 : 100 / val;
      else if (fromId === 'mpg_us') kml = val * 0.425144;
      else if (fromId === 'mpg_imp') kml = val * 0.354006;

      if (toId === 'kml') return kml;
      if (toId === 'l100km') return kml === 0 ? 0 : 100 / kml;
      if (toId === 'mpg_us') return kml / 0.425144;
      if (toId === 'mpg_imp') return kml / 0.354006;
      return kml;
    }

    if (dimension === 'shoeSize') {
      let cm = val;
      if (fromId === 'us_m') cm = (val + 7.5) / 0.75;
      else if (fromId === 'us_w') cm = (val + 6.5) / 0.75;
      else if (fromId === 'uk') cm = (val + 8.5) / 0.75;
      else if (fromId === 'eu') cm = (val - 2) / 1.5;

      if (toId === 'cm') return cm;
      if (toId === 'us_m') return cm * 0.75 - 7.5;
      if (toId === 'us_w') return cm * 0.75 - 6.5;
      if (toId === 'uk') return cm * 0.75 - 8.5;
      if (toId === 'eu') return cm * 1.5 + 2;
      return cm;
    }

    if (dimension === 'clothingSize') {
      const mapVal = (id: string, v: number): number => {
        if (id === 'intl') return Math.max(0, Math.min(5, Math.round(v)));
        if (id === 'us') return Math.max(0, Math.min(5, Math.round((v - 2) / 2)));
        if (id === 'uk') return Math.max(0, Math.min(5, Math.round((v - 4) / 2)));
        if (id === 'eu') return Math.max(0, Math.min(5, Math.round((v - 32) / 2)));
        return 2;
      };
      const idx = mapVal(fromId, val);
      if (toId === 'intl') return idx;
      if (toId === 'us') return idx * 2 + 2;
      if (toId === 'uk') return idx * 2 + 4;
      if (toId === 'eu') return idx * 2 + 32;
      return idx;
    }

    const fromUnit = currentDimData.units.find((u) => u.id === fromId);
    const toUnit = currentDimData.units.find((u) => u.id === toId);
    if (!fromUnit || !toUnit) return val;

    const baseVal = val * fromUnit.factor;
    return baseVal / toUnit.factor;
  };

  const isEmpty = inputText.trim() === '';
  const parsedInput = Number(inputText);
  const isInvalid = !isEmpty && !Number.isFinite(parsedInput);
  const numericPrecision = Number(precision);

  const convertedResult = useMemo(() => {
    if (isEmpty || isInvalid) return 0;
    return convertValue(parsedInput, fromUnitId, toUnitId);
  }, [parsedInput, isEmpty, isInvalid, fromUnitId, toUnitId, dimension]);

  const fromUnitObj =
    currentDimData.units.find((u) => u.id === fromUnitId) || currentDimData.units[0];
  const toUnitObj =
    currentDimData.units.find((u) => u.id === toUnitId) ||
    currentDimData.units[1] ||
    currentDimData.units[0];

  const allConversions = useMemo(() => {
    if (isEmpty || isInvalid) return [];
    return currentDimData.units.map((unit) => ({
      unit,
      value: convertValue(parsedInput, fromUnitId, unit.id)
    }));
  }, [parsedInput, isEmpty, isInvalid, fromUnitId, dimension]);

  const formattedResult =
    !isEmpty && !isInvalid
      ? convertedResult.toLocaleString(undefined, { maximumFractionDigits: numericPrecision })
      : '—';

  const handleCopy = () => {
    if (isEmpty || isInvalid) return;
    const text = `${parsedInput} ${fromUnitObj.symbol} = ${formattedResult} ${toUnitObj.symbol}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-5">
      {/* 1. Static Accessible Dimension Tabs */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleScrollTabs('left')}
          disabled={!canScrollLeft}
          aria-label={language === 'es' ? 'Desplazar dimensiones a la izquierda' : 'Scroll dimensions left'}
          className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-border-subtle bg-surface text-text-secondary transition-all duration-200 shrink-0 cursor-pointer ${
            canScrollLeft
              ? 'hover:text-text-primary hover:bg-surface-hover hover:border-border-main hover:scale-105 active:scale-95'
              : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4 transition-transform duration-200 hover:-translate-x-0.5" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          role="tablist"
          aria-label={language === 'es' ? 'Dimensiones de conversión' : 'Measurement dimensions'}
          className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto touch-pan-x py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {dimensionKeys.map((dimKey) => {
            const data = DIMENSIONS[dimKey];
            const isActive = dimension === dimKey;
            return (
              <button
                key={dimKey}
                ref={isActive ? activeTabRef : null}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleDimensionChange(dimKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer border whitespace-nowrap ${
                  isActive
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface text-text-secondary border-border-subtle hover:text-text-primary hover:border-border-main hover:bg-surface-hover'
                }`}
              >
                {language === 'es' ? data.nameEs : data.name}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleScrollTabs('right')}
          disabled={!canScrollRight}
          aria-label={language === 'es' ? 'Desplazar dimensiones a la derecha' : 'Scroll dimensions right'}
          className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-border-subtle bg-surface text-text-secondary transition-all duration-200 shrink-0 cursor-pointer ${
            canScrollRight
              ? 'hover:text-text-primary hover:bg-surface-hover hover:border-border-main hover:scale-105 active:scale-95'
              : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-4 h-4 transition-transform duration-200 hover:translate-x-0.5" />
        </button>
      </div>

      {/* 2. Primary Converter Workspace */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-subtle">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary tracking-tight">
              {language === 'es' ? currentDimData.nameEs : currentDimData.name}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {language === 'es'
                ? 'Convierte al instante entre unidades de la misma dimensión.'
                : 'Convert instantly between units in the same measurement family.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Limpiar' : 'Clear'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Restablecer' : 'Reset'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-end">
          {/* From */}
          <div className="md:col-span-5 space-y-2">
            <label htmlFor={fromInputId} className="ui-label block">
              {language === 'es' ? 'Desde' : 'From'}
            </label>
            <input
              id={fromInputId}
              type="number"
              step="any"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="0"
              className="ui-input text-xl font-bold font-mono tabular-nums py-3"
            />
            <select
              id={fromSelectId}
              aria-label={language === 'es' ? 'Unidad de origen' : 'Source unit'}
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="ui-select"
            >
              {currentDimData.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {language === 'es' ? u.nameEs : u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Control */}
          <div className="md:col-span-1 flex justify-center md:pb-1">
            <button
              type="button"
              onClick={handleSwap}
              aria-label={language === 'es' ? 'Intercambiar unidades' : 'Swap units'}
              title={language === 'es' ? 'Intercambiar unidades' : 'Swap units'}
              className="w-10 h-10 rounded-xl border border-border-main bg-surface-secondary hover:bg-accent-light hover:border-accent/50 text-accent flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To */}
          <div className="md:col-span-5 space-y-2">
            <label htmlFor={toSelectId} className="ui-label block">
              {language === 'es' ? 'Resultado convertido' : 'To'}
            </label>
            <div
              aria-live="polite"
              className="w-full px-3.5 py-3 rounded-[10px] border border-result-border bg-result-bg text-xl font-bold font-mono tabular-nums text-result-text flex items-center justify-between gap-2 min-h-[50px]"
            >
              <span className="truncate">{formattedResult}</span>
              <span className="text-xs font-semibold text-result-icon shrink-0">
                {toUnitObj.symbol}
              </span>
            </div>
            <select
              id={toSelectId}
              aria-label={language === 'es' ? 'Unidad de destino' : 'Target unit'}
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="ui-select"
            >
              {currentDimData.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {language === 'es' ? u.nameEs : u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {isInvalid && (
          <div role="alert" className="ui-error-state flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {language === 'es'
                ? 'Ingrese un número válido para convertir.'
                : 'Enter a valid numeric value to convert.'}
            </span>
          </div>
        )}

        {/* Toolbar: Precision + Copy Result */}
        <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-secondary">
              {language === 'es' ? 'Precisión:' : 'Precision:'}
            </span>
            <ToolSegmentedControl
              ariaLabel="Decimal precision"
              value={precision}
              onChange={setPrecision}
              options={[
                { value: '2', label: '2 dec' },
                { value: '4', label: '4 dec' },
                { value: '6', label: '6 dec' }
              ]}
            />
          </div>

          <button
            type="button"
            disabled={isEmpty || isInvalid}
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-result-icon hover:bg-result-bg border border-border-subtle transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>
              {copied
                ? language === 'es'
                  ? 'Copiado'
                  : 'Copied'
                : language === 'es'
                  ? 'Copiar resultado'
                  : 'Copy result'}
            </span>
          </button>
        </div>

        {/* Presets */}
        {currentDimData.presets.length > 0 && (
          <ToolPresetBar
            label={language === 'es' ? 'Ejemplos:' : 'Quick presets:'}
            presets={currentDimData.presets.map((preset) => ({
              label: language === 'es' ? preset.labelEs : preset.label,
              onSelect: () => {
                setInputText(String(preset.val));
                setFromUnitId(preset.from);
                setToUnitId(preset.to);
              }
            }))}
          />
        )}
      </section>

      {/* 3. Complete Multi-Unit Comparison Matrix */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              {language === 'es'
                ? `Equivalencias para ${isEmpty ? '—' : `${parsedInput} ${fromUnitObj.symbol}`}`
                : `All Equivalents for ${isEmpty ? '—' : `${parsedInput} ${fromUnitObj.symbol}`}`}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {language === 'es'
                ? 'Haz clic en cualquier unidad para seleccionarla como destino.'
                : 'Click any unit row to select it as your target unit.'}
            </p>
          </div>
          <span className="text-xs font-mono text-text-tertiary">
            {currentDimData.units.length} {language === 'es' ? 'unidades' : 'units'}
          </span>
        </div>

        {isEmpty || isInvalid ? (
          <div className="ui-empty-state">
            <p className="text-sm font-semibold text-text-primary">
              {language === 'es' ? 'Ingrese un valor arriba' : 'Enter a value above'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {language === 'es'
                ? 'Los equivalentes en todas las unidades aparecerán aquí.'
                : 'Equivalent values across every unit in this dimension will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {allConversions.map(({ unit, value }) => {
              const isTarget = unit.id === toUnitId;
              const isSource = unit.id === fromUnitId;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setToUnitId(unit.id)}
                  className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    isTarget
                      ? 'border-result-border bg-result-bg'
                      : isSource
                        ? 'border-border-main bg-surface-secondary/70'
                        : 'border-border-subtle bg-surface hover:border-accent/50 hover:bg-surface-hover'
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      className={`text-xs truncate ${
                        isTarget ? 'text-result-text-secondary' : 'text-text-secondary'
                      }`}
                    >
                      {language === 'es' ? unit.nameEs : unit.name}
                    </div>
                    <div
                      className={`text-sm font-bold font-mono tabular-nums truncate mt-0.5 ${
                        isTarget ? 'text-result-text' : 'text-text-primary'
                      }`}
                    >
                      {value.toLocaleString(undefined, { maximumFractionDigits: numericPrecision })}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold font-mono shrink-0 ${
                      isTarget ? 'text-result-icon' : 'text-text-tertiary'
                    }`}
                  >
                    {unit.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
