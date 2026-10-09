import React, { useState } from 'react';
import { Printer, Download, BookOpen, Layers, Tag, Monitor, Tablet, Smartphone, Sparkles, MoreVertical } from 'lucide-react';

export type DeviceLayoutMode = 'auto' | 'desktop' | 'tablet' | 'mobile';

interface HeaderProps {
  onOpenManual: () => void;
  onOpenLabels: () => void;
  onPrint: () => void;
  onExportExcel: () => void;
  totalSlats: number;
  totalMeters: number;
  totalMaterialCost: number;
  deviceMode: DeviceLayoutMode;
  onChangeDeviceMode: (mode: DeviceLayoutMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenManual,
  onOpenLabels,
  onPrint,
  onExportExcel,
  totalSlats,
  totalMeters,
  totalMaterialCost,
  deviceMode,
  onChangeDeviceMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Branding & Summary Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>Sloped Vertical Engine</span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5 flex-wrap">
              <span>{totalSlats} sheets</span>
              <span aria-hidden="true">·</span>
              <span>{totalMeters}m</span>
              <span aria-hidden="true" className="hidden xs:inline">·</span>
              <span className="text-emerald-400 font-semibold hidden xs:inline">
                ${(totalMaterialCost || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Device Layout Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => onChangeDeviceMode('auto')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1 ${
              deviceMode === 'auto'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Auto-detect based on screen size"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Auto</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDeviceMode('desktop')}
            className={`p-1 sm:px-2 sm:py-1 rounded transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1 ${
              deviceMode === 'desktop'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Desktop Layout (Focused Workspaces)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDeviceMode('tablet')}
            className={`p-1 sm:px-2 sm:py-1 rounded transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1 ${
              deviceMode === 'tablet'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Tablet Layout (Touch Optimized)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDeviceMode('mobile')}
            className={`p-1 sm:px-2 sm:py-1 rounded transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1 ${
              deviceMode === 'mobile'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Mobile Layout (Step-by-Step App View)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Zone 3: Navigation / Utility Links */}
        <nav className="hidden lg:flex items-center gap-2 text-xs font-medium text-neutral-300">
          <button
            type="button"
            onClick={onOpenManual}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span>Manual</span>
          </button>
          <button
            type="button"
            onClick={onOpenLabels}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-neutral-400" />
            <span>Labels</span>
          </button>
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>
        </nav>

        {/* Zone 4: Action Buttons & Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm shadow-amber-950/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Order</span>
            <span className="sm:hidden">Print</span>
          </button>

          {/* Mobile Utility Dropdown Toggle */}
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md bg-neutral-800/80 cursor-pointer"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenManual();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-neutral-300 hover:bg-neutral-800 rounded transition-colors text-left"
                >
                  <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Engineering Manual</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLabels();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-neutral-300 hover:bg-neutral-800 rounded transition-colors text-left"
                >
                  <Tag className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Slat Stickers / Labels</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onExportExcel();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-neutral-300 hover:bg-neutral-800 rounded transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Excel Sheet</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
