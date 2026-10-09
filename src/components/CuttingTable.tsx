import React, { useState, useMemo } from 'react';
import { BlindInput, CalculationResult, SlatCalculationItem, SlatSortOrder } from '../types/blind';
import { Copy, Check, ArrowUpDown, Filter, RotateCcw, CheckSquare, Square } from 'lucide-react';

interface CuttingTableProps {
  input: BlindInput;
  result: CalculationResult;
  selectedSlatId: number | null;
  onSelectSlat: (id: number) => void;
  onToggleCut: (id: number) => void;
  onToggleAllCut: (markAll: boolean) => void;
}

export const CuttingTable: React.FC<CuttingTableProps> = ({
  input,
  result,
  selectedSlatId,
  onSelectSlat,
  onToggleCut,
  onToggleAllCut,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SlatSortOrder>('left_to_right');
  const [copied, setCopied] = useState(false);

  // Sorting logic
  const sortedSlats = useMemo(() => {
    let items = [...result.slats];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      items = items.filter(
        (s) =>
          s.index.toString().includes(q) ||
          s.cutLength.toString().includes(q) ||
          s.positionX.toString().includes(q)
      );
    }

    switch (sortOrder) {
      case 'right_to_left':
        return items.reverse();
      case 'cut_ascending':
        return items.sort((a, b) => a.cutLength - b.cutLength);
      case 'cut_descending':
        return items.sort((a, b) => b.cutLength - a.cutLength);
      case 'left_to_right':
      default:
        return items;
    }
  }, [result.slats, searchTerm, sortOrder]);

  // Cut progress
  const cutCount = result.slats.filter((s) => s.isCut).length;
  const cutPercentage = result.totalSlats > 0 ? Math.round((cutCount / result.totalSlats) * 100) : 0;

  // Clipboard copy
  const handleCopyClipboard = () => {
    const header = [
      'Slat No',
      'Center X (mm)',
      'Window Height (mm)',
      'Finished Drop (mm)',
      'Cut Length (mm)',
      'Delta (mm)',
      'Top Angle (°)',
      'Status',
    ].join('\t');

    const rows = sortedSlats.map((s) =>
      [
        s.index,
        s.positionX,
        s.windowHeight,
        s.finishedHeight,
        s.cutLength,
        s.stepDiffFromPrev > 0 ? `+${s.stepDiffFromPrev}` : s.stepDiffFromPrev,
        `${s.bevelAngleDeg}°`,
        s.isCut ? 'Completed' : 'Pending',
      ].join('\t')
    );

    const text = [header, ...rows].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Table Header & Toolbar */}
      <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Slat Cutting Schedule & Fabrication Table</h2>
            <span className="text-xs font-mono text-neutral-400">
              Total {result.totalSlats} sheets
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Exact fabric roll cutting dimensions (Finished Drop + Top Fold {input.fTop}mm + Bottom Pocket {input.fBottom}mm)
          </p>
        </div>

        {/* Progress & Cut Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Cutting Progress:</span>
            <span className="font-mono font-bold text-amber-400">
              {cutCount} / {result.totalSlats} sheets ({cutPercentage}%)
            </span>
            <div className="w-20 bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${cutPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleAllCut(cutCount < result.totalSlats)}
              className="px-2.5 py-1.5 text-xs rounded-md bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1"
              title="Mark all as cut or reset"
            >
              {cutCount < result.totalSlats ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mark All Done</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Clear All</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyClipboard}
              className="px-2.5 py-1.5 text-xs rounded-md bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1"
              title="Copy cutting schedule data for spreadsheets"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copy Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sorting & Filter Controls */}
      <div className="px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Filter className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Slat No. or length (mm)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <span>Cutting Sequence:</span>
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SlatSortOrder)}
            className="bg-neutral-900 border border-neutral-800 rounded-md px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="left_to_right">Left to Right (1 → N)</option>
            <option value="right_to_left">Right to Left (N → 1)</option>
            <option value="cut_ascending">Shortest to Longest (Ascending)</option>
            <option value="cut_descending">Longest to Shortest (Descending)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-neutral-950 text-neutral-400 sticky top-0 z-10 border-b border-neutral-800 shadow-sm font-medium">
            <tr>
              <th className="py-2.5 px-3 text-center w-12">Check</th>
              <th className="py-2.5 px-3 text-center w-16">No.</th>
              <th className="py-2.5 px-3 text-right">Position X</th>
              <th className="py-2.5 px-3 text-right">Opening Height</th>
              <th className="py-2.5 px-3 text-right">Finished Drop</th>
              <th className="py-2.5 px-4 text-right bg-amber-500/10 text-amber-300 font-bold border-x border-amber-500/20">
                ★ Fabric Cut Length
              </th>
              <th className="py-2.5 px-3 text-right">Step Diff</th>
              <th className="py-2.5 px-3 text-center">Bevel Angle</th>
              <th className="py-2.5 px-3 text-right">Cumulative Fabric</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono">
            {sortedSlats.map((slat, idx) => {
              const isSelected = selectedSlatId === slat.id;
              // Cumulative calculation up to this row
              let cumulativeMm = 0;
              for (let i = 0; i <= idx; i++) {
                cumulativeMm += sortedSlats[i].cutLength;
              }

              return (
                <tr
                  key={slat.id}
                  onClick={() => onSelectSlat(slat.id)}
                  className={`transition-colors cursor-pointer hover:bg-neutral-800/60 ${
                    isSelected
                      ? 'bg-amber-500/15 text-white'
                      : slat.isCut
                      ? 'bg-neutral-900/40 text-neutral-400'
                      : 'text-neutral-200'
                  }`}
                >
                  {/* Cut Checkbox */}
                  <td
                    className="py-2 px-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCut(slat.id);
                    }}
                  >
                    <button
                      type="button"
                      className="cursor-pointer text-neutral-400 hover:text-amber-400"
                    >
                      {slat.isCut ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-600" />
                      )}
                    </button>
                  </td>

                  {/* Slat Index */}
                  <td className="py-2 px-3 text-center font-bold">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {slat.index}
                    </span>
                  </td>

                  {/* Position X */}
                  <td className="py-2 px-3 text-right text-neutral-400 tabular-nums">
                    {slat.positionX.toLocaleString()} mm
                  </td>

                  {/* Window opening height */}
                  <td className="py-2 px-3 text-right text-neutral-300 tabular-nums">
                    {slat.windowHeight.toLocaleString()} mm
                  </td>

                  {/* Finished Height */}
                  <td className="py-2 px-3 text-right text-neutral-300 tabular-nums">
                    {slat.finishedHeight.toLocaleString()} mm
                  </td>

                  {/* Cutting Length (★ Hero Column) */}
                  <td className="py-2 px-4 text-right bg-amber-500/10 border-x border-amber-500/20 font-bold text-amber-300 text-sm tabular-nums">
                    {slat.cutLength.toLocaleString()} mm
                  </td>

                  {/* Delta step */}
                  <td className="py-2 px-3 text-right tabular-nums text-neutral-400 text-[11px]">
                    {slat.stepDiffFromPrev > 0
                      ? `+${slat.stepDiffFromPrev} mm`
                      : `${slat.stepDiffFromPrev} mm`}
                  </td>

                  {/* Angle */}
                  <td className="py-2 px-3 text-center tabular-nums text-neutral-400 text-[11px]">
                    {slat.bevelAngleDeg}°
                  </td>

                  {/* Cumulative Roll Fabric (m) */}
                  <td className="py-2 px-3 text-right tabular-nums text-neutral-500 text-[11px]">
                    {(cumulativeMm / 1000).toFixed(2)} m
                  </td>
                </tr>
              );
            })}

            {sortedSlats.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-neutral-500">
                  No slat records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* KPI Footer Strip */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div>
          <span className="text-neutral-500 block text-[10px]">Min Cut Length</span>
          <span className="text-neutral-200 font-bold">{result.minCutLength.toLocaleString()} mm</span>
        </div>
        <div>
          <span className="text-neutral-500 block text-[10px]">Max Cut Length</span>
          <span className="text-neutral-200 font-bold">{result.maxCutLength.toLocaleString()} mm</span>
        </div>
        <div>
          <span className="text-neutral-500 block text-[10px]">Net Fabric Required</span>
          <span className="text-emerald-400 font-bold">{result.totalCutLengthMeters} m</span>
        </div>
        <div>
          <span className="text-neutral-500 block text-[10px]">Fabric Inc. +5% Buffer</span>
          <span className="text-amber-400 font-bold">{result.totalCutLengthWithWaste} m</span>
        </div>
      </div>
    </div>
  );
};
