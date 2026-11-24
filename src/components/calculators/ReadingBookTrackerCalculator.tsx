import { useState, useEffect, useId } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Printer,
  Download,
  Save,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface Book {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
}

const INITIAL_BOOKS: Book[] = [
  { id: '1', title: 'Atomic Habits', author: 'James Clear', currentPage: 180, totalPages: 320 },
  { id: '2', title: 'Clean Code', author: 'Robert C. Martin', currentPage: 240, totalPages: 464 },
  { id: '3', title: 'Deep Work', author: 'Cal Newport', currentPage: 95, totalPages: 304 }
];

const STORAGE_KEY = 'calctools_reading_tracker';

export default function ReadingBookTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [current, setCurrent] = useState('0');
  const [total, setTotal] = useState('300');
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editTotal, setEditTotal] = useState('300');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setBooks(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError(isEs ? 'Ingresa el título del libro.' : 'Please enter a book title.');
      return;
    }
    setFormError('');
    const totalPgs = Math.max(1, Number(total) || 100);
    const curPgs = Math.min(totalPgs, Math.max(0, Number(current) || 0));
    setBooks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: trimmedTitle,
        author: author.trim() || (isEs ? 'Autor desconocido' : 'Unknown Author'),
        currentPage: curPgs,
        totalPages: totalPgs
      }
    ]);
    setTitle('');
    setAuthor('');
    setCurrent('0');
    setTotal('300');
  };

  const removeBook = (id: string) => setBooks((prev) => prev.filter((b) => b.id !== id));

  const updatePages = (id: string, delta: number) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const next = Math.min(b.totalPages, Math.max(0, b.currentPage + delta));
          return { ...b, currentPage: next };
        }
        return b;
      })
    );
  };

  const startEdit = (b: Book) => {
    setEditingId(b.id);
    setEditTitle(b.title);
    setEditAuthor(b.author);
    setEditTotal(String(b.totalPages));
  };

  const commitEdit = (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    const nextTotal = Math.max(1, Number(editTotal) || 100);
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              title: trimmed,
              author: editAuthor.trim() || b.author,
              totalPages: nextTotal,
              currentPage: Math.min(b.currentPage, nextTotal)
            }
          : b
      )
    );
    setEditingId(null);
  };

  const totalBooksFinished = books.filter((b) => b.currentPage >= b.totalPages).length;
  const totalPagesRead = books.reduce((sum, b) => sum + b.currentPage, 0);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Lectura y Libros' : 'Reading & Book Progress Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Administra tu biblioteca y registra páginas leídas' : 'Manage your reading list and advance page progress'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            <span>{savedStatus ? (isEs ? '¡Guardado!' : 'Saved!') : (isEs ? 'Guardar' : 'Save')}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" />
            <span>{isEs ? 'Imprimir' : 'Print'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setBooks(INITIAL_BOOKS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Libros Terminados' : 'Books Completed'}
          value={`${totalBooksFinished} / ${books.length}`}
          hint={isEs ? 'biblioteca activa' : 'in library'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Páginas Leídas' : 'Total Pages Read'}
          value={totalPagesRead.toLocaleString()}
          hint={isEs ? 'acumuladas' : 'across all books'}
        />
        <ToolMetricTile
          label={isEs ? 'En Progreso' : 'In Progress'}
          value={String(books.length - totalBooksFinished)}
          hint={isEs ? 'lecturas activas' : 'active reads'}
        />
      </div>

      {/* Add Book Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addBook} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Título del Libro' : 'Book Title'} htmlFor={`${baseId}-title`}>
              <UiInput
                id={`${baseId}-title`}
                type="text"
                placeholder={isEs ? 'Ej. Hábitos Atómicos' : 'Book Title'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Autor' : 'Author'} htmlFor={`${baseId}-author`}>
              <UiInput
                id={`${baseId}-author`}
                type="text"
                placeholder={isEs ? 'Autor' : 'Author'}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Total Páginas' : 'Total Pages'} htmlFor={`${baseId}-total`}>
              <UiInput
                id={`${baseId}-total`}
                type="number"
                min={1}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Agregar' : 'Add Book'}</span>
            </UiButton>
          </div>
        </form>

        {/* Books List */}
        {books.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Tu biblioteca está vacía' : 'No books in library yet'}
            description={
              isEs
                ? 'Agrega un libro arriba o restaura la lista inicial.'
                : 'Add a book above or restore starter books.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setBooks(INITIAL_BOOKS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample books'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {books.map((b) => {
              const pct = Math.min(100, Math.round((b.currentPage / (b.totalPages || 1)) * 100));
              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3"
                >
                  {editingId === b.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar título' : 'Edit title'}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar autor' : 'Edit author'}
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="ui-input w-40 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        aria-label={isEs ? 'Editar total de páginas' : 'Edit total pages'}
                        value={editTotal}
                        onChange={(e) => setEditTotal(e.target.value)}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(b.id)}
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-text-primary text-sm truncate">{b.title}</h4>
                        <p className="text-xs text-text-secondary truncate">{b.author}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <UiStatusLabel tone={pct === 100 ? 'success' : 'accent'}>
                          {pct}%
                        </UiStatusLabel>
                        <button
                          type="button"
                          onClick={() => startEdit(b)}
                          aria-label={isEs ? `Editar ${b.title}` : `Edit ${b.title}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBook(b.id)}
                          aria-label={isEs ? `Eliminar ${b.title}` : `Remove ${b.title}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums text-text-secondary">
                      <span>
                        {isEs
                          ? `Página ${b.currentPage} de ${b.totalPages}`
                          : `Page ${b.currentPage} of ${b.totalPages}`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface border border-border-subtle overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <UiButton variant="secondary" size="sm" onClick={() => updatePages(b.id, -10)}>
                      -10 pgs
                    </UiButton>
                    <UiButton variant="primary" size="sm" onClick={() => updatePages(b.id, 10)}>
                      +10 pgs
                    </UiButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
