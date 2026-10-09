import React, { useState } from 'react';
import { CalculationResult, MaterialCostConfig } from '../types/blind';
import { formatUSD } from '../utils/calculator';
import { DollarSign, Copy, Check, Sparkles, Percent, RotateCcw } from 'lucide-react';

interface CostEstimatorProps {
  result: CalculationResult;
  costConfig: MaterialCostConfig;
  onChangeCostConfig: (updated: Partial<MaterialCostConfig>) => void;
  onResetCostConfig: () => void;
}

const COST_PRESETS: Array<{
  name: string;
  fabricCost: number;
  desc: string;
}> = [
  { name: 'Standard Sunscreen 3%', fabricCost: 3.5, desc: 'Commercial sunscreen ($3.50 / m)' },
  { name: 'Premium Blockout FR', fabricCost: 6.8, desc: 'Fire-retardant blockout ($6.80 / m)' },
  { name: 'Designer Linen Jacquard', fabricCost: 12.5, desc: 'High-end textured weave ($12.50 / m)' },
];

export const CostEstimator: React.FC<CostEstimatorProps> = ({
  result,
  costConfig,
  onChangeCostConfig,
  onResetCostConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const cost = result.costBreakdown;

  // Percentage calculations for visual bar
  const totalMfg = Math.max(0.01, cost.totalManufacturingCost);
  const fabricPct = Math.round((cost.fabricCost / totalMfg) * 100);
  const railMechCost = cost.headrailCost + cost.controlKitCost;
  const railMechPct = Math.round((railMechCost / totalMfg) * 100);
  const accessoriesPct = Math.round((cost.accessoriesSubtotal / totalMfg) * 100);
  const laborExtraCost = cost.assemblyLaborCost + cost.additionalCost;
  const laborExtraPct = Math.max(0, 100 - fabricPct - railMechPct - accessoriesPct);

  const handleCopyQuote = () => {
    const text = [
      `[SLOPED VERTICAL BLIND BILL OF MATERIALS & COST SCHEDULE ($ AUD)]`,
      `Specification: ${result.totalSlats} sheets / Track ${result.railLength} mm / Slope ${result.angleDeg}°`,
      `Fabric Required: ${cost.fabricBillableMeters} m ($${costConfig.fabricCostPerMeter.toFixed(2)} / m)`,
      `----------------------------------------`,
      `1. Fabric Bill of Material: ${formatUSD(cost.fabricCost)}`,
      `2. Sloped Aluminium Headrail (${cost.headrailBillableMeters} m): ${formatUSD(cost.headrailCost)}`,
      `3. Slat Components (Weights + Hangers + Chains × ${result.totalSlats} sheets): ${formatUSD(cost.accessoriesSubtotal)}`,
      `   - Bottom Weight Plates (${result.totalSlats} EA): ${formatUSD(cost.bottomWeightsCost)}`,
      `   - Top Hanger Clips (${result.totalSlats} EA): ${formatUSD(cost.topHangersCost)}`,
      `   - Bottom Link Chains (${result.totalSlats} sheets): ${formatUSD(cost.bottomChainCost)}`,
      `4. Sloped Tilt Gear & Control Kit (1 set): ${formatUSD(cost.controlKitCost)}`,
      cost.additionalCost > 0 ? `5. Additional Hardware (${costConfig.additionalCostLabel}): ${formatUSD(cost.additionalCost)}` : '',
      `----------------------------------------`,
      `▶ Net Direct Material Cost: ${formatUSD(cost.totalMaterialCost)} (Avg ${formatUSD(cost.totalMaterialCost / result.totalSlats)} / sheet)`,
      `▶ Fabrication & Assembly Labor: ${formatUSD(cost.assemblyLaborCost)}`,
      `▶ Total Direct Manufacturing Cost: ${formatUSD(cost.totalManufacturingCost)}`,
      `▶ Wholesale Price Ex GST (${costConfig.marginPercent}% Markup): ${formatUSD(cost.suggestedSalePrice)}`,
      costConfig.includeVat ? `▶ Final Invoice Total Inc 10% GST: ${formatUSD(cost.finalSalePriceWithVat)}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-6">
      {/* Header & Preset Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Bill of Materials (BOM) & Material Cost Estimation ($ AUD)</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time calculation of fabric, aluminium headrail, components, and labor in Australian Dollars ($).
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onResetCostConfig}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-800"
            title="Reset unit rates to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Costs</span>
          </button>
          <button
            type="button"
            onClick={handleCopyQuote}
            className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quotation Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Quotation ($)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Fabric Presets */}
      <div>
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Fabric Cost Presets ($ / m)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {COST_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChangeCostConfig({ fabricCostPerMeter: preset.fabricCost })}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                costConfig.fabricCostPerMeter === preset.fabricCost
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{preset.name}</span>
                <span className="font-mono text-xs font-bold">{formatUSD(preset.fabricCost)} / m</span>
              </div>
              <div className="text-[10px] text-neutral-500 truncate mt-0.5">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Cost Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {/* 1. Fabric Cost Input */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>1. Fabric Material</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-400">
              {formatUSD(cost.fabricCost)}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 flex justify-between">
              <span>Unit Rate per Linear Metre</span>
              <span className="font-mono text-neutral-500">$ / m</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">$</span>
              <input
                type="number"
                min="0"
                step="0.10"
                value={costConfig.fabricCostPerMeter}
                onChange={(e) => onChangeCostConfig({ fabricCostPerMeter: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono text-right focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1 border-t border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Billable Quantity:</span>
              <span className="font-mono text-neutral-200">{cost.fabricBillableMeters} m</span>
            </div>
            <label className="flex items-center gap-2 text-[10px] text-neutral-400 cursor-pointer">
              <input
                type="checkbox"
                checked={costConfig.useWasteLengthForCost}
                onChange={(e) => onChangeCostConfig({ useWasteLengthForCost: e.target.checked })}
                className="rounded accent-emerald-500"
              />
              <span>Include +5% waste allowance in costing</span>
            </label>
          </div>
        </div>

        {/* 2. Headrail & Sloped Mechanism */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>2. Headrail & Mechanism</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-sky-400">
              {formatUSD(cost.headrailCost + cost.controlKitCost)}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 flex justify-between">
              <span>Aluminium Headrail Profile</span>
              <span className="font-mono text-neutral-500">Cut: {cost.headrailBillableMeters} m</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">$</span>
              <input
                type="number"
                min="0"
                step="0.50"
                value={costConfig.headrailCostPerMeter}
                onChange={(e) => onChangeCostConfig({ headrailCostPerMeter: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono text-right focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 flex justify-between">
              <span>Sloped Tilt Gear & Control Kit</span>
              <span className="font-mono text-neutral-500">$ / set</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">$</span>
              <input
                type="number"
                min="0"
                step="0.50"
                value={costConfig.slopedControlKitCost}
                onChange={(e) => onChangeCostConfig({ slopedControlKitCost: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono text-right focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Per-Slat Accessories */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>3. Slat Hardware ({result.totalSlats} sheets)</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-400">
              {formatUSD(cost.accessoriesSubtotal)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="space-y-0.5">
              <label className="text-[10px] text-neutral-400 block truncate" title="Bottom weight plate">
                Weights ($ / EA)
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={costConfig.bottomWeightCostPerUnit}
                onChange={(e) => onChangeCostConfig({ bottomWeightCostPerUnit: Number(e.target.value) || 0 })}
                className="w-full px-1.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono text-right"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] text-neutral-400 block truncate" title="Top hanger hook clip">
                Hangers ($ / EA)
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={costConfig.topHangerCostPerUnit}
                onChange={(e) => onChangeCostConfig({ topHangerCostPerUnit: Number(e.target.value) || 0 })}
                className="w-full px-1.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono text-right"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] text-neutral-400 block truncate" title="Bottom link spacer chain">
                Chain ($ / sheet)
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={costConfig.bottomChainCostPerUnit}
                onChange={(e) => onChangeCostConfig({ bottomChainCostPerUnit: Number(e.target.value) || 0 })}
                className="w-full px-1.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono text-right"
              />
            </div>
          </div>

          <div className="pt-1 border-t border-neutral-850 text-[10px] text-neutral-400 flex justify-between">
            <span>Per Slat Hardware Total:</span>
            <span className="font-mono text-neutral-200">
              {formatUSD(costConfig.bottomWeightCostPerUnit + costConfig.topHangerCostPerUnit + costConfig.bottomChainCostPerUnit)} / sheet
            </span>
          </div>
        </div>

        {/* 4. Labor & Margin Settings */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>4. Labor & Markup</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-purple-400">
              Labor {formatUSD(cost.assemblyLaborCost)}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 flex justify-between">
              <span>Fabrication & Assembly Labor</span>
              <span className="font-mono text-neutral-500">$ / set</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">$</span>
              <input
                type="number"
                min="0"
                step="1.0"
                value={costConfig.assemblyLaborCost}
                onChange={(e) => onChangeCostConfig({ assemblyLaborCost: Number(e.target.value) || 0 })}
                className="w-full pl-6 pr-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono text-right focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Percent className="w-3 h-3" />
                <span>Markup (%)</span>
              </label>
              <input
                type="number"
                min="0"
                max="200"
                step="5"
                value={costConfig.marginPercent}
                onChange={(e) => onChangeCostConfig({ marginPercent: Number(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono text-right"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={costConfig.includeVat}
                  onChange={(e) => onChangeCostConfig({ includeVat: e.target.checked })}
                  className="rounded accent-purple-500"
                />
                <span>Include 10% GST (AU)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Proportion Bar */}
      <div className="space-y-1.5 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Manufacturing Direct Cost Composition</span>
          <span className="font-mono">Direct Production Cost: {formatUSD(cost.totalManufacturingCost)}</span>
        </div>
        <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${fabricPct}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Fabric: ${fabricPct}%`}
          />
          <div
            style={{ width: `${railMechPct}%` }}
            className="bg-sky-500 h-full transition-all"
            title={`Track/Kit: ${railMechPct}%`}
          />
          <div
            style={{ width: `${accessoriesPct}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Accessories: ${accessoriesPct}%`}
          />
          <div
            style={{ width: `${laborExtraPct}%` }}
            className="bg-purple-500 h-full transition-all"
            title={`Labor: ${laborExtraPct}%`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Fabric {fabricPct}% ({formatUSD(cost.fabricCost)})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Track & Gear {railMechPct}% ({formatUSD(railMechCost)})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Components {accessoriesPct}% ({formatUSD(cost.accessoriesSubtotal)})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Labor {laborExtraPct}% ({formatUSD(laborExtraCost)})</span>
          </span>
        </div>
      </div>

      {/* Cost Summary Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5">
          <span className="text-[11px] text-neutral-400 block">Net Direct Material Cost</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-neutral-100 tabular-nums">
              {formatUSD(cost.totalMaterialCost)}
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 block mt-0.5">
            Average {formatUSD(cost.totalMaterialCost / result.totalSlats)} / sheet
          </span>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5">
          <span className="text-[11px] text-neutral-400 block">Total Manufacturing Cost</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-sky-400 tabular-nums">
              {formatUSD(cost.totalManufacturingCost)}
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 block mt-0.5">
            Includes {formatUSD(cost.assemblyLaborCost)} Labor / set
          </span>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5">
          <span className="text-[11px] text-neutral-400 block">Wholesale Price (Ex GST)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-amber-300 tabular-nums">
              {formatUSD(cost.suggestedSalePrice)}
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 block mt-0.5">
            Margin: {formatUSD(cost.suggestedSalePrice - cost.totalManufacturingCost)} ({costConfig.marginPercent}%)
          </span>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5">
          <span className="text-[11px] text-emerald-400 block font-semibold">
            ★ Total Quotation {costConfig.includeVat ? '(Inc. 10% GST)' : '(Ex GST)'}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-emerald-300 tabular-nums">
              {formatUSD(costConfig.includeVat ? cost.finalSalePriceWithVat : cost.suggestedSalePrice)}
            </span>
          </div>
          {costConfig.includeVat && (
            <span className="text-[10px] text-emerald-500/80 block mt-0.5">
              Price {formatUSD(cost.suggestedSalePrice)} + GST {formatUSD(cost.vatAmount)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
