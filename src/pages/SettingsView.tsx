/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  DollarSign,
  Sliders,
  Table,
  BarChart3,
  Download,
  Bell,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HaulageMode, AmountType, LadenStatus, PayableAt } from '../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useApp();
  const [activeTab, setActiveTab] = useState<
    'general' | 'workbench' | 'grid' | 'analytics' | 'export' | 'notifications'
  >('general');
  const [savedNotice, setSavedNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUpdate = (updates: any) => {
    updateSettings(updates);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General Preferences', icon: DollarSign },
    { id: 'workbench', label: 'Workbench Defaults', icon: Sliders },
    { id: 'grid', label: 'Table & Grid Density', icon: Table },
    { id: 'analytics', label: 'Rate Analytics', icon: BarChart3 },
    { id: 'export', label: 'Record Serialization', icon: Download },
    { id: 'notifications', label: 'Operational Alerts', icon: Bell },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-[1500px] mx-auto space-y-6 text-[#0F172A]"
    >
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#0F172A] text-[#FEF3C7] rounded-xl border border-[#F59E0B]/40 shadow-xs">
            <Settings className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Application Settings
            </h1>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Manage operational preferences, workbench defaults, grid density, and export configurations.
            </p>
          </div>
        </div>

        {savedNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences Updated</span>
          </motion.div>
        )}
      </div>

      {/* TABS & SETTINGS BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] text-white shadow-enterprise-sm'
                    : 'bg-white text-[#0F172A] hover:bg-slate-50 border border-slate-200 shadow-xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#F59E0B]' : 'text-[#0284C7]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-3">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Baseline</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-enterprise space-y-6">
          {/* TAB 1: GENERAL PREFERENCES */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">General Operational Preferences</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Set baseline regional formats, currency standards, and freight unit metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Default Currency</label>
                  <select
                    value={settings.defaultCurrency || 'EUR'}
                    onChange={(e) => handleUpdate({ defaultCurrency: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-mono font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="EUR">EUR (€) - Eurozone Standard</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                    <option value="CZK">CZK (Kč) - Czech Koruna</option>
                  </select>
                  <p className="text-[10px] text-[#64748B]">Applied as default currency when creating new commercial contracts.</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Date Format</label>
                  <select
                    value={settings.defaultDateFormat || 'DD/MM/YYYY'}
                    onChange={(e) => handleUpdate({ defaultDateFormat: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-mono font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 01/06/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US convention)</option>
                  </select>
                  <p className="text-[10px] text-[#64748B]">Formatting used across validity periods and audit logs.</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Weight Unit</label>
                  <select
                    value={settings.weightUnit || 'Tonnes'}
                    onChange={(e) => handleUpdate({ weightUnit: e.target.value as any })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-mono font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="Tonnes">Tonnes (t) - Metric Ton</option>
                    <option value="Kilograms">Kilograms (kg)</option>
                  </select>
                  <p className="text-[10px] text-[#64748B]">Unit of measure for tiered weight slab bands.</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Default Equipment Filter</label>
                  <select
                    value={settings.defaultEquipmentView || 'ALL'}
                    onChange={(e) => handleUpdate({ defaultEquipmentView: e.target.value as any })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-mono font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="ALL">All Equipment (20 ft & 40 ft)</option>
                    <option value="20s">20 ft Standard Only</option>
                    <option value="40s">40 ft Standard Only</option>
                  </select>
                  <p className="text-[10px] text-[#64748B]">Initial equipment filtering in operational record views.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKBENCH PREFERENCES */}
          {activeTab === 'workbench' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Workbench Defaults & Entry Rules</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Configure default values when initializing route lines and contract headers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Default Opening Workbench</label>
                  <select
                    value={settings.defaultOpeningWorkbench || 'overview'}
                    onChange={(e) => handleUpdate({ defaultOpeningWorkbench: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="overview">Platform Overview</option>
                    <option value="import-workbench">Import Workbench</option>
                    <option value="export-workbench">Export Workbench</option>
                    <option value="dashboard">Executive Dashboard</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Default Haulage Mode</label>
                  <select
                    value={settings.defaultHaulageMode || 'Road'}
                    onChange={(e) => handleUpdate({ defaultHaulageMode: e.target.value as HaulageMode })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="Road">Road</option>
                    <option value="Rail">Rail</option>
                    <option value="Barge">Barge</option>
                    <option value="Combined">Combined (Intermodal)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Default Pricing Amount Type</label>
                  <select
                    value={settings.defaultAmountType || 'Wt.Slab'}
                    onChange={(e) => handleUpdate({ defaultAmountType: e.target.value as AmountType })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="Wt.Slab">Weight Slab (Tiered)</option>
                    <option value="Lumpsum">Lump Sum (Fixed)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Default Laden Status</label>
                  <select
                    value={settings.defaultLadenStatus || 'Laden'}
                    onChange={(e) => handleUpdate({ defaultLadenStatus: e.target.value as LadenStatus })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="Laden">Laden (Full Container)</option>
                    <option value="Empty">Empty (Repositioning)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Default Payable At</label>
                  <select
                    value={settings.defaultPayableAt || 'POD'}
                    onChange={(e) => handleUpdate({ defaultPayableAt: e.target.value as PayableAt })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="POD">POD (Port of Discharge)</option>
                    <option value="POL">POL (Port of Loading)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Bulk Add Rows Count</label>
                  <select
                    value={settings.defaultRowsAdded || 10}
                    onChange={(e) => handleUpdate({ defaultRowsAdded: parseInt(e.target.value, 10) })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="1">1 Row</option>
                    <option value="5">5 Rows</option>
                    <option value="10">10 Rows</option>
                    <option value="25">25 Rows</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRID PREFERENCES */}
          {activeTab === 'grid' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Table & Grid Display Density</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Customize table row spacing, column pinning, and visual cell helpers.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Compact Grid Density</span>
                    <span className="text-[10px] text-[#64748B]">Reduces cell padding for higher information density on widescreen monitors.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.compactGridDensity ?? false}
                    onChange={(e) => handleUpdate({ compactGridDensity: e.target.checked })}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Freeze Key Identifier Columns</span>
                    <span className="text-[10px] text-[#64748B]">Pins Origin, Destination, and Mode columns during horizontal scrolling.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.freezeKeyColumns ?? true}
                    onChange={(e) => handleUpdate({ freezeKeyColumns: e.target.checked })}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Highlight Inherited Header Fields</span>
                    <span className="text-[10px] text-[#64748B]">Subtly styles table cells inherited from contract headers with a neutral slate shade.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showInheritedFields ?? true}
                    onChange={(e) => handleUpdate({ showInheritedFields: e.target.checked })}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RATE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Rate Analytics & Outlier Settings</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Configure statistical bounds and filtering for weight slab dispersion curves.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Display Zero-Rate Slab Tiers</span>
                    <span className="text-[10px] text-[#64748B]">Include empty or zero-priced slab bands in analytics distribution curves.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showZeroRateSlabs ?? false}
                    onChange={(e) => handleUpdate({ showZeroRateSlabs: e.target.checked })}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Include Draft & Incomplete Contracts</span>
                    <span className="text-[10px] text-[#64748B]">Plot rates from draft contracts alongside validated active agreements.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showIncompleteContracts ?? false}
                    onChange={(e) => handleUpdate({ showIncompleteContracts: e.target.checked })}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RECORD SERIALIZATION & EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Record Serialization & Export Schema</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Configure sequential ID counters and downstream Excel worksheet formats.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Starting Record ID Counter</label>
                  <input
                    type="number"
                    value={settings.startRecordId || 1001}
                    onChange={(e) => handleUpdate({ startRecordId: parseInt(e.target.value, 10) || 1001, startTrustId: parseInt(e.target.value, 10) || 1001 })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-mono font-bold focus:outline-hidden focus:border-[#0284C7]"
                  />
                  <p className="text-[10px] text-[#64748B]">Base integer ID for newly generated 44-column operational rows.</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block">Default Export Format</label>
                  <select
                    value={settings.defaultExportFormat || 'XLSX'}
                    onChange={(e) => handleUpdate({ defaultExportFormat: e.target.value as any })}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] font-bold focus:outline-hidden focus:border-[#0284C7]"
                  >
                    <option value="XLSX">Microsoft Excel (.xlsx) - Dual Worksheet</option>
                    <option value="CSV">Comma Separated Values (.csv)</option>
                    <option value="JSON">Structured JSON Dataset (.json)</option>
                  </select>
                  <p className="text-[10px] text-[#64748B]">Default file type for one-click downstream export actions.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#0F172A] block">Standardized Column Order Compatibility</span>
                  <span className="text-[10px] text-[#64748B]">Places Payable At in Column 17 and Port To Pay in Column 18 for export contracts.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.standardizedExportMode ?? true}
                  onChange={(e) => handleUpdate({ standardizedExportMode: e.target.checked, legacyTrustCompatibility: e.target.checked })}
                  className="w-4 h-4 accent-[#0284C7] rounded"
                />
              </div>
            </div>
          )}

          {/* TAB 6: OPERATIONAL NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Operational Alerts & Validation Warnings</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Configure pre-flight alert prompts and operational notifications.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Contract Expiry Warnings</span>
                    <span className="text-[10px] text-[#64748B]">Alert when viewing contracts expiring within 90 calendar days.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyContractExpiry ?? true}
                    onChange={(e) => handleUpdate({ notifyContractExpiry: e.target.checked })}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Missing Rate & Zero-Amount Alerts</span>
                    <span className="text-[10px] text-[#64748B]">Highlight routes in matrix missing valid pricing values prior to execution.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyMissingRates ?? true}
                    onChange={(e) => handleUpdate({ notifyMissingRates: e.target.checked })}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Processing Completion Toast Alerts</span>
                    <span className="text-[10px] text-[#64748B]">Display notification banner upon completing operational record generation runs.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyProcessingComplete ?? true}
                    onChange={(e) => handleUpdate({ notifyProcessingComplete: e.target.checked })}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESET CONFIRM MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4 text-slate-800"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-50 text-[#F59E0B] rounded-2xl border border-amber-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Reset Demonstration Data?</h3>
                  <p className="text-xs text-[#64748B]">Restore baseline contracts, rate matrices, and weight slabs.</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetDemoData();
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
