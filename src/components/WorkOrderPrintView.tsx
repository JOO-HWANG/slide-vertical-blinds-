import React from 'react';
import { BlindInput, CalculationResult } from '../types/blind';
import { formatUSD } from '../utils/calculator';
import { Printer, X } from 'lucide-react';

interface WorkOrderPrintViewProps {
  input: BlindInput;
  result: CalculationResult;
  onClose?: () => void;
  isModal?: boolean;
}

export const WorkOrderPrintView: React.FC<WorkOrderPrintViewProps> = ({
  input,
  result,
  onClose,
  isModal = false,
}) => {
  const [includeCostInPrint, setIncludeCostInPrint] = React.useState(false);
  const cost = result.costBreakdown;

  const printDate = new Date().toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const lotNumber =
    input.orderNo ||
    `WO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
      Math.floor(Math.random() * 900 + 100)
    )}`;

  // Split slats into 3 columns for compact fit on A4 paper
  const total = result.slats.length;
  const colSize = Math.ceil(total / 3);
  const col1 = result.slats.slice(0, colSize);
  const col2 = result.slats.slice(colSize, colSize * 2);
  const col3 = result.slats.slice(colSize * 2);

  const handlePrint = () => {
    window.print();
  };

  const getStackDescription = (type: string) => {
    switch (type) {
      case 'high_side':
        return 'High Side Stack (Recommended)';
      case 'low_side':
        return 'Low Side Stack';
      case 'split':
        return 'Center Split Pair';
      case 'left':
        return 'Left Stack';
      case 'right':
        return 'Right Stack';
      default:
        return 'High Side Stack';
    }
  };

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto'
          : 'hidden print:block'
      }
    >
      <div
        className={
          isModal
            ? 'bg-white text-neutral-900 w-full max-w-4xl p-8 rounded-xl shadow-2xl relative max-h-[92vh] overflow-y-auto'
            : 'bg-white text-neutral-900 w-full max-w-none p-0'
        }
      >
        {/* Modal Controls (Hidden in Print) */}
        {isModal && (
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 no-print">
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-neutral-800">
                Work Order A4 Print Preview
              </div>
              <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCostInPrint}
                  onChange={(e) => setIncludeCostInPrint(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Include Material Cost & Quotation on Printout</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded text-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Printable Sheet Container */}
        <div className="print-content text-neutral-950 font-sans">
          {/* Sheet Header */}
          <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-3 mb-4">
            <div>
              <div className="text-2xl font-black tracking-tight uppercase">
                Sloped Vertical Blind Work Order & Cutting Schedule
              </div>
              <div className="text-xs text-neutral-600 mt-0.5 font-medium">
                PRECISION MANUFACTURING & CUTTING SPECIFICATION · ISO 9001 FACTORY STANDARD
              </div>
            </div>

            {/* Approval / Sign-off Stamp Box */}
            <table className="border-collapse border border-neutral-800 text-[11px] text-center ml-auto">
              <tbody>
                <tr>
                  <td className="border border-neutral-800 bg-neutral-100 px-3 py-0.5 font-bold">Cutting</td>
                  <td className="border border-neutral-800 bg-neutral-100 px-3 py-0.5 font-bold">Assembly / QC</td>
                  <td className="border border-neutral-800 bg-neutral-100 px-3 py-0.5 font-bold">Dispatch Approval</td>
                </tr>
                <tr>
                  <td className="border border-neutral-800 h-10 w-20 align-bottom pb-1 text-[10px] text-neutral-400">Sign</td>
                  <td className="border border-neutral-800 h-10 w-20 align-bottom pb-1 text-[10px] text-neutral-400">Sign</td>
                  <td className="border border-neutral-800 h-10 w-20 align-bottom pb-1 text-[10px] text-neutral-400">Sign</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4 border border-neutral-400 p-3 bg-neutral-50 rounded">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 font-bold text-neutral-700">Work Order No:</span>
                <span className="font-mono font-bold text-neutral-900">{lotNumber}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold text-neutral-700">Project / Job:</span>
                <span className="font-medium text-neutral-900">{input.projectName || 'Standard Project'}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold text-neutral-700">Customer / Account:</span>
                <span className="text-neutral-900">{input.customerName || 'General Account'}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold text-neutral-700">Fabric Louvre:</span>
                <span className="text-neutral-900 font-bold">
                  {input.fabricCode || 'Standard'} · {input.fabricWidth}mm ({input.fabricColor || 'White'})
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 font-bold text-neutral-700">Issued Date:</span>
                <span className="font-mono text-neutral-900">{printDate}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold text-neutral-700">Control & Stack:</span>
                <span className="text-neutral-900">
                  {input.controlSide === 'left' ? 'Left Control' : 'Right Control'} · {getStackDescription(input.stackType)}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold text-neutral-700">Total Slat Count:</span>
                <span className="font-bold text-neutral-900 font-mono text-sm">
                  {result.totalSlats} sheets ({result.actualPitchRail}mm rail / {result.actualPitch}mm horiz)
                </span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold text-neutral-700">Fabric Required:</span>
                <span className="font-mono text-neutral-900">
                  {result.totalCutLengthMeters} m (Inc. +5% buffer: {result.totalCutLengthWithWaste} m)
                </span>
              </div>
            </div>
          </div>

          {/* Technical Spec Box */}
          <table className="w-full text-xs border border-neutral-400 mb-4 text-center">
            <thead className="bg-neutral-200 font-bold">
              <tr>
                <th className="border border-neutral-400 py-1">Opening Width</th>
                <th className="border border-neutral-400 py-1">Track Width</th>
                <th className="border border-neutral-400 py-1">Left Drop (HL)</th>
                <th className="border border-neutral-400 py-1">Right Drop (HR)</th>
                <th className="border border-neutral-400 py-1">Headrail Cut</th>
                <th className="border border-neutral-400 py-1">Slope Angle</th>
                <th className="border border-neutral-400 py-1">Pitch (Rail / Horiz)</th>
                <th className="border border-neutral-400 py-1">Slat 1 Inset</th>
                <th className="border border-neutral-400 py-1">Deductions (Top/Bot)</th>
                <th className="border border-neutral-400 py-1">Hem Allowances</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr>
                <td className="border border-neutral-400 py-1 font-bold">{result.openingWidth} mm</td>
                <td className="border border-neutral-400 py-1 font-bold text-amber-900">{result.trackWidth} mm (-10L/-10R)</td>
                <td className="border border-neutral-400 py-1">{input.heightLeft} mm</td>
                <td className="border border-neutral-400 py-1">{input.heightRight} mm</td>
                <td className="border border-neutral-400 py-1 font-bold text-blue-900">{result.railLength} mm</td>
                <td className="border border-neutral-400 py-1 font-bold">{result.angleDeg}°</td>
                <td className="border border-neutral-400 py-1 font-bold text-amber-800">{result.actualPitchRail} / {result.actualPitch} mm</td>
                <td className="border border-neutral-400 py-1 font-bold">X = {result.firstSlatOffsetX} mm</td>
                <td className="border border-neutral-400 py-1">-{input.dTop} / -{input.dBottom} mm</td>
                <td className="border border-neutral-400 py-1 font-bold">+{input.fTop + input.fBottom} mm</td>
              </tr>
            </tbody>
          </table>

          {/* Cutting Instructions Banner */}
          <div className="bg-amber-100 border-l-4 border-amber-600 p-2 mb-3 text-xs text-amber-950 flex items-center justify-between">
            <span className="font-bold">
              ★ CUTTING INSTRUCTION: The [Fabric Cut Length (mm)] values specify exact physical fabric roll cuts including top fold ({input.fTop}mm) and bottom pocket ({input.fBottom}mm).
            </span>
            <span className="font-mono text-[11px] font-bold">Tolerance: ±2mm</span>
          </div>

          {/* 3-Column Compact Cutting Table for A4 Fit */}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {[col1, col2, col3].map((col, colIdx) => (
              <div key={colIdx} className="border border-neutral-400">
                <table className="w-full text-center border-collapse">
                  <thead className="bg-neutral-200 text-[10px] font-bold">
                    <tr>
                      <th className="border-b border-r border-neutral-400 py-1 w-8">No</th>
                      <th className="border-b border-r border-neutral-400 py-1 font-bold text-neutral-900">
                        Cut Length (mm)
                      </th>
                      <th className="border-b border-r border-neutral-400 py-1">Finished Drop</th>
                      <th className="border-b border-neutral-400 py-1 w-10">Check</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono divide-y divide-neutral-300">
                    {col.map((slat) => (
                      <tr key={slat.id} className="hover:bg-neutral-50">
                        <td className="border-r border-neutral-300 py-1 font-bold bg-neutral-100">
                          {slat.index}
                        </td>
                        <td className="border-r border-neutral-300 py-1 font-bold text-neutral-950 bg-amber-50">
                          {slat.cutLength}
                        </td>
                        <td className="border-r border-neutral-300 py-1 text-neutral-600">
                          {slat.finishedHeight}
                        </td>
                        <td className="py-1 text-center">
                          <span className="inline-block w-3.5 h-3.5 border border-neutral-500 rounded-sm"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Quality Inspection & Notes */}
          <div className="mt-4 pt-3 border-t border-neutral-300 text-[11px] grid grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-neutral-800 mb-1">■ Quality & Assembly Checklist</div>
              <ul className="list-disc list-inside text-neutral-600 space-y-0.5">
                <li>Verify sequential slat numbering and top hanger clips (Slat 1 to {result.totalSlats} sheets)</li>
                <li>Verify bottom weight plates inserted and link spacer chain evenly aligned</li>
                <li>Inspect slope headrail tilt gear rotation and tension test at {result.angleDeg}°</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-neutral-800 mb-1">■ Special Instructions / Notes</div>
              <div className="text-neutral-700 bg-neutral-50 border border-neutral-200 p-2 rounded min-h-[44px]">
                {input.notes || 'Manufacture precisely to specified schedule. Check all clearances on site.'}
              </div>
            </div>
          </div>

          {/* Optional Cost Quotation Box */}
          {includeCostInPrint && (
            <div className="mt-4 pt-3 border-t-2 border-dashed border-neutral-400 text-xs">
              <div className="font-bold text-neutral-900 mb-1.5 flex justify-between items-center">
                <span>■ Bill of Materials & Cost Quotation ($ AUD)</span>
                <span className="font-mono text-neutral-600">Currency: AUD ($)</span>
              </div>
              <table className="w-full border-collapse border border-neutral-400 text-center text-[10px]">
                <thead className="bg-neutral-100 font-bold">
                  <tr>
                    <th className="border border-neutral-400 py-1">Fabric ({cost.fabricBillableMeters} m)</th>
                    <th className="border border-neutral-400 py-1">Headrail & Mech Kit</th>
                    <th className="border border-neutral-400 py-1">Accessories ({result.totalSlats} sheets)</th>
                    <th className="border border-neutral-400 py-1">Net Material Cost</th>
                    <th className="border border-neutral-400 py-1">Labor & Assembly</th>
                    <th className="border border-neutral-400 py-1 bg-amber-50">Wholesale (Ex GST)</th>
                    <th className="border border-neutral-400 py-1 font-bold text-neutral-900 bg-neutral-200">
                      Total Invoice (Inc. 10% GST)
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr>
                    <td className="border border-neutral-400 py-1">{formatUSD(cost.fabricCost)}</td>
                    <td className="border border-neutral-400 py-1">
                      {formatUSD(cost.headrailCost + cost.controlKitCost)}
                    </td>
                    <td className="border border-neutral-400 py-1">{formatUSD(cost.accessoriesSubtotal)}</td>
                    <td className="border border-neutral-400 py-1 font-bold text-neutral-900">
                      {formatUSD(cost.totalMaterialCost)}
                    </td>
                    <td className="border border-neutral-400 py-1">{formatUSD(cost.assemblyLaborCost)}</td>
                    <td className="border border-neutral-400 py-1 bg-amber-50 font-bold">
                      {formatUSD(cost.suggestedSalePrice)}
                    </td>
                    <td className="border border-neutral-400 py-1 font-black bg-neutral-200 text-xs">
                      {formatUSD(cost.finalSalePriceWithVat)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
