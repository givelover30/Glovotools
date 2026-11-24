import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiCheckbox } from '../ui/AppPrimitives.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_TITLE = 'CalcTools - Free Online Calculators & Utility Tools';
const DEFAULT_DESC =
  'Discover over 4,000 free online calculators, financial estimators, developer tools, and instant document converters built for accuracy.';

export default function SeoChecklistCheckerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [title, setTitle] = useState<string>(DEFAULT_TITLE);
  const [desc, setDesc] = useState<string>(DEFAULT_DESC);
  const [h1Count, setH1Count] = useState<number>(1);
  const [hasViewport, setHasViewport] = useState<boolean>(true);
  const [hasCanonical, setHasCanonical] = useState<boolean>(true);

  const analysis = useMemo(() => {
    const titleLen = title.trim().length;
    const descLen = desc.trim().length;

    const checks = [
      {
        label: isEs ? 'Longitud del título (30–60 caracteres)' : 'Title length (30–60 chars)',
        detail: `${titleLen} ${isEs ? 'caracteres' : 'chars'}`,
        pass: titleLen >= 30 && titleLen <= 60
      },
      {
        label: isEs ? 'Meta descripción (120–160 caracteres)' : 'Meta description (120–160 chars)',
        detail: `${descLen} ${isEs ? 'caracteres' : 'chars'}`,
        pass: descLen >= 120 && descLen <= 160
      },
      {
        label: isEs ? 'Exactamente una etiqueta H1' : 'Exactly one H1 heading',
        detail: `${h1Count} H1`,
        pass: h1Count === 1
      },
      {
        label: isEs ? 'Meta etiqueta Viewport móvil' : 'Mobile Viewport meta tag',
        detail: hasViewport ? (isEs ? 'Presente' : 'Present') : isEs ? 'Falta' : 'Missing',
        pass: hasViewport
      },
      {
        label: isEs ? 'Enlace Canonical configurado' : 'Canonical link tag present',
        detail: hasCanonical ? (isEs ? 'Presente' : 'Present') : isEs ? 'Falta' : 'Missing',
        pass: hasCanonical
      }
    ];

    const passedCount = checks.filter((c) => c.pass).length;
    const score = Math.round((passedCount / checks.length) * 100);
    const statusTone: 'success' | 'warning' | 'error' =
      score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';

    return {
      titleLen,
      descLen,
      checks,
      passedCount,
      score,
      statusTone
    };
  }, [title, desc, h1Count, hasViewport, hasCanonical, isEs]);

  const handleClear = () => {
    setTitle('');
    setDesc('');
    setH1Count(0);
    setHasViewport(false);
    setHasCanonical(false);
  };

  const handleReset = () => {
    setTitle(DEFAULT_TITLE);
    setDesc(DEFAULT_DESC);
    setH1Count(1);
    setHasViewport(true);
    setHasCanonical(true);
  };

  const copySummary = `SEO Score: ${analysis.score}/100 (${analysis.passedCount}/5) | Title: ${analysis.titleLen} chars | Meta Description: ${analysis.descLen} chars | H1: ${h1Count} | Viewport: ${hasViewport ? 'Yes' : 'No'} | Canonical: ${hasCanonical ? 'Yes' : 'No'}`;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Auditoría de Checklist SEO On-Page' : 'On-Page SEO Checklist Auditor'}
          subtitle={
            isEs
              ? 'Evalúa longitud de título, meta descripción, estructura H1, viewport y etiqueta canonical.'
              : 'Audits page title length, meta description length, H1 count, mobile viewport, and canonical setup.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Título de la página (<title>)' : 'Page Title (<title>)'}
            htmlFor="seo-title-input"
            unit={`${analysis.titleLen} / 60`}
          >
            <input
              id="seo-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEs ? 'Título SEO óptimo (30–60 caracteres)' : 'Optimal SEO title (30–60 chars)'}
              className="ui-input text-sm"
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label={isEs ? 'Meta descripción' : 'Meta Description'}
            htmlFor="seo-desc-input"
            unit={`${analysis.descLen} / 160`}
          >
            <textarea
              id="seo-desc-input"
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={
                isEs
                  ? 'Meta descripción recomendada (120–160 caracteres)'
                  : 'Recommended meta description (120–160 chars)'
              }
              className="ui-input text-sm resize-y"
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label={isEs ? 'Cantidad de encabezados H1 en la página' : 'Number of H1 Tags on Page'}
            htmlFor="seo-h1-input"
            unit={isEs ? 'Ideal: 1' : 'Target: 1'}
          >
            <input
              id="seo-h1-input"
              type="number"
              min={0}
              max={20}
              value={h1Count}
              onChange={(e) => setH1Count(Math.max(0, Number(e.target.value) || 0))}
              className="ui-input font-mono text-sm"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <UiCheckbox
              id="seo-viewport-check"
              checked={hasViewport}
              onChange={(e) => setHasViewport(e.target.checked)}
              label={isEs ? 'Meta Viewport presente' : 'Viewport Meta Tag'}
            />
            <UiCheckbox
              id="seo-canonical-check"
              checked={hasCanonical}
              onChange={(e) => setHasCanonical(e.target.checked)}
              label={isEs ? 'Etiqueta Canonical presente' : 'Canonical Link Tag'}
            />
          </div>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Óptimo (100/100)' : 'Optimized (100/100)',
                onSelect: handleReset
              },
              {
                label: isEs ? 'Necesita mejoras' : 'Needs Work (40/100)',
                onSelect: () => {
                  setTitle('Home');
                  setDesc('Short desc.');
                  setH1Count(2);
                  setHasViewport(true);
                  setHasCanonical(true);
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Puntuación SEO' : 'SEO Audit Score'}
          state="ready"
          primaryLabel={isEs ? 'Puntuación On-Page' : 'On-Page SEO Score'}
          primaryValue={`${analysis.score} / 100`}
          primarySubtext={
            isEs
              ? `${analysis.passedCount} de ${analysis.checks.length} criterios esenciales aprobados.`
              : `${analysis.passedCount} of ${analysis.checks.length} core on-page SEO checks passed.`
          }
          statusLabel={
            analysis.score >= 80
              ? isEs
                ? 'Óptimo'
                : 'Strong'
              : analysis.score >= 60
                ? isEs
                  ? 'Mejorable'
                  : 'Fair'
                : isEs
                  ? 'Crítico'
                  : 'Needs Work'
          }
          statusTone={analysis.statusTone}
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar auditoría' : 'Copy audit'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              <ToolMetricTile
                label={isEs ? 'Título' : 'Title'}
                value={`${analysis.titleLen} ch`}
                accent={analysis.titleLen >= 30 && analysis.titleLen <= 60}
              />
              <ToolMetricTile
                label={isEs ? 'Descripción' : 'Meta Desc'}
                value={`${analysis.descLen} ch`}
              />
              <ToolMetricTile label="H1" value={String(h1Count)} />
            </div>

            <div className="space-y-2">
              {analysis.checks.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs ${
                    item.pass
                      ? 'border-status-success/30 bg-status-success-bg text-text-primary'
                      : 'border-status-error/30 bg-status-error-bg text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.pass ? (
                      <Check className="w-4 h-4 text-status-success shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-status-error shrink-0" />
                    )}
                    <span className="font-medium break-words">{item.label}</span>
                  </div>
                  <span className="font-mono font-semibold text-text-secondary shrink-0">
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ToolResultsPanel>
      }
    />
  );
}
