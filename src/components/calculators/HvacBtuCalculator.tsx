import { useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  roomSqFt: '500',
  ceilingHeight: '8',
  climateMultiplier: '1',
  insulationQuality: '1',
  occupants: '2'
};

export default function HvacBtuCalculator() {
  const [roomSqFtStr, setRoomSqFtStr] = useState<string>(DEFAULTS.roomSqFt);
  const [ceilingHeightStr, setCeilingHeightStr] = useState<string>(DEFAULTS.ceilingHeight);
  const [climateMultiplierStr, setClimateMultiplierStr] = useState<string>(
    DEFAULTS.climateMultiplier
  );
  const [insulationQualityStr, setInsulationQualityStr] = useState<string>(
    DEFAULTS.insulationQuality
  );
  const [occupantsStr, setOccupantsStr] = useState<string>(DEFAULTS.occupants);

  const areaId = useId();
  const ceilingId = useId();
  const occupantsId = useId();
  const climateId = useId();
  const insulationId = useId();

  const handleReset = () => {
    setRoomSqFtStr(DEFAULTS.roomSqFt);
    setCeilingHeightStr(DEFAULTS.ceilingHeight);
    setClimateMultiplierStr(DEFAULTS.climateMultiplier);
    setInsulationQualityStr(DEFAULTS.insulationQuality);
    setOccupantsStr(DEFAULTS.occupants);
  };

  const handleClear = () => {
    setRoomSqFtStr('');
    setCeilingHeightStr('');
    setOccupantsStr('');
  };

  const isEmpty =
    roomSqFtStr.trim() === '' || ceilingHeightStr.trim() === '' || occupantsStr.trim() === '';

  const roomSqFt = Number(roomSqFtStr);
  const ceilingHeight = Number(ceilingHeightStr);
  const climateMultiplier = Number(climateMultiplierStr);
  const insulationQuality = Number(insulationQualityStr);
  const occupants = Number(occupantsStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(roomSqFt) || roomSqFt <= 0) {
      errors.roomSqFt = 'Room square footage must be greater than 0 sq ft.';
    }
    if (!Number.isFinite(ceilingHeight) || ceilingHeight <= 0) {
      errors.ceilingHeight = 'Ceiling height must be greater than 0 feet.';
    }
    if (!Number.isFinite(occupants) || occupants < 0) {
      errors.occupants = 'Number of regular occupants must be 0 or greater.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let rawBtu = 0;
  let occupantBtu = 0;
  let totalCoolingBtu = 0;
  let estimatedTons = 0;

  if (!isEmpty && !hasErrors) {
    const baseBtuPerSqFt = 25;
    rawBtu =
      roomSqFt * baseBtuPerSqFt * (ceilingHeight / 8) * climateMultiplier * insulationQuality;
    occupantBtu = occupants * 600;
    totalCoolingBtu = Math.round(rawBtu + occupantBtu);
    estimatedTons = Number((totalCoolingBtu / 12000).toFixed(2));
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `HVAC BTU Summary — Required Cooling Capacity: ${totalCoolingBtu.toLocaleString()} BTU/hr | Estimated AC Tonnage: ${estimatedTons} Tons (${roomSqFt.toLocaleString()} sq ft, ${ceilingHeight} ft ceiling, ${occupants} occupants)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Room Dimensions, Climate & Insulation"
          subtitle="Estimate required air conditioning BTU load and tonnage for a conditioned space."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Room Square Footage"
              htmlFor={areaId}
              unit="sq ft"
              error={errors.roomSqFt}
            >
              <input
                id={areaId}
                type="number"
                min="0"
                step="any"
                value={roomSqFtStr}
                onChange={(e) => setRoomSqFtStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="500"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Ceiling Height"
              htmlFor={ceilingId}
              unit="ft"
              error={errors.ceilingHeight}
            >
              <input
                id={ceilingId}
                type="number"
                min="0"
                step="any"
                value={ceilingHeightStr}
                onChange={(e) => setCeilingHeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="8"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Regular Occupants"
              htmlFor={occupantsId}
              unit="people"
              error={errors.occupants}
            >
              <input
                id={occupantsId}
                type="number"
                min="0"
                step="1"
                value={occupantsStr}
                onChange={(e) => setOccupantsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="2"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Climate Zone Factor" htmlFor={climateId}>
              <select
                id={climateId}
                value={climateMultiplierStr}
                onChange={(e) => setClimateMultiplierStr(e.target.value)}
                className="ui-input"
              >
                <option value="0.9">Cool / Mild Climate</option>
                <option value="1">Moderate Climate (Standard)</option>
                <option value="1.15">Hot &amp; Sunny Climate</option>
                <option value="1.3">Very Hot / Humid Climate</option>
              </select>
            </ToolFieldGroup>

            <ToolFieldGroup label="Insulation Quality" htmlFor={insulationId}>
              <select
                id={insulationId}
                value={insulationQualityStr}
                onChange={(e) => setInsulationQualityStr(e.target.value)}
                className="ui-input"
              >
                <option value="0.85">Well Insulated (Shaded / Modern)</option>
                <option value="1">Average Insulation</option>
                <option value="1.2">Poorly Insulated / Sunny Room</option>
              </select>
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            Estimates provide a generalized room BTU requirement. Professional Manual J calculations
            factor in duct leakage, exact solar orientation, and thermal bridging.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="HVAC BTU & Cooling Capacity Summary"
          state={resultState}
          primaryLabel="Required Cooling Capacity"
          primaryValue={`${totalCoolingBtu.toLocaleString()} BTU/hr`}
          primarySubtext={`Equivalent to ${estimatedTons} Tons of cooling (1 Ton = 12,000 BTU/hr)`}
          statusLabel={`${estimatedTons} Tons`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter room dimensions"
          emptyDescription="Provide square footage, ceiling height, and regular occupants to calculate required cooling BTU/hr and tonnage."
          errorTitle="Invalid HVAC load inputs"
          errorMessage={Object.values(errors)[0] || 'Check room dimensions and occupant count.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Base Space Load"
              value={`${Math.round(rawBtu).toLocaleString()} BTU/hr`}
            />
            <ToolMetricTile label="Estimated AC Tonnage" value={`${estimatedTons} Tons`} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Base Space Cooling Load',
                value: `${Math.round(rawBtu).toLocaleString()} BTU/hr`
              },
              {
                label: 'Occupant Sensible Gain (600 BTU/ea)',
                value: `${Math.round(occupantBtu).toLocaleString()} BTU/hr`
              },
              {
                label: 'Estimated AC Tonnage',
                value: `${estimatedTons} Tons`
              },
              {
                label: 'Required Cooling Capacity',
                value: `${totalCoolingBtu.toLocaleString()} BTU/hr`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
