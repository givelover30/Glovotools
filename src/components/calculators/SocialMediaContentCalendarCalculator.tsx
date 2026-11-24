import { useState, useId } from 'react';
import {
  Share2,
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
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiSelect,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface PostItem {
  id: string;
  platform: 'Twitter / X' | 'LinkedIn' | 'Instagram' | 'YouTube' | 'TikTok';
  title: string;
  date: string;
  status: 'Idea' | 'Drafting' | 'Scheduled' | 'Published';
}

const INITIAL_POSTS: PostItem[] = [
  { id: '1', platform: 'LinkedIn', title: 'Phase 9D Product Launch Announcement', date: '2026-11-15', status: 'Scheduled' },
  { id: '2', platform: 'Twitter / X', title: 'Top 10 Developer Productivity Tips', date: '2026-11-18', status: 'Drafting' },
  { id: '3', platform: 'Instagram', title: 'Behind the scenes UI design systems', date: '2026-11-20', status: 'Idea' }
];

const PLATFORMS: PostItem['platform'][] = [
  'LinkedIn',
  'Twitter / X',
  'Instagram',
  'YouTube',
  'TikTok'
];

const STATUSES: PostItem['status'][] = ['Idea', 'Drafting', 'Scheduled', 'Published'];

const STATUS_ES: Record<PostItem['status'], string> = {
  Idea: 'Idea',
  Drafting: 'Borrador',
  Scheduled: 'Programada',
  Published: 'Publicada'
};

export default function SocialMediaContentCalendarCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [newPlatform, setNewPlatform] = useState<PostItem['platform']>('LinkedIn');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState<PostItem['platform']>('LinkedIn');
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState<PostItem['status']>('Idea');

  const addPost = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el título o tema del post.' : 'Please enter a post title or topic.');
      return;
    }
    setFormError('');
    setPosts([
      ...posts,
      {
        id: Date.now().toString(),
        platform: newPlatform,
        title: trimmed,
        date: newDate,
        status: 'Idea'
      }
    ]);
    setNewTitle('');
  };

  const startEdit = (p: PostItem) => {
    setEditingId(p.id);
    setEditPlatform(p.platform);
    setEditTitle(p.title);
    setEditDate(p.date);
    setEditStatus(p.status);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    setPosts(
      posts.map((p) =>
        p.id === id
          ? { ...p, platform: editPlatform, title: trimmed, date: editDate, status: editStatus }
          : p
      )
    );
    setEditingId(null);
  };

  const updatePostStatus = (id: string, status: PostItem['status']) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'social_calendar.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Calendario de Contenido Social' : 'Social Media Content Calendar'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Planifica publicaciones por canal, fecha de salida y estado editorial'
                : 'Plan posts across social channels with publish dates and workflow status'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Calendario (JSON)' : 'Export Content Calendar (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setPosts(INITIAL_POSTS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Total Publicaciones' : 'Total Planned Posts'}
          value={String(posts.length)}
          hint={isEs ? 'en calendario' : 'in calendar'}
        />
        <ToolMetricTile
          label={isEs ? 'Programadas' : 'Scheduled'}
          value={String(posts.filter((p) => p.status === 'Scheduled').length)}
          hint={isEs ? 'listas para publicar' : 'ready to publish'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Borradores / Ideas' : 'Ideas & Drafts'}
          value={String(posts.filter((p) => p.status === 'Idea' || p.status === 'Drafting').length)}
          hint={isEs ? 'en producción' : 'in production'}
        />
      </div>

      {/* Form & Calendar List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form
          onSubmit={addPost}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
        >
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Plataforma' : 'Platform'} htmlFor={`${baseId}-plat`}>
              <UiSelect
                id={`${baseId}-plat`}
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as PostItem['platform'])}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-5">
            <ToolFieldGroup
              label={isEs ? 'Título / Tema del Post' : 'Post Title / Topic'}
              htmlFor={`${baseId}-title`}
            >
              <UiInput
                id={`${baseId}-title`}
                type="text"
                placeholder={
                  isEs ? 'Ej. 5 formas de optimizar React' : 'e.g. 5 ways to optimize React apps'
                }
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Publicación' : 'Publish Date'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
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

        {posts.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Calendario de contenido vacío' : 'No planned posts yet'}
            description={
              isEs
                ? 'Agrega una idea de publicación arriba o restaura el calendario base.'
                : 'Add a social post above or restore the starter content calendar.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setPosts(INITIAL_POSTS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample posts'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {posts.map((post) => {
              const statusTone =
                post.status === 'Published'
                  ? 'success'
                  : post.status === 'Scheduled'
                  ? 'accent'
                  : post.status === 'Drafting'
                  ? 'warning'
                  : 'neutral';

              return (
                <div
                  key={post.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === post.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <select
                        aria-label={isEs ? 'Editar plataforma' : 'Edit platform'}
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value as PostItem['platform'])}
                        className="ui-select w-32 py-1.5 text-xs"
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar título' : 'Edit post title'}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="ui-input flex-1 min-w-[150px] py-1.5 text-xs"
                      />
                      <input
                        type="date"
                        aria-label={isEs ? 'Editar fecha' : 'Edit publish date'}
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="ui-input w-36 py-1.5 text-xs font-mono"
                      />
                      <select
                        aria-label={isEs ? 'Editar estado' : 'Edit status'}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as PostItem['status'])}
                        className="ui-select w-32 py-1.5 text-xs"
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
                        onClick={() => commitEdit(post.id)}
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
                          {post.title}
                        </span>
                        <div className="text-xs text-text-secondary font-mono">
                          {post.platform} • {post.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          aria-label={isEs ? `Estado de ${post.title}` : `Status for ${post.title}`}
                          value={post.status}
                          onChange={(e) =>
                            updatePostStatus(post.id, e.target.value as PostItem['status'])
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
                          {isEs ? STATUS_ES[post.status] : post.status}
                        </UiStatusLabel>
                        <button
                          type="button"
                          onClick={() => startEdit(post)}
                          aria-label={isEs ? `Editar ${post.title}` : `Edit ${post.title}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosts(posts.filter((p) => p.id !== post.id))}
                          aria-label={isEs ? `Eliminar ${post.title}` : `Remove ${post.title}`}
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
