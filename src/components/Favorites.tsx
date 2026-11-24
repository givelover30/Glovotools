import { useState, useMemo, useRef } from 'react';
import { 
  Star, 
  ArrowRight, 
  Search, 
  Trash2, 
  Calculator, 
  Layers, 
  FolderTree,
  ChevronRight,
  Download,
  Upload,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { CalculatorMeta, CalculatorId, CategoryMeta, CategoryId, SubcategoryMeta } from '../types.ts';
import CalculatorIcon from './common/CalculatorIcon.tsx';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { CATEGORIES } from '../data/calculators.ts';
import { getLocalizedCalculator, getLocalizedCategory } from '../i18n/esTranslations.ts';
import { GlobalFavorites } from '../services/FavoritesService.ts';
import CompactToolCard from './common/CompactToolCard.tsx';
import ToolHoverPreviewModal from './home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from './home/useToolHoverPreview.ts';

interface FavoritesProps {
  globalFavorites: GlobalFavorites;
  favoriteCalculators: CalculatorMeta[];
  favoriteCategories: CategoryMeta[];
  favoriteSubcategories: { subcategory: SubcategoryMeta; category: CategoryMeta }[];
  onSelectCalculator: (id: CalculatorId) => void;
  onSelectCategory: (id: CategoryId) => void;
  onSelectSubcategory: (catId: CategoryId, subId: string) => void;
  onToggleFavoriteCalc: (id: CalculatorId) => void;
  onToggleFavoriteCat: (id: CategoryId) => void;
  onToggleFavoriteSubcat: (id: string) => void;
  onClearAll: () => void;
  onUpdateFavorites: (favs: GlobalFavorites) => void;
}

type FilterTab = 'all' | 'calculators' | 'categories' | 'subcategories';
type SortOrder = 'default' | 'alphabetical';

export default function Favorites({
  globalFavorites,
  favoriteCalculators,
  favoriteCategories,
  favoriteSubcategories,
  onSelectCalculator,
  onSelectCategory,
  onSelectSubcategory,
  onToggleFavoriteCalc,
  onToggleFavoriteCat,
  onToggleFavoriteSubcat,
  onClearAll,
  onUpdateFavorites
}: FavoritesProps) {
  const { language, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  const totalCount = favoriteCalculators.length + favoriteCategories.length + favoriteSubcategories.length;

  // Export JSON backup
  const handleExportJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(globalFavorites, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `calctools_favorites_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  // Import JSON restore with validation and duplicate prevention
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            const newCalcs = Array.isArray(parsed.calculators) ? parsed.calculators : [];
            const newCats = Array.isArray(parsed.categories) ? parsed.categories : [];
            const newSubcats = Array.isArray(parsed.subcategories) ? parsed.subcategories : [];
            
            const merged: GlobalFavorites = {
              calculators: Array.from(new Set([...globalFavorites.calculators, ...newCalcs])),
              categories: Array.from(new Set([...globalFavorites.categories, ...newCats])),
              subcategories: Array.from(new Set([...globalFavorites.subcategories, ...newSubcats]))
            };
            onUpdateFavorites(merged);
            alert(language === 'es' ? '¡Favoritos importados y fusionados exitosamente!' : 'Favorites imported and merged successfully!');
          } else {
            throw new Error('Invalid JSON structure');
          }
        } catch (err) {
          alert(language === 'es' ? 'Archivo JSON de favoritos no válido o dañado.' : 'Invalid or malformed favorites JSON file.');
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
    }
  };

  const filteredCalculators = useMemo(() => {
    let list = favoriteCalculators;
    if (selectedPillar !== 'all') {
      list = list.filter(c => c.category === selectedPillar);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.shortDesc.toLowerCase().includes(q));
    }
    if (sortOrder === 'alphabetical') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [favoriteCalculators, searchQuery, selectedPillar, sortOrder]);

  const filteredCategories = useMemo(() => {
    let list = favoriteCategories;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(cat => cat.title.toLowerCase().includes(q) || cat.subtitle.toLowerCase().includes(q));
    }
    if (sortOrder === 'alphabetical') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [favoriteCategories, searchQuery, sortOrder]);

  const filteredSubcategories = useMemo(() => {
    let list = favoriteSubcategories;
    if (selectedPillar !== 'all') {
      list = list.filter(item => item.category.id === selectedPillar);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.subcategory.name.toLowerCase().includes(q) || item.category.title.toLowerCase().includes(q));
    }
    if (sortOrder === 'alphabetical') {
      return [...list].sort((a, b) => a.subcategory.name.localeCompare(b.subcategory.name));
    }
    return list;
  }, [favoriteSubcategories, searchQuery, selectedPillar, sortOrder]);

  return (
    <section className="pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn space-y-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 shadow-xs">
            <Star className="w-6 h-6 fill-amber-400 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                {language === 'es' ? 'Mis Favoritos' : 'My Favorites Dashboard'}
              </h2>
              <span className="text-xs font-semibold font-mono px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                {totalCount} {language === 'es' ? 'elementos guardados' : 'saved items'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {language === 'es' 
                ? 'Centro de gestión local de tus calculadoras, categorías y herramientas favoritas.'
                : 'Centralized browser-local management hub for your pinned calculators, categories, and tools.'}
            </p>
          </div>
        </div>

        {/* Action Buttons (Export / Import / Clear) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {totalCount > 0 && (
            <>
              {/* Export JSON */}
              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-main bg-white dark:bg-[#151922] text-text-primary text-xs font-semibold hover:border-amber-400 transition cursor-pointer shadow-2xs"
                title={language === 'es' ? 'Exportar favoritos como JSON' : 'Export favorites as JSON backup'}
              >
                <Download className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'es' ? 'Exportar JSON' : 'Export JSON'}</span>
              </button>

              {/* Import JSON */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-main bg-white dark:bg-[#151922] text-text-primary text-xs font-semibold hover:border-amber-400 transition cursor-pointer shadow-2xs"
                title={language === 'es' ? 'Importar favoritos desde JSON' : 'Import favorites from JSON backup'}
              >
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'es' ? 'Importar JSON' : 'Import JSON'}</span>
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".json" 
                onChange={handleImportJson} 
                className="hidden" 
              />
            </>
          )}

          {/* Clear All */}
          {totalCount > 0 && (
            <>
              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Borrar Todo' : 'Clear All'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                    {language === 'es' ? '¿Estás seguro?' : 'Are you sure?'}
                  </span>
                  <button
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                    }}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    {language === 'es' ? 'Sí' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 text-text-primary rounded-lg text-xs font-medium cursor-pointer"
                  >
                    {language === 'es' ? 'No' : 'No'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls Bar: Search, Sorting, Pillar Filter */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-2xl border border-border-subtle">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'es' ? 'Buscar en tus favoritos...' : 'Search your favorites...'}
              className="pl-9 pr-4 py-2 rounded-xl border border-border-main bg-background text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Order */}
            <div className="inline-flex items-center gap-1 bg-white dark:bg-[#151922] border border-border-main px-3 py-2 rounded-xl text-xs font-medium text-text-primary shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="bg-transparent text-text-primary focus:outline-none cursor-pointer text-xs"
              >
                <option value="default">{language === 'es' ? 'Orden predeterminado' : 'Default Order'}</option>
                <option value="alphabetical">{language === 'es' ? 'Alfabético (A-Z)' : 'Alphabetical (A-Z)'}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 border-b border-border-subtle pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-text-secondary hover:text-text-primary'
            }`}
          >
            {language === 'es' ? 'Todos' : 'All'} ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calculators'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Calculadoras' : 'Calculators'} ({favoriteCalculators.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-text-secondary hover:text-text-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Categorías' : 'Categories'} ({favoriteCategories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'subcategories'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-text-secondary hover:text-text-primary'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Subcategorías' : 'Subcategories'} ({favoriteSubcategories.length})</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {totalCount === 0 ? (
        <div className="p-16 rounded-3xl border border-dashed border-border-main bg-neutral-50/50 dark:bg-neutral-900/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 mx-auto shadow-sm">
            <Star className="w-8 h-8 fill-amber-400 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-primary">
              {language === 'es' ? 'No hay elementos favoritos guardados' : 'No favorite items saved yet'}
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              {language === 'es'
                ? 'Haz clic en el icono de estrella en cualquier calculadora, categoría o subcategoría para guardarla aquí para un acceso rápido. También puedes importar un respaldo JSON anterior.'
                : 'Click the star icon on any calculator, category, or subcategory card to pin it here for quick access. You can also import a previous JSON backup.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition shadow-md cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{language === 'es' ? 'Importar Respaldo JSON' : 'Import JSON Backup'}</span>
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".json" 
              onChange={handleImportJson} 
              className="hidden" 
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. FAVORITE CALCULATORS */}
          {(activeTab === 'all' || activeTab === 'calculators') && filteredCalculators.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-text-tertiary">
                  <Calculator className="w-4 h-4 text-amber-500" />
                  <span>{language === 'es' ? 'Calculadoras Favoritas' : 'Favorite Calculators'} ({filteredCalculators.length})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredCalculators.map((rawCalc) => {
                  const calc = getLocalizedCalculator(rawCalc, language);
                  const rawCat = CATEGORIES.find((c) => c.id === rawCalc.category);
                  const catTitle = rawCat ? getLocalizedCategory(rawCat, language).title : rawCalc.category;
                  return (
                    <CompactToolCard
                      key={calc.id}
                      tool={calc}
                      categoryLabel={catTitle}
                      isFavorite={true}
                      onSelect={onSelectCalculator}
                      onToggleFavorite={onToggleFavoriteCalc}
                      favoriteAddLabel={language === 'es' ? 'Agregar a favoritos' : 'Save to favorites'}
                      favoriteRemoveLabel={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
                      onHoverEnter={handleCardHoverEnter}
                      onHoverLeave={handleCardHoverLeave}
                      isPreviewActive={hoverPreviewState?.tool.id === calc.id}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. FAVORITE CATEGORIES */}
          {(activeTab === 'all' || activeTab === 'categories') && filteredCategories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-text-tertiary">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>{language === 'es' ? 'Categorías Favoritas' : 'Favorite Categories'} ({filteredCategories.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredCategories.map((rawCat) => {
                  const cat = getLocalizedCategory(rawCat, language);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                      className="text-left p-4 rounded-2xl border border-border-main bg-white dark:bg-[#151922] hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer relative overflow-hidden shadow-xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2 flex-1">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: rawCat.iconBg }}
                        >
                          <CalculatorIcon name={rawCat.iconName} className="w-5 h-5 stroke-[2.2]" style={{ color: rawCat.iconColor }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-text-primary group-hover:text-amber-600 transition truncate leading-snug">
                            {cat.title}
                          </h3>
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {cat.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavoriteCat(cat.id);
                          }}
                          title={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
                          className="p-1 rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                        >
                          <Star className="w-4 h-4 fill-amber-400 stroke-[1.8]" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. FAVORITE SUBCATEGORIES */}
          {(activeTab === 'all' || activeTab === 'subcategories') && filteredSubcategories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-text-tertiary">
                <FolderTree className="w-4 h-4 text-amber-500" />
                <span>{language === 'es' ? 'Subcategorías Favoritas' : 'Favorite Subcategories'} ({filteredSubcategories.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubcategories.map(({ subcategory, category }) => {
                  const localizedCat = getLocalizedCategory(category, language);
                  const subId = `${category.id}:${subcategory.id}`;
                  return (
                    <div
                      key={subId}
                      onClick={() => onSelectSubcategory(category.id, subcategory.id)}
                      className="text-left p-4 rounded-2xl border border-border-main bg-white dark:bg-[#151922] hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-pointer relative overflow-hidden shadow-xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 inline-block mb-1 truncate max-w-full">
                          {localizedCat.title}
                        </span>
                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-amber-600 truncate leading-snug">
                          {subcategory.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavoriteSubcat(subId);
                          }}
                          title={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
                          className="p-1 rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                        >
                          <Star className="w-4 h-4 fill-amber-400 stroke-[1.8]" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {hoverPreviewState && (
        <ToolHoverPreviewModal
          tool={hoverPreviewState.tool}
          categoryLabel={hoverPreviewState.categoryLabel}
          anchorRect={hoverPreviewState.anchorRect}
          isFavorite={globalFavorites.calculators.includes(hoverPreviewState.tool.id)}
          onClose={closePreview}
          onSelect={onSelectCalculator}
          onToggleFavorite={onToggleFavoriteCalc}
          onMouseEnter={handleModalMouseEnter}
          onMouseLeave={handleModalMouseLeave}
        />
      )}
    </section>
  );
}
