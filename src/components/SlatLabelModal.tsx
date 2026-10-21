import React from 'react';
import { BlindInput, CalculationResult } from '../types/blind';
import { Printer, X, Tag } from 'lucide-react';

interface SlatLabelModalProps {
  input: BlindInput;
  result: CalculationResult;
  onClose: () => void;
}

export const SlatLabelModal: React.FC<SlatLabelModalProps> = ({ input, result, onClose }) => {
  const handlePrintLabels = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 text-white w-full max-w-4xl p-6 rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Slat Cutting Identification Labels</h2>
              <p className="text-xs text-neutral-400">
                Individual roll tags for workshop cutting and assembly (Total {result.totalSlats} sheets)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintLabels}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Labels</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Labels Grid */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {result.slats.map((slat) => (
              <div
                key={slat.id}
                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 flex flex-col justify-between hover:border-amber-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1 mb-1.5">
                    <span className="font-mono font-bold text-xs text-neutral-400">
                      {input.orderNo || 'WO-STANDARD'}
                    </span>
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      #{slat.index} of {result.totalSlats} sheets
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 truncate mb-1">
                    {input.projectName || 'Sloped Blind'}
                  </div>

                  <div className="bg-neutral-900 p-2 rounded border border-neutral-800 my-1 text-center">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Cut Length</div>
                    <div className="text-base font-black text-amber-300 font-mono">
                      {slat.cutLength.toLocaleString()} mm
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-neutral-400 font-mono mt-1">
                    <div>Drop: {slat.finishedHeight}mm</div>
                    <div className="text-right">Angle: {slat.bevelAngleDeg}°</div>
                    <div>Track X: {slat.positionX}mm</div>
                    <div className="text-right">Rail: {slat.carrierDistanceOnRail}mm</div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-neutral-850 flex justify-between items-center text-[9px] text-neutral-500">
                  <span>QC Verified</span>
                  <span className="w-3.5 h-3.5 border border-neutral-700 rounded-sm"></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
