import { useState, useEffect, useId, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Download,
  RotateCcw,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiSelect,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  unit: 'lbs' | 'kg';
  notes: string;
}

const INITIAL_RECORDS: WeightRecord[] = [
  { id: '1', date: '2026-01-01', weight: 5, unit: 'lbs', notes: '8 weeks old' },
  { id: '2', date: '2026-02-01', weight: 12, unit: 'lbs', notes: '12 weeks old' },
  { id: '3', date: '2026-03-01', weight: 22, unit: 'lbs', notes: '16 weeks old' }
];

const STORAGE_KEY = 'calctools_pet_growth_records';

export default function PetGrowthTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [petName, setPetName] = useState<string>('Max');
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [breedSize, setBreedSize] = useState<'toy' | 'small' | 'medium' | 'large' | 'giant'>('medium');
  const [records, setRecords] = useState<WeightRecord[]>(INITIAL_RECORDS);

  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState<number>(30);
  const [newUnit, setNewUnit] = useState<'lbs' | 'kg'>('lbs');
  const [newNotes, setNewNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editWeight, setEditWeight] = useState<string>('0');
  const [editUnit, setEditUnit] = useState<'lbs' | 'kg'>('lbs');
  const [editNotes, setEditNotes] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecords(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const saveToStorage = (updated: WeightRecord[]) => {
    const sorted = [...updated].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setRecords(sorted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || isNaN(newWeight) || newWeight <= 0) {
      setFormError(
        isEs
          ? 'Ingresa una fecha y un peso válido mayor a 0.'
          : 'Please enter a valid date and weight greater than 0.'
      );
      return;
    }
    setFormError('');
    const item: WeightRecord = {
      id: Date.now().toString(),
      date: newDate,
      weight: Number(newWeight),
      unit: newUnit,
      notes: newNotes.trim()
    };
    saveToStorage([...records, item]);
    setNewNotes('');
  };

  const handleDelete = (id: string) => {
    saveToStorage(records.filter((r) => r.id !== id));
  };

  const startEdit = (rec: WeightRecord) => {
    setEditingId(rec.id);
    setEditDate(rec.date);
    setEditWeight(String(rec.weight));
    setEditUnit(rec.unit);
    setEditNotes(rec.notes);
  };

  const commitEdit = (id: string) => {
    const w = Number(editWeight);
    if (!editDate || isNaN(w) || w <= 0) return;
    saveToStorage(
      records.map((r) =>
        r.id === id
          ? { ...r, date: editDate, weight: w, unit: editUnit, notes: editNotes.trim() }
          : r
      )
    );
    setEditingId(null);
  };

  const latestWeight = records.length > 0 ? records[records.length - 1].weight : 0;
  const latestUnit = records.length > 0 ? records[records.length - 1].unit : 'lbs';
  const initialWeight = records.length > 0 ? records[0].weight : 0;
  const totalGain = Math.max(0, latestWeight - initialWeight);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pet-growth-${petName.toLowerCase().replace(/\s+/g, '-') || 'records'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Responsive SVG growth curve calculation
  const chartData = useMemo(() => {
    if (records.length === 0) return null;
    const svgW = 580;
    const svgH = 210;
    const padL = 46;
    const padR = 24;
    const padT = 22;
    const padB = 34;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;

    const weights = records.map((r) => r.weight);
    const minVal = Math.min(...weights);
    const maxVal = Math.max(...weights);
    const rawSpan = maxVal - minVal;
    const yMin = rawSpan === 0 ? Math.max(0, minVal * 0.8) : Math.max(0, minVal - rawSpan * 0.15);
    const yMax = rawSpan === 0 ? Math.max(10, maxVal * 1.2) : maxVal + rawSpan * 0.15;
    const ySpan = Math.max(1, yMax - yMin);

    const points = records.map((r, idx) => {
      const x =
        records.length === 1
          ? padL + plotW / 2
          : padL + (idx / (records.length - 1)) * plotW;
      const y = padT + plotH - ((r.weight - yMin) / ySpan) * plotH;
      return {
        ...r,
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1))
      };
    });

    const linePath = points
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
      .join(' ');
    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`
        : '';

    const yTicks = [0, 0.5, 1].map((t) => ({
      val: (yMin + t * ySpan).toFixed(1),
      y: Number((padT + plotH - t * plotH).toFixed(1))
    }));

    return { svgW, svgH, padL, padR, padT, padB, plotH, points, linePath, areaPath, yTicks };
  }, [records]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left column: Pet Profile & Add Measurement */}
        <div className="lg:col-span-4 space-y-5">
          <section className="ui-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-primary">
                {isEs ? 'Perfil de la Mascota' : 'Pet Profile'}
              </h3>
              <UiButton
                variant="ghost"
                size="sm"
                onClick={() => saveToStorage(INITIAL_RECORDS)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isEs ? 'Restaurar' : 'Reset'}</span>
              </UiButton>
            </div>

            <ToolFieldGroup label={isEs ? 'Nombre' : 'Pet Name'} htmlFor={`${baseId}-petname`}>
              <UiInput
                id={`${baseId}-petname`}
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </ToolFieldGroup>

            <div className="grid grid-cols-2 gap-3">
              <ToolFieldGroup label={isEs ? 'Especie' : 'Species'} htmlFor={`${baseId}-species`}>
                <UiSelect
                  id={`${baseId}-species`}
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as 'dog' | 'cat')}
                >
                  <option value="dog">{isEs ? 'Perro' : 'Dog'}</option>
                  <option value="cat">{isEs ? 'Gato' : 'Cat'}</option>
                </UiSelect>
              </ToolFieldGroup>

              <ToolFieldGroup label={isEs ? 'Tamaño' : 'Breed Size'} htmlFor={`${baseId}-size`}>
                <UiSelect
                  id={`${baseId}-size`}
                  value={breedSize}
                  onChange={(e) =>
                    setBreedSize(e.target.value as 'toy' | 'small' | 'medium' | 'large' | 'giant')
                  }
                >
                  <option value="toy">{isEs ? 'Mini' : 'Toy'}</option>
                  <option value="small">{isEs ? 'Pequeño' : 'Small'}</option>
                  <option value="medium">{isEs ? 'Mediano' : 'Medium'}</option>
                  <option value="large">{isEs ? 'Grande' : 'Large'}</option>
                  <option value="giant">{isEs ? 'Gigante' : 'Giant'}</option>
                </UiSelect>
              </ToolFieldGroup>
            </div>
          </section>

          <section className="ui-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3">
              {isEs ? 'Registrar Peso' : 'Add Weight Log'}
            </h3>
            {formError && <UiErrorState message={formError} />}
            <form onSubmit={handleAdd} className="space-y-3.5">
              <ToolFieldGroup label={isEs ? 'Fecha' : 'Date'} htmlFor={`${baseId}-date`}>
                <UiInput
                  id={`${baseId}-date`}
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="font-mono"
                />
              </ToolFieldGroup>

              <div className="grid grid-cols-2 gap-3">
                <ToolFieldGroup label={isEs ? 'Peso' : 'Weight'} htmlFor={`${baseId}-weight`}>
                  <UiInput
                    id={`${baseId}-weight`}
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="font-mono tabular-nums"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label={isEs ? 'Unidad' : 'Unit'} htmlFor={`${baseId}-unit`}>
                  <UiSelect
                    id={`${baseId}-unit`}
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as 'lbs' | 'kg')}
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </UiSelect>
                </ToolFieldGroup>
              </div>

              <ToolFieldGroup
                label={isEs ? 'Notas / Hitos' : 'Notes / Milestones'}
                htmlFor={`${baseId}-notes`}
              >
                <UiInput
                  id={`${baseId}-notes`}
                  type="text"
                  placeholder={isEs ? 'Ej. Vacunación, 20 semanas' : 'e.g. Vaccinated, Dewormed'}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </ToolFieldGroup>

              <UiButton type="submit" variant="primary" className="w-full">
                <Plus className="w-4 h-4" />
                <span>{isEs ? 'Agregar Medición' : 'Add Measurement'}</span>
              </UiButton>
            </form>
          </section>
        </div>

        {/* Right column: KPIs, SVG Growth Chart, History List */}
        <div className="lg:col-span-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolMetricTile
              label={isEs ? 'Peso Actual' : 'Current Weight'}
              value={`${latestWeight} ${latestUnit}`}
              hint={petName || (isEs ? 'Mascota' : 'Pet')}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Ganancia Total' : 'Total Weight Gained'}
              value={`+${totalGain.toFixed(1)} ${latestUnit}`}
              hint={isEs ? 'desde primer registro' : 'since first record'}
            />
            <ToolMetricTile
              label={isEs ? 'Registros Totales' : 'Total Logs'}
              value={`${records.length} ${isEs ? 'entradas' : 'entries'}`}
              hint={isEs ? 'almacenamiento local' : 'browser-local storage'}
            />
          </div>

          {/* Responsive SVG Growth Progression Chart */}
          <section className="ui-panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-text-primary">
                {isEs
                  ? `Curva de Crecimiento (${petName || 'Mascota'})`
                  : `Growth Progression Chart (${petName || 'Pet'})`}
              </h3>
              <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </UiButton>
            </div>

            {chartData ? (
              <div className="w-full">
                <svg
                  viewBox={`0 0 ${chartData.svgW} ${chartData.svgH}`}
                  className="w-full h-52 select-none"
                  role="img"
                  aria-label={
                    isEs
                      ? `Gráfico de peso de ${petName}`
                      : `Weight progression chart for ${petName}`
                  }
                >
                  {/* Horizontal Gridlines & Y-Axis Labels */}
                  {chartData.yTicks.map((tick, idx) => (
                    <g key={idx}>
                      <line
                        x1={chartData.padL}
                        y1={tick.y}
                        x2={chartData.svgW - chartData.padR}
                        y2={tick.y}
                        stroke="var(--border-main)"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={chartData.padL - 8}
                        y={tick.y + 4}
                        textAnchor="end"
                        fill="var(--text-tertiary)"
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                      >
                        {tick.val}
                      </text>
                    </g>
                  ))}

                  {/* Baseline axis */}
                  <line
                    x1={chartData.padL}
                    y1={chartData.padT + chartData.plotH}
                    x2={chartData.svgW - chartData.padR}
                    y2={chartData.padT + chartData.plotH}
                    stroke="var(--border-strong)"
                    strokeWidth="1"
                  />

                  {/* Subtle area fill */}
                  {chartData.areaPath && (
                    <path
                      d={chartData.areaPath}
                      fill="var(--accent)"
                      fillOpacity="0.12"
                    />
                  )}

                  {/* Line curve */}
                  {chartData.points.length > 1 && (
                    <path
                      d={chartData.linePath}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Plotted data points and labels */}
                  {chartData.points.map((pt, idx) => (
                    <g key={pt.id}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={5}
                        fill="var(--bg-surface)"
                        stroke="var(--accent)"
                        strokeWidth="2.5"
                        data-testid="growth-chart-point"
                      >
                        <title>{`${pt.date}: ${pt.weight} ${pt.unit}${pt.notes ? ` (${pt.notes})` : ''}`}</title>
                      </circle>
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="var(--font-mono)"
                      >
                        {pt.weight} {pt.unit}
                      </text>
                      {(chartData.points.length <= 6 ||
                        idx === 0 ||
                        idx === chartData.points.length - 1 ||
                        idx === Math.floor(chartData.points.length / 2)) && (
                        <text
                          x={pt.x}
                          y={chartData.padT + chartData.plotH + 18}
                          textAnchor="middle"
                          fill="var(--text-secondary)"
                          fontSize="10"
                          fontFamily="var(--font-mono)"
                        >
                          {pt.date}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <UiEmptyState
                title={isEs ? 'Sin datos para graficar' : 'No weight data to chart'}
                description={
                  isEs
                    ? 'Agrega una medición para visualizar la curva de crecimiento.'
                    : 'Add a weight measurement to render the growth curve.'
                }
              />
            )}
          </section>

          {/* Weight Log History */}
          <section className="ui-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">
                {isEs
                  ? `Historial de Peso (${petName || 'Mascota'})`
                  : `Weight Log History (${petName || 'Pet'})`}
              </h3>
              <span className="text-xs font-mono text-text-tertiary">{records.length}</span>
            </div>

            {records.length === 0 ? (
              <UiEmptyState
                title={isEs ? 'No hay registros de peso' : 'No weight records logged yet'}
                description={
                  isEs
                    ? 'Agrega un registro a la izquierda o restaura los ejemplos iniciales.'
                    : 'Add a weight entry on the left or restore sample records.'
                }
                action={
                  <UiButton
                    variant="secondary"
                    size="sm"
                    onClick={() => saveToStorage(INITIAL_RECORDS)}
                  >
                    {isEs ? 'Restaurar ejemplo' : 'Restore sample records'}
                  </UiButton>
                }
              />
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                  >
                    {editingId === rec.id ? (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        <input
                          type="date"
                          aria-label={isEs ? 'Editar fecha' : 'Edit date'}
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="ui-input w-36 py-1.5 text-xs font-mono"
                        />
                        <input
                          type="number"
                          step="0.1"
                          aria-label={isEs ? 'Editar peso' : 'Edit weight'}
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className="ui-input w-24 py-1.5 text-xs font-mono"
                        />
                        <select
                          aria-label={isEs ? 'Editar unidad' : 'Edit unit'}
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value as 'lbs' | 'kg')}
                          className="ui-select w-20 py-1.5 text-xs"
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                        </select>
                        <input
                          type="text"
                          aria-label={isEs ? 'Editar notas' : 'Edit notes'}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                        />
                        <UiButton
                          variant="primary"
                          size="sm"
                          aria-label={isEs ? 'Confirmar' : 'Confirm'}
                          onClick={() => commitEdit(rec.id)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </UiButton>
                        <UiButton
                          variant="ghost"
                          size="sm"
                          aria-label={isEs ? 'Cancelar' : 'Cancel'}
                          onClick={() => setEditingId(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </UiButton>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 min-w-0">
                          <Calendar className="w-4 h-4 text-accent shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold font-mono tabular-nums text-text-primary">
                              {rec.date}
                            </div>
                            {rec.notes && (
                              <div className="text-xs text-text-secondary truncate">{rec.notes}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold font-mono tabular-nums text-accent">
                            {rec.weight} {rec.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => startEdit(rec)}
                            aria-label={isEs ? `Editar registro ${rec.date}` : `Edit log ${rec.date}`}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rec.id)}
                            aria-label={isEs ? `Eliminar registro ${rec.date}` : `Delete log ${rec.date}`}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
