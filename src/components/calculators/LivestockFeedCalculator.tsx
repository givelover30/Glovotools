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

interface FeedProfile {
  id: string;
  name: string;
  nameEs: string;
  dmiPercent: number; // Dry matter intake as % of body weight
  source: string;
}

const FEED_PROFILES: FeedProfile[] = [
  {
    id: 'beef-maintenance',
    name: 'Beef Cattle (Maintenance)',
    nameEs: 'Ganado de carne (Mantenimiento)',
    dmiPercent: 2.0,
    source: 'USDA / NASEM Guidelines'
  },
  {
    id: 'beef-growing',
    name: 'Beef Cattle (Growing / Finishing)',
    nameEs: 'Ganado de carne (Crecimiento / Engorde)',
    dmiPercent: 2.5,
    source: 'USDA / NASEM Guidelines'
  },
  {
    id: 'dairy-lactating',
    name: 'Dairy Cattle (Lactating)',
    nameEs: 'Ganado lechero (En lactancia)',
    dmiPercent: 3.5,
    source: 'Dairy Extension Standards'
  },
  {
    id: 'sheep-adult',
    name: 'Sheep / Ewe (Maintenance/Gestating)',
    nameEs: 'Oveja (Mantenimiento / Gestación)',
    dmiPercent: 2.5,
    source: 'Merck Veterinary Manual'
  },
  {
    id: 'goat-dairy',
    name: 'Dairy Goat (Lactating)',
    nameEs: 'Cabra lechera (En lactancia)',
    dmiPercent: 3.8,
    source: 'Caprine Extension Standard'
  },
  {
    id: 'pig-finisher',
    name: 'Swine (Finisher Pig)',
    nameEs: 'Porcino (Cerdo en terminación)',
    dmiPercent: 4.0,
    source: 'Swine Production Manual'
  }
];

const DEFAULTS = {
  profileId: 'beef-growing',
  animalWeight: '1000',
  weightUnit: 'lbs' as 'lbs' | 'kg',
  animalCount: '10',
  dryMatterPercent: '88'
};

export default function LivestockFeedCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [profileId, setProfileId] = useState<string>(DEFAULTS.profileId);
  const [animalWeightStr, setAnimalWeightStr] = useState<string>(DEFAULTS.animalWeight);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(DEFAULTS.weightUnit);
  const [animalCountStr, setAnimalCountStr] = useState<string>(DEFAULTS.animalCount);
  const [dryMatterStr, setDryMatterStr] = useState<string>(DEFAULTS.dryMatterPercent);

  const profileSelectId = useId();
  const weightId = useId();
  const unitId = useId();
  const countId = useId();
  const dmId = useId();

  const handleReset = () => {
    setProfileId(DEFAULTS.profileId);
    setAnimalWeightStr(DEFAULTS.animalWeight);
    setWeightUnit(DEFAULTS.weightUnit);
    setAnimalCountStr(DEFAULTS.animalCount);
    setDryMatterStr(DEFAULTS.dryMatterPercent);
  };

  const handleClear = () => {
    setAnimalWeightStr('');
    setAnimalCountStr('');
    setDryMatterStr('');
  };

  const profile = FEED_PROFILES.find((p) => p.id === profileId) || FEED_PROFILES[0];
  const profileName = isEs ? profile.nameEs : profile.name;

  const isEmpty =
    animalWeightStr.trim() === '' ||
    animalCountStr.trim() === '' ||
    dryMatterStr.trim() === '';

  const animalWeight = Number(animalWeightStr);
  const animalCount = Number(animalCountStr);
  const dryMatterPercent = Number(dryMatterStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(animalWeight) || animalWeight <= 0) {
      errors.animalWeight = isEs
        ? 'El peso promedio debe ser mayor que 0.'
        : 'Average animal weight must be greater than 0.';
    }
    if (!Number.isFinite(animalCount) || animalCount < 1) {
      errors.animalCount = isEs
        ? 'La cantidad de animales debe ser al menos 1.'
        : 'Animal count in herd must be at least 1.';
    }
    if (!Number.isFinite(dryMatterPercent) || dryMatterPercent < 10 || dryMatterPercent > 100) {
      errors.dryMatterPercent = isEs
        ? 'La materia seca del alimento debe estar entre 10% y 100%.'
        : 'Feed dry matter percentage must be between 10% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let asFedPerAnimal = 0;
  let totalHerdDailyAsFed = 0;
  let totalHerdMonthlyAsFed = 0;
  let totalHerdDailyDmi = 0;

  if (!isEmpty && !hasErrors) {
    const weightInLbs = weightUnit === 'kg' ? animalWeight * 2.20462 : animalWeight;
    const dmiPerAnimalLbs = weightInLbs * (profile.dmiPercent / 100);
    const asFedPerAnimalLbs = dmiPerAnimalLbs / (dryMatterPercent / 100);

    const totalHerdDailyDmiLbs = dmiPerAnimalLbs * animalCount;
    const totalHerdDailyAsFedLbs = asFedPerAnimalLbs * animalCount;
    const totalHerdMonthlyAsFedLbs = totalHerdDailyAsFedLbs * 30.44;

    const toDisplay = (lbs: number) =>
      weightUnit === 'kg' ? Math.round(lbs / 2.20462) : Math.round(lbs);

    asFedPerAnimal = toDisplay(asFedPerAnimalLbs);
    totalHerdDailyAsFed = toDisplay(totalHerdDailyAsFedLbs);
    totalHerdMonthlyAsFed = toDisplay(totalHerdMonthlyAsFedLbs);
    totalHerdDailyDmi = toDisplay(totalHerdDailyDmiLbs);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const dayUnit = isEs ? 'día' : 'day';
  const monthUnit = isEs ? 'mes' : 'month';

  const copyText = isEs
    ? `Alimento para ganado (${profileName}) — Total diario del hato (tal cual): ${totalHerdDailyAsFed} ${weightUnit}/${dayUnit} | Por animal: ${asFedPerAnimal} ${weightUnit}/${dayUnit} | Mensual del hato: ${totalHerdMonthlyAsFed} ${weightUnit}/${monthUnit} | Materia seca diaria: ${totalHerdDailyDmi} ${weightUnit} MS`
    : `Livestock Feed (${profileName}) — Total Herd Daily (As-Fed): ${totalHerdDailyAsFed} ${weightUnit}/${dayUnit} | Per Animal Daily: ${asFedPerAnimal} ${weightUnit}/${dayUnit} | Total Herd Monthly: ${totalHerdMonthlyAsFed} ${weightUnit}/${monthUnit} | Herd Daily DMI: ${totalHerdDailyDmi} ${weightUnit} DM`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Perfil productivo y ración' : 'Livestock Profile & Ration Parameters'}
          subtitle={
            isEs
              ? 'Estima el consumo de materia seca (CMS) y las cantidades de alimento tal cual para tu hato.'
              : 'Estimate dry matter intake (DMI) and as-fed feed quantities for livestock.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <ToolFieldGroup
            label={isEs ? 'Perfil productivo del ganado' : 'Livestock Production Profile'}
            htmlFor={profileSelectId}
          >
            <select
              id={profileSelectId}
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="ui-input"
            >
              {FEED_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {isEs ? p.nameEs : p.name} ({p.dmiPercent}% {isEs ? 'MS' : 'DMI'})
                </option>
              ))}
            </select>
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Peso promedio por animal' : 'Average Animal Weight'}
              htmlFor={weightId}
              unit={weightUnit}
              error={errors.animalWeight}
            >
              <input
                id={weightId}
                type="number"
                min="50"
                max="3000"
                step="any"
                value={animalWeightStr}
                onChange={(e) => setAnimalWeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Sistema de unidades' : 'Unit System'}
              htmlFor={unitId}
            >
              <select
                id={unitId}
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as 'lbs' | 'kg')}
                className="ui-input"
              >
                <option value="lbs">{isEs ? 'Libras (lbs)' : 'Pounds (lbs)'}</option>
                <option value="kg">{isEs ? 'Kilogramos (kg)' : 'Kilograms (kg)'}</option>
              </select>
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Cantidad de animales en el hato' : 'Animal Count in Herd'}
              htmlFor={countId}
              unit={isEs ? 'cab.' : 'head'}
              error={errors.animalCount}
            >
              <input
                id={countId}
                type="number"
                min="1"
                max="5000"
                step="1"
                value={animalCountStr}
                onChange={(e) => setAnimalCountStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="10"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Materia seca del alimento' : 'Feed Dry Matter'}
              htmlFor={dmId}
              unit="%"
              error={errors.dryMatterPercent}
            >
              <input
                id={dmId}
                type="number"
                min="10"
                max="100"
                step="any"
                value={dryMatterStr}
                onChange={(e) => setDryMatterStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="88"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">
              {isEs ? 'Estándar de referencia:' : 'Reference Standard:'}
            </strong>{' '}
            {profile.source} —{' '}
            {isEs
              ? 'Estima el consumo de materia seca (CMS) y cantidades de alimento tal cual.'
              : 'Estimates dry matter intake (DMI) and as-fed feed quantities.'}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Requerimientos de alimento' : 'Feed Requirement Results'}
          state={resultState}
          primaryLabel={
            isEs ? 'Total diario del hato (Tal cual)' : 'Total Herd Daily (As-Fed)'
          }
          primaryValue={`${totalHerdDailyAsFed}`}
          primaryUnit={`${weightUnit} / ${dayUnit}`}
          primarySubtext={
            isEs
              ? `${profileName} · ${profile.dmiPercent}% MS · ${animalCount} animales`
              : `${profileName} · ${profile.dmiPercent}% DMI · ${animalCount} head`
          }
          statusLabel={`${profile.dmiPercent}% ${isEs ? 'MS' : 'DMI'}`}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa los datos del hato' : 'Enter herd feed parameters'}
          emptyDescription={
            isEs
              ? 'Indica peso promedio, número de animales y porcentaje de materia seca para calcular el alimento requerido.'
              : 'Provide average animal weight, herd count, and feed dry matter percentage to calculate feed needs.'
          }
          errorTitle={isEs ? 'Parámetros no válidos' : 'Invalid feed inputs'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs
              ? 'Verifica peso, cantidad de animales y porcentaje de materia seca.'
              : 'Check animal weight, herd count, and dry matter percentage.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={isEs ? 'Diario por animal (Tal cual)' : 'Per Animal Daily (As-Fed)'}
              value={`${asFedPerAnimal} ${weightUnit} / ${dayUnit}`}
            />
            <ToolMetricTile
              label={isEs ? 'Mensual del hato (Tal cual)' : 'Total Herd Monthly (As-Fed)'}
              value={`${totalHerdMonthlyAsFed} ${weightUnit} / ${monthUnit}`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Diario por animal (Tal cual)' : 'Per Animal Daily (As-Fed)',
                value: `${asFedPerAnimal} ${weightUnit} / ${dayUnit}`
              },
              {
                label: isEs ? 'Total diario del hato (Tal cual)' : 'Total Herd Daily (As-Fed)',
                value: `${totalHerdDailyAsFed} ${weightUnit} / ${dayUnit}`,
                highlight: true
              },
              {
                label: isEs ? 'Total mensual del hato (30.44 d)' : 'Total Herd Monthly (As-Fed)',
                value: `${totalHerdMonthlyAsFed} ${weightUnit} / ${monthUnit}`
              },
              {
                label: isEs ? 'Materia seca diaria del hato' : 'Total Herd Daily Dry Matter (DMI)',
                value: `${totalHerdDailyDmi} ${weightUnit} ${isEs ? 'MS' : 'DM'}`
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
