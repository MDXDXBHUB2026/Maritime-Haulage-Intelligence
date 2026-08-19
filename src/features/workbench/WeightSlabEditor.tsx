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
  Scale,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  DEFAULT_WEIGHT_SLABS_20,
  DEFAULT_WEIGHT_SLABS_40,
} from '../../data/demoData';

interface WeightSlabEditorProps {
  slabs20: WeightSlabBand[];
  slabs40: WeightSlabBand[];
  onUpdate20?: (slabs: WeightSlabBand[]) => void;
  onUpdate40?: (slabs: WeightSlabBand[]) => void;
  onUpdateSlabs20?: (slabs: WeightSlabBand[]) => void;
  onUpdateSlabs40?: (slabs: WeightSlabBand[]) => void;
  onApply20Headers?: () => void;
  onApply40Headers?: () => void;
  direction?: 'IMPORT' | 'EXPORT';
}

export const WeightSlabEditor: React.FC<WeightSlabEditorProps> = ({
  slabs20,
  slabs40,
  onUpdate20,
  onUpdate40,
  onUpdateSlabs20,
  onUpdateSlabs40,
  onApply20Headers,
  onApply40Headers,
  direction = 'IMPORT',
}) => {
  const [feedback20, setFeedback20] = useState<boolean>(false);
  const [feedback40, setFeedback40] = useState<boolean>(false);

  const update20 = onUpdate20 || onUpdateSlabs20 || (() => {});
  const update40 = onUpdate40 || onUpdateSlabs40 || (() => {});

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
    update20(updated);
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
    update40(updated);
  };

  const handleTrigger20 = () => {
    if (onApply20Headers) onApply20Headers();
    update20([...slabs20]);
    setFeedback20(true);
    setTimeout(() => setFeedback20(false), 2200);
  };

  const handleTrigger40 = () => {
    if (onApply40Headers) onApply40Headers();
    update40([...slabs40]);
    setFeedback40(true);
    setTimeout(() => setFeedback40(false), 2200);
  };

  const handleResetDefaults = () => {
    update20(DEFAULT_WEIGHT_SLABS_20);
    update40(DEFAULT_WEIGHT_SLABS_40);
    if (onApply20Headers) onApply20Headers();
    if (onApply40Headers) onApply40Headers();
    setFeedback20(true);
    setFeedback40(true);
    setTimeout(() => {
      setFeedback20(false);
      setFeedback40(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E1E7EC] shadow-enterprise-sm p-5 space-y-4">
      {/* Title & Reset Defaults */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E1E7EC]">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider bg-[#17212B] text-[#FFF4DB] border border-[#F5A623]/30">
            WEIGHT SLAB BRACKETS
          </span>
          <span className="text-xs text-[#5C6B78] font-mono">
            Standard European Hinterland Weight Tiers (5 Bands)
          </span>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-xs text-[#5C6B78] hover:text-[#176B9B] font-bold flex items-center space-x-1.5 px-2.5 py-1 rounded-lg hover:bg-[#F5F7FA] border border-[#E1E7EC] transition-colors cursor-pointer"
          title="Reset standard German/European hinterland weight slabs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 20 FT WEIGHT SLABS (Maritime Blue #176B9B) */}
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-200">
            <span className="font-bold text-xs text-[#176B9B] flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#176B9B]" />
              <span>20 FT WEIGHT SLABS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Standard Corridor Tiers</span>
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-blue-200/60 font-bold uppercase">
                <th className="py-1 w-10">Band</th>
                <th className="py-1">From (t)</th>
                <th className="py-1">To (t)</th>
                <th className="py-1">Matrix Header</th>
              </tr>
            </thead>
            <tbody>
              {slabs20.map((slab, idx) => (
                <tr key={slab.index || idx + 1} className="border-b border-blue-100 last:border-0 text-xs">
                  <td className="py-1 font-mono font-bold text-slate-600">
                    Tier {idx + 1}
                  </td>
                  <td className="py-1 px-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={slab.from}
                      onChange={(e) => handleSlab20Change(idx, 'from', e.target.value)}
                      className="w-full text-center bg-white border border-[#E1E7EC] rounded-lg px-1.5 py-1 text-xs font-mono font-medium text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                    />
                  </td>
                  <td className="py-1 px-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={slab.to}
                      onChange={(e) => handleSlab20Change(idx, 'to', e.target.value)}
                      className="w-full text-center bg-white border border-[#E1E7EC] rounded-lg px-1.5 py-1 text-xs font-mono font-bold text-[#176B9B] focus:border-[#176B9B] focus:outline-hidden"
                    />
                  </td>
                  <td className="py-1 font-mono font-bold text-xs text-slate-600">
                    20' &lt;{slab.to}t
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={handleTrigger20}
            className={`w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all border shadow-xs cursor-pointer ${
              feedback20
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white hover:bg-blue-100/50 text-[#176B9B] border-blue-300'
            }`}
          >
            {feedback20 ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>20s Matrix Columns Synced!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#176B9B]" />
                <span>Sync 20ft Weight Slab Columns</span>
              </>
            )}
          </button>
        </div>

        {/* 40 FT WEIGHT SLABS (Ocean Teal #168C8C) */}
        <div className="border border-teal-200 rounded-xl p-4 bg-teal-50/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-teal-200">
            <span className="font-bold text-xs text-[#168C8C] flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#168C8C]" />
              <span>40 FT WEIGHT SLABS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Heavy Equipment Tiers</span>
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-teal-200/60 font-bold uppercase">
                <th className="py-1 w-10">Band</th>
                <th className="py-1">From (t)</th>
                <th className="py-1">To (t)</th>
                <th className="py-1">Matrix Header</th>
              </tr>
            </thead>
            <tbody>
              {slabs40.map((slab, idx) => (
                <tr key={slab.index || idx + 1} className="border-b border-teal-100 last:border-0 text-xs">
                  <td className="py-1 font-mono font-bold text-slate-600">
                    Tier {idx + 1}
                  </td>
                  <td className="py-1 px-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={slab.from}
                      onChange={(e) => handleSlab40Change(idx, 'from', e.target.value)}
                      className="w-full text-center bg-white border border-[#E1E7EC] rounded-lg px-1.5 py-1 text-xs font-mono font-medium text-[#18212B] focus:border-[#168C8C] focus:outline-hidden"
                    />
                  </td>
                  <td className="py-1 px-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={slab.to}
                      onChange={(e) => handleSlab40Change(idx, 'to', e.target.value)}
                      className="w-full text-center bg-white border border-[#E1E7EC] rounded-lg px-1.5 py-1 text-xs font-mono font-bold text-[#168C8C] focus:border-[#168C8C] focus:outline-hidden"
                    />
                  </td>
                  <td className="py-1 font-mono font-bold text-xs text-slate-600">
                    40' &lt;{slab.to}t
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={handleTrigger40}
            className={`w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all border shadow-xs cursor-pointer ${
              feedback40
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white hover:bg-teal-100/50 text-[#168C8C] border-teal-300'
            }`}
          >
            {feedback40 ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>40s Matrix Columns Synced!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#168C8C]" />
                <span>Sync 40ft Weight Slab Columns</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
