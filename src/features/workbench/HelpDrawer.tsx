/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Layers, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: 'IMPORT' | 'EXPORT';
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({
  isOpen,
  onClose,
  direction = 'IMPORT',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-[#0B1F33] text-white px-6 py-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-400/30 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-slate-100">
                Application User Guide & Technical Manual
              </h2>
              <p className="text-xs text-blue-300 font-mono">
                Legacy 2015–2016 VBA Haulage Workbench Refactor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Overview */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1769AA]" />
              1. Haulage Workbench Architecture
            </h3>
            <p className="text-slate-600 mb-3">
              This operational workbench provides high-throughput maritime haulage contract automation. It connects header-level logistics terms with an editable 35-column route matrix and generates canonical formatted haulage records and child Weight Slab staging rows.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">Import Mode</span>
                Pick Up Port/Location is fixed at contract header level (e.g. <code className="font-mono text-blue-700">DEHAM</code>). Drop Destinations are specified per route.
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">Export Mode</span>
                Return Port/Location is fixed at contract header level. Pick Up Origins are specified per route in the grid.
              </div>
            </div>
          </div>

          {/* Section 2: Weight Slab vs Lump Sum Rules */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F8B8D]" />
              2. Amount Types & Pricing Models
            </h3>
            <div className="space-y-3">
              <div className="bg-blue-50/60 p-3 rounded border border-blue-200/60">
                <div className="font-semibold text-blue-900 mb-1">Weight Slab (Wt.Slab)</div>
                <p className="text-slate-600 mb-2">
                  When Amount Type is set to <strong>Wt.Slab</strong>, 10 rate columns appear (5 for 20ft and 5 for 40ft). In the generated main haulage records, the general Amount field is set to <strong>0</strong>. Separate child Weight Slab records are generated for all active non-zero rates referencing the parent Record ID.
                </p>
                <div className="text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-blue-100">
                  Child Schema: Size (20s/40s) | From (t) | To (t) | Amount (€) | ID (Parent Seq)
                </div>
              </div>

              <div className="bg-amber-50/60 p-3 rounded border border-amber-200/60">
                <div className="font-semibold text-amber-900 mb-1">Lump Sum (Lumpsum)</div>
                <p className="text-slate-600 mb-1">
                  Weight Slab columns are hidden. You can choose between:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                  <li><strong>Single Amount:</strong> One <code className="font-mono bg-white px-1 py-0.5 rounded">Amount</code> column applied uniformly to all equipment sizes.</li>
                  <li><strong>Separate 20s/40s Amounts:</strong> Two separate rate columns where 20s equipment uses <code className="font-mono bg-white px-1 py-0.5 rounded">20s Amount</code> and 40s equipment uses <code className="font-mono bg-white px-1 py-0.5 rounded">40s Amount</code>.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Deterministic Port Mapping Expansion */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              3. Port Terminal & Equipment Expansion Engine
            </h3>
            <p className="text-slate-600 mb-3">
              The deterministic engine expands each source route row into multiple canonical haulage records based on active terminal mappings:
            </p>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-mono font-bold text-slate-800">Hamburg (DEHAM) Import:</span>
                <span className="text-slate-600">1 route → <strong>4 records</strong> (HHLA TBURC 20s/40s + Eurogate TEURC 20s/40s)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-mono font-bold text-slate-800">Bremerhaven (DEBRV) Import:</span>
                <span className="text-slate-600">1 route → <strong>2 records</strong> (Eurogate TECTB 20s/40s)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-mono font-bold text-slate-800">Hamburg Export (EDEHAM):</span>
                <span className="text-slate-600">1 route → <strong>2 records</strong> (HHLA TBURC 20s/40s)</span>
              </div>
            </div>
          </div>

          {/* Section 4: Spreadsheet Productivity & Shortcuts */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              4. Grid Controls & Excel Copy/Paste
            </h3>
            <ul className="space-y-1.5 text-slate-600">
              <li>• <strong>Inherited Cells:</strong> Shown in subtle slate background. Changing the contract header immediately propagates updates across all active rows.</li>
              <li>• <strong>Update Slabs:</strong> Click <em>Update 20s / 40s Wt. Slab Columns</em> to dynamically refresh table column header labels from the slab threshold inputs.</li>
              <li>• <strong>Add Rows:</strong> Use <em>+ Add Row</em> or <em>+ Add 10 Rows</em> for rapid bulk data entry.</li>
              <li>• <strong>Excel Clipboard:</strong> Select cells in Microsoft Excel, copy (<kbd className="px-1 py-0.5 bg-slate-100 border rounded font-mono">Ctrl+C</kbd>), and use <em>Paste Excel Data</em> to import multi-column tabular routes instantly.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Maritime Haulage Intelligence Engine • Deterministic Core
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0B1F33] text-white hover:bg-slate-800 rounded text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
