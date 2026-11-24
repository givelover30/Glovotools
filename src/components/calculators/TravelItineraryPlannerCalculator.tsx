import { useState, useEffect, useId } from 'react';
import {
  Plane,
  Plus,
  Trash2,
  Download,
  Save,
  RotateCcw,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  activity: string;
  location: string;
  cost: number;
}

const STORAGE_KEY = 'calctools_travel_itinerary';

const INITIAL_TRIP: ItineraryItem[] = [
  { id: '1', day: 1, time: '09:00 AM', activity: 'Arrival & Hotel Check-in', location: 'Grand Plaza Hotel', cost: 250 },
  { id: '2', day: 1, time: '01:00 PM', activity: 'Historic City Center Walking Tour', location: 'Old Town Square', cost: 45 },
  { id: '3', day: 2, time: '10:00 AM', activity: 'National Art Museum Visit', location: 'Museum District', cost: 25 },
  { id: '4', day: 2, time: '07:30 PM', activity: 'Fine Dining Dinner reservation', location: 'Bistro Riviera', cost: 120 }
];

export default function TravelItineraryPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const fmtMoney = (val: number) =>
    formatCurrency(val, Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined);
  const isEs = language === 'es';
  const baseId = useId();

  const [destination, setDestination] = useState<string>('Paris, France');
  const [durationDays, setDurationDays] = useState<number>(5);
  const [items, setItems] = useState<ItineraryItem[]>(INITIAL_TRIP);

  const [newDay, setNewDay] = useState<number>(1);
  const [newTime, setNewTime] = useState<string>('12:00 PM');
  const [newActivity, setNewActivity] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newCost, setNewCost] = useState<string>('0');
  const [formError, setFormError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCost, setEditCost] = useState('0');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.destination === 'string') setDestination(parsed.destination);
          if (parsed.durationDays !== undefined) {
            const d = Number(parsed.durationDays);
            if (Number.isFinite(d) && d >= 1) setDurationDays(Math.min(30, d));
          }
          if (Array.isArray(parsed.items)) setItems(parsed.items);
        }
      } catch {
        // Ignore invalid localStorage payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ destination, durationDays, items })
    );
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleReset = () => {
    setDestination('Paris, France');
    setDurationDays(5);
    setItems(INITIAL_TRIP);
    setFormError('');
    setEditingId(null);
  };

  const addItem = () => {
    const act = newActivity.trim();
    const cost = Number(newCost);
    if (!act) {
      setFormError(isEs ? 'Ingresa una actividad.' : 'Please enter an activity description.');
      return;
    }
    if (!Number.isFinite(cost) || cost < 0) {
      setFormError(isEs ? 'El costo no puede ser negativo.' : 'Cost cannot be negative.');
      return;
    }
    setFormError('');
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        day: Math.min(Math.max(1, Number(newDay) || 1), Math.max(1, durationDays)),
        time: newTime.trim() || '12:00 PM',
        activity: act,
        location: newLocation.trim(),
        cost
      }
    ]);
    setNewActivity('');
    setNewLocation('');
    setNewCost('0');
  };

  const startEdit = (item: ItineraryItem) => {
    setEditingId(item.id);
    setEditTime(item.time);
    setEditActivity(item.activity);
    setEditLocation(item.location);
    setEditCost(String(item.cost));
  };

  const commitEdit = (id: string) => {
    const act = editActivity.trim();
    const cost = Number(editCost);
    if (!act || !Number.isFinite(cost) || cost < 0) return;
    setItems(
      items.map((it) =>
        it.id === id
          ? { ...it, time: editTime.trim() || it.time, activity: act, location: editLocation.trim(), cost }
          : it
      )
    );
    setEditingId(null);
  };

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const totalCost = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const safeDuration = Math.max(1, Math.min(30, Number(durationDays) || 1));

  const handleDownload = () => {
    const data = { destination, durationDays: safeDuration, items, totalCost };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-itinerary-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Viajes e Itinerario' : 'Travel Itinerary & Trip Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Organiza actividades día por día, ubicaciones y presupuesto'
                : 'Schedule daily trip activities, locations, and estimated costs'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedStatus && (
            <UiStatusLabel tone="success">
              {isEs ? 'Guardado localmente' : 'Saved locally'}
            </UiStatusLabel>
          )}
          <UiButton variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            <span>{savedStatus ? (isEs ? '¡Guardado!' : 'Saved!') : (isEs ? 'Guardar' : 'Save')}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Trip Settings & KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ui-panel p-4 space-y-1.5">
          <ToolFieldGroup label={isEs ? 'Destino' : 'Destination'} htmlFor={`${baseId}-dest`}>
            <UiInput
              id={`${baseId}-dest`}
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </ToolFieldGroup>
        </div>

        <div className="ui-panel p-4 space-y-1.5">
          <ToolFieldGroup
            label={isEs ? 'Duración (Días)' : 'Duration (Days)'}
            htmlFor={`${baseId}-days`}
          >
            <UiInput
              id={`${baseId}-days`}
              type="number"
              min={1}
              max={30}
              value={durationDays}
              onChange={(e) => setDurationDays(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
              className="font-mono font-bold"
            />
          </ToolFieldGroup>
        </div>

        <ToolMetricTile
          label={isEs ? 'Costo Estimado Total' : 'Estimated Total Cost'}
          value={fmtMoney(totalCost)}
          hint={`${items.length} ${isEs ? 'actividades en' : 'activities over'} ${safeDuration} ${isEs ? 'días' : 'days'}`}
          accent
        />
      </div>

      {/* Add Activity Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Actividad al Itinerario' : 'Add Itinerary Activity'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Día' : 'Day'} htmlFor={`${baseId}-day`}>
              <UiInput
                id={`${baseId}-day`}
                type="number"
                min={1}
                max={safeDuration}
                value={newDay}
                onChange={(e) => setNewDay(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Hora' : 'Time'} htmlFor={`${baseId}-time`}>
              <UiInput
                id={`${baseId}-time`}
                type="text"
                placeholder="12:00 PM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Actividad' : 'Activity'} htmlFor={`${baseId}-act`}>
              <UiInput
                id={`${baseId}-act`}
                type="text"
                placeholder={isEs ? 'Ej. Tour al museo' : 'e.g. Museum Tour'}
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Ubicación' : 'Location'} htmlFor={`${baseId}-loc`}>
              <UiInput
                id={`${baseId}-loc`}
                type="text"
                placeholder={isEs ? 'Lugar' : 'Location'}
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Costo (${currencyMeta.symbol})` : `Cost (${currencyMeta.symbol})`} htmlFor={`${baseId}-cost`}>
              <UiInput
                id={`${baseId}-cost`}
                type="number"
                min={0}
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton
              variant="primary"
              onClick={addItem}
              className="w-full"
              aria-label={isEs ? 'Agregar actividad' : 'Add Activity'}
            >
              <Plus className="w-4 h-4" />
              <span className="sm:sr-only">{isEs ? 'Agregar' : 'Add'}</span>
            </UiButton>
          </div>
        </div>
      </section>

      {/* Day-grouped Itinerary */}
      {items.length === 0 ? (
        <section className="ui-panel p-6">
          <UiEmptyState
            title={isEs ? 'No hay actividades en tu itinerario' : 'No itinerary activities yet'}
            description={
              isEs
                ? 'Agrega tu primera actividad arriba o restaura el viaje de ejemplo.'
                : 'Add your first activity above or restore the sample itinerary.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setItems(INITIAL_TRIP)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample trip'}
              </UiButton>
            }
          />
        </section>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: safeDuration }, (_, i) => i + 1).map((dayNum) => {
            const dayItems = items.filter((item) => item.day === dayNum);
            const dayTotal = dayItems.reduce((s, it) => s + (Number(it.cost) || 0), 0);
            return (
              <section key={dayNum} className="ui-panel p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-subtle">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    {isEs ? `Día ${dayNum}` : `Day ${dayNum}`}
                  </h3>
                  <UiStatusLabel tone={dayTotal > 0 ? 'accent' : 'neutral'}>
                    {fmtMoney(dayTotal)}
                  </UiStatusLabel>
                </div>

                {dayItems.length === 0 ? (
                  <p className="text-xs text-text-secondary py-1">
                    {isEs
                      ? 'No hay actividades planeadas para este día.'
                      : 'No activities scheduled for this day yet.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border-subtle bg-surface-secondary/50"
                      >
                        {editingId === item.id ? (
                          <div className="flex flex-1 flex-wrap items-center gap-2">
                            <input
                              type="text"
                              aria-label={isEs ? 'Editar hora' : 'Edit time'}
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="ui-input w-24 py-1.5 text-xs font-mono"
                            />
                            <input
                              type="text"
                              aria-label={isEs ? 'Editar actividad' : 'Edit activity'}
                              value={editActivity}
                              onChange={(e) => setEditActivity(e.target.value)}
                              className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                            />
                            <input
                              type="text"
                              aria-label={isEs ? 'Editar ubicación' : 'Edit location'}
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              className="ui-input w-36 py-1.5 text-xs"
                            />
                            <input
                              type="number"
                              min={0}
                              aria-label={isEs ? 'Editar costo' : 'Edit cost'}
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                              className="ui-input w-20 py-1.5 text-xs font-mono"
                            />
                            <UiButton
                              variant="primary"
                              size="sm"
                              aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                              onClick={() => commitEdit(item.id)}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </UiButton>
                            <UiButton
                              variant="ghost"
                              size="sm"
                              aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                              onClick={() => setEditingId(null)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </UiButton>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono text-xs font-bold text-accent w-20 shrink-0">
                                {item.time}
                              </span>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-text-primary block truncate">
                                  {item.activity}
                                </span>
                                {item.location && (
                                  <span className="text-[11px] text-text-secondary block truncate">
                                    {item.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono tabular-nums text-xs font-bold text-text-primary">
                                {fmtMoney(Number(item.cost))}
                              </span>
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                aria-label={isEs ? `Editar ${item.activity}` : `Edit ${item.activity}`}
                                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                aria-label={isEs ? `Eliminar ${item.activity}` : `Remove ${item.activity}`}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
