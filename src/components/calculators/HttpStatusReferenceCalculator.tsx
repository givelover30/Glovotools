import { useState, useMemo, useId } from 'react';
import { Globe, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiStatusLabel, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface HttpStatusItem {
  code: number;
  text: string;
  category:
    | '1xx Informational'
    | '2xx Success'
    | '3xx Redirection'
    | '4xx Client Error'
    | '5xx Server Error';
  description: string;
}

const HTTP_STATUS_LIST: HttpStatusItem[] = [
  { code: 100, text: 'Continue', category: '1xx Informational', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, text: 'Switching Protocols', category: '1xx Informational', description: 'The requester has asked the server to switch protocols and the server has agreed to do so.' },
  { code: 200, text: 'OK', category: '2xx Success', description: 'Standard response for successful HTTP requests. The requested resource is returned in the body.' },
  { code: 201, text: 'Created', category: '2xx Success', description: 'The request has been fulfilled and resulted in a new resource being created.' },
  { code: 204, text: 'No Content', category: '2xx Success', description: 'The server successfully processed the request, but is not returning any content.' },
  { code: 301, text: 'Moved Permanently', category: '3xx Redirection', description: 'This and all future requests should be directed to the given URI.' },
  { code: 302, text: 'Found (Moved Temporarily)', category: '3xx Redirection', description: 'Tells the client to look at another URL using the same method for the temporary redirect.' },
  { code: 304, text: 'Not Modified', category: '3xx Redirection', description: 'Indicates the resource has not been modified since the version specified in the request headers.' },
  { code: 400, text: 'Bad Request', category: '4xx Client Error', description: 'The server cannot or will not process the request due to something perceived as a client error.' },
  { code: 401, text: 'Unauthorized', category: '4xx Client Error', description: 'Authentication is required and has failed or has not yet been provided.' },
  { code: 403, text: 'Forbidden', category: '4xx Client Error', description: 'The client does not have access rights to the content; unauthorized access is denied.' },
  { code: 404, text: 'Not Found', category: '4xx Client Error', description: 'The server cannot find the requested resource. The URL is not recognized or has been deleted.' },
  { code: 405, text: 'Method Not Allowed', category: '4xx Client Error', description: 'A request method is not supported for the requested resource (e.g. POST on a GET-only route).' },
  { code: 409, text: 'Conflict', category: '4xx Client Error', description: 'Indicates that the request could not be processed because of conflict in the current state of the resource.' },
  { code: 422, text: 'Unprocessable Entity', category: '4xx Client Error', description: 'The request was well-formed but was unable to be followed due to semantic errors (validation failed).' },
  { code: 429, text: 'Too Many Requests', category: '4xx Client Error', description: 'The user has sent too many requests in a given amount of time (rate limiting).' },
  { code: 500, text: 'Internal Server Error', category: '5xx Server Error', description: 'A generic error message, given when an unexpected condition was encountered on the server.' },
  { code: 502, text: 'Bad Gateway', category: '5xx Server Error', description: 'The server, while acting as a gateway or proxy, received an invalid response from the inbound server.' },
  { code: 503, text: 'Service Unavailable', category: '5xx Server Error', description: 'The server is currently unable to handle the request due to temporary overload or scheduled maintenance.' },
  { code: 504, text: 'Gateway Timeout', category: '5xx Server Error', description: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.' }
];

const CATEGORIES = [
  'all',
  '1xx Informational',
  '2xx Success',
  '3xx Redirection',
  '4xx Client Error',
  '5xx Server Error'
];

export default function HttpStatusReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return HTTP_STATUS_LIST.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.code.toString().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  const handleCopy = (item: HttpStatusItem) => {
    navigator.clipboard?.writeText(`${item.code} ${item.text}: ${item.description}`);
    setCopiedCode(item.code);
    window.setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTone = (cat: HttpStatusItem['category']) => {
    if (cat === '2xx Success') return 'success';
    if (cat === '4xx Client Error') return 'warning';
    if (cat === '5xx Server Error') return 'error';
    return 'accent';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="ui-panel p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar código HTTP' : 'Search HTTP status code'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar código HTTP (ej. 404, Not Found)...'
                : 'Search HTTP status code (e.g. 404, Not Found, Gateway)...'
            }
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={isEs ? 'Limpiar búsqueda' : 'Clear search'}
              className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono tabular-nums text-text-secondary">
            <Search className="w-3.5 h-3.5 text-text-tertiary" />
            <span>
              {filtered.length}/{HTTP_STATUS_LIST.length}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-subtle">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-accent text-white'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                }`}
              >
                {cat === 'all' ? (isEs ? 'Todos' : 'All Codes') : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Status Codes */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin códigos HTTP coincidentes' : 'No matching HTTP status codes'}
          description={
            isEs
              ? 'Restaura los filtros o prueba otro código de estado.'
              : 'Reset filters or try another HTTP status code.'
          }
          action={
            <UiButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
            >
              {isEs ? 'Restaurar filtros' : 'Reset filters'}
            </UiButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.code}
              className="ui-card ui-card-interactive p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-accent-light border border-accent/25 text-accent font-mono tabular-nums font-bold text-sm shrink-0">
                      {item.code}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary truncate">{item.text}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    aria-label={isEs ? `Copiar código ${item.code}` : `Copy status ${item.code}`}
                    className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer shrink-0"
                  >
                    {copiedCode === item.code ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
              </div>
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <UiStatusLabel tone={getTone(item.category)}>{item.category}</UiStatusLabel>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
