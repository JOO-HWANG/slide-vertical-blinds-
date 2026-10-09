import React, { useState, useEffect, useMemo } from 'react';
import { BlindInput, MaterialCostConfig } from './types/blind';
import { calculateBlind, DEFAULT_COST_CONFIG, formatUSD } from './utils/calculator';
import { exportBlindToExcel } from './utils/excelExport';
import { Header, DeviceLayoutMode } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { Visualizer } from './components/Visualizer';
import { CuttingTable } from './components/CuttingTable';
import { CostEstimator } from './components/CostEstimator';
import { WorkOrderPrintView } from './components/WorkOrderPrintView';
import { SlatLabelModal } from './components/SlatLabelModal';
import { ManualModal } from './components/ManualModal';
import {
  Ruler,
  Compass,
  Layers,
  CheckCircle,
  DollarSign,
  FileSpreadsheet,
  Sliders,
  Eye,
  CheckSquare,
  ArrowRight,
  Printer,
  Tag,
  Download,
  Info,
} from 'lucide-react';

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
  trackDeductionLeft: 10, // 10mm left clearance
  trackDeductionRight: 10, // 10mm right clearance
  firstSlatOffsetX: 44.5, // 44.5mm start position for 89mm louvre
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

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

export default function App() {
  const windowWidth = useWindowWidth();
  const [deviceMode, setDeviceMode] = useState<DeviceLayoutMode>('auto');

  // Determine effective device layout mode
  const effectiveDevice: 'desktop' | 'tablet' | 'mobile' = useMemo(() => {
    if (deviceMode !== 'auto') return deviceMode;
    if (windowWidth < 768) return 'mobile';
    if (windowWidth < 1024) return 'tablet';
    return 'desktop';
  }, [deviceMode, windowWidth]);

  // Tab states for different device modes
  const [desktopTab, setDesktopTab] = useState<'cad' | 'cutting' | 'cost' | 'split'>('cad');
  const [tabletTab, setTabletTab] = useState<'blueprint' | 'cutting' | 'cost'>('blueprint');
  const [mobileTab, setMobileTab] = useState<'inputs' | 'visualizer' | 'cutting' | 'cost'>('inputs');

  // Core application data state
  const [input, setInput] = useState<BlindInput>(INITIAL_INPUT);
  const [costConfig, setCostConfig] = useState<MaterialCostConfig>(DEFAULT_COST_CONFIG);
  const [cutStatusMap, setCutStatusMap] = useState<Record<number, boolean>>({});
  const [selectedSlatId, setSelectedSlatId] = useState<number | null>(null);

  // Modals state
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isLabelsOpen, setIsLabelsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Calculation result with clearance and geometry logic
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

  const cutCount = useMemo(() => {
    return Object.values(cutStatusMap).filter(Boolean).length;
  }, [cutStatusMap]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans pb-16 md:pb-6">
      {/* Top Bar Header */}
      <Header
        onOpenManual={() => setIsManualOpen(true)}
        onOpenLabels={() => setIsLabelsOpen(true)}
        onPrint={handlePrint}
        onExportExcel={handleExportExcel}
        totalSlats={result.totalSlats}
        totalMeters={result.totalCutLengthMeters}
        totalMaterialCost={result.costBreakdown.totalMaterialCost}
        deviceMode={deviceMode}
        onChangeDeviceMode={setDeviceMode}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-5 no-print">
        {/* KPI Summary Strip - Tailored per Device */}
        {effectiveDevice === 'desktop' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-neutral-400" />
                <span>Opening Width (W)</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {input.width.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 font-mono">mm</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                HL: {input.heightLeft} / HR: {input.heightRight}
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Track Cut Length</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
                  {result.railLength.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 font-mono">mm (∠{result.angleDeg}°)</span>
              </div>
              <span className="text-[10px] text-amber-400/90 font-mono">
                Width {result.trackWidth}mm (-10L/-10R)
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                <span>Total Slat Count</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {result.totalSlats}
                </span>
                <span className="text-xs text-neutral-500 font-mono">sheets</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Pitch {result.actualPitch}mm · Slat #1 @ {result.firstSlatOffsetX}mm
              </span>
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
                <span className="text-xs text-neutral-500 font-mono">m</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                Inc. +5% waste: {result.totalCutLengthWithWaste}m
              </span>
            </div>

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
                  {formatUSD(
                    costConfig.includeVat
                      ? result.costBreakdown.finalSalePriceWithVat
                      : result.costBreakdown.suggestedSalePrice
                  )}
                </span>
              </div>
              <span className="text-[10px] text-emerald-500/80 font-mono">
                {costConfig.includeVat ? 'Inc. 10% GST' : 'Ex GST'} (Margin {costConfig.marginPercent}%)
              </span>
            </div>
          </div>
        )}

        {effectiveDevice === 'tablet' && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-sky-400" />
                  <span>Window Opening & Track</span>
                </span>
                <span className="text-amber-400 font-mono text-[11px]">-10L/-10R</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    W {input.width}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">mm</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 font-mono">Track: </span>
                  <span className="text-sm font-bold font-mono text-sky-400">
                    {result.railLength}mm
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fabrication Schedule</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {cutCount}/{result.totalSlats} cut
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    {result.totalSlats}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono"> sheets</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 font-mono">Fabric: </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {result.totalCutLengthMeters}m
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Total Quotation</span>
                </span>
                <span className="text-[10px] text-emerald-500/80 font-mono">
                  {costConfig.includeVat ? 'Inc. GST' : 'Ex GST'}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-black font-mono text-emerald-300 tabular-nums">
                  {formatUSD(
                    costConfig.includeVat
                      ? result.costBreakdown.finalSalePriceWithVat
                      : result.costBreakdown.suggestedSalePrice
                  )}
                </span>
                <span className="text-xs font-mono text-emerald-400/80">
                  Net: {formatUSD(result.costBreakdown.totalMaterialCost)}
                </span>
              </div>
            </div>
          </div>
        )}

        {effectiveDevice === 'mobile' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{input.projectName || 'Job Specification'}</span>
                <span className="text-neutral-500 font-mono text-[10px]">{input.orderNo}</span>
              </div>
              <span className="text-emerald-400 font-bold font-mono">
                {formatUSD(
                  costConfig.includeVat
                    ? result.costBreakdown.finalSalePriceWithVat
                    : result.costBreakdown.suggestedSalePrice
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-0.5">
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800/80">
                <div className="text-[10px] text-neutral-400">Opening & Track</div>
                <div className="font-bold text-white mt-0.5">W {input.width} mm</div>
                <div className="text-[10px] text-sky-400">Track {result.railLength}mm (-20)</div>
              </div>
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800/80">
                <div className="text-[10px] text-neutral-400">Slat Count & Fabric</div>
                <div className="font-bold text-white mt-0.5">{result.totalSlats} sheets</div>
                <div className="text-[10px] text-amber-400">Fabric {result.totalCutLengthMeters}m (Slat 1 @ 44.5)</div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- DESKTOP LAYOUT ----------------- */}
        {effectiveDevice === 'desktop' && (
          <div className="space-y-5">
            {/* Desktop Workspace Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setDesktopTab('cad')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                    desktopTab === 'cad'
                      ? 'bg-neutral-800 text-amber-400 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>CAD & Specifications</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopTab('cutting')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                    desktopTab === 'cutting'
                      ? 'bg-neutral-800 text-amber-400 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Cutting Schedule ({cutCount}/{result.totalSlats})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopTab('cost')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                    desktopTab === 'cost'
                      ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BOM & Cost Estimation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopTab('split')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                    desktopTab === 'split'
                      ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="View all sections in split overview"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Split Studio</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Track Clearance: -10mm L / -10mm R · Slat #1 @ 44.5mm</span>
                </span>
              </div>
            </div>

            {/* Desktop Tab 1: CAD & Specifications */}
            {desktopTab === 'cad' && (
              <div className="grid grid-cols-12 gap-6 items-start">
                <div className="col-span-5 space-y-6">
                  <InputPanel input={input} onChange={handleInputChange} onReset={handleReset} />
                </div>
                <div className="col-span-7 space-y-6">
                  <Visualizer
                    input={input}
                    result={result}
                    selectedSlatId={selectedSlatId}
                    onSelectSlat={setSelectedSlatId}
                  />

                  {/* Quick Shortcut to Cutting Table */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Ready for Fabrication?</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {result.totalSlats} sheets calculated with ±2mm cutting tolerance.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDesktopTab('cutting')}
                      className="px-3.5 py-2 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>Open Cutting Schedule</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Tab 2: Cutting Schedule */}
            {desktopTab === 'cutting' && (
              <div className="space-y-4">
                <CuttingTable
                  input={input}
                  result={result}
                  selectedSlatId={selectedSlatId}
                  onSelectSlat={setSelectedSlatId}
                  onToggleCut={handleToggleCut}
                  onToggleAllCut={handleToggleAllCut}
                />
              </div>
            )}

            {/* Desktop Tab 3: BOM & Cost Estimation */}
            {desktopTab === 'cost' && (
              <div className="space-y-4">
                <CostEstimator
                  result={result}
                  costConfig={costConfig}
                  onChangeCostConfig={handleCostConfigChange}
                  onResetCostConfig={handleResetCostConfig}
                />
              </div>
            )}

            {/* Desktop Tab 4: Split Studio Overview */}
            {desktopTab === 'split' && (
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-6 items-start">
                  <div className="col-span-5">
                    <InputPanel input={input} onChange={handleInputChange} onReset={handleReset} />
                  </div>
                  <div className="col-span-7">
                    <Visualizer
                      input={input}
                      result={result}
                      selectedSlatId={selectedSlatId}
                      onSelectSlat={setSelectedSlatId}
                    />
                  </div>
                </div>
                <CuttingTable
                  input={input}
                  result={result}
                  selectedSlatId={selectedSlatId}
                  onSelectSlat={setSelectedSlatId}
                  onToggleCut={handleToggleCut}
                  onToggleAllCut={handleToggleAllCut}
                />
                <CostEstimator
                  result={result}
                  costConfig={costConfig}
                  onChangeCostConfig={handleCostConfigChange}
                  onResetCostConfig={handleResetCostConfig}
                />
              </div>
            )}
          </div>
        )}

        {/* ----------------- TABLET LAYOUT ----------------- */}
        {effectiveDevice === 'tablet' && (
          <div className="space-y-5">
            {/* Tablet Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-medium w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setTabletTab('blueprint')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    tabletTab === 'blueprint'
                      ? 'bg-neutral-800 text-amber-400 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Dimensions & Visualizer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabletTab('cutting')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    tabletTab === 'cutting'
                      ? 'bg-neutral-800 text-amber-400 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Cutting Workshop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabletTab('cost')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    tabletTab === 'cost'
                      ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BOM & Quote</span>
                </button>
              </div>
            </div>

            {tabletTab === 'blueprint' && (
              <div className="space-y-6">
                <Visualizer
                  input={input}
                  result={result}
                  selectedSlatId={selectedSlatId}
                  onSelectSlat={setSelectedSlatId}
                />
                <InputPanel input={input} onChange={handleInputChange} onReset={handleReset} />
              </div>
            )}

            {tabletTab === 'cutting' && (
              <div className="space-y-4">
                <CuttingTable
                  input={input}
                  result={result}
                  selectedSlatId={selectedSlatId}
                  onSelectSlat={setSelectedSlatId}
                  onToggleCut={handleToggleCut}
                  onToggleAllCut={handleToggleAllCut}
                />
              </div>
            )}

            {tabletTab === 'cost' && (
              <div className="space-y-4">
                <CostEstimator
                  result={result}
                  costConfig={costConfig}
                  onChangeCostConfig={handleCostConfigChange}
                  onResetCostConfig={handleResetCostConfig}
                />
              </div>
            )}
          </div>
        )}

        {/* ----------------- MOBILE LAYOUT ----------------- */}
        {effectiveDevice === 'mobile' && (
          <div className="space-y-4">
            {/* Mobile Top Segmented Tab Switcher */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMobileTab('inputs')}
                className={`py-1.5 rounded transition-colors cursor-pointer flex flex-col items-center gap-0.5 ${
                  mobileTab === 'inputs'
                    ? 'bg-neutral-800 text-amber-400 shadow-sm font-bold'
                    : 'text-neutral-400'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-[10px]">Inputs</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('visualizer')}
                className={`py-1.5 rounded transition-colors cursor-pointer flex flex-col items-center gap-0.5 ${
                  mobileTab === 'visualizer'
                    ? 'bg-neutral-800 text-amber-400 shadow-sm font-bold'
                    : 'text-neutral-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[10px]">CAD</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('cutting')}
                className={`py-1.5 rounded transition-colors cursor-pointer flex flex-col items-center gap-0.5 ${
                  mobileTab === 'cutting'
                    ? 'bg-neutral-800 text-amber-400 shadow-sm font-bold'
                    : 'text-neutral-400'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span className="text-[10px]">Cut List</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('cost')}
                className={`py-1.5 rounded transition-colors cursor-pointer flex flex-col items-center gap-0.5 ${
                  mobileTab === 'cost'
                    ? 'bg-neutral-800 text-emerald-400 shadow-sm font-bold'
                    : 'text-neutral-400'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px]">Quote</span>
              </button>
            </div>

            {/* Mobile Tab 1: Inputs */}
            {mobileTab === 'inputs' && (
              <div className="space-y-4">
                <InputPanel input={input} onChange={handleInputChange} onReset={handleReset} />
                <button
                  type="button"
                  onClick={() => setMobileTab('visualizer')}
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Review Visualizer & CAD</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Tab 2: Visualizer */}
            {mobileTab === 'visualizer' && (
              <div className="space-y-4">
                <Visualizer
                  input={input}
                  result={result}
                  selectedSlatId={selectedSlatId}
                  onSelectSlat={setSelectedSlatId}
                />
                <button
                  type="button"
                  onClick={() => setMobileTab('cutting')}
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Open Cutting Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Tab 3: Cutting List */}
            {mobileTab === 'cutting' && (
              <div className="space-y-4">
                <CuttingTable
                  input={input}
                  result={result}
                  selectedSlatId={selectedSlatId}
                  onSelectSlat={setSelectedSlatId}
                  onToggleCut={handleToggleCut}
                  onToggleAllCut={handleToggleAllCut}
                />
              </div>
            )}

            {/* Mobile Tab 4: Cost & Quote */}
            {mobileTab === 'cost' && (
              <div className="space-y-4">
                <CostEstimator
                  result={result}
                  costConfig={costConfig}
                  onChangeCostConfig={handleCostConfigChange}
                  onResetCostConfig={handleResetCostConfig}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-4 px-4 text-center text-xs text-neutral-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Sloped Vertical Blind Fabrication Engine · ISO 9001 Workshop Standard
          </div>
          <div className="text-neutral-500 text-[11px] font-mono">
            Track Clearance: 10mm L + 10mm R · 1st Slat Pos X = 44.5mm (No Overhang)
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      {effectiveDevice === 'mobile' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 px-2 py-1.5 flex items-center justify-around no-print">
          <button
            type="button"
            onClick={() => setMobileTab('inputs')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded text-xs ${
              mobileTab === 'inputs' ? 'text-amber-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="text-[10px]">Inputs</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('visualizer')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded text-xs ${
              mobileTab === 'visualizer' ? 'text-amber-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-[10px]">CAD</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('cutting')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded text-xs ${
              mobileTab === 'cutting' ? 'text-amber-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-[10px]">Cut Table</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('cost')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded text-xs ${
              mobileTab === 'cost' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-[10px]">Quote</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded text-xs text-neutral-300 hover:text-white"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[10px]">Print</span>
          </button>
        </div>
      )}

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
