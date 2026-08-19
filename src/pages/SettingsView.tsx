/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useApp();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-slate-500" />
          <span>System & Enterprise Compatibility Settings</span>
        </h1>
        <p className="text-xs text-slate-500">
          Configure export serialization, sequential ID assignments, and portfolio demonstration environment
        </p>
      </div>

      <div className="space-y-4">
        {/* Export Compatibility Option */}
        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Standard Excel Compatibility Mode</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                When enabled, Export records serialize with <strong>Payable At</strong> in Column 17 and <strong>Port To Pay</strong> in Column 18 (mirroring standard enterprise templates). Weight slab files use the 5-column schema (<code className="text-amber-800 font-mono">Size, From, To, Amount, Id</code>).
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateSettings({
                  legacyTrustCompatibility: !settings.legacyTrustCompatibility,
                })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.legacyTrustCompatibility ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.legacyTrustCompatibility ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Start Record ID */}
        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Starting Sequential Haulage Record ID</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Base integer ID for newly generated haulage records. Each record increments sequentially, and child weight slabs inherit the exact parent Record ID.
              </p>
            </div>

            <input
              type="number"
              value={settings.startTrustId}
              onChange={(e) =>
                updateSettings({
                  startTrustId: parseInt(e.target.value, 10) || 1001,
                })
              }
              className="w-24 bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-sm px-3 py-1.5 rounded-md text-center focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Runtime Mode */}
        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Application Runtime Mode</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                <strong>Portfolio Demo Mode</strong> uses sanitized synthetic datasets. <strong>Private Mode</strong> allows internal operational experimentation and custom migrations.
              </p>
            </div>

            <div className="flex items-center bg-slate-100 rounded-md p-1 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => updateSettings({ appMode: 'DEMO' })}
                className={`px-3 py-1.5 rounded-sm transition-colors ${
                  settings.appMode === 'DEMO'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Portfolio Demo
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ appMode: 'PRIVATE' })}
                className={`px-3 py-1.5 rounded-sm transition-colors ${
                  settings.appMode === 'PRIVATE'
                    ? 'bg-white text-blue-800 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Private Mode
              </button>
            </div>
          </div>
        </div>

        {/* Reset Demo Data */}
        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Reset Demonstration Dataset</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Restores all 5 demonstration vendors (NorthSea Inland Logistics GmbH, etc.), 5 sample contracts, port mappings, and pre-generated haulage records to the default portfolio state.
              </p>
            </div>

            {showConfirmReset ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    resetDemoData();
                    setShowConfirmReset(false);
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-bold transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-amber-800 border border-slate-200 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Dataset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
