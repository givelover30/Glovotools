import { useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_XML = `<note>
  <to>Tove</to>
  <from>Jani</from>
  <heading>Reminder</heading>
  <body>Don't forget me this weekend!</body>
</note>`;

const NESTED_ATTRIBUTES_XML = `<catalog version="2.0">
  <book id="bk101" currency="USD">
    <title>XML Developer's Guide</title>
    <price>44.95</price>
  </book>
  <book id="bk102" currency="EUR">
    <title>Data Pipelines</title>
    <price>39.00</price>
  </book>
</catalog>`;

function xmlNodeToJson(xml: Node): any {
  const obj: Record<string, any> = {};
  let hasAttributes = false;
  let hasElementChildren = false;
  let collectedText = '';

  if (xml.nodeType === 1) {
    const el = xml as Element;
    if (el.attributes && el.attributes.length > 0) {
      hasAttributes = true;
      obj['@attributes'] = {};
      for (let j = 0; j < el.attributes.length; j++) {
        const attribute = el.attributes.item(j);
        if (attribute) {
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    }
  } else if (xml.nodeType === 3) {
    return xml.nodeValue?.trim() || '';
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      if (!item) continue;
      if (item.nodeType === 3 || item.nodeType === 4) {
        const val = item.nodeValue?.trim();
        if (val) {
          collectedText = collectedText ? `${collectedText} ${val}` : val;
        }
      } else if (item.nodeType === 1) {
        hasElementChildren = true;
        const nodeName = item.nodeName;
        const parsedChild = xmlNodeToJson(item);
        if (obj[nodeName] === undefined) {
          obj[nodeName] = parsedChild;
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(parsedChild);
        }
      }
    }
  }

  if (!hasAttributes && !hasElementChildren) {
    return collectedText;
  }
  if (collectedText) {
    obj['#text'] = collectedText;
  }
  return obj;
}

export default function XmlToJsonCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [xmlInput, setXmlInput] = useState<string>(DEFAULT_XML);

  const conversion = useMemo(() => {
    if (!xmlInput.trim()) {
      return { state: 'empty' as const };
    }
    try {
      const parser = new DOMParser();
      const dom = parser.parseFromString(xmlInput, 'text/xml');
      const parserError = dom.querySelector('parsererror');
      if (parserError) {
        const detail = parserError.textContent?.trim() || '';
        throw new Error(
          detail ||
            (isEs
              ? 'Estructura XML inválida. Verifica etiquetas de apertura y cierre.'
              : 'Invalid XML structure. Check opening and closing tags.')
        );
      }
      const root = dom.documentElement;
      if (!root) {
        throw new Error(isEs ? 'No se encontró un elemento raíz XML.' : 'No root XML element found.');
      }
      const res = { [root.nodeName]: xmlNodeToJson(root) };
      const jsonOutput = JSON.stringify(res, null, 2);
      return {
        state: 'ready' as const,
        rootName: root.nodeName,
        jsonOutput,
        lineCount: jsonOutput.split('\n').length
      };
    } catch (err: any) {
      return {
        state: 'error' as const,
        errorMessage:
          err?.message || (isEs ? 'Error al analizar el XML.' : 'XML parsing failed.')
      };
    }
  }, [xmlInput, isEs]);

  const handleClear = () => setXmlInput('');
  const handleReset = () => setXmlInput(DEFAULT_XML);

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Documento XML de entrada' : 'Input XML Document'}
          subtitle={
            isEs
              ? 'Analiza nodos anidados, atributos (@attributes) y elementos repetidos con DOMParser.'
              : 'Parses nested elements, @attributes, and repeated sibling nodes via native DOMParser.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Código XML' : 'XML Source'}
            htmlFor="xml-to-json-input"
            unit="text/xml"
          >
            <textarea
              id="xml-to-json-input"
              rows={11}
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              placeholder="<root><item>Value</item></root>"
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Nota simple' : 'Default Note',
                onSelect: () => setXmlInput(DEFAULT_XML)
              },
              {
                label: isEs ? 'Anidado y atributos' : 'Nested & Attributes',
                onSelect: () => setXmlInput(NESTED_ATTRIBUTES_XML)
              },
              {
                label: isEs ? 'Etiqueta con texto y atributo' : 'Attribute + Text',
                onSelect: () =>
                  setXmlInput(
                    '<order id="ORD-42">\n  <total currency="USD">129.50</total>\n  <status>confirmed</status>\n</order>'
                  )
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'JSON generado' : 'Generated JSON'}
          state={conversion.state}
          emptyTitle={isEs ? 'Ingresa XML para convertir' : 'Enter XML to convert'}
          emptyDescription={
            isEs
              ? 'Escribe o pega un documento XML válido a la izquierda para ver el JSON equivalente.'
              : 'Type or paste a valid XML document on the left to generate structured JSON.'
          }
          errorTitle={isEs ? 'XML mal formado' : 'Malformed XML'}
          errorMessage={conversion.state === 'error' ? conversion.errorMessage : undefined}
          copyText={conversion.state === 'ready' ? conversion.jsonOutput : undefined}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
        >
          {conversion.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Nodo raíz' : 'Root Element'}
                  value={`<${conversion.rootName}>`}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Líneas JSON' : 'JSON Lines'}
                  value={String(conversion.lineCount)}
                />
              </div>

              <ToolFieldGroup
                label={isEs ? 'Salida JSON' : 'JSON Output'}
                htmlFor="xml-to-json-output"
                unit="application/json"
              >
                <textarea
                  id="xml-to-json-output"
                  rows={11}
                  readOnly
                  value={conversion.jsonOutput}
                  className="ui-input font-mono text-xs leading-relaxed resize-y bg-surface-secondary/60"
                />
              </ToolFieldGroup>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
