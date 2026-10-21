import React from 'react';
import { X, BookOpen, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ManualModalProps {
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 w-full max-w-3xl p-6 sm:p-8 rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sloped Vertical Blind Manufacturing Manual</h2>
              <p className="text-xs text-neutral-400">
                Mathematical engineering formulas, fabrication tolerances, and workshop standards
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Overview */}
        <div className="space-y-2 text-xs leading-relaxed text-neutral-300">
          <div className="p-3.5 bg-neutral-950 rounded-lg border border-neutral-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Engineering Purpose</strong>
              In raked and sloped windows, every single vertical louvre slat requires a unique finished drop length.
              This automated system computes the slope angle, hypotenuse headrail cut, finished louvre drops, and
              the <strong>exact physical fabric cut lengths</strong> including top hanger folds and bottom weight pockets with zero calculation error.
            </div>
          </div>
        </div>

        {/* Section 2: Mathematical Formulas */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Core Trigonometric Formulas</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-amber-400 font-bold block">1. Headrail Slope Angle (θ)</span>
              <code className="text-neutral-200 block font-mono bg-neutral-900 p-1.5 rounded">
                θ = arctan( |HR - HL| / W ) × (180 / π)
              </code>
              <p className="text-neutral-400 text-[11px]">
                Calculated from window width (W) and drop difference (ΔH).
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-amber-400 font-bold block">2. Sloped Headrail Cut Length (L_rail)</span>
              <code className="text-neutral-200 block font-mono bg-neutral-900 p-1.5 rounded">
                W_track = W - 20mm (10mm L + 10mm R)
                <br />
                L_rail = W_track / cos(θ)
              </code>
              <p className="text-neutral-400 text-[11px]">
                Calculated on net track width after 10mm left and right clearance deductions.
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-amber-400 font-bold block">3. Sloped Carrier Pitch & Cosine Projection</span>
              <code className="text-neutral-200 block font-mono bg-neutral-900 p-1.5 rounded">
                p_eff_horiz = p_nominal × cos(θ)
                <br />
                intervals = round( CarrierSpan_horiz / p_eff_horiz )
                <br />
                N = intervals + 1  (Slat Count)
              </code>
              <p className="text-neutral-400 text-[11px]">
                Because carrier links run along the sloped track at angle θ, a nominal 75mm pitch projects horizontally as 75mm × cos(θ) (e.g. ~68mm at 25° slope). The slat count is scaled by this effective pitch to guarantee full louvre overlap with zero light leaks.
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-amber-400 font-bold block">4. Carrier Position & Zero Overhang (X_k)</span>
              <code className="text-neutral-200 block font-mono bg-neutral-900 p-1.5 rounded">
                X_1 = 44.5mm (half of 89mm louvre)
                <br />
                X_k = 44.5 + (k - 1) × p_actual_horiz
                <br />
                S_rail(k) = X_k / cos(θ)
              </code>
              <p className="text-neutral-400 text-[11px]">
                Slat #1 starts @ 44.5mm so the outer fabric edge exactly bounds track start (X=0) with zero overhang. Carrier spacing along the rail is p_actual_rail = p_actual_horiz / cos(θ).
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1 col-span-1 sm:col-span-2">
              <span className="text-amber-400 font-bold block">5. Slat Center Opening Height (H_win)</span>
              <code className="text-neutral-200 block font-mono bg-neutral-900 p-1.5 rounded">
                x_open = 10mm + X_k
                <br />
                H_win(k) = HL + (ΔH / W) × x_open
              </code>
              <p className="text-neutral-400 text-[11px]">
                Linear opening drop calculated at the exact position inside the window opening.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Factory Deductions & Hem Allowances */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Factory Allowances & Hem Definitions</span>
          </h3>

          <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="font-bold text-neutral-200 w-36 shrink-0">Finished Drop (H_finished)</span>
              <span className="text-neutral-400">
                = <span className="text-white font-mono">H_win(k) - d_top - d_bottom</span>
                <br />
                The true finished hanging louvre drop after subtracting <strong>top track deduction (d_top: 45mm)</strong> and <strong>bottom clearance (d_bottom: 15mm)</strong>.
              </span>
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-neutral-850">
              <span className="font-bold text-amber-400 w-36 shrink-0">★ Physical Cut Length (H_cut)</span>
              <span className="text-neutral-400">
                = <span className="text-amber-300 font-mono font-bold">H_finished + f_top + f_bottom</span>
                <br />
                Finished drop plus <strong>top hanger insert fold (f_top: 20mm)</strong> and <strong>bottom weight pocket fold (f_bottom: 50mm)</strong>.
                <span className="text-white font-semibold"> (Exact measurement for the factory roll cutting table)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Workshop Tips */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Workshop Standards & Best Practices</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="font-bold text-white mb-1">1. Slat Identification Tagging</div>
              <p className="text-neutral-400">
                Immediately mark each cut louvre slat on the inner top fold with Slat # (1 to N sheets) or attach printable adhesive labels.
              </p>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="font-bold text-white mb-1">2. Bunch Towards High Side</div>
              <p className="text-neutral-400">
                For sloped tracks, stacking towards the <strong>High Side</strong> is strongly recommended to minimize carrier drag and prevent fabric collision.
              </p>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="font-bold text-white mb-1">3. Weight Plates & Spacer Chain</div>
              <p className="text-neutral-400">
                Ensure each bottom weight plate is securely inserted into the 50mm hem pocket and clip the link spacer chain evenly on both sides.
              </p>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="font-bold text-white mb-1">4. Sequential Cutting Tracking</div>
              <p className="text-neutral-400">
                Use the interactive checklist on the cutting table to tick off each slat as it is cut from the fabric roll to prevent missing sheets.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
