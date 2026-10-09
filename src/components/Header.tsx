import React from 'react';
import { Printer, Download, BookOpen, Layers, Tag } from 'lucide-react';

interface HeaderProps {
  onOpenManual: () => void;
  onOpenLabels: () => void;
  onPrint: () => void;
  onExportExcel: () => void;
  totalSlats: number;
  totalMeters: number;
  totalMaterialCost: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenManual,
  onOpenLabels,
  onPrint,
  onExportExcel,
  totalSlats,
  totalMeters,
  totalMaterialCost,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-4 lg:px-8 py-3 transition-colors no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>Sloped Vertical Blind Fabrication Engine</span>
            </div>
            <div className="text-xs text-neutral-400 font-mono flex items-center gap-2">
              <span>{totalSlats} sheets</span>
              <span aria-hidden="true">·</span>
              <span>Fabric {totalMeters} m</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">Material Cost ${(totalMaterialCost || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation / Utility Links */}
        <nav className="hidden md:flex items-center gap-3 text-xs font-medium text-neutral-300">
          <button
            onClick={onOpenManual}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <span>Manual & Formulas</span>
          </button>
          <button
            onClick={onOpenLabels}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          >
            <Tag className="w-4 h-4 text-neutral-400" />
            <span>Slat Roll Labels</span>
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm shadow-amber-950/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Print Work Order</span>
          </button>
        </div>
      </div>
    </header>
  );
};
