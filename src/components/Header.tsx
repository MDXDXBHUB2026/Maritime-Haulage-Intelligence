/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Terminal,
  Layers,
  Sparkles,
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    settings,
    updateSettings,
    toggleTheme,
    resetDemoData,
    setActiveView,
    activeView,
  } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (activeView) {
      case 'import-workbench':
      case 'import-contract':
      case 'import':
        return 'Operations / Import Workbench';
      case 'export-workbench':
      case 'export-contract':
      case 'export':
        return 'Operations / Export Workbench';
      case 'generated-trust':
      case 'generated-haulage':
        return 'Processing / Generated Haulage Records';
      case 'weight-slabs':
        return 'Processing / Weight Slab Data';
      case 'contracts':
        return 'Processing / Contracts Master';
      case 'dashboard':
        return 'Analytics / Executive Dashboard';
      case 'regression-tests':
        return 'Analytics / Regression Suite';
      case 'traceability':
        return 'Analytics / Traceability & Audit';
      case 'vendors':
        return 'Administration / Vendor Master';
      case 'master-data':
        return 'Administration / Master Data';
      case 'audit-trail':
        return 'Administration / Audit Trail';
      case 'settings':
        return 'Administration / Settings';
      case 'ai-assistant':
        return 'Support / AI Assistant';
      case 'portfolio-overview':
        return 'Support / Project Overview';
      default:
        return 'Analytics / Executive Dashboard';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 text-slate-800 dark:text-slate-100 sticky top-0 z-40 shadow-xs select-none transition-colors">
      {/* Breadcrumb Hierarchy */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            MARITIME HAULAGE
          </button>
          <span className="text-slate-300 dark:text-slate-600 font-bold">/</span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest truncate max-w-[200px] sm:max-w-none">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Top Quick Navigation Bar */}
      <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
            activeView === 'dashboard'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('import-workbench')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
            activeView === 'import-workbench' || activeView === 'import-contract'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Import Sheet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('export-workbench')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
            activeView === 'export-workbench' || activeView === 'export-contract'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Export Sheet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('generated-trust')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
            activeView === 'generated-trust' || activeView === 'generated-haulage'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Generated Records</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('regression-tests')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
            activeView === 'regression-tests'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Tests (10/10)</span>
        </button>
      </div>

      {/* Action Bar & Demo Mode State */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Demo Mode Badge */}
        <div
          onClick={() => updateSettings({ appMode: settings.appMode === 'DEMO' ? 'PRIVATE' : 'DEMO' })}
          className={`cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full border transition-all ${
            settings.appMode === 'DEMO'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
          }`}
          title="Click to toggle Demo vs Private Mode"
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              settings.appMode === 'DEMO' ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {settings.appMode === 'DEMO' ? 'Demo Mode' : 'Private Mode'}
          </span>
        </div>

        {/* Reset Demo Data Button */}
        <div className="relative">
          {showResetConfirm ? (
            <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded-md px-2 py-1">
              <span className="text-xs text-amber-800 dark:text-amber-200 font-semibold">Reset?</span>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 rounded font-medium shadow-xs cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-1 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Reset demo dataset to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline text-xs">Reset</span>
            </button>
          )}
        </div>

        {/* Project Overview Button */}
        <button
          type="button"
          onClick={() => setActiveView('portfolio-overview')}
          className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3 py-1 text-xs rounded-md font-semibold transition-colors shadow-xs cursor-pointer"
        >
          Project Overview
        </button>
      </div>
    </header>
  );
};
