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

interface BreedingSpecies {
  id: string;
  name: string;
  nameEs: string;
  cycleDays: number;
  estrusDurationHours: string;
  estrusDurationHoursEs: string;
  source: string;
}

const BREEDING_SPECIES: BreedingSpecies[] = [
  {
    id: 'cattle',
    name: 'Cattle (Bovine)',
    nameEs: 'Ganado bovino (Vaca)',
    cycleDays: 21,
    estrusDurationHours: '12 - 18 hours',
    estrusDurationHoursEs: '12 - 18 horas',
    source: 'Merck Veterinary Manual'
  },
  {
    id: 'goat',
    name: 'Goat (Caprine)',
    nameEs: 'Cabra (Caprino)',
    cycleDays: 21,
    estrusDurationHours: '24 - 36 hours',
    estrusDurationHoursEs: '24 - 36 horas',
    source: 'Caprine Extension Standard'
  },
  {
    id: 'sheep',
    name: 'Sheep (Ovine)',
    nameEs: 'Oveja (Ovino)',
    cycleDays: 17,
    estrusDurationHours: '24 - 36 hours',
    estrusDurationHoursEs: '24 - 36 horas',
    source: 'Ovine Reproduction Guide'
  },
  {
    id: 'pig',
    name: 'Swine (Porcine)',
    nameEs: 'Cerdo (Porcino)',
    cycleDays: 21,
    estrusDurationHours: '48 - 72 hours',
    estrusDurationHoursEs: '48 - 72 horas',
    source: 'Swine Production Manual'
  },
  {
    id: 'horse',
    name: 'Horse (Equine)',
    nameEs: 'Caballo (Equino)',
    cycleDays: 21,
    estrusDurationHours: '5 - 7 days',
    estrusDurationHoursEs: '5 - 7 días',
    source: 'Equine Veterinary Association'
  },
  {
    id: 'dog',
    name: 'Dog (Canine)',
    nameEs: 'Perro (Canino)',
    cycleDays: 180,
    estrusDurationHours: '9 - 14 days (Estrogen phase)',
    estrusDurationHoursEs: '9 - 14 días (Fase estrogénica)',
    source: 'Canine Reproductive Manual'
  }
];

function getTodayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AnimalBreedingIntervalCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [speciesId, setSpeciesId] = useState<string>('cattle');
  const [lastHeatDate, setLastHeatDate] = useState<string>(() => getTodayIso());

  const speciesSelectId = useId();
  const heatDateId = useId();

  const handleReset = () => {
    setSpeciesId('cattle');
    setLastHeatDate(getTodayIso());
  };

  const handleClear = () => {
    setLastHeatDate('');
  };

  const species = BREEDING_SPECIES.find((s) => s.id === speciesId) || BREEDING_SPECIES[0];
  const speciesName = isEs ? species.nameEs : species.name;
  const estrusDuration = isEs ? species.estrusDurationHoursEs : species.estrusDurationHours;

  const isEmpty = lastHeatDate.trim() === '';
  const heatObj = new Date(lastHeatDate);
  const errors: Record<string, string> = {};

  if (!isEmpty && Number.isNaN(heatObj.getTime())) {
    errors.lastHeatDate = isEs
      ? 'Ingresa una fecha válida de último celo o monta.'
      : 'Please enter a valid last observed heat / breeding date.';
  }
  const hasErrors = Object.keys(errors).length > 0;

  let nextHeatFormatted = '';
  if (!isEmpty && !hasErrors) {
    const nextHeatObj = new Date(heatObj);
    nextHeatObj.setDate(heatObj.getDate() + species.cycleDays);
    nextHeatFormatted = nextHeatObj.toLocaleDateString(isEs ? 'es-ES' : undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const copyText = isEs
    ? `Intervalo reproductivo (${speciesName}) — Próximo celo estimado: ${nextHeatFormatted} | Duración del ciclo: ${species.cycleDays} días | Celo receptivo: ${estrusDuration}`
    : `Animal Breeding Interval (${speciesName}) — Next Expected Heat: ${nextHeatFormatted} | Cycle Duration: ${species.cycleDays} days | Standing Heat: ${estrusDuration}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Parámetros del ciclo estral' : 'Estrous Cycle Parameters'}
          subtitle={
            isEs
              ? 'Calcula la próxima fecha esperada de celo y la ventana óptima de reproducción.'
              : 'Calculate next estrous cycle heat dates and optimal re-breeding windows.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <ToolFieldGroup
            label={isEs ? 'Seleccionar especie' : 'Select Species'}
            htmlFor={speciesSelectId}
          >
            <select
              id={speciesSelectId}
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              className="ui-input"
            >
              {BREEDING_SPECIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {isEs ? s.nameEs : s.name} (
                  {isEs ? `Ciclo de ${s.cycleDays} días` : `${s.cycleDays} Day Cycle`})
                </option>
              ))}
            </select>
          </ToolFieldGroup>

          <ToolFieldGroup
            label={
              isEs
                ? 'Fecha del último celo observado / monta'
                : 'Date of Last Observed Heat / Breeding'
            }
            htmlFor={heatDateId}
            error={errors.lastHeatDate}
          >
            <input
              id={heatDateId}
              type="date"
              value={lastHeatDate}
              onChange={(e) => setLastHeatDate(e.target.value)}
              className="ui-input font-mono tabular-nums"
            />
          </ToolFieldGroup>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary space-y-1">
            <p className="font-semibold text-text-primary">
              {isEs ? 'Referencia del ciclo estral' : 'Estrous Cycle Reference'}
            </p>
            <p>
              {species.source}.{' '}
              {isEs
                ? `Duración promedio del ciclo: ${species.cycleDays} días. Duración del celo receptivo: ${estrusDuration}.`
                : `Average cycle length: ${species.cycleDays} days. Standing heat duration: ${estrusDuration}.`}
            </p>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Calendario reproductivo' : 'Reproductive Schedule'}
          state={resultState}
          primaryLabel={
            isEs
              ? 'Próximo celo esperado / ventana estral'
              : 'Next Expected Heat / Estrous Window'
          }
          primaryValue={nextHeatFormatted}
          primarySubtext={
            isEs
              ? `Ciclo de ${species.cycleDays} días para ${speciesName}`
              : `${species.cycleDays}-day estrous cycle for ${speciesName}`
          }
          statusLabel={`${species.cycleDays} ${isEs ? 'días' : 'Days'}`}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa la fecha del último celo' : 'Enter last observed heat date'}
          emptyDescription={
            isEs
              ? 'Selecciona la fecha del último celo o monta para calcular el próximo ciclo reproductivo.'
              : 'Select the date of the last observed heat or breeding to project the next estrous window.'
          }
          errorTitle={isEs ? 'Fecha no válida' : 'Invalid breeding date'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs
              ? 'Verifica la fecha del último celo observado.'
              : 'Check the last observed heat / breeding date.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={isEs ? 'Duración del intervalo' : 'Cycle Interval Duration'}
              value={`${species.cycleDays} ${isEs ? 'días' : 'Days'}`}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Celo receptivo óptimo' : 'Standing Heat Duration'}
              value={estrusDuration}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Especie' : 'Species',
                value: speciesName
              },
              {
                label: isEs ? 'Último celo / monta' : 'Last Observed Heat',
                value: lastHeatDate
              },
              {
                label: isEs ? 'Próximo celo esperado' : 'Next Expected Heat',
                value: nextHeatFormatted,
                highlight: true
              },
              {
                label: isEs ? 'Fuente de referencia' : 'Reference Source',
                value: species.source
              }
            ]}
          />

          <p className="text-xs text-text-tertiary border-t border-border-subtle pt-3">
            {isEs
              ? 'Las estimaciones ofrecen orientación general de manejo y no garantizan resultados de fertilidad.'
              : 'Predictions provide general management guidance and do not guarantee fertility outcomes.'}
          </p>
        </ToolResultsPanel>
      }
    />
  );
}
