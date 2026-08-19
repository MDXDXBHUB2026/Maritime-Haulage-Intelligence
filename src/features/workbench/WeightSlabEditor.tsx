/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WeightSlabBand } from '../../types';
import {
  RefreshCw,
  Play,
  Trash2,
  HelpCircle,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_WEIGHT_SLABS_20,
  DEFAULT_WEIGHT_SLABS_40,
} from '../../data/demoData';

interface WeightSlabEditorProps {
  slabs20: WeightSlabBand[];
  slabs40: WeightSlabBand[];
  onUpdateSlabs20: (slabs: WeightSlabBand[]) => void;
  onUpdateSlabs40: (slabs: WeightSlabBand[]) => void;
  onApply20Headers: () => void;
  onApply40Headers: () => void;
  onRunGeneration: () => void;
  onClearOutput: () => void;
  onOpenHelp: () => void;
  direction: 'IMPORT' | 'EXPORT';
  isRunDisabled: boolean;
  disabledReason?: string;
  isGenerated: boolean;
}

export const WeightSlabEditor: React.FC<WeightSlabEditorProps> = ({
  slabs20,
  slabs40,
  onUpdateSlabs20,
  onUpdateSlabs40,
  onApply20Headers,
  onApply40Headers,
  onRunGeneration,
  onClearOutput,
  onOpenHelp,
  direction,
  isRunDisabled,
  disabledReason,
  isGenerated,
}) => {
  const isImport = direction === 'IMPORT';
  const [feedback20, setFeedback20] = useState<boolean>(false);
  const [feedback40, setFeedback40] = useState<boolean>(false);

  const handleSlab20Change = (
    index: number,
    field: 'from' | 'to',
    rawVal: string
  ) => {
    const num = parseFloat(rawVal);
    const value = isNaN(num) ? 0 : num;

    const updated = slabs20.map((s, i) => {
      if (i === index) {
        const next = { ...s, [field]: value };
        next.label = `20' <${field === 'to' ? value : next.to}t`;
        return next;
      }
      return s;
    });
    onUpdateSlabs20(updated);
  };

  const handleSlab40Change = (
    index: number,
    field: 'from' | 'to',
    rawVal: string
  ) => {
    const num = parseFloat(rawVal);
    const value = isNaN(num) ? 0 : num;

    const updated = slabs40.map((s, i) => {
      if (i === index) {
        const next = { ...s, [field]: value };
        next.label = `40' <${field === 'to' ? value : next.to}t`;
        return next;
      }
      return s;
    });
    onUpdateSlabs40(updated);
  };

  const handleTrigger20 = () => {
    onApply20Headers();
    setFeedback20(true);
    setTimeout(() => setFeedback20(false), 2200);
  };

  const handleTrigger40 = () => {
    onApply40Headers();
    setFeedback40(true);
    setTimeout(() => setFeedback40(false), 2200);
  };

  const handleResetDefaults = () => {
    onUpdateSlabs20(DEFAULT_WEIGHT_SLABS_20);
    onUpdateSlabs40(DEFAULT_WEIGHT_SLABS_40);
    onApply20Headers();
    onApply40Headers();
    setFeedback20(true);
    setFeedback40(true);
    setTimeout(() => {
      setFeedback20(false);
      setFeedback40(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between h-full">
      {/* Title & Reset Defaults */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#1769AA] text-white">
            WEIGHT SLAB DEFINITION (TONS)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Bands 1 to 5</span>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-[10px] text-slate-500 hover:text-blue-600 font-medium flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
          title="Reset standard German/European hinterland weight slabs"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Slabs</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* 20 FT WEIGHT SLABS */}
        <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
            <span className="font-bold text-[11px] text-slate-800 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>20 FT SLABS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">From / To</span>
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-slate-200">
                <th className="py-0.5 font-medium w-8">Band</th>
                <th className="py-0.5 font-medium">From (t)</th>
                <th className="py-0.5 font-medium">To (t)</th>
              </tr>
            </thead>
            <tbody>
              {slabs20.map((slab, idx) => (
                <tr key={slab.index || idx + 1} className="border-b border-slate-100 last:border-0">
                  <td className="py-0.5 font-mono text-[10px] font-bold text-slate-600">
                    {idx + 1}
                  </td>
                  <td className="py-0.5 px-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={slab.from}
                      onChange={(e) =>
                        handleSlab20Change(idx, 'from', e.target.value)
                      }
                      className="w-full text-center bg-white border border-slate-300 rounded px-1 py-0.5 text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="py-0.5 px-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={slab.to}
                      onChange={(e) =>
                        handleSlab20Change(idx, 'to', e.target.value)
                      }
                      className="w-full text-center bg-white border border-slate-300 rounded px-1 py-0.5 text-xs font-mono font-bold text-blue-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 40 FT WEIGHT SLABS */}
        <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
            <span className="font-bold text-[11px] text-slate-800 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>40 FT SLABS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">From / To</span>
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-slate-200">
                <th className="py-0.5 font-medium w-8">Band</th>
                <th className="py-0.5 font-medium">From (t)</th>
                <th className="py-0.5 font-medium">To (t)</th>
              </tr>
            </thead>
            <tbody>
              {slabs40.map((slab, idx) => (
                <tr key={slab.index || idx + 1} className="border-b border-slate-100 last:border-0">
                  <td className="py-0.5 font-mono text-[10px] font-bold text-slate-600">
                    {idx + 1}
                  </td>
                  <td className="py-0.5 px-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={slab.from}
                      onChange={(e) =>
                        handleSlab40Change(idx, 'from', e.target.value)
                      }
                      className="w-full text-center bg-white border border-slate-300 rounded px-1 py-0.5 text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="py-0.5 px-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={slab.to}
                      onChange={(e) =>
                        handleSlab40Change(idx, 'to', e.target.value)
                      }
                      className="w-full text-center bg-white border border-slate-300 rounded px-1 py-0.5 text-xs font-mono font-bold text-indigo-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION BUTTON AREA */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleTrigger20}
            className={`flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all border shadow-2xs ${
              feedback20
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Update 20ft rate column captions in the rate matrix"
          >
            {feedback20 ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>20s Slabs Updated!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Update 20s Wt. Slab</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleTrigger40}
            className={`flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all border shadow-2xs ${
              feedback40
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Update 40ft rate column captions in the rate matrix"
          >
            {feedback40 ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>40s Slabs Updated!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Update 40s Wt. Slab</span>
              </>
            )}
          </button>
        </div>

        {/* PRIMARY RUN / CLEAR / HELP BUTTONS */}
        <div className="grid grid-cols-12 gap-2 pt-1">
          <div className="col-span-6">
            <button
              type="button"
              disabled={isRunDisabled}
              onClick={onRunGeneration}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded font-bold text-xs shadow-xs transition-all ${
                isRunDisabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : isImport
                  ? 'bg-[#0B1F33] hover:bg-[#1769AA] text-white'
                  : 'bg-[#0F8B8D] hover:bg-[#0c7072] text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isImport ? 'IMPORT RUN' : 'EXPORT RUN'}</span>
            </button>
          </div>

          <div className="col-span-4">
            <button
              type="button"
              onClick={onClearOutput}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-semibold transition-colors"
              title="Delete generated haulage staging sheets"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Output</span>
            </button>
          </div>

          <div className="col-span-2">
            <button
              type="button"
              onClick={onOpenHelp}
              className="w-full flex items-center justify-center py-2 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium transition-colors"
              title="Application Technical Help & Rules"
            >
              <HelpCircle className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Status / Disabled Notification */}
        {isRunDisabled && disabledReason ? (
          <div className="flex items-center space-x-1.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span className="truncate">{disabledReason}</span>
          </div>
        ) : isGenerated ? (
          <div className="flex items-center justify-between text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
            <div className="flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Haulage & Slab Output generated</span>
            </div>
            <span className="font-mono text-emerald-600">ID 1001+</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
