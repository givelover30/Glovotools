import { useEffect, useId, useState } from 'react';
import { Bookmark, Edit2, Trash2, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

type SpeciesGroup = 'farm' | 'equine' | 'companion' | 'camelid' | 'wildlife';
type GroupFilter = 'all' | SpeciesGroup;

interface AnimalSpecies {
  id: string;
  group: SpeciesGroup;
  commonName: string;
  commonNameEs: string;
  scientificName: string;
  avgDays: number;
  minDays?: number;
  maxDays?: number;
  source: string;
  terminology: {
    female: string;
    offspring: string;
    birthEvent: string;
  };
  terminologyEs: {
    female: string;
    offspring: string;
    birthEvent: string;
  };
}

interface SavedAnimalRecord {
  id: string;
  label: string;
  speciesId: string;
  speciesName: string;
  breedingDate: string;
  dueDate: string;
}

const STORAGE_KEY = 'calctools_animal_gestation_records';

const ANIMAL_SPECIES_DB: AnimalSpecies[] = [
  // Farm Livestock
  {
    id: 'cow',
    group: 'farm',
    commonName: 'Cattle / Cow',
    commonNameEs: 'Ganado / Vaca',
    scientificName: 'Bos taurus',
    avgDays: 283,
    minDays: 279,
    maxDays: 292,
    source: 'Merck Veterinary Manual / MSD',
    terminology: { female: 'Cow', offspring: 'Calf', birthEvent: 'Calving' },
    terminologyEs: { female: 'Vaca', offspring: 'Ternero', birthEvent: 'Parto bovino' }
  },
  {
    id: 'sheep',
    group: 'farm',
    commonName: 'Sheep / Ewe',
    commonNameEs: 'Oveja',
    scientificName: 'Ovis aries',
    avgDays: 150,
    minDays: 144,
    maxDays: 152,
    source: 'Merck Veterinary Manual / NMSU',
    terminology: { female: 'Ewe', offspring: 'Lamb', birthEvent: 'Lambing' },
    terminologyEs: { female: 'Oveja', offspring: 'Cordero', birthEvent: 'Parición ovina' }
  },
  {
    id: 'goat',
    group: 'farm',
    commonName: 'Goat / Doe',
    commonNameEs: 'Cabra',
    scientificName: 'Capra hircus',
    avgDays: 150,
    minDays: 145,
    maxDays: 155,
    source: 'Merck Veterinary Manual / MSD',
    terminology: { female: 'Doe', offspring: 'Kid', birthEvent: 'Kidding' },
    terminologyEs: { female: 'Cabra', offspring: 'Cabrito', birthEvent: 'Parto caprino' }
  },
  {
    id: 'pig',
    group: 'farm',
    commonName: 'Pig / Sow',
    commonNameEs: 'Cerda',
    scientificName: 'Sus scrofa domesticus',
    avgDays: 114,
    minDays: 111,
    maxDays: 116,
    source: 'Merck Veterinary Manual (3 months, 3 weeks, 3 days)',
    terminology: { female: 'Sow', offspring: 'Piglet', birthEvent: 'Farrowing' },
    terminologyEs: { female: 'Cerda', offspring: 'Lechón', birthEvent: 'Parto porcino' }
  },
  {
    id: 'water-buffalo',
    group: 'farm',
    commonName: 'Water Buffalo',
    commonNameEs: 'Búfala de agua',
    scientificName: 'Bubalus bubalis',
    avgDays: 310,
    minDays: 300,
    maxDays: 320,
    source: 'Veterinary Reproductive Reference',
    terminology: { female: 'Cow', offspring: 'Calf', birthEvent: 'Calving' },
    terminologyEs: { female: 'Búfala', offspring: 'Bucerro', birthEvent: 'Parto' }
  },

  // Equine
  {
    id: 'horse',
    group: 'equine',
    commonName: 'Horse / Mare',
    commonNameEs: 'Caballo / Yegua',
    scientificName: 'Equus caballus',
    avgDays: 340,
    minDays: 320,
    maxDays: 370,
    source: 'NMSU Extension / Merck Veterinary Manual',
    terminology: { female: 'Mare', offspring: 'Foal', birthEvent: 'Foaling' },
    terminologyEs: { female: 'Yegua', offspring: 'Potro', birthEvent: 'Parto equino' }
  },
  {
    id: 'donkey',
    group: 'equine',
    commonName: 'Donkey / Jenny',
    commonNameEs: 'Burra / Asna',
    scientificName: 'Equus asinus',
    avgDays: 365,
    minDays: 350,
    maxDays: 385,
    source: 'Merck Veterinary Manual',
    terminology: { female: 'Jenny', offspring: 'Foal / Jack', birthEvent: 'Foaling' },
    terminologyEs: { female: 'Burra', offspring: 'Pollino', birthEvent: 'Parto' }
  },

  // Companion Animals
  {
    id: 'dog',
    group: 'companion',
    commonName: 'Dog / Bitch',
    commonNameEs: 'Perra (Canino)',
    scientificName: 'Canis lupus familiaris',
    avgDays: 63,
    minDays: 58,
    maxDays: 68,
    source: 'Merck Veterinary Manual',
    terminology: { female: 'Bitch', offspring: 'Puppy', birthEvent: 'Whelping' },
    terminologyEs: { female: 'Perra', offspring: 'Cachorro', birthEvent: 'Parto canino' }
  },
  {
    id: 'cat',
    group: 'companion',
    commonName: 'Cat / Queen',
    commonNameEs: 'Gata (Felino)',
    scientificName: 'Felis catus',
    avgDays: 65,
    minDays: 58,
    maxDays: 70,
    source: 'Merck Veterinary Manual',
    terminology: { female: 'Queen', offspring: 'Kitten', birthEvent: 'Queening' },
    terminologyEs: { female: 'Gata', offspring: 'Gatito', birthEvent: 'Parto felino' }
  },
  {
    id: 'rabbit',
    group: 'companion',
    commonName: 'Rabbit / Doe',
    commonNameEs: 'Coneja',
    scientificName: 'Oryctolagus cuniculus',
    avgDays: 31,
    minDays: 29,
    maxDays: 35,
    source: 'Veterinary Care Manual',
    terminology: { female: 'Doe', offspring: 'Kit', birthEvent: 'Kindling' },
    terminologyEs: { female: 'Coneja', offspring: 'Gazapo', birthEvent: 'Parto cunícola' }
  },
  {
    id: 'ferret',
    group: 'companion',
    commonName: 'Ferret / Jill',
    commonNameEs: 'Hurón hembra',
    scientificName: 'Mustela putorius furo',
    avgDays: 42,
    minDays: 40,
    maxDays: 44,
    source: 'Veterinary Reproductive Data',
    terminology: { female: 'Jill', offspring: 'Kit', birthEvent: 'Kittening' },
    terminologyEs: { female: 'Hembra', offspring: 'Cría', birthEvent: 'Parto' }
  },
  {
    id: 'guinea-pig',
    group: 'companion',
    commonName: 'Guinea Pig / Sow',
    commonNameEs: 'Cobaya hembra',
    scientificName: 'Cavia porcellus',
    avgDays: 68,
    minDays: 59,
    maxDays: 72,
    source: 'Laboratory Animal Science',
    terminology: { female: 'Sow', offspring: 'Pup', birthEvent: 'Farrowing' },
    terminologyEs: { female: 'Hembra', offspring: 'Cría', birthEvent: 'Parto' }
  },

  // Camelids
  {
    id: 'alpaca',
    group: 'camelid',
    commonName: 'Alpaca',
    commonNameEs: 'Alpaca',
    scientificName: 'Vicugna pacos',
    avgDays: 342,
    minDays: 335,
    maxDays: 355,
    source: 'Camelid Veterinary Reference',
    terminology: { female: 'Hembra', offspring: 'Cria', birthEvent: 'Parturition' },
    terminologyEs: { female: 'Hembra', offspring: 'Cría', birthEvent: 'Parto' }
  },
  {
    id: 'llama',
    group: 'camelid',
    commonName: 'Llama',
    commonNameEs: 'Llama',
    scientificName: 'Lama glama',
    avgDays: 350,
    minDays: 340,
    maxDays: 365,
    source: 'Camelid Veterinary Reference',
    terminology: { female: 'Hembra', offspring: 'Cria', birthEvent: 'Parturition' },
    terminologyEs: { female: 'Hembra', offspring: 'Cría', birthEvent: 'Parto' }
  },

  // Wildlife / Other
  {
    id: 'deer',
    group: 'wildlife',
    commonName: 'White-Tailed Deer',
    commonNameEs: 'Ciervo de cola blanca',
    scientificName: 'Odocoileus virginianus',
    avgDays: 200,
    minDays: 180,
    maxDays: 210,
    source: 'Wildlife Management Reference',
    terminology: { female: 'Doe', offspring: 'Fawn', birthEvent: 'Fawning' },
    terminologyEs: { female: 'Cierva', offspring: 'Cervatillo', birthEvent: 'Parto' }
  },
  {
    id: 'bison',
    group: 'wildlife',
    commonName: 'American Bison',
    commonNameEs: 'Bisonte americano',
    scientificName: 'Bison bison',
    avgDays: 285,
    minDays: 270,
    maxDays: 300,
    source: 'Wildlife Veterinary Data',
    terminology: { female: 'Cow', offspring: 'Calf', birthEvent: 'Calving' },
    terminologyEs: { female: 'Hembra', offspring: 'Cría', birthEvent: 'Parto' }
  }
];

function getTodayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AnimalGestationCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('cow');
  const [breedingDate, setBreedingDate] = useState<string>(() => getTodayIso());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>('all');

  // Local records state (exact key: calctools_animal_gestation_records)
  const [records, setRecords] = useState<SavedAnimalRecord[]>([]);
  const [animalLabel, setAnimalLabel] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState(false);

  const searchInputId = useId();
  const speciesSelectId = useId();
  const breedingDateId = useId();
  const labelInputId = useId();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecords(parsed);
        }
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const handleReset = () => {
    setSelectedSpeciesId('cow');
    setBreedingDate(getTodayIso());
    setSearchQuery('');
    setSelectedGroup('all');
    setAnimalLabel('');
    setEditId(null);
  };

  const handleClear = () => {
    setBreedingDate('');
    setSearchQuery('');
    setAnimalLabel('');
    setEditId(null);
  };

  const persistRecords = (updated: SavedAnimalRecord[]) => {
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }
  };

  const handleSaveRecord = () => {
    if (!breedingDate) return;
    const species = ANIMAL_SPECIES_DB.find((s) => s.id === selectedSpeciesId);
    if (!species) return;

    const bDate = new Date(breedingDate);
    if (Number.isNaN(bDate.getTime())) return;

    const dDate = new Date(bDate);
    dDate.setDate(bDate.getDate() + species.avgDays);
    const dueDateStr = dDate.toISOString().split('T')[0];

    if (editId) {
      const updated = records.map((r) =>
        r.id === editId
          ? {
              ...r,
              label: animalLabel || species.commonName,
              speciesId: species.id,
              speciesName: species.commonName,
              breedingDate,
              dueDate: dueDateStr
            }
          : r
      );
      persistRecords(updated);
      setEditId(null);
    } else {
      const newRec: SavedAnimalRecord = {
        id: Date.now().toString(),
        label: animalLabel || `${species.commonName} #${records.length + 1}`,
        speciesId: species.id,
        speciesName: species.commonName,
        breedingDate,
        dueDate: dueDateStr
      };
      persistRecords([newRec, ...records]);
    }

    setAnimalLabel('');
    setSaveStatus(true);
    window.setTimeout(() => setSaveStatus(false), 2000);
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    persistRecords(updated);
    if (editId === id) {
      setEditId(null);
      setAnimalLabel('');
    }
  };

  const editRecord = (rec: SavedAnimalRecord) => {
    setEditId(rec.id);
    setSelectedSpeciesId(rec.speciesId);
    setBreedingDate(rec.breedingDate);
    setAnimalLabel(rec.label);
  };

  const cancelEdit = () => {
    setEditId(null);
    setAnimalLabel('');
  };

  // Filter species (matches EN name, ES name, or scientific name)
  const filteredSpecies = ANIMAL_SPECIES_DB.filter((s) => {
    const matchesGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      s.commonName.toLowerCase().includes(q) ||
      s.commonNameEs.toLowerCase().includes(q) ||
      s.scientificName.toLowerCase().includes(q);
    return matchesGroup && matchesSearch;
  });

  const currentSpecies =
    ANIMAL_SPECIES_DB.find((s) => s.id === selectedSpeciesId) || ANIMAL_SPECIES_DB[0];
  const currentSpeciesName = isEs ? currentSpecies.commonNameEs : currentSpecies.commonName;
  const currentTerminology = isEs ? currentSpecies.terminologyEs : currentSpecies.terminology;

  const isEmpty = breedingDate.trim() === '';
  const parsedBreeding = new Date(breedingDate);
  const errors: Record<string, string> = {};
  if (!isEmpty && Number.isNaN(parsedBreeding.getTime())) {
    errors.breedingDate = isEs
      ? 'Ingresa una fecha válida de monta o inseminación.'
      : 'Please enter a valid breeding / mating date.';
  }
  const hasErrors = Object.keys(errors).length > 0;

  let avgDueDateFormatted = '';
  let deliveryWindowFormatted = 'N/A — N/A';
  let elapsedDays = 0;
  let remainingDays = currentSpecies.avgDays;
  let progressPct = 0;

  if (!isEmpty && !hasErrors) {
    // Preserve exact original calculation formulas for 100% BEFORE/AFTER parity
    const bDate = new Date(breedingDate);
    const avgDueDate = new Date(bDate);
    avgDueDate.setDate(bDate.getDate() + currentSpecies.avgDays);

    const minDueDate = currentSpecies.minDays
      ? new Date(bDate.setDate(bDate.getDate() + (currentSpecies.minDays - currentSpecies.avgDays)))
      : null;
    const bDate2 = new Date(breedingDate);
    const maxDueDate = currentSpecies.maxDays
      ? new Date(bDate2.setDate(bDate2.getDate() + (currentSpecies.maxDays - currentSpecies.avgDays)))
      : null;

    const today = new Date();
    elapsedDays = Math.floor(
      (today.getTime() - new Date(breedingDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    remainingDays = currentSpecies.avgDays - elapsedDays;
    progressPct = Math.min(100, Math.max(0, Math.round((elapsedDays / currentSpecies.avgDays) * 100)));

    avgDueDateFormatted = isEs
      ? avgDueDate.toLocaleDateString('es-ES', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : avgDueDate.toDateString();

    const locale = isEs ? 'es-ES' : undefined;
    deliveryWindowFormatted = `${minDueDate ? minDueDate.toLocaleDateString(locale) : 'N/A'} — ${
      maxDueDate ? maxDueDate.toLocaleDateString(locale) : 'N/A'
    }`;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const groupOptions: Array<{ value: GroupFilter; label: string }> = [
    { value: 'all', label: isEs ? 'Todas' : 'All' },
    { value: 'farm', label: isEs ? 'Granja' : 'Farm' },
    { value: 'equine', label: isEs ? 'Equinos' : 'Equine' },
    { value: 'companion', label: isEs ? 'Compañía' : 'Companion' },
    { value: 'camelid', label: isEs ? 'Camélidos' : 'Camelid' },
    { value: 'wildlife', label: isEs ? 'Fauna' : 'Wildlife' }
  ];

  const copyText = isEs
    ? `Gestación animal (${currentSpeciesName}) — Duración promedio: ${currentSpecies.avgDays} días (${(currentSpecies.avgDays / 7).toFixed(1)} semanas) | Fecha estimada de parto: ${avgDueDateFormatted} | Progreso: ${progressPct}%`
    : `Animal Gestation (${currentSpeciesName}) — Average Duration: ${currentSpecies.avgDays} Days (${(currentSpecies.avgDays / 7).toFixed(1)} weeks) | Estimated Due Date: ${avgDueDateFormatted} | Progress: ${progressPct}%`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Especie y fecha de monta' : 'Animal Species & Breeding Date'}
          subtitle={
            isEs
              ? 'Basado en literatura veterinaria verificada (Merck Veterinary Manual, NMSU Extension).'
              : 'Powered by verified veterinary literature (Merck Veterinary Manual, NMSU Extension).'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <div className="space-y-3">
            <ToolSegmentedControl
              options={groupOptions}
              value={selectedGroup}
              onChange={(val) => setSelectedGroup(val)}
              ariaLabel={isEs ? 'Filtrar especies por grupo' : 'Filter species by group'}
            />

            <ToolFieldGroup
              label={isEs ? 'Buscar especie animal' : 'Search Animal Species'}
              htmlFor={searchInputId}
            >
              <input
                id={searchInputId}
                type="text"
                placeholder={isEs ? 'Buscar por nombre común o científico...' : 'Search animal species...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ui-input"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Especie' : 'Species'}
              htmlFor={speciesSelectId}
            >
              <select
                id={speciesSelectId}
                value={selectedSpeciesId}
                onChange={(e) => setSelectedSpeciesId(e.target.value)}
                className="ui-input"
              >
                {filteredSpecies.length > 0 ? (
                  filteredSpecies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isEs ? s.commonNameEs : s.commonName} (
                      {isEs ? `${s.avgDays} días prom.` : `${s.avgDays} days avg`})
                    </option>
                  ))
                ) : (
                  <option value={currentSpecies.id}>
                    {currentSpeciesName} ({currentSpecies.avgDays}{' '}
                    {isEs ? 'días prom.' : 'days avg'})
                  </option>
                )}
              </select>
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary space-y-1">
            <div className="flex flex-wrap justify-between gap-2">
              <span>{isEs ? 'Nombre científico:' : 'Scientific Name:'}</span>
              <span className="font-mono italic text-text-primary">
                {currentSpecies.scientificName}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <span>{isEs ? 'Fuente de referencia:' : 'Reference Source:'}</span>
              <span className="font-semibold text-accent">{currentSpecies.source}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <span>{isEs ? 'Terminología:' : 'Terminology:'}</span>
              <span className="text-text-primary">
                {currentTerminology.female} → {currentTerminology.offspring} (
                {currentTerminology.birthEvent})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
            <ToolFieldGroup
              label={
                isEs
                  ? 'Fecha de referencia de monta / servicio'
                  : 'Breeding / Mating Reference Date'
              }
              htmlFor={breedingDateId}
              error={errors.breedingDate}
            >
              <input
                id={breedingDateId}
                type="date"
                value={breedingDate}
                onChange={(e) => setBreedingDate(e.target.value)}
                className="ui-input font-mono tabular-nums"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Etiqueta o ID del animal (opcional)' : 'Optional Animal Label / ID'}
              htmlFor={labelInputId}
            >
              <input
                id={labelInputId}
                type="text"
                placeholder={isEs ? 'Ej. Margarita #104 o Bella' : 'e.g. Daisy #104 or Bella'}
                value={animalLabel}
                onChange={(e) => setAnimalLabel(e.target.value)}
                className="ui-input"
              />
            </ToolFieldGroup>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveRecord}
              disabled={isEmpty || hasErrors}
              className="flex-1 min-h-[40px] px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Bookmark className="w-4 h-4 shrink-0" />
              <span>
                {saveStatus
                  ? isEs
                    ? '¡Guardado en el navegador!'
                    : 'Saved to Browser Local Storage!'
                  : editId
                  ? isEs
                    ? 'Actualizar registro local'
                    : 'Update Local Record'
                  : isEs
                  ? 'Guardar registro localmente'
                  : 'Save Animal Record Locally'}
              </span>
            </button>

            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-border-main bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isEs ? 'Cancelar' : 'Cancel'}</span>
              </button>
            )}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Gestación y ventana de parto estimada' : 'Estimated Gestation & Delivery Window'}
          state={resultState}
          primaryLabel={isEs ? 'Fecha promedio estimada de parto' : 'Estimated Average Due Date'}
          primaryValue={avgDueDateFormatted}
          primarySubtext={`${currentTerminology.birthEvent} · ${currentSpecies.avgDays} ${
            isEs ? 'días' : 'Days'
          } (${(currentSpecies.avgDays / 7).toFixed(1)} ${isEs ? 'semanas' : 'weeks'})`}
          statusLabel={`${progressPct}%`}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa una fecha de monta' : 'Enter a breeding date'}
          emptyDescription={
            isEs
              ? 'Selecciona la especie y la fecha de monta para estimar la fecha de parto y la línea de tiempo.'
              : 'Select an animal species and enter the breeding date to estimate delivery dates and gestation progress.'
          }
          errorTitle={isEs ? 'Fecha no válida' : 'Invalid breeding date'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs ? 'Verifica la fecha de monta ingresada.' : 'Check the breeding / mating date.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={isEs ? 'Duración promedio de gestación' : 'Average Gestation Duration'}
              value={`${currentSpecies.avgDays} ${isEs ? 'días' : 'Days'}`}
              hint={`(${(currentSpecies.avgDays / 7).toFixed(1)} ${isEs ? 'semanas' : 'weeks'})`}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Ventana de parto documentada' : 'Expected Delivery Window'}
              value={deliveryWindowFormatted}
              hint={isEs ? 'Rango documentado' : 'Documented range'}
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap justify-between gap-2 text-xs font-medium text-text-secondary font-mono tabular-nums">
              <span>
                {isEs ? 'Transcurridos:' : 'Elapsed:'} {Math.max(0, elapsedDays)}{' '}
                {isEs ? 'días' : 'days'}
              </span>
              <span>
                {isEs ? 'Progreso:' : 'Progress:'} {progressPct}%
              </span>
              <span>
                {isEs ? 'Restantes:' : 'Remaining:'} {Math.max(0, remainingDays)}{' '}
                {isEs ? 'días' : 'days'}
              </span>
            </div>
            <div className="w-full bg-surface-secondary border border-border-subtle h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Especie' : 'Species',
                value: `${currentSpeciesName} (${currentSpecies.scientificName})`
              },
              {
                label: isEs ? 'Fecha de monta' : 'Breeding Date',
                value: breedingDate
              },
              {
                label: isEs ? 'Fecha promedio estimada' : 'Estimated Average Due Date',
                value: avgDueDateFormatted,
                highlight: true
              },
              {
                label: isEs ? 'Evento de nacimiento' : 'Birth Event',
                value: `${currentTerminology.birthEvent} (${currentTerminology.offspring})`
              }
            ]}
          />
        </ToolResultsPanel>
      }
      below={
        <div className="space-y-5">
          {records.length > 0 && (
            <section className="ui-panel p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-accent" />
                  <span>
                    {isEs
                      ? `Registros de gestación guardados (${records.length})`
                      : `Saved Animal Gestation Records (${records.length})`}
                  </span>
                </h2>
              </div>

              <div className="divide-y divide-border-subtle">
                {records.map((rec) => {
                  const matched = ANIMAL_SPECIES_DB.find((s) => s.id === rec.speciesId);
                  const displaySp = matched
                    ? isEs
                      ? matched.commonNameEs
                      : matched.commonName
                    : rec.speciesName;
                  return (
                    <div
                      key={rec.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <strong className="text-sm font-semibold text-text-primary block truncate">
                          {rec.label}
                        </strong>
                        <span className="text-xs text-text-secondary">
                          {displaySp} · {isEs ? 'Monta:' : 'Bred:'}{' '}
                          <span className="font-mono tabular-nums">{rec.breedingDate}</span> ·{' '}
                          {isEs ? 'Parto est.:' : 'Due:'}{' '}
                          <strong className="text-accent font-mono tabular-nums">
                            {rec.dueDate}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => editRecord(rec)}
                          aria-label={isEs ? `Editar ${rec.label}` : `Edit ${rec.label}`}
                          title={isEs ? 'Editar' : 'Edit'}
                          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg border border-border-subtle bg-surface-secondary hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRecord(rec.id)}
                          aria-label={isEs ? `Eliminar ${rec.label}` : `Delete ${rec.label}`}
                          title={isEs ? 'Eliminar' : 'Delete'}
                          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg border border-border-subtle bg-surface-secondary hover:bg-status-error hover:text-white hover:border-status-error text-text-primary transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4 text-xs text-text-secondary space-y-1">
            <strong className="block font-semibold text-text-primary">
              {isEs ? 'Aviso veterinario y de cría' : 'Veterinary & Breeding Disclaimer'}
            </strong>
            <span>
              {isEs
                ? 'Las fechas de gestación son estimaciones basadas en datos veterinarios publicados. La fecha real del parto varía según especie, raza, individuo, salud y factores ambientales. Esta calculadora no confirma la gestación ni sustituye la atención veterinaria profesional.'
                : 'Gestation dates are estimates based on published species reference data. Actual delivery timing varies by species, breed, individual animal, reproductive timing, health, and environmental factors. This calculator does not confirm pregnancy or replace professional veterinary advice.'}
            </span>
          </div>
        </div>
      }
    />
  );
}
