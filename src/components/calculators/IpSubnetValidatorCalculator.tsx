import { useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_IP = '192.168.1.1/24';

function intToIpv4(num: number): string {
  const u = num >>> 0;
  return `${(u >>> 24) & 255}.${(u >>> 16) & 255}.${(u >>> 8) & 255}.${u & 255}`;
}

function isValidIpv6(ip: string): boolean {
  if (!ip || ip.includes(':::')) return false;
  const doubleColonParts = ip.split('::');
  if (doubleColonParts.length > 2) return false;
  const left = doubleColonParts[0] ? doubleColonParts[0].split(':') : [];
  const right = doubleColonParts.length === 2 && doubleColonParts[1] ? doubleColonParts[1].split(':') : [];
  const allGroups = [...left, ...right];
  if (doubleColonParts.length === 1 && allGroups.length !== 8) return false;
  if (doubleColonParts.length === 2 && allGroups.length > 7) return false;
  return allGroups.every((group) => /^[0-9a-fA-F]{1,4}$/.test(group));
}

export default function IpSubnetValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_IP);

  const analysis = useMemo(() => {
    const clean = input.trim();
    if (!clean) {
      return { state: 'empty' as const };
    }

    const slashParts = clean.split('/');
    if (slashParts.length > 2) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Formato CIDR inválido: se encontró más de una barra "/".'
          : 'Invalid CIDR notation: multiple "/" characters found.'
      };
    }

    const ipPart = slashParts[0];
    const cidrPart = slashParts[1];

    // Check IPv4
    const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ipPart);
    if (ipv4Match) {
      const octets = ipv4Match.slice(1, 5).map(Number);
      if (octets.some((o) => o < 0 || o > 255)) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? 'Cada octeto IPv4 debe estar entre 0 y 255.'
            : 'Each IPv4 octet must be between 0 and 255.'
        };
      }

      if (cidrPart !== undefined) {
        if (!/^\d+$/.test(cidrPart)) {
          return {
            state: 'error' as const,
            errorMessage: isEs
              ? 'El prefijo CIDR IPv4 debe ser un entero entre 0 y 32.'
              : 'IPv4 CIDR prefix must be an integer between 0 and 32.'
          };
        }
        const prefix = parseInt(cidrPart, 10);
        if (prefix < 0 || prefix > 32) {
          return {
            state: 'error' as const,
            errorMessage: isEs
              ? `Prefijo CIDR /${prefix} fuera de rango (debe ser 0–32).`
              : `CIDR prefix /${prefix} out of range (must be 0–32).`
          };
        }

        const ipInt =
          (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
        const maskInt = prefix === 0 ? 0 : ((0xffffffff << (32 - prefix)) >>> 0);
        const wildcardInt = (~maskInt) >>> 0;
        const networkInt = (ipInt & maskInt) >>> 0;
        const broadcastInt = (networkInt | wildcardInt) >>> 0;

        const totalAddresses = Math.pow(2, 32 - prefix);
        let usableHosts: number;
        let firstUsable: string;
        let lastUsable: string;
        let rangeNote: string | null = null;

        if (prefix === 32) {
          usableHosts = 1;
          firstUsable = intToIpv4(networkInt);
          lastUsable = intToIpv4(networkInt);
          rangeNote = isEs ? 'Ruta de host único (/32)' : 'Single host route (/32)';
        } else if (prefix === 31) {
          usableHosts = 2;
          firstUsable = intToIpv4(networkInt);
          lastUsable = intToIpv4(broadcastInt);
          rangeNote = isEs ? 'Enlace punto a punto RFC 3021 (/31)' : 'RFC 3021 point-to-point link (/31)';
        } else {
          usableHosts = totalAddresses - 2;
          firstUsable = intToIpv4((networkInt + 1) >>> 0);
          lastUsable = intToIpv4((broadcastInt - 1) >>> 0);
        }

        return {
          state: 'ready' as const,
          version: 'IPv4' as const,
          ip: ipPart,
          prefix,
          network: intToIpv4(networkInt),
          broadcast: intToIpv4(broadcastInt),
          subnetMask: intToIpv4(maskInt),
          wildcardMask: intToIpv4(wildcardInt),
          firstUsable,
          lastUsable,
          usableRange: `${firstUsable} – ${lastUsable}`,
          usableHosts,
          totalAddresses,
          rangeNote
        };
      }

      return {
        state: 'ready' as const,
        version: 'IPv4' as const,
        ip: ipPart,
        prefix: null
      };
    }

    // Check IPv6
    if (isValidIpv6(ipPart)) {
      if (cidrPart !== undefined) {
        if (!/^\d+$/.test(cidrPart)) {
          return {
            state: 'error' as const,
            errorMessage: isEs
              ? 'El prefijo CIDR IPv6 debe ser un entero entre 0 y 128.'
              : 'IPv6 CIDR prefix must be an integer between 0 and 128.'
          };
        }
        const prefix = parseInt(cidrPart, 10);
        if (prefix < 0 || prefix > 128) {
          return {
            state: 'error' as const,
            errorMessage: isEs
              ? `Prefijo IPv6 /${prefix} fuera de rango (0–128).`
              : `IPv6 prefix /${prefix} out of range (0–128).`
          };
        }
        return {
          state: 'ready' as const,
          version: 'IPv6' as const,
          ip: ipPart,
          prefix
        };
      }
      return {
        state: 'ready' as const,
        version: 'IPv6' as const,
        ip: ipPart,
        prefix: null
      };
    }

    return {
      state: 'error' as const,
      errorMessage: isEs
        ? 'Dirección IPv4, IPv6 o subred CIDR inválida.'
        : 'Invalid IPv4, IPv6, or CIDR subnet format.'
    };
  }, [input, isEs]);

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_IP);

  const copySummary =
    analysis.state === 'ready'
      ? analysis.version === 'IPv4' && analysis.prefix !== null
        ? `${analysis.ip}/${analysis.prefix} | Network: ${analysis.network} | Broadcast: ${analysis.broadcast} | Mask: ${analysis.subnetMask} | Usable: ${analysis.usableRange} (${analysis.usableHosts.toLocaleString()} hosts)`
        : `Valid ${analysis.version}: ${analysis.ip}${analysis.prefix !== null ? `/${analysis.prefix}` : ''}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador de IP y Subred CIDR' : 'IP & CIDR Subnet Validator'}
          subtitle={
            isEs
              ? 'Valida IPv4/IPv6 y calcula red, broadcast, máscara, rango utilizable y casos límite (/0, /31, /32).'
              : 'Validates IPv4/IPv6 addresses and calculates network, broadcast, masks, usable host range, and edge prefixes (/0, /31, /32).'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Dirección IP o subred CIDR' : 'IP Address or CIDR Subnet'}
            htmlFor="ip-subnet-validator-input"
            unit="IPv4 / IPv6"
          >
            <input
              id="ip-subnet-validator-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="192.168.1.1/24 or 2001:db8::1/64"
              className="ui-input font-mono text-sm"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              { label: '192.168.1.1/24', onSelect: () => setInput('192.168.1.1/24') },
              { label: '10.0.0.1/31 (P2P)', onSelect: () => setInput('10.0.0.1/31') },
              { label: '198.51.100.7/32', onSelect: () => setInput('198.51.100.7/32') },
              { label: '0.0.0.0/0', onSelect: () => setInput('0.0.0.0/0') },
              { label: 'IPv6 /64', onSelect: () => setInput('2001:db8::1/64') }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Análisis de red' : 'Network Analysis'}
          state={analysis.state}
          primaryLabel={isEs ? 'Clasificación IP' : 'IP Classification'}
          primaryValue={
            analysis.state === 'ready'
              ? `${analysis.version}${analysis.prefix !== null ? ` /${analysis.prefix}` : ''}`
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready'
              ? analysis.version === 'IPv4' && analysis.prefix !== null
                ? analysis.rangeNote ||
                  (isEs
                    ? `Rango utilizable: ${analysis.usableRange}`
                    : `Usable host range: ${analysis.usableRange}`)
                : isEs
                  ? `Dirección ${analysis.version} válida: ${analysis.ip}`
                  : `Valid ${analysis.version} address: ${analysis.ip}`
              : undefined
          }
          statusLabel={analysis.state === 'ready' ? (isEs ? 'Válida' : 'Valid') : undefined}
          statusTone="success"
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar subred' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa una IP o CIDR' : 'Enter an IP or CIDR block'}
          emptyDescription={
            isEs
              ? 'Escribe una dirección IPv4/IPv6 o bloque CIDR (ej. 192.168.1.1/24) a la izquierda.'
              : 'Enter an IPv4/IPv6 address or CIDR block (e.g. 192.168.1.1/24) on the left.'
          }
          errorTitle={isEs ? 'IP / Subred Inválida' : 'Invalid IP / Subnet'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' &&
            analysis.version === 'IPv4' &&
            analysis.prefix !== null && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <ToolMetricTile
                    label={isEs ? 'Dirección de red' : 'Network Address'}
                    value={analysis.network}
                    accent
                  />
                  <ToolMetricTile
                    label={isEs ? 'Dirección broadcast' : 'Broadcast Address'}
                    value={analysis.broadcast}
                  />
                </div>

                <ToolBreakdownList
                  items={[
                    {
                      label: isEs ? 'Máscara de subred' : 'Subnet Mask',
                      value: analysis.subnetMask
                    },
                    {
                      label: isEs ? 'Máscara wildcard' : 'Wildcard Mask',
                      value: analysis.wildcardMask
                    },
                    {
                      label: isEs ? 'Rango de hosts utilizables' : 'Usable Host Range',
                      value: analysis.usableRange,
                      highlight: true
                    },
                    {
                      label: isEs ? 'Hosts utilizables' : 'Usable Hosts',
                      value: analysis.usableHosts.toLocaleString()
                    },
                    {
                      label: isEs ? 'Direcciones totales' : 'Total Addresses',
                      value: analysis.totalAddresses.toLocaleString()
                    }
                  ]}
                />
              </div>
            )}

          {analysis.state === 'ready' &&
            (analysis.version === 'IPv6' || analysis.prefix === null) && (
              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Versión de protocolo' : 'Protocol Version',
                    value: analysis.version
                  },
                  {
                    label: isEs ? 'Dirección IP' : 'IP Address',
                    value: analysis.ip,
                    highlight: true
                  },
                  {
                    label: isEs ? 'Prefijo CIDR' : 'CIDR Prefix',
                    value: analysis.prefix !== null ? `/${analysis.prefix}` : isEs ? 'Sin prefijo' : 'None'
                  }
                ]}
              />
            )}
        </ToolResultsPanel>
      }
    />
  );
}
