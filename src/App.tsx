import React, { useState, useMemo } from 'react';
import { BlindInput, MaterialCostConfig } from './types/blind';
import { calculateBlind, DEFAULT_COST_CONFIG, formatUSD } from './utils/calculator';
import { exportBlindToExcel } from './utils/excelExport';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { Visualizer } from './components/Visualizer';
import { CuttingTable } from './components/CuttingTable';
import { CostEstimator } from './components/CostEstimator';
import { WorkOrderPrintView } from './components/WorkOrderPrintView';
import { SlatLabelModal } from './components/SlatLabelModal';
import { ManualModal } from './components/ManualModal';
import { Ruler, Compass, Layers, CheckCircle, DollarSign, LayoutDashboard, FileSpreadsheet } from 'lucide-react';

const INITIAL_INPUT: BlindInput = {
  width: 2000,
  heightLeft: 1500,
  heightRight: 2100,
  fabricWidth: 89,
  shapeType: 'right_high',
  gablePeakRatio: 0.5,
  gablePeakHeight: 2400,
  dTop: 45,
  dBottom: 15,
  fTop: 20,
  fBottom: 50,
  pitch: 76,
  projectName: 'Loft Residence Master Bed',
  customerName: 'Coastal Living Interiors',
  orderNo: 'WO-202610-01',
  orderDate: new Date().toISOString().split('T')[0],
  deliveryDate: '',
  fabricCode: 'VS-301 Ivory 3% Sunscreen',
  fabricColor: 'Ivory',
  controlSide: 'right',
  stackType: 'high_side',
  slatSortOrder: 'left_to_right',
  notes: 'Bunch towards high side (right). Supply sloped top mounting brackets.',
};

type ActiveWorkspaceTab = 'all' | 'cutting' | 'cost';

export default function App() {
  const [input, setInput] = useState<BlindInput>(INITIAL_INPUT);
  const [costConfig, setCostConfig] = useState<MaterialCostConfig>(DEFAULT_COST_CONFIG);
  const [cutStatusMap, setCutStatusMap] = useState<Record<number, boolean>>({});
  const [selectedSlatId, setSelectedSlatId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('all');

  // Modals state
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isLabelsOpen, setIsLabelsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Core calculation with cost
  const result = useMemo(() => {
    return calculateBlind(input, cutStatusMap, costConfig);
  }, [input, cutStatusMap, costConfig]);

  // Handlers
  const handleInputChange = (updated: Partial<BlindInput>) => {
    setInput((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setInput(INITIAL_INPUT);
    setCutStatusMap({});
    setSelectedSlatId(null);
  };

  const handleCostConfigChange = (updated: Partial<MaterialCostConfig>) => {
    setCostConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleResetCostConfig = () => {
    setCostConfig(DEFAULT_COST_CONFIG);
  };

  const handleToggleCut = (id: number) => {
    setCutStatusMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleAllCut = (markAll: boolean) => {
    const updated: Record<number, boolean> = {};
    if (markAll) {
      result.slats.forEach((s) => {
        updated[s.id] = true;
      });
    }
    setCutStatusMap(updated);
  };

  const handleExportExcel = () => {
    exportBlindToExcel(input, result, result.slats);
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        onOpenManual={() => setIsManualOpen(true)}
        onOpenLabels={() => setIsLabelsOpen(true)}
        onPrint={handlePrint}
        onExportExcel={handleExportExcel}
        totalSlats={result.totalSlats}
        totalMeters={result.totalCutLengthMeters}
        totalMaterialCost={result.costBreakdown.totalMaterialCost}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 no-print">
        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-neutral-500" />
              <span>Opening Width (W)</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {input.width.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 font-mono">mm</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Sloped Track Length</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
                {result.railLength.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 font-mono">mm (∠{result.angleDeg}°)</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              <span>Total Slat Count</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {result.totalSlats}
              </span>
              <span className="text-xs text-neutral-500 font-mono">sheets (Pitch {result.actualPitch}mm)</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Fabric Required</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {result.totalCutLengthMeters}
              </span>
              <span className="text-xs text-neutral-500 font-mono">m (+5%: {result.totalCutLengthWithWaste}m)</span>
            </div>
          </div>

          {/* Cost KPIs */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Net Material Cost</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {formatUSD(result.costBreakdown.totalMaterialCost)}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">
              Avg {formatUSD(result.costBreakdown.totalMaterialCost / result.totalSlats)} / sheet
            </span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Total Quotation</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-black font-mono text-emerald-300 tabular-nums">
                {formatUSD(costConfig.includeVat ? result.costBreakdown.finalSalePriceWithVat : result.costBreakdown.suggestedSalePrice)}
              </span>
            </div>
            <span className="text-[10px] text-emerald-500/80 font-mono">
              {costConfig.includeVat ? 'Inc. 10% GST' : 'Ex GST'} (Margin {costConfig.marginPercent}%)
            </span>
          </div>
        </div>

        {/* Workspace Mode Tabs */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Integrated Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cutting')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'cutting'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Cutting Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cost')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'cost'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>BOM & Cost Estimation</span>
            </button>
          </div>

          <div className="text-xs text-neutral-400 font-mono hidden sm:block">
            Fabric {formatUSD(costConfig.fabricCostPerMeter)} / m · Track {formatUSD(costConfig.headrailCostPerMeter)} / m
          </div>
        </div>

        {/* Tab Content Rendering */}
        {(activeTab === 'all' || activeTab === 'cutting') && (
          <>
            {/* 2-Column Grid: Inputs & Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Numeric Input Controls */}
              <div className="lg:col-span-5 space-y-6">
                <InputPanel
                  input={input}
                  onChange={handleInputChange}
                  onReset={handleReset}
                />
              </div>

              {/* Right Column: Visualizer Blueprint */}
              <div className="lg:col-span-7 space-y-6">
                <Visualizer
                  input={input}
                  result={result}
                  selectedSlatId={selectedSlatId}
                  onSelectSlat={setSelectedSlatId}
                />
              </div>
            </div>

            {/* Cutting Table */}
            <div className="w-full">
              <CuttingTable
                input={input}
                result={result}
                selectedSlatId={selectedSlatId}
                onSelectSlat={setSelectedSlatId}
                onToggleCut={handleToggleCut}
                onToggleAllCut={handleToggleAllCut}
              />
            </div>
          </>
        )}

        {/* Cost Estimator Section */}
        {(activeTab === 'all' || activeTab === 'cost') && (
          <div className="w-full">
            <CostEstimator
              result={result}
              costConfig={costConfig}
              onChangeCostConfig={handleCostConfigChange}
              onResetCostConfig={handleResetCostConfig}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-6 px-4 text-center text-xs text-neutral-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Sloped Vertical Blind Fabrication & Costing Engine · ISO 9001 Workshop Standard
          </div>
          <div className="text-neutral-400 text-[11px] font-mono">
            Formulas: L_rail = √(W² + ΔH²) · BOM Costing = Fabric + Track + Hardware + Labor
          </div>
        </div>
      </footer>

      {/* Dedicated Print Sheet for window.print() */}
      <WorkOrderPrintView input={input} result={result} isModal={false} />

      {/* Print Preview Modal */}
      {isPrintModalOpen && (
        <WorkOrderPrintView
          input={input}
          result={result}
          onClose={() => setIsPrintModalOpen(false)}
          isModal={true}
        />
      )}

      {/* Slat Stickers / Labels Modal */}
      {isLabelsOpen && (
        <SlatLabelModal
          input={input}
          result={result}
          onClose={() => setIsLabelsOpen(false)}
        />
      )}

      {/* Engineering Manual Modal */}
      {isManualOpen && <ManualModal onClose={() => setIsManualOpen(false)} />}
    </div>
  );
}
