import { useId, useState } from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

interface PoultrySpecies {
  id: string;
  name: string;
  nameEs: string;
  incubationDays: number;
  lockdownDay: number;
  candlingDays: number[];
  source: string;
}

const POULTRY_DB: PoultrySpecies[] = [
  {
    id: 'chicken',
    name: 'Chicken',
    nameEs: 'Gallina',
    incubationDays: 21,
    lockdownDay: 18,
    candlingDays: [7, 14],
    source: 'Poultry Science Association'
  },
  {
    id: 'duck',
    name: 'Duck (Standard)',
    nameEs: 'Pato (Estándar)',
    incubationDays: 28,
    lockdownDay: 25,
    candlingDays: [7, 14, 21],
    source: 'Waterfowl Incubation Guide'
  },
  {
    id: 'muscovy',
    name: 'Muscovy Duck',
    nameEs: 'Pato criollo (Muscovy)',
    incubationDays: 35,
    lockdownDay: 31,
    candlingDays: [10, 21],
    source: 'Avian Science Reference'
  },
  {
    id: 'goose',
    name: 'Goose',
    nameEs: 'Ganso',
    incubationDays: 30,
    lockdownDay: 27,
    candlingDays: [10, 20],
    source: 'Waterfowl Breeding Standards'
  },
  {
    id: 'turkey',
    name: 'Turkey',
    nameEs: 'Pavo',
    incubationDays: 28,
    lockdownDay: 25,
    candlingDays: [7, 14, 21],
    source: 'Avian Management Guide'
  },
  {
    id: 'quail',
    name: 'Quail (Coturnix)',
    nameEs: 'Codorniz (Coturnix)',
    incubationDays: 17,
    lockdownDay: 14,
    candlingDays: [6, 12],
    source: 'Gamebird Production Manual'
  }
];

function getTodayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export default function EggIncubationCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [speciesId, setSpeciesId] = useState<string>('chicken');
  const [settingDate, setSettingDate] = useState<string>(() => getTodayIso());

  const speciesSelectId = useId();
  const settingDateId = useId();

  const handleReset = () => {
    setSpeciesId('chicken');
    setSettingDate(getTodayIso());
  };

  const handleClear = () => {
    setSettingDate('');
  };

  const species = POULTRY_DB.find((p) => p.id === speciesId) || POULTRY_DB[0];
  const speciesName = isEs ? species.nameEs : species.name;

  const isEmpty = settingDate.trim() === '';
  const setDateObj = new Date(settingDate);
  const errors: Record<string, string> = {};

  if (!isEmpty && Number.isNaN(setDateObj.getTime())) {
    errors.settingDate = isEs
      ? 'Ingresa una fecha válida de inicio de incubación.'
      : 'Please enter a valid egg setting date.';
  }
  const hasErrors = Object.keys(errors).length > 0;

  let hatchDateFormatted = '';
  let lockdownDateFormatted = '';
  let candlingSummary = '';

  if (!isEmpty && !hasErrors) {
    const locale = isEs ? 'es-ES' : undefined;
    const formatDate = (date: Date) =>
      date.toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

    const hatchDateObj = new Date(setDateObj);
    hatchDateObj.setDate(setDateObj.getDate() + species.incubationDays);
    hatchDateFormatted = formatDate(hatchDateObj);

    const lockdownDateObj = new Date(setDateObj);
    lockdownDateObj.setDate(setDateObj.getDate() + species.lockdownDay);
    lockdownDateFormatted = formatDate(lockdownDateObj);

    candlingSummary = species.candlingDays
      .map((d) => {
        const cDate = new Date(setDateObj);
        cDate.setDate(setDateObj.getDate() + d);
        const shortDate = cDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
        return `${isEs ? 'Día' : 'Day'} ${d} (${shortDate})`;
      })
      .join(' • ');
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const copyText = isEs
    ? `Incubación de huevos (${speciesName}) — Eclosión estimada: ${hatchDateFormatted} | Fase final (Día ${species.lockdownDay}): ${lockdownDateFormatted} | Ovoscopia: ${candlingSummary}`
    : `Egg Incubation (${speciesName}) — Expected Hatch Date: ${hatchDateFormatted} | Lockdown (Day ${species.lockdownDay}): ${lockdownDateFormatted} | Candling: ${candlingSummary}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Especie avícola y fecha de carga' : 'Poultry Species & Setting Date'}
          subtitle={
            isEs
              ? 'Calcula fechas de eclosión, inicio de fase final (lockdown) y días recomendados de ovoscopia.'
              : 'Calculate hatch dates, lockdown schedules, and candling milestones.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <ToolFieldGroup
            label={isEs ? 'Seleccionar especie avícola' : 'Select Poultry Species'}
            htmlFor={speciesSelectId}
          >
            <select
              id={speciesSelectId}
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              className="ui-input"
            >
              {POULTRY_DB.map((p) => (
                <option key={p.id} value={p.id}>
                  {isEs ? p.nameEs : p.name} ({p.incubationDays} {isEs ? 'días' : 'Days'})
                </option>
              ))}
            </select>
          </ToolFieldGroup>

          <ToolFieldGroup
            label={isEs ? 'Fecha de inicio de incubación (Día 0)' : 'Egg Setting Date (Day 0)'}
            htmlFor={settingDateId}
            error={errors.settingDate}
          >
            <input
              id={settingDateId}
              type="date"
              value={settingDate}
              onChange={(e) => setSettingDate(e.target.value)}
              className="ui-input font-mono tabular-nums"
            />
          </ToolFieldGroup>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary space-y-1">
            <p className="font-semibold text-text-primary">
              {isEs ? 'Parámetros de incubación' : 'Incubation Parameter'}
            </p>
            <p>
              {species.source} —{' '}
              {isEs
                ? `Duración estándar: ${species.incubationDays} días. La fase final (lockdown) inicia el Día ${species.lockdownDay}.`
                : `Standard incubation duration: ${species.incubationDays} days. Lockdown begins on Day ${species.lockdownDay}.`}
            </p>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Calendario de eclosión' : 'Hatching Schedule'}
          state={resultState}
          primaryLabel={isEs ? 'Fecha esperada de eclosión' : 'Expected Hatch Date'}
          primaryValue={hatchDateFormatted}
          primarySubtext={
            isEs
              ? `Duración total: ${species.incubationDays} días desde el inicio (${speciesName})`
              : `Total duration: ${species.incubationDays} days from setting (${speciesName})`
          }
          statusLabel={`${species.incubationDays} ${isEs ? 'días' : 'Days'}`}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa la fecha de incubación' : 'Enter egg setting date'}
          emptyDescription={
            isEs
              ? 'Selecciona la fecha de inicio (Día 0) para calcular eclosión, lockdown y ovoscopia.'
              : 'Select the egg setting date (Day 0) to generate hatch, lockdown, and candling dates.'
          }
          errorTitle={isEs ? 'Fecha no válida' : 'Invalid setting date'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs ? 'Verifica la fecha de inicio ingresada.' : 'Check the egg setting date.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={
                isEs
                  ? `Fecha de lockdown (Día ${species.lockdownDay})`
                  : `Lockdown Date (Day ${species.lockdownDay})`
              }
              value={lockdownDateFormatted}
              hint={
                isEs
                  ? 'Detener volteo y subir humedad'
                  : 'Stop turning eggs and increase humidity'
              }
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Días recomendados de ovoscopia' : 'Recommended Candling Days'}
              value={candlingSummary}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Especie avícola' : 'Poultry Species',
                value: speciesName
              },
              {
                label: isEs ? 'Día 0 (Inicio)' : 'Setting Date (Day 0)',
                value: settingDate
              },
              {
                label: isEs
                  ? `Lockdown (Día ${species.lockdownDay})`
                  : `Lockdown Date (Day ${species.lockdownDay})`,
                value: lockdownDateFormatted
              },
              {
                label: isEs ? 'Eclosión esperada' : 'Expected Hatch Date',
                value: hatchDateFormatted,
                highlight: true
              },
              {
                label: isEs ? 'Ovoscopia recomendada' : 'Candling Milestones',
                value: candlingSummary
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
