import React, { useId, useState } from 'react';
import { ChevronDown, FileText, Loader2, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getESignText } from '../../i18n/esignTranslations.ts';
import type { ESignDocumentMetadata } from '../../services/pdf/v2/pdfESignatureEngine.ts';

export interface PdfMetadataEditorProps {
  metadata: ESignDocumentMetadata;
  hasDocument: boolean;
  loading?: boolean;
  isDirty?: boolean;
  disabled?: boolean;
  defaultOpen?: boolean;
  onChange: (next: ESignDocumentMetadata) => void;
  onReset: () => void;
}

export default function PdfMetadataEditor({
  metadata,
  hasDocument,
  loading = false,
  isDirty = false,
  disabled = false,
  defaultOpen = true,
  onChange,
  onReset
}: PdfMetadataEditorProps) {
  const { language } = useTranslation();
  const tr = (key: Parameters<typeof getESignText>[1], vars?: Record<string, string | number>) =>
    getESignText(language, key, vars);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const instanceId = useId();
  const panelBodyId = `${instanceId}-body`;
  const titleId = `${instanceId}-title`;
  const authorId = `${instanceId}-author`;
  const subjectId = `${instanceId}-subject`;

  const handleFieldChange = (field: keyof ESignDocumentMetadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value
    });
  };

  return (
    <div
      data-testid="esign-metadata-editor"
      className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          data-testid="esign-metadata-toggle-btn"
          aria-expanded={isOpen}
          aria-controls={panelBodyId}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 min-w-0 text-left cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
        >
          <FileText className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
          <span className="text-xs font-bold text-text-primary truncate">
            {tr('esign.metadata.heading')}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-text-tertiary shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {hasDocument && isDirty && !loading && (
          <button
            type="button"
            data-testid="esign-metadata-reset-btn"
            disabled={disabled}
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle disabled:opacity-45 disabled:pointer-events-none cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>{tr('esign.metadata.reset')}</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div id={panelBodyId} className="space-y-2.5 pt-1 border-t border-border-subtle/70">
          <p className="text-[11px] text-text-secondary leading-relaxed">
            {tr('esign.metadata.subtitle')}
          </p>

          {!hasDocument ? (
            <p
              data-testid="esign-metadata-empty"
              className="text-[11px] text-text-tertiary py-1"
            >
              {tr('esign.metadata.emptyHint')}
            </p>
          ) : loading ? (
            <div
              data-testid="esign-metadata-loading"
              className="flex items-center gap-2 py-2 text-[11px] text-text-secondary"
            >
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin shrink-0" aria-hidden="true" />
              <span>{tr('esign.metadata.loading')}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <label
                  htmlFor={titleId}
                  className="block text-[11px] font-semibold text-text-secondary"
                >
                  {tr('esign.metadata.titleLabel')}
                </label>
                <input
                  id={titleId}
                  type="text"
                  data-testid="esign-metadata-title-input"
                  value={metadata.title}
                  maxLength={512}
                  disabled={disabled}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder={tr('esign.metadata.titlePlaceholder')}
                  className="ui-input py-1.5 text-xs w-full"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor={authorId}
                  className="block text-[11px] font-semibold text-text-secondary"
                >
                  {tr('esign.metadata.authorLabel')}
                </label>
                <input
                  id={authorId}
                  type="text"
                  data-testid="esign-metadata-author-input"
                  value={metadata.author}
                  maxLength={512}
                  disabled={disabled}
                  onChange={(e) => handleFieldChange('author', e.target.value)}
                  placeholder={tr('esign.metadata.authorPlaceholder')}
                  className="ui-input py-1.5 text-xs w-full"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor={subjectId}
                  className="block text-[11px] font-semibold text-text-secondary"
                >
                  {tr('esign.metadata.subjectLabel')}
                </label>
                <input
                  id={subjectId}
                  type="text"
                  data-testid="esign-metadata-subject-input"
                  value={metadata.subject}
                  maxLength={512}
                  disabled={disabled}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  placeholder={tr('esign.metadata.subjectPlaceholder')}
                  className="ui-input py-1.5 text-xs w-full"
                />
              </div>

              {isDirty && (
                <p
                  data-testid="esign-metadata-modified-note"
                  className="text-[11px] font-medium text-accent pt-0.5"
                >
                  {tr('esign.metadata.modifiedNote')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
