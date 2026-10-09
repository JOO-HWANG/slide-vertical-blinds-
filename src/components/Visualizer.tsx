import React, { useState, useRef, useId } from 'react';
import { BlindInput, CalculationResult, SlatCalculationItem } from '../types/blind';
import { Eye, Info, SlidersHorizontal, Maximize2, RotateCcw } from 'lucide-react';

interface VisualizerProps {
  input: BlindInput;
  result: CalculationResult;
  selectedSlatId: number | null;
  onSelectSlat: (id: number) => void;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  input,
  result,
  selectedSlatId,
  onSelectSlat,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSlat, setHoveredSlat] = useState<SlatCalculationItem | null>(null);
  const [louvreAngle, setLouvreAngle] = useState<number>(0); // 0 (closed) to 90 (fully open)
  const [stackPercent, setStackPercent] = useState<number>(0); // 0 (fully drawn across) to 100 (fully gathered)
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showSlatNumbers, setShowSlatNumbers] = useState<boolean>(true);
  const [showCutMargin, setShowCutMargin] = useState<boolean>(false);

  const rawId = useId();
  const safePatternId = 'grid_' + rawId.replace(/[^a-zA-Z0-9]/g, '_');

  const W = Math.max(100, input.width);
  const HL = Math.max(100, input.heightLeft);
  const HR = Math.max(100, input.heightRight);
  const maxH = Math.max(HL, HR, input.gablePeakHeight || 0);

  // SVG Viewport coordinate space
  const svgW = 1000;
  const svgH = 460;
  const padLeft = 85;
  const padRight = 75;
  const padTop = 60;
  const padBottom = 65;

  const innerW = svgW - padLeft - padRight;
  const innerH = svgH - padTop - padBottom;

  const scaleX = innerW / W;
  const scaleY = innerH / maxH;
  const scale = Math.min(scaleX, scaleY);

  const drawnW = W * scale;
  const drawnHL = HL * scale;
  const drawnHR = HR * scale;
  const originX = padLeft + (innerW - drawnW) / 2;
  const floorY = svgH - padBottom;

  // Track Deductions & Coordinates
  const dLeft = result.trackDeductionLeft ?? 10;
  const dRight = result.trackDeductionRight ?? 10;
  const trackStartX = originX + dLeft * scale;
  const trackEndX = originX + (W - dRight) * scale;
  const trackDrawnW = trackEndX - trackStartX;

  // Height along slope for track ends
  let trackStartH = HL;
  let trackEndH = HR;
  if (input.shapeType === 'right_high' || input.shapeType === 'left_high') {
    const deltaH = HR - HL;
    trackStartH = HL + (deltaH / W) * dLeft;
    trackEndH = HL + (deltaH / W) * (W - dRight);
  } else if (input.shapeType === 'level') {
    trackStartH = HL;
    trackEndH = HL;
  }

  // Window frame path
  let windowPath = '';
  let railPath = '';

  if (input.shapeType === 'gable_peak') {
    const peakX = W * (input.gablePeakRatio || 0.5);
    const peakH = Math.max(HL, HR, Number(input.gablePeakHeight) || maxH);
    const drawnPeakX = originX + peakX * scale;
    const drawnPeakY = floorY - peakH * scale;

    windowPath = `M ${originX} ${floorY} L ${originX + drawnW} ${floorY} L ${originX + drawnW} ${floorY - drawnHR} L ${drawnPeakX} ${drawnPeakY} L ${originX} ${floorY - drawnHL} Z`;
    
    // Sloped Track Path inside clearances
    const startY = floorY - (HL + ((peakH - HL) / peakX) * dLeft) * scale;
    const endY = floorY - (HR + ((peakH - HR) / (W - peakX)) * dRight) * scale;
    railPath = `M ${trackStartX} ${startY} L ${drawnPeakX} ${drawnPeakY} L ${trackEndX} ${endY}`;
  } else {
    windowPath = `M ${originX} ${floorY} L ${originX + drawnW} ${floorY} L ${originX + drawnW} ${floorY - drawnHR} L ${originX} ${floorY - drawnHL} Z`;
    railPath = `M ${trackStartX} ${floorY - trackStartH * scale} L ${trackEndX} ${floorY - trackEndH * scale}`;
  }

  // Calculate stack movement
  const stackDirection = input.stackType; // 'high_side', 'low_side', 'split', 'left', 'right'
  const isHighSideRight = HR >= HL;

  const getSlatVisualX = (slatIndex: number, originalPositionX: number): number => {
    // originalPositionX is relative to track start (starts at 44.5mm)
    const baseVisualX = trackStartX + originalPositionX * scale;
    if (stackPercent === 0) return baseVisualX;

    const N = result.totalSlats;
    const factor = stackPercent / 100;
    const carrierBunchThickness = 9; // mm per compressed carrier

    let targetX = originalPositionX;
    if (
      stackDirection === 'high_side' ? isHighSideRight :
      stackDirection === 'right' || (stackDirection !== 'left' && isHighSideRight)
    ) {
      // Stack to right
      const compressedEndX = result.trackWidth - (N - slatIndex) * carrierBunchThickness;
      targetX = originalPositionX + (compressedEndX - originalPositionX) * factor;
    } else {
      // Stack to left
      const compressedStartX = (slatIndex - 1) * carrierBunchThickness + (result.firstSlatOffsetX ?? 44.5);
      targetX = originalPositionX - (originalPositionX - compressedStartX) * factor;
    }
    return trackStartX + targetX * scale;
  };

  // Louvre width projection based on tilt angle
  const nominalSlatWidthPx = Math.max(8, (input.fabricWidth || 89) * scale * 0.9);
  const visualSlatWidthPx = Math.max(
    2.5,
    nominalSlatWidthPx * Math.cos((louvreAngle * Math.PI) / 180)
  );

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Visualizer Top Bar */}
      <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>CAD Technical Visualizer & Louvre Simulation</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-neutral-400 font-mono">
            <span>Track: {result.railLength.toLocaleString()}mm</span>
            <span>·</span>
            <span>Slope: {result.angleDeg}°</span>
            <span>·</span>
            <span>Pitch: {result.actualPitch}mm</span>
          </div>
        </div>

        {/* Display Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              showDimensions ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Toggle dimension annotation lines"
          >
            Dimensions
          </button>
          <button
            type="button"
            onClick={() => setShowSlatNumbers(!showSlatNumbers)}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              showSlatNumbers ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Toggle slat number tags"
          >
            Slat Numbers
          </button>
          <button
            type="button"
            onClick={() => setShowCutMargin(!showCutMargin)}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              showCutMargin ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Toggle sewing hem allowances overlay"
          >
            Hems (+{input.fTop + input.fBottom}mm)
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full h-[340px] sm:h-[400px] bg-neutral-950 flex items-center justify-center select-none overflow-hidden"
      >
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Engineering Grid Pattern */}
            <pattern id={safePatternId} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            {/* Arrow Marker */}
            <marker
              id="arrowhead-start"
              markerWidth="6"
              markerHeight="6"
              refX="1"
              refY="3"
              orient="auto"
            >
              <polygon points="5 0, 0 3, 5 6" fill="#94a3b8" />
            </marker>
            <marker
              id="arrowhead-end"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 5 3, 0 6" fill="#94a3b8" />
            </marker>
            <linearGradient id="slatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="selectedSlatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Grid background */}
          <rect width={svgW} height={svgH} fill={`url(#${safePatternId})`} />

          {/* Floor baseline */}
          <line
            x1={padLeft - 20}
            y1={floorY}
            x2={svgW - padRight + 20}
            y2={floorY}
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text
            x={originX + drawnW + 10}
            y={floorY + 4}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
          >
            FL (Finished Floor Level)
          </text>

          {/* Window opening contour */}
          <path
            d={windowPath}
            fill="rgba(56, 189, 248, 0.03)"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />

          {/* Sloped Rail Contour (Headrail profile) */}
          <path
            d={railPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={railPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Slat Hanging Elements */}
          {result.slats.map((slat) => {
            const visualX = getSlatVisualX(slat.index, slat.positionX);
            const isHovered = hoveredSlat?.id === slat.id;
            const isSelected = selectedSlatId === slat.id;

            // Height calculations
            const hWinScaled = slat.windowHeight * scale;
            const topClearanceScaled = input.dTop * scale;
            const bottomClearanceScaled = input.dBottom * scale;

            // Headrail attachment point
            const railAttachmentY = floorY - hWinScaled;
            // Slat top position (after dTop)
            const slatTopY = railAttachmentY + topClearanceScaled;
            // Slat finished bottom position (before floor clearance)
            const slatBottomY = floorY - bottomClearanceScaled;
            const slatHeightPx = Math.max(2, slatBottomY - slatTopY);

            // Cut margin extension (fTop + fBottom)
            const cutTopY = slatTopY - input.fTop * scale;
            const cutBottomY = slatBottomY + input.fBottom * scale;

            return (
              <g
                key={slat.id}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredSlat(slat)}
                onMouseLeave={() => setHoveredSlat(null)}
                onClick={() => onSelectSlat(slat.id)}
              >
                {/* Carrier Hook */}
                <circle
                  cx={visualX}
                  cy={railAttachmentY + 2}
                  r="2.5"
                  fill={isSelected ? '#f59e0b' : '#94a3b8'}
                />
                <line
                  x1={visualX}
                  y1={railAttachmentY + 2}
                  x2={visualX}
                  y2={slatTopY}
                  stroke={isSelected ? '#f59e0b' : '#64748b'}
                  strokeWidth="1"
                />

                {/* Cut Margin Ghost Overlay (if toggled) */}
                {showCutMargin && (
                  <rect
                    x={visualX - visualSlatWidthPx / 2}
                    y={cutTopY}
                    width={visualSlatWidthPx}
                    height={cutBottomY - cutTopY}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.4"
                  />
                )}

                {/* Slat Body */}
                <rect
                  x={visualX - visualSlatWidthPx / 2}
                  y={slatTopY}
                  width={visualSlatWidthPx}
                  height={slatHeightPx}
                  rx="1"
                  fill={isSelected ? 'url(#selectedSlatGradient)' : isHovered ? '#f1f5f9' : 'url(#slatGradient)'}
                  stroke={isSelected ? '#eab308' : isHovered ? '#38bdf8' : '#475569'}
                  strokeWidth={isSelected || isHovered ? 1.5 : 0.6}
                  opacity={slat.isCut ? 0.95 : 0.75}
                />

                {/* Bottom Weight Plate (추판) */}
                <rect
                  x={visualX - visualSlatWidthPx / 2 + 0.5}
                  y={slatBottomY - 6}
                  width={Math.max(1, visualSlatWidthPx - 1)}
                  height="5"
                  rx="0.5"
                  fill="#64748b"
                  opacity="0.7"
                />

                {/* Bottom spacer chain link indicator */}
                <circle cx={visualX} cy={slatBottomY - 1} r="1" fill="#94a3b8" />

                {/* Slat Number Indicator (Every 1, 5, or if hovered/selected) */}
                {showSlatNumbers && (slat.index === 1 || slat.index === result.totalSlats || slat.index % 5 === 0 || isHovered || isSelected) && (
                  <text
                    x={visualX}
                    y={floorY + 16}
                    fill={isSelected ? '#fbbf24' : isHovered ? '#38bdf8' : '#94a3b8'}
                    fontSize="9"
                    fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    #{slat.index}
                  </text>
                )}
              </g>
            );
          })}

          {/* Dimension Lines (W, HL, HR, L_rail) */}
          {showDimensions && (
            <g className="font-mono text-xs select-none">
              {/* Width Dimension (Top or Bottom) */}
              <line
                x1={originX}
                y1={svgH - 25}
                x2={originX + drawnW}
                y2={svgH - 25}
                stroke="#64748b"
                strokeWidth="1"
                markerStart="url(#arrowhead-start)"
                markerEnd="url(#arrowhead-end)"
              />
              <text
                x={originX + drawnW / 2}
                y={svgH - 12}
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                가로 W = {W.toLocaleString()} mm
              </text>

              {/* Left Height Dimension */}
              <line
                x1={originX - 30}
                y1={floorY - drawnHL}
                x2={originX - 30}
                y2={floorY}
                stroke="#64748b"
                strokeWidth="1"
                markerStart="url(#arrowhead-start)"
                markerEnd="url(#arrowhead-end)"
              />
              <text
                x={originX - 36}
                y={floorY - drawnHL / 2}
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="600"
                textAnchor="end"
                dominantBaseline="middle"
              >
                HL = {HL.toLocaleString()}
              </text>

              {/* Right Height Dimension */}
              <line
                x1={originX + drawnW + 30}
                y1={floorY - drawnHR}
                x2={originX + drawnW + 30}
                y2={floorY}
                stroke="#64748b"
                strokeWidth="1"
                markerStart="url(#arrowhead-start)"
                markerEnd="url(#arrowhead-end)"
              />
              <text
                x={originX + drawnW + 36}
                y={floorY - drawnHR / 2}
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="600"
                textAnchor="start"
                dominantBaseline="middle"
              >
                HR = {HR.toLocaleString()}
              </text>

              {/* Angle & Sloped Rail Info Label */}
              <text
                x={originX + drawnW / 2}
                y={Math.min(floorY - drawnHL, floorY - drawnHR) - 20}
                fill="#38bdf8"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                Sloped Track {result.railLength.toLocaleString()}mm (Width {result.trackWidth}mm · Clearance -10L/-10R · ∠{result.angleDeg}°)
              </text>
            </g>
          )}
        </svg>

        {/* Hover / Selected Floating HUD Tooltip */}
        {(hoveredSlat || selectedSlatId) && (
          <div className="absolute top-3 right-3 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-lg p-2.5 shadow-xl text-xs space-y-1 z-20 pointer-events-none">
            {(() => {
              const current = hoveredSlat || result.slats.find((s) => s.id === selectedSlatId);
              if (!current) return null;
              return (
                <>
                  <div className="flex items-center justify-between gap-4 font-bold border-b border-neutral-800 pb-1">
                    <span className="text-amber-400 font-mono">Slat #{current.index} of {result.totalSlats} sheets</span>
                    <span className="text-amber-300 font-mono">Track X = {current.positionX}mm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-0.5 text-[11px]">
                    <span className="text-neutral-400">Opening X:</span>
                    <span className="text-right font-mono text-neutral-300">{current.openingPositionX ?? Number((current.positionX + (result.trackDeductionLeft ?? 10)).toFixed(1))}mm</span>
                    <span className="text-neutral-400">Opening Height:</span>
                    <span className="text-right font-mono text-neutral-200">{current.windowHeight}mm</span>
                    <span className="text-neutral-400">Finished Drop:</span>
                    <span className="text-right font-mono text-neutral-200">{current.finishedHeight}mm</span>
                    <span className="text-amber-400 font-semibold">★ Cut Length:</span>
                    <span className="text-right font-mono font-bold text-amber-300">{current.cutLength}mm</span>
                    <span className="text-neutral-400">Top Bevel Angle:</span>
                    <span className="text-right font-mono text-neutral-300">{current.bevelAngleDeg}°</span>
                  </div>
                  {current.isCut && (
                    <div className="text-[10px] text-emerald-400 font-medium pt-1 text-right">
                      ✓ Cut Completed
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Visualizer Controls (Louvre Tilt & Stacking Sliders) */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Louvre Rotation */}
        <div className="flex items-center gap-3">
          <label className="text-neutral-400 flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
            <span>Louvre Rotation (Tilt):</span>
            <span className="font-mono text-amber-400 font-semibold w-8">{louvreAngle}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={louvreAngle}
            onChange={(e) => setLouvreAngle(Number(e.target.value))}
            className="flex-1 accent-amber-400"
          />
          <button
            type="button"
            onClick={() => setLouvreAngle(louvreAngle === 0 ? 90 : 0)}
            className="text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 bg-neutral-800 rounded cursor-pointer"
          >
            {louvreAngle === 0 ? 'Open (90°)' : 'Closed (0°)'}
          </button>
        </div>

        {/* Stacking / Gather Simulation */}
        <div className="flex items-center gap-3">
          <label className="text-neutral-400 flex items-center gap-1.5 shrink-0">
            <Maximize2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Louvre Stack / Draw:</span>
            <span className="font-mono text-amber-400 font-semibold w-8">{stackPercent}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={stackPercent}
            onChange={(e) => setStackPercent(Number(e.target.value))}
            className="flex-1 accent-amber-400"
          />
          <button
            type="button"
            onClick={() => setStackPercent(0)}
            className="text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 bg-neutral-800 rounded cursor-pointer"
            title="Reset stack draw to full width"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
