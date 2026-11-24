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
  fenceLength: '150',
  postSpacing: '8',
  picketWidthInches: '5.5',
  picketGapInches: '0.5',
  railsPerSection: '3',
  wasteFactor: '10'
};

export default function FenceMaterialCalculator() {
  const [fenceLengthStr, setFenceLengthStr] = useState<string>(DEFAULTS.fenceLength);
  const [postSpacingStr, setPostSpacingStr] = useState<string>(DEFAULTS.postSpacing);
  const [picketWidthInchesStr, setPicketWidthInchesStr] = useState<string>(
    DEFAULTS.picketWidthInches
  );
  const [picketGapInchesStr, setPicketGapInchesStr] = useState<string>(DEFAULTS.picketGapInches);
  const [railsPerSectionStr, setRailsPerSectionStr] = useState<string>(DEFAULTS.railsPerSection);
  const [wasteFactorStr, setWasteFactorStr] = useState<string>(DEFAULTS.wasteFactor);

  const lengthId = useId();
  const spacingId = useId();
  const railsId = useId();
  const picketWidId = useId();
  const picketGapId = useId();
  const wasteId = useId();

  const handleReset = () => {
    setFenceLengthStr(DEFAULTS.fenceLength);
    setPostSpacingStr(DEFAULTS.postSpacing);
    setPicketWidthInchesStr(DEFAULTS.picketWidthInches);
    setPicketGapInchesStr(DEFAULTS.picketGapInches);
    setRailsPerSectionStr(DEFAULTS.railsPerSection);
    setWasteFactorStr(DEFAULTS.wasteFactor);
  };

  const handleClear = () => {
    setFenceLengthStr('');
    setPostSpacingStr('');
    setPicketWidthInchesStr('');
    setPicketGapInchesStr('');
    setRailsPerSectionStr('');
    setWasteFactorStr('');
  };

  const isEmpty =
    fenceLengthStr.trim() === '' ||
    postSpacingStr.trim() === '' ||
    picketWidthInchesStr.trim() === '' ||
    picketGapInchesStr.trim() === '' ||
    railsPerSectionStr.trim() === '' ||
    wasteFactorStr.trim() === '';

  const fenceLength = Number(fenceLengthStr);
  const postSpacing = Number(postSpacingStr);
  const picketWidthInches = Number(picketWidthInchesStr);
  const picketGapInches = Number(picketGapInchesStr);
  const railsPerSection = Number(railsPerSectionStr);
  const wasteFactor = Number(wasteFactorStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(fenceLength) || fenceLength <= 0) {
      errors.fenceLength = 'Total fence length must be greater than 0 feet.';
    }
    if (!Number.isFinite(postSpacing) || postSpacing <= 0) {
      errors.postSpacing = 'Post spacing must be greater than 0 feet.';
    }
    if (!Number.isFinite(railsPerSection) || railsPerSection < 0) {
      errors.railsPerSection = 'Rails per section must be 0 or greater.';
    }
    if (!Number.isFinite(picketWidthInches) || picketWidthInches <= 0) {
      errors.picketWidthInches = 'Picket width must be greater than 0 inches.';
    }
    if (!Number.isFinite(picketGapInches) || picketGapInches < 0) {
      errors.picketGapInches = 'Picket gap must be 0 inches or greater.';
    }
    if (!Number.isFinite(wasteFactor) || wasteFactor < 0 || wasteFactor > 100) {
      errors.wasteFactor = 'Waste allowance must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let totalSections = 0;
  let totalPosts = 0;
  let totalPickets = 0;
  let totalRails = 0;

  if (!isEmpty && !hasErrors) {
    totalSections = Math.ceil(fenceLength / postSpacing);
    totalPosts = totalSections + 1;
    const fenceLengthInches = fenceLength * 12;
    const picketSpanInches = picketWidthInches + picketGapInches;
    totalPickets = Math.ceil((fenceLengthInches / picketSpanInches) * (1 + wasteFactor / 100));
    totalRails = Math.ceil(totalSections * railsPerSection * (1 + wasteFactor / 100));
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Fence Material Summary — Posts: ${totalPosts} posts | Rails: ${totalRails} rails | Pickets: ${totalPickets} pickets (${totalSections} sections, ${wasteFactor}% waste)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Fence Line & Picket Specifications"
          subtitle="Estimate required fence posts, horizontal rails, and pickets including waste allowance."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Total Fence Length"
              htmlFor={lengthId}
              unit="ft"
              error={errors.fenceLength}
            >
              <input
                id={lengthId}
                type="number"
                min="0"
                step="any"
                value={fenceLengthStr}
                onChange={(e) => setFenceLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="150"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Post Spacing"
              htmlFor={spacingId}
              unit="ft"
              error={errors.postSpacing}
            >
              <input
                id={spacingId}
                type="number"
                min="0"
                step="any"
                value={postSpacingStr}
                onChange={(e) => setPostSpacingStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="8"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Rails per Section"
              htmlFor={railsId}
              unit="rails"
              error={errors.railsPerSection}
            >
              <input
                id={railsId}
                type="number"
                min="0"
                step="1"
                value={railsPerSectionStr}
                onChange={(e) => setRailsPerSectionStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="3"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Waste Allowance"
              htmlFor={wasteId}
              unit="%"
              error={errors.wasteFactor}
            >
              <input
                id={wasteId}
                type="number"
                min="0"
                step="any"
                value={wasteFactorStr}
                onChange={(e) => setWasteFactorStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="10"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Picket Width"
              htmlFor={picketWidId}
              unit="in"
              error={errors.picketWidthInches}
            >
              <input
                id={picketWidId}
                type="number"
                min="0"
                step="0.1"
                value={picketWidthInchesStr}
                onChange={(e) => setPicketWidthInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="5.5"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Picket Gap"
              htmlFor={picketGapId}
              unit="in"
              error={errors.picketGapInches}
            >
              <input
                id={picketGapId}
                type="number"
                min="0"
                step="0.1"
                value={picketGapInchesStr}
                onChange={(e) => setPicketGapInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="0.5"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Fence Material Estimator Summary"
          state={resultState}
          primaryLabel="Total Pickets Required"
          primaryValue={`${totalPickets} pickets`}
          primarySubtext={`Across ${totalSections} sections (${fenceLength} ft run with ${wasteFactor}% waste)`}
          statusLabel={`${totalPosts} Posts`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter fence dimensions"
          emptyDescription="Provide total fence length, post spacing, rails per section, picket sizing, and waste percentage."
          errorTitle="Invalid fence parameters"
          errorMessage={Object.values(errors)[0] || 'Check fence length, spacing, and picket sizes.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Total Posts Required" value={`${totalPosts} posts`} />
            <ToolMetricTile label="Total Rails Required" value={`${totalRails} rails`} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Fence Sections',
                value: `${totalSections} sections`
              },
              {
                label: 'Total Posts Required',
                value: `${totalPosts} posts`
              },
              {
                label: 'Total Rails Required',
                value: `${totalRails} rails`
              },
              {
                label: 'Total Pickets Required',
                value: `${totalPickets} pickets`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
