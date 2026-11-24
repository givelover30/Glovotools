import React, { useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolPresetBar,
  ToolSegmentedControl,
} from '../calculator/ToolWorkspacePrimitives';
import { UiCheckbox } from '../ui/AppPrimitives';

type LoremUnit = 'paragraphs' | 'sentences' | 'words';

const DEFAULTS = {
  count: 3,
  type: 'paragraphs' as LoremUnit,
  startWithLorem: true,
  useHtml: false,
};

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur', 'pretium',
  'tincidunt', 'lacus', 'nulla', 'gravida', 'orci', 'a', 'odio', 'nullam', 'varius',
];

const CLASSIC_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const LoremIpsumCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [countInput, setCountInput] = useState<string>(String(DEFAULTS.count));
  const [type, setType] = useState<LoremUnit>(DEFAULTS.type);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(DEFAULTS.startWithLorem);
  const [useHtml, setUseHtml] = useState<boolean>(DEFAULTS.useHtml);
  const [seed, setSeed] = useState<number>(303);

  const parsedCount = Number(countInput);
  const isCountValid =
    countInput.trim() !== '' && Number.isInteger(parsedCount) && parsedCount >= 1 && parsedCount <= 50;

  const { outputText, wordCount, charCount } = useMemo(() => {
    if (!isCountValid) {
      return { outputText: '', wordCount: 0, charCount: 0 };
    }
    const rng = mulberry32(seed + (type === 'paragraphs' ? 1 : type === 'sentences' ? 2 : 3));

    const makeSentence = (minWords = 8, maxWords = 15): string => {
      const len = Math.floor(rng() * (maxWords - minWords + 1)) + minWords;
      const words: string[] = [];
      for (let i = 0; i < len; i++) {
        words.push(LOREM_WORDS[Math.floor(rng() * LOREM_WORDS.length)]);
      }
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      return `${words.join(' ')}.`;
    };

    let text = '';
    if (type === 'words') {
      const words: string[] = [];
      if (startWithLorem) {
        const classicWords = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'];
        for (let i = 0; i < Math.min(parsedCount, classicWords.length); i++) {
          words.push(classicWords[i]);
        }
      }
      while (words.length < parsedCount) {
        words.push(LOREM_WORDS[Math.floor(rng() * LOREM_WORDS.length)]);
      }
      text = words.join(' ');
      if (useHtml) text = `<p>${text}</p>`;
    } else if (type === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < parsedCount; i++) {
        sentences.push(i === 0 && startWithLorem ? CLASSIC_START : makeSentence());
      }
      text = useHtml ? sentences.map((s) => `<p>${s}</p>`).join('\n') : sentences.join(' ');
    } else {
      const paragraphs: string[] = [];
      for (let p = 0; p < parsedCount; p++) {
        const sentenceCount = Math.floor(rng() * 3) + 4;
        const sentences: string[] = [];
        for (let s = 0; s < sentenceCount; s++) {
          sentences.push(p === 0 && s === 0 && startWithLorem ? CLASSIC_START : makeSentence());
        }
        paragraphs.push(sentences.join(' '));
      }
      text = useHtml
        ? paragraphs.map((p) => `<p>${p}</p>`).join('\n\n')
        : paragraphs.join('\n\n');
    }

    const plain = text.replace(/<\/?p>/g, ' ').trim();
    const wCount = plain ? plain.split(/\s+/).length : 0;
    return {
      outputText: text,
      wordCount: wCount,
      charCount: text.length,
    };
  }, [isCountValid, parsedCount, type, startWithLorem, useHtml, seed]);

  const handleReset = () => {
    setCountInput(String(DEFAULTS.count));
    setType(DEFAULTS.type);
    setStartWithLorem(DEFAULTS.startWithLorem);
    setUseHtml(DEFAULTS.useHtml);
    setSeed(303);
  };

  const presets = [
    {
      label: isEs ? '3 Párrafos' : '3 Paragraphs',
      onSelect: () => {
        setType('paragraphs');
        setCountInput('3');
        setUseHtml(false);
      },
    },
    {
      label: isEs ? '5 Frases' : '5 Sentences',
      onSelect: () => {
        setType('sentences');
        setCountInput('5');
        setUseHtml(false);
      },
    },
    {
      label: isEs ? '25 Palabras' : '25 Words',
      onSelect: () => {
        setType('words');
        setCountInput('25');
        setUseHtml(false);
      },
    },
    {
      label: isEs ? 'HTML <p> (4)' : 'HTML <p> (4)',
      onSelect: () => {
        setType('paragraphs');
        setCountInput('4');
        setUseHtml(true);
      },
    },
  ];

  const unitLabel =
    type === 'paragraphs'
      ? isEs
        ? 'párrafos'
        : 'paragraphs'
      : type === 'sentences'
        ? isEs
          ? 'frases'
          : 'sentences'
        : isEs
          ? 'palabras'
          : 'words';

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Opciones de Lorem Ipsum' : 'Lorem Ipsum Options'}
      subtitle={
        isEs
          ? 'Genera texto de relleno en párrafos, frases, palabras o etiquetas HTML <p>.'
          : 'Generate placeholder copy by paragraphs, sentences, words, or HTML <p> tags.'
      }
      onReset={handleReset}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
    >
      <ToolPresetBar label={isEs ? 'Formatos rápidos' : 'Quick presets'} presets={presets} />

      <ToolFieldGroup label={isEs ? 'Unidad de Generación' : 'Generation Unit'}>
        <ToolSegmentedControl<LoremUnit>
          ariaLabel={isEs ? 'Unidad de texto Lorem Ipsum' : 'Lorem Ipsum unit'}
          value={type}
          onChange={setType}
          options={[
            { value: 'paragraphs', label: isEs ? 'Párrafos' : 'Paragraphs' },
            { value: 'sentences', label: isEs ? 'Frases' : 'Sentences' },
            { value: 'words', label: isEs ? 'Palabras' : 'Words' },
          ]}
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'Cantidad (1–50)' : 'Count (1–50)'}
        htmlFor="lorem-count"
        error={
          !isCountValid
            ? isEs
              ? 'Introduce un número entero entre 1 y 50.'
              : 'Enter a whole number between 1 and 50.'
            : undefined
        }
      >
        <input
          id="lorem-count"
          type="number"
          min={1}
          max={50}
          value={countInput}
          onChange={(e) => setCountInput(e.target.value)}
          className="ui-input font-mono"
        />
      </ToolFieldGroup>

      <div className="space-y-2.5 pt-1">
        <UiCheckbox
          id="lorem-start"
          checked={startWithLorem}
          onChange={(e) => setStartWithLorem(e.target.checked)}
          label={
            isEs
              ? 'Comenzar con "Lorem ipsum dolor sit amet..."'
              : 'Start with "Lorem ipsum dolor sit amet..."'
          }
        />
        <UiCheckbox
          id="lorem-html"
          checked={useHtml}
          onChange={(e) => setUseHtml(e.target.checked)}
          label={isEs ? 'Envolver en etiquetas HTML <p>' : 'Wrap output in HTML <p> tags'}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          disabled={!isCountValid}
          onClick={() => setSeed((prev) => prev + 31)}
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {isEs ? 'Regenerar' : 'Regenerate'}
        </button>
        <button
          type="button"
          disabled={!isCountValid}
          onClick={() =>
            downloadBlob(
              outputText,
              useHtml ? 'lorem-ipsum.html' : 'lorem-ipsum.txt',
              useHtml ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8'
            )
          }
          className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {useHtml
            ? isEs
              ? 'Descargar .html'
              : 'Download .html'
            : isEs
              ? 'Descargar .txt'
              : 'Download .txt'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Texto Generado' : 'Generated Placeholder Copy'}
      state={isCountValid ? 'ready' : 'error'}
      errorTitle={isEs ? 'Cantidad no válida' : 'Invalid Count'}
      errorMessage={
        isEs
          ? 'Introduce una cantidad entera entre 1 y 50.'
          : 'Enter a whole number between 1 and 50.'
      }
      primaryLabel={isEs ? 'Salida Actual' : 'Current Output'}
      primaryValue={isCountValid ? String(parsedCount) : '—'}
      primaryUnit={unitLabel}
      primarySubtext={
        isCountValid
          ? isEs
            ? `${wordCount} palabras · ${charCount} caracteres${useHtml ? ' · HTML <p>' : ''}`
            : `${wordCount} words · ${charCount} characters${useHtml ? ' · HTML <p>' : ''}`
          : undefined
      }
      statusLabel={useHtml ? 'HTML' : isEs ? 'Texto plano' : 'Plain Text'}
      statusTone="accent"
      copyText={outputText}
      copyLabel={isEs ? 'Copiar Texto' : 'Copy Text'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isCountValid && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile label={isEs ? 'Palabras' : 'Words'} value={String(wordCount)} accent />
            <ToolMetricTile label={isEs ? 'Caracteres' : 'Characters'} value={String(charCount)} />
          </div>

          <div
            className={`p-4 rounded-lg border border-border-main bg-surface-secondary text-sm text-text-primary max-h-[360px] overflow-y-auto whitespace-pre-wrap leading-relaxed ${
              useHtml ? 'font-mono text-xs' : ''
            }`}
          >
            {outputText}
          </div>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default LoremIpsumCalculator;
