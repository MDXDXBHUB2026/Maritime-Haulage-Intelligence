/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LumpSumMode } from '../../types';
import { CheckCircle2, Layers, DollarSign, X } from 'lucide-react';

interface LumpSumModeDialogProps {
  isOpen: boolean;
  currentMode: LumpSumMode;
  onSelectMode: (mode: LumpSumMode) => void;
  onClose: () => void;
}

export const LumpSumModeDialog: React.FC<LumpSumModeDialogProps> = ({
  isOpen,
  currentMode,
  onSelectMode,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1F33] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-sm tracking-wide">
                Lump Sum Amount Entry Mode
              </h3>
              <p className="text-[11px] text-slate-300">
                Legacy VBA Decision: How should Lump Sum amounts be entered?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Select the pricing structure for this contract. In Lump Sum mode, Weight Slab rate columns are replaced by standard flat amount column(s).
          </p>

          <div className="grid grid-cols-1 gap-3">
            {/* Option A: Single Amount */}
            <div
              onClick={() => {
                onSelectMode('SINGLE_AMOUNT');
                onClose();
              }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                currentMode === 'SINGLE_AMOUNT'
                  ? 'border-[#1769AA] bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs ${
                    currentMode === 'SINGLE_AMOUNT' ? 'bg-[#1769AA] text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    A
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">
                      Option A — Single Amount
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Displays a single <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">Amount</code> column. Both 20ft and 40ft generated records will inherit this unified general rate.
                    </div>
                  </div>
                </div>
                {currentMode === 'SINGLE_AMOUNT' && (
                  <CheckCircle2 className="w-4 h-4 text-[#1769AA] shrink-0 ml-2" />
                )}
              </div>
            </div>

            {/* Option B: Separate 20 ft and 40 ft Amounts */}
            <div
              onClick={() => {
                onSelectMode('EQUIPMENT_SPECIFIC');
                onClose();
              }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                currentMode === 'EQUIPMENT_SPECIFIC'
                  ? 'border-[#1769AA] bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs ${
                    currentMode === 'EQUIPMENT_SPECIFIC' ? 'bg-[#1769AA] text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    B
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">
                      Option B — Separate 20 ft & 40 ft Amounts
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Displays separate <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">20s Amount</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">40s Amount</code> columns. Generated 20s records use 20s Amount; 40s records use 40s Amount.
                    </div>
                  </div>
                </div>
                {currentMode === 'EQUIPMENT_SPECIFIC' && (
                  <CheckCircle2 className="w-4 h-4 text-[#1769AA] shrink-0 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded text-xs font-medium transition-colors"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};
