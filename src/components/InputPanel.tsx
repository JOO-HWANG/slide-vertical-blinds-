import React, { useState } from 'react';
import { BlindInput, ShapeType } from '../types/blind';
import { PRESET_JOBS } from '../utils/calculator';
import { Sliders, RotateCcw, Building, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface InputPanelProps {
  input: BlindInput;
  onChange: (updated: Partial<BlindInput>) => void;
  onReset: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ input, onChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFabricWidthChange = (val: 89 | 127) => {
    const defaultPitch = val === 89 ? 76 : 115;
    onChange({ fabricWidth: val, pitch: defaultPitch });
  };

  const handleShapeChange = (shape: ShapeType) => {
    if (shape === 'right_high' && input.heightLeft > input.heightRight) {
      // Swap or adjust if needed
      onChange({ shapeType: shape, heightLeft: input.heightRight, heightRight: input.heightLeft });
    } else if (shape === 'left_high' && input.heightLeft < input.heightRight) {
      onChange({ shapeType: shape, heightLeft: input.heightRight, heightRight: input.heightLeft });
    } else {
      onChange({ shapeType: shape });
    }
  };

  const applyPreset = (idx: number) => {
    const preset = PRESET_JOBS[idx];
    if (preset) {
      onChange({ ...preset.input });
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-6">
      {/* Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Factory Preset Specification</span>
          </label>
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PRESET_JOBS.map((preset, idx) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(idx)}
              className="text-left p-2.5 rounded-lg border border-neutral-800 bg-neutral-850 hover:bg-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group"
            >
              <div className="text-xs font-medium text-neutral-200 group-hover:text-amber-400 truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Window Dimensions */}
      <div className="space-y-4 pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-xs font-mono flex items-center justify-center font-bold">
              1
            </span>
            <span>Opening Dimensions (mm)</span>
          </h2>
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => handleShapeChange('right_high')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                input.shapeType === 'right_high'
                  ? 'bg-neutral-800 text-amber-400 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Right High ↗
            </button>
            <button
              type="button"
              onClick={() => handleShapeChange('left_high')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                input.shapeType === 'left_high'
                  ? 'bg-neutral-800 text-amber-400 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Left High ↘
            </button>
            <button
              type="button"
              onClick={() => handleShapeChange('gable_peak')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                input.shapeType === 'gable_peak'
                  ? 'bg-neutral-800 text-amber-400 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Gable Apex ∧
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 flex justify-between">
              <span>Overall Width (W)</span>
              <span className="text-neutral-500 font-mono">mm</span>
            </label>
            <input
              type="number"
              min="200"
              max="15000"
              step="10"
              value={input.width || ''}
              onChange={(e) => onChange({ width: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-right focus:outline-none focus:border-amber-500 text-sm"
              placeholder="2000"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 flex justify-between">
              <span>Left Height / Drop (HL)</span>
              <span className="text-neutral-500 font-mono">mm</span>
            </label>
            <input
              type="number"
              min="200"
              max="15000"
              step="10"
              value={input.heightLeft || ''}
              onChange={(e) => onChange({ heightLeft: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-right focus:outline-none focus:border-amber-500 text-sm"
              placeholder="1500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 flex justify-between">
              <span>Right Height / Drop (HR)</span>
              <span className="text-neutral-500 font-mono">mm</span>
            </label>
            <input
              type="number"
              min="200"
              max="15000"
              step="10"
              value={input.heightRight || ''}
              onChange={(e) => onChange({ heightRight: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-right focus:outline-none focus:border-amber-500 text-sm"
              placeholder="2100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 flex justify-between">
              <span>Louvre Fabric Width</span>
              <span className="text-neutral-500">Profile</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleFabricWidthChange(89)}
                className={`py-2 rounded-lg font-mono text-xs font-semibold border transition-all cursor-pointer ${
                  input.fabricWidth === 89
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                89mm (Standard)
              </button>
              <button
                type="button"
                onClick={() => handleFabricWidthChange(127)}
                className={`py-2 rounded-lg font-mono text-xs font-semibold border transition-all cursor-pointer ${
                  input.fabricWidth === 127
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                127mm (Wide)
              </button>
            </div>
          </div>
        </div>

        {/* Gable peak conditional inputs */}
        {input.shapeType === 'gable_peak' && (
          <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-300 font-medium flex justify-between">
                <span>Apex Peak Height (H_peak)</span>
                <span className="text-neutral-500 font-mono">mm</span>
              </label>
              <input
                type="number"
                min={Math.max(input.heightLeft, input.heightRight)}
                value={input.gablePeakHeight || Math.max(input.heightLeft, input.heightRight) + 300}
                onChange={(e) => onChange({ gablePeakHeight: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-white font-mono text-right"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-300 font-medium flex justify-between">
                <span>Apex Peak Position (X_peak)</span>
                <span className="text-neutral-500 font-mono">
                  {Math.round((input.gablePeakRatio || 0.5) * 100)}% (
                  {Math.round(input.width * (input.gablePeakRatio || 0.5))}mm)
                </span>
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={input.gablePeakRatio || 0.5}
                onChange={(e) => onChange({ gablePeakRatio: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Factory Tolerances & Hem Allowances */}
      <div className="space-y-4 pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-xs font-mono flex items-center justify-center font-bold">
              2
            </span>
            <span>Factory Allowances & Hem Deductions (mm)</span>
          </h2>
          <span className="text-xs text-neutral-500">Drop = Open - Deductions | Cut = Drop + Hems</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400" title="Rail body & carrier hook deduction">
              Top Rail Deduction (d_top)
            </label>
            <input
              type="number"
              min="0"
              max="150"
              value={input.dTop || 0}
              onChange={(e) => onChange({ dTop: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-right text-xs focus:border-amber-500 focus:outline-none"
            />
            <div className="text-[10px] text-neutral-500">Std: 45mm (Track + Hook)</div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400" title="Clearance above sill/floor">
              Floor Clearance (d_bottom)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={input.dBottom || 0}
              onChange={(e) => onChange({ dBottom: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-right text-xs focus:border-amber-500 focus:outline-none"
            />
            <div className="text-[10px] text-neutral-500">Std: 15mm clearance</div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400" title="Top fold for hanger clip insert">
              Top Hem / Fold (f_top)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={input.fTop || 0}
              onChange={(e) => onChange({ fTop: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-right text-xs focus:border-amber-500 focus:outline-none"
            />
            <div className="text-[10px] text-neutral-500">Std: 20mm hanger fold</div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400" title="Bottom pocket for weight plate">
              Bottom Pocket (f_bottom)
            </label>
            <input
              type="number"
              min="0"
              max="150"
              value={input.fBottom || 0}
              onChange={(e) => onChange({ fBottom: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-right text-xs focus:border-amber-500 focus:outline-none"
            />
            <div className="text-[10px] text-neutral-500">Std: 50mm weight pocket</div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400" title="Carrier link pitch spacing">
              Carrier Pitch (p)
            </label>
            <input
              type="number"
              min="40"
              max="160"
              value={input.pitch || 76}
              onChange={(e) => onChange({ pitch: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-right text-xs focus:border-amber-500 focus:outline-none"
            />
            <div className="text-[10px] text-neutral-500">
              {input.fabricWidth === 89 ? '89mm: 76mm rec.' : '127mm: 115mm rec.'}
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Job Order & Production Metadata */}
      <div className="pt-2 border-t border-neutral-800">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs font-semibold text-neutral-300 py-1 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-neutral-400" />
            <span>Job Order & Specification Details (Project, LOT, Control & Stack)</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
            <div className="space-y-1">
              <label className="text-neutral-400">Project / Job Name</label>
              <input
                type="text"
                value={input.projectName}
                onChange={(e) => onChange({ projectName: e.target.value })}
                placeholder="e.g. Master Bedroom Void"
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400">Customer / Account</label>
              <input
                type="text"
                value={input.customerName}
                onChange={(e) => onChange({ customerName: e.target.value })}
                placeholder="e.g. Acme Blinds & Interiors"
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400">Fabric Code & Colour</label>
              <input
                type="text"
                value={input.fabricCode}
                onChange={(e) => onChange({ fabricCode: e.target.value })}
                placeholder="e.g. VS-301 Ivory 3%"
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400">Work Order / LOT No.</label>
              <input
                type="text"
                value={input.orderNo}
                onChange={(e) => onChange({ orderNo: e.target.value })}
                placeholder="e.g. WO-202610-01"
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400">Control Operation</label>
              <select
                value={input.controlSide}
                onChange={(e) => onChange({ controlSide: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
              >
                <option value="left">Left Hand Control</option>
                <option value="right">Right Hand Control</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400">Stack / Bunch Direction</label>
              <select
                value={input.stackType}
                onChange={(e) => onChange({ stackType: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
              >
                <option value="high_side">High Side Stack (Recommended)</option>
                <option value="low_side">Low Side Stack</option>
                <option value="split">Center Split Draw (Pair)</option>
                <option value="left">Left Hand Stack</option>
                <option value="right">Right Hand Stack</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-neutral-400">Special Workshop Notes</label>
              <input
                type="text"
                value={input.notes}
                onChange={(e) => onChange({ notes: e.target.value })}
                placeholder="e.g. Bunch towards high side. Include top mounting brackets."
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
