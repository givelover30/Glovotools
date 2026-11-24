import { useState, useId } from 'react';
import {
  Sprout,
  Plus,
  Trash2,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface PlantItem {
  id: string;
  name: string;
  category: 'Vegetables' | 'Herbs' | 'Flowers' | 'Fruits';
  plantingSeason: string;
  quantity: number;
  status: 'Planned' | 'Sown' | 'Harvesting';
}

const INITIAL_PLANTS: PlantItem[] = [
  { id: '1', name: 'Tomatoes (Roma)', category: 'Vegetables', plantingSeason: 'Spring', quantity: 6, status: 'Sown' },
  { id: '2', name: 'Basil (Sweet)', category: 'Herbs', plantingSeason: 'Spring', quantity: 4, status: 'Planned' },
  { id: '3', name: 'Strawberries', category: 'Fruits', plantingSeason: 'Spring', quantity: 10, status: 'Harvesting' }
];

const CATEGORIES: PlantItem['category'][] = ['Vegetables', 'Herbs', 'Fruits', 'Flowers'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const STATUSES: PlantItem['status'][] = ['Planned', 'Sown', 'Harvesting'];

const CATEGORY_ES: Record<PlantItem['category'], string> = {
  Vegetables: 'Vegetales',
  Herbs: 'Hierbas Aromáticas',
  Fruits: 'Frutas',
  Flowers: 'Flores'
};

const SEASON_ES: Record<string, string> = {
  Spring: 'Primavera',
  Summer: 'Verano',
  Fall: 'Otoño',
  Winter: 'Invierno'
};

const STATUS_ES: Record<PlantItem['status'], string> = {
  Planned: 'Planeado',
  Sown: 'Sembrado',
  Harvesting: 'Cosechando'
};

export default function GardenPlantingPlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [plants, setPlants] = useState<PlantItem[]>(INITIAL_PLANTS);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<PlantItem['category']>('Vegetables');
  const [newSeason, setNewSeason] = useState('Spring');
  const [newQty, setNewQty] = useState(5);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<PlantItem['category']>('Vegetables');
  const [editSeason, setEditSeason] = useState('Spring');
  const [editQty, setEditQty] = useState(1);
  const [editStatus, setEditStatus] = useState<PlantItem['status']>('Planned');

  const addPlant = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la planta.' : 'Please enter a plant name.');
      return;
    }
    if (!Number.isFinite(newQty) || newQty < 1) {
      setFormError(isEs ? 'La cantidad debe ser al menos 1.' : 'Quantity must be at least 1.');
      return;
    }
    setFormError('');
    setPlants([
      ...plants,
      {
        id: Date.now().toString(),
        name: trimmed,
        category: newCategory,
        plantingSeason: newSeason,
        quantity: Math.max(1, Number(newQty) || 1),
        status: 'Planned'
      }
    ]);
    setNewName('');
  };

  const startEdit = (p: PlantItem) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditSeason(p.plantingSeason);
    setEditQty(p.quantity);
    setEditStatus(p.status);
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed || editQty < 1) return;
    setPlants(
      plants.map((p) =>
        p.id === id
          ? {
              ...p,
              name: trimmed,
              category: editCategory,
              plantingSeason: editSeason,
              quantity: Math.max(1, Number(editQty)),
              status: editStatus
            }
          : p
      )
    );
    setEditingId(null);
  };

  const updateStatus = (id: string, status: PlantItem['status']) => {
    setPlants(plants.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(plants, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'garden_plan.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Siembra y Huerto' : 'Garden Planting & Crop Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Organiza cultivos por temporada, cantidad de ejemplares y estado'
                : 'Organize garden varieties, planting seasons, quantities, and harvest status'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Jardín (JSON)' : 'Export Garden Plan (JSON)'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setPlants(INITIAL_PLANTS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Variedades de Plantas' : 'Plant Varieties'}
          value={String(plants.length)}
          hint={isEs ? 'especies activas' : 'active varieties'}
        />
        <ToolMetricTile
          label={isEs ? 'Total de Ejemplares' : 'Total Plant Quantity'}
          value={String(plants.reduce((acc, p) => acc + p.quantity, 0))}
          hint={isEs ? 'unidades sembradas o planeadas' : 'planned or sown units'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Listas / Cosechando' : 'Sown & Harvesting'}
          value={String(
            plants.filter((p) => p.status === 'Sown' || p.status === 'Harvesting').length
          )}
          hint={isEs ? 'cultivos activos' : 'active crops'}
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form
          onSubmit={addPlant}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
        >
          <div className="sm:col-span-4">
            <ToolFieldGroup
              label={isEs ? 'Nombre de la Planta' : 'Plant Name'}
              htmlFor={`${baseId}-name`}
            >
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder={isEs ? 'Ej. Pimientos morrones' : 'e.g. Bell Peppers'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiSelect
                id={`${baseId}-cat`}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as PlantItem['category'])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {isEs ? CATEGORY_ES[c] : c}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Temporada' : 'Season'} htmlFor={`${baseId}-season`}>
              <UiSelect
                id={`${baseId}-season`}
                value={newSeason}
                onChange={(e) => setNewSeason(e.target.value)}
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {isEs ? SEASON_ES[s] : s}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Cantidad' : 'Quantity'} htmlFor={`${baseId}-qty`}>
              <UiInput
                id={`${baseId}-qty`}
                type="number"
                min={1}
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Añadir' : 'Add'}</span>
            </UiButton>
          </div>
        </form>

        {plants.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Tu huerto está vacío' : 'No plants in your garden plan'}
            description={
              isEs
                ? 'Agrega una variedad arriba o restaura las plantas iniciales.'
                : 'Add a plant variety above or restore the starter garden plan.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setPlants(INITIAL_PLANTS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample garden'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {plants.map((plant) => {
              const displayCat = isEs ? CATEGORY_ES[plant.category] || plant.category : plant.category;
              const displaySeason = isEs
                ? SEASON_ES[plant.plantingSeason] || plant.plantingSeason
                : plant.plantingSeason;
              const statusTone =
                plant.status === 'Harvesting'
                  ? 'success'
                  : plant.status === 'Sown'
                  ? 'accent'
                  : 'neutral';

              return (
                <div
                  key={plant.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === plant.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar planta' : 'Edit plant name'}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                      />
                      <select
                        aria-label={isEs ? 'Editar categoría' : 'Edit category'}
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as PlantItem['category'])}
                        className="ui-select w-32 py-1.5 text-xs"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {isEs ? CATEGORY_ES[c] : c}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label={isEs ? 'Editar temporada' : 'Edit season'}
                        value={editSeason}
                        onChange={(e) => setEditSeason(e.target.value)}
                        className="ui-select w-28 py-1.5 text-xs"
                      >
                        {SEASONS.map((s) => (
                          <option key={s} value={s}>
                            {isEs ? SEASON_ES[s] : s}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        aria-label={isEs ? 'Editar cantidad' : 'Edit quantity'}
                        value={editQty}
                        onChange={(e) => setEditQty(Number(e.target.value))}
                        className="ui-input w-20 py-1.5 text-xs font-mono"
                      />
                      <select
                        aria-label={isEs ? 'Editar estado' : 'Edit status'}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as PlantItem['status'])}
                        className="ui-select w-28 py-1.5 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {isEs ? STATUS_ES[s] : s}
                          </option>
                        ))}
                      </select>
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEdit(plant.id)}
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
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-text-primary block truncate">
                          {plant.name}
                        </span>
                        <div className="text-xs text-text-secondary font-mono">
                          {displayCat} • {isEs ? 'Cant:' : 'Qty:'} {plant.quantity} • {displaySeason}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          aria-label={isEs ? `Estado de ${plant.name}` : `Status for ${plant.name}`}
                          value={plant.status}
                          onChange={(e) =>
                            updateStatus(plant.id, e.target.value as PlantItem['status'])
                          }
                          className="ui-select py-1 px-2 text-xs w-28"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {isEs ? STATUS_ES[s] : s}
                            </option>
                          ))}
                        </select>
                        <UiStatusLabel tone={statusTone}>
                          {isEs ? STATUS_ES[plant.status] : plant.status}
                        </UiStatusLabel>
                        <button
                          type="button"
                          onClick={() => startEdit(plant)}
                          aria-label={isEs ? `Editar ${plant.name}` : `Edit ${plant.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlants(plants.filter((p) => p.id !== plant.id))}
                          aria-label={isEs ? `Eliminar ${plant.name}` : `Remove ${plant.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
