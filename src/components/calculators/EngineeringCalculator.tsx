import { useEffect, useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

export type EngTool = 'hydraulic' | 'energy';

interface EngineeringCalculatorProps {
  initialTool?: EngTool;
}

const DEFAULTS = {
  pressurePsi: '2500',
  boreDiameterInches: '3.5',
  massKg: '1200',
  velocityKmh: '60',
  heightM: '25'
};

export default function EngineeringCalculator({ initialTool = 'hydraulic' }: EngineeringCalculatorProps) {
  const [tool, setTool] = useState<EngTool>(initialTool);

  useEffect(() => {
    setTool(initialTool);
  }, [initialTool]);

  const [pressureStr, setPressureStr] = useState<string>(DEFAULTS.pressurePsi);
  const [boreStr, setBoreStr] = useState<string>(DEFAULTS.boreDiameterInches);
  const [massStr, setMassStr] = useState<string>(DEFAULTS.massKg);
  const [velocityStr, setVelocityStr] = useState<string>(DEFAULTS.velocityKmh);
  const [heightStr, setHeightStr] = useState<string>(DEFAULTS.heightM);

  const pressureId = useId();
  const boreId = useId();
  const massId = useId();
  const velocityId = useId();
  const heightId = useId();

  const handleReset = () => {
    if (tool === 'hydraulic') {
      setPressureStr(DEFAULTS.pressurePsi);
      setBoreStr(DEFAULTS.boreDiameterInches);
    } else {
      setMassStr(DEFAULTS.massKg);
      setVelocityStr(DEFAULTS.velocityKmh);
      setHeightStr(DEFAULTS.heightM);
    }
  };

  const handleClear = () => {
    if (tool === 'hydraulic') {
      setPressureStr('');
      setBoreStr('');
    } else {
      setMassStr('');
      setVelocityStr('');
      setHeightStr('');
    }
  };

  const modeTabs = (
    <ToolSegmentedControl
      ariaLabel="Engineering calculation mode"
      value={tool}
      onChange={setTool}
      options={[
        { value: 'hydraulic', label: 'Hydraulic Cylinder Force (F = P × A)' },
        { value: 'energy', label: 'Kinetic & Potential Energy (½mv², mgh)' }
      ]}
    />
  );

  if (tool === 'hydraulic') {
    const isEmpty = pressureStr.trim() === '' || boreStr.trim() === '';
    const pressurePsi = Number(pressureStr);
    const boreDiameterInches = Number(boreStr);

    const errors: Record<string, string> = {};
    if (!isEmpty) {
      if (!Number.isFinite(pressurePsi) || pressurePsi <= 0) {
        errors.pressure = 'Operating pressure must be greater than 0 PSI.';
      }
      if (!Number.isFinite(boreDiameterInches) || boreDiameterInches <= 0) {
        errors.bore = 'Bore diameter must be greater than 0 inches.';
      }
    }
    const hasErrors = Object.keys(errors).length > 0;

    const pistonAreaSqInches =
      !isEmpty && !hasErrors ? Math.PI * Math.pow(boreDiameterInches / 2, 2) : 0;
    const forceLbf = !isEmpty && !hasErrors ? pressurePsi * pistonAreaSqInches : 0;
    const forceNewtons = forceLbf * 4.44822;
    const forceTons = forceLbf / 2000;

    const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
    const copyText = `Hydraulic Cylinder Force (${pressurePsi} PSI, ${boreDiameterInches} in bore): ${forceLbf.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbf (${forceTons.toFixed(2)} US Tons) | Area: ${pistonAreaSqInches.toFixed(3)} sq in | SI: ${forceNewtons.toLocaleString(undefined, { maximumFractionDigits: 0 })} N (${(forceNewtons / 1000).toFixed(2)} kN)`;

    return (
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title="Hydraulic Parameters"
            subtitle="Compute theoretical cylinder push force in lbf, US tons, Newtons, and kilonewtons."
            onReset={handleReset}
            onClear={handleClear}
          >
            <div className="overflow-x-auto pb-1">{modeTabs}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Operating Pressure" htmlFor={pressureId} unit="PSI" error={errors.pressure}>
                <input
                  id={pressureId}
                  type="number"
                  min="1"
                  step="any"
                  value={pressureStr}
                  onChange={(e) => setPressureStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="2500"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Cylinder Bore Diameter" htmlFor={boreId} unit="Inches" error={errors.bore}>
                <input
                  id={boreId}
                  type="number"
                  min="0.1"
                  step="0.25"
                  value={boreStr}
                  onChange={(e) => setBoreStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="3.5"
                />
              </ToolFieldGroup>
            </div>

            <p className="text-xs font-mono text-text-tertiary">
              Formula: Piston Area A = π × (d/2)², Force F = Pressure × Area
            </p>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title="Theoretical Cylinder Force"
            state={resultState}
            primaryLabel="Total Theoretical Force"
            primaryValue={forceLbf.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            primaryUnit="lbf"
            primarySubtext={`Equivalent to ${forceTons.toFixed(2)} US Tons of force`}
            copyText={copyText}
            emptyTitle="Enter hydraulic parameters"
            emptyDescription="Provide operating pressure (PSI) and bore diameter (inches) to calculate piston force."
            errorTitle="Invalid hydraulic inputs"
            errorMessage={Object.values(errors)[0] || 'Pressure and bore diameter must be greater than zero.'}
          >
            <div className="grid grid-cols-2 gap-3">
              <ToolMetricTile label="US Tons" value={`${forceTons.toFixed(2)} tons`} accent />
              <ToolMetricTile label="Kilonewtons" value={`${(forceNewtons / 1000).toFixed(2)} kN`} />
            </div>

            <ToolBreakdownList
              items={[
                { label: 'Effective Piston Area', value: `${pistonAreaSqInches.toFixed(3)} sq in` },
                {
                  label: 'Force in Newtons (SI)',
                  value: `${forceNewtons.toLocaleString(undefined, { maximumFractionDigits: 0 })} N`,
                  highlight: true
                },
                { label: 'Kilonewtons', value: `${(forceNewtons / 1000).toFixed(2)} kN` }
              ]}
            />
          </ToolResultsPanel>
        }
      />
    );
  }

  // Kinetic & Potential Energy
  const isEmpty = massStr.trim() === '' || velocityStr.trim() === '' || heightStr.trim() === '';
  const massKg = Number(massStr);
  const velocityKmh = Number(velocityStr);
  const heightM = Number(heightStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(massKg) || massKg <= 0) errors.mass = 'Mass must be greater than 0 kg.';
    if (!Number.isFinite(velocityKmh) || velocityKmh < 0) errors.velocity = 'Velocity must be 0 or greater.';
    if (!Number.isFinite(heightM) || heightM < 0) errors.height = 'Height must be 0 or greater.';
  }
  const hasErrors = Object.keys(errors).length > 0;

  const velocityMs = !isEmpty && !hasErrors ? (velocityKmh * 1000) / 3600 : 0;
  const kineticEnergyJoules = !isEmpty && !hasErrors ? 0.5 * massKg * Math.pow(velocityMs, 2) : 0;
  const potentialEnergyJoules = !isEmpty && !hasErrors ? massKg * 9.80665 * heightM : 0;
  const totalEnergyKj = (kineticEnergyJoules + potentialEnergyJoules) / 1000;

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Mechanical Energy (${massKg} kg, ${velocityKmh} km/h, ${heightM} m): Kinetic Energy = ${(kineticEnergyJoules / 1000).toFixed(2)} kJ | Potential Energy = ${(potentialEnergyJoules / 1000).toFixed(2)} kJ | Total Mechanical Energy = ${totalEnergyKj.toFixed(2)} kJ`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Motion & Position"
          subtitle="Calculate kinetic energy (½mv²), gravitational potential energy (mgh), and total mechanical energy."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="overflow-x-auto pb-1">{modeTabs}</div>

          <ToolFieldGroup label="Mass" htmlFor={massId} unit="kg" error={errors.mass}>
            <input
              id={massId}
              type="number"
              min="0.1"
              step="any"
              value={massStr}
              onChange={(e) => setMassStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="1200"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Velocity" htmlFor={velocityId} unit="km/h" error={errors.velocity}>
              <input
                id={velocityId}
                type="number"
                min="0"
                step="any"
                value={velocityStr}
                onChange={(e) => setVelocityStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="60"
              />
            </ToolFieldGroup>
            <ToolFieldGroup label="Height" htmlFor={heightId} unit="meters" error={errors.height}>
              <input
                id={heightId}
                type="number"
                min="0"
                step="any"
                value={heightStr}
                onChange={(e) => setHeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="25"
              />
            </ToolFieldGroup>
          </div>

          <p className="text-xs font-mono text-text-tertiary">
            Kinetic Energy: KE = ½mv², Gravitational Potential Energy: PE = mgh (g = 9.80665 m/s²)
          </p>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Mechanical Energy Summary"
          state={resultState}
          primaryLabel="Total Mechanical Energy (KE + PE)"
          primaryValue={totalEnergyKj.toFixed(2)}
          primaryUnit="kJ"
          primarySubtext={`Velocity: ${velocityMs.toFixed(2)} m/s`}
          copyText={copyText}
          emptyTitle="Enter mass, velocity, and height"
          emptyDescription="Provide mass, velocity, and height to compute kinetic and potential energy."
          errorTitle="Invalid energy inputs"
          errorMessage={Object.values(errors)[0] || 'Check mass, velocity, and height values.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Kinetic Energy" value={`${(kineticEnergyJoules / 1000).toFixed(2)} kJ`} accent />
            <ToolMetricTile label="Potential Energy" value={`${(potentialEnergyJoules / 1000).toFixed(2)} kJ`} accent />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Kinetic Energy (KE)', value: `${(kineticEnergyJoules / 1000).toFixed(2)} kJ` },
              { label: 'Potential Energy (PE)', value: `${(potentialEnergyJoules / 1000).toFixed(2)} kJ` },
              { label: 'Total Mechanical Energy (KE + PE)', value: `${totalEnergyKj.toFixed(2)} kJ`, highlight: true }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
