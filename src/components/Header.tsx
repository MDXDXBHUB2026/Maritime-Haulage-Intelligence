/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Sparkles,
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Compass,
  Cpu,
  FileSpreadsheet,
  Search,
  Scale,
  Activity,
  CheckCircle2,
  X,
  Command,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    resetDemoData,
    setActiveView,
    activeView,
    contracts,
    allHaulageRecords,
  } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary menu items for the Level 1 sticky top navbar
  const mainNavItems = [
    { id: 'portfolio-overview', label: 'Overview', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'import-workbench', label: 'Import', icon: ArrowDownLeft },
    { id: 'export-workbench', label: 'Export', icon: ArrowUpRight },
    { id: 'weight-slabs', label: 'Analytics', icon: Scale },
    { id: 'processing-engine', label: 'Processing', icon: Cpu },
    { id: 'generated-trust', label: 'Records', icon: FileSpreadsheet },
  ];

  const isNavActive = (id: string) => {
    if (id === 'portfolio-overview') return activeView === 'portfolio-overview' || activeView === 'overview';
    if (id === 'dashboard') return activeView === 'dashboard';
    if (id === 'import-workbench') return activeView === 'import-workbench' || activeView === 'import' || activeView === 'import-contract';
    if (id === 'export-workbench') return activeView === 'export-workbench' || activeView === 'export' || activeView === 'export-contract';
    if (id === 'weight-slabs') return activeView === 'weight-slabs' || activeView === 'weight-slab-data';
    if (id === 'processing-engine') return activeView === 'processing-engine' || activeView === 'engine';
    if (id === 'generated-trust') return activeView === 'generated-trust' || activeView === 'generated-haulage';
    return activeView === id;
  };

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  return (
    <>
      <header className="h-16 bg-[#0F172A] border-b border-[#1E293B] text-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 select-none shadow-enterprise">
        {/* LEFT: BRAND & LOGO MARK */}
        <div className="flex items-center space-x-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('portfolio-overview')}
            className="flex items-center space-x-3 cursor-pointer group text-left transition-transform active:scale-95"
            title="Go to Platform Overview"
          >
            {/* Logo Mark MHI */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D9488] via-[#0284C7] to-[#0F172A] border border-[#F59E0B]/40 flex items-center justify-center shadow-xs group-hover:border-[#F59E0B] group-hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all duration-300">
              <Compass className="w-5 h-5 text-[#FEF3C7] transition-transform group-hover:rotate-45 duration-300" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-sm tracking-tight group-hover:text-[#F59E0B] transition-colors">
                  MHI
                </span>
                <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                  ·
                </span>
                <span className="text-xs font-bold text-slate-200 tracking-tight hidden md:inline group-hover:text-white transition-colors">
                  Maritime Haulage Intelligence
                </span>
              </div>
              <div className="text-[10px] text-[#0D9488] font-mono font-medium hidden sm:flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse"></span>
                <span>Operational Logistics Platform</span>
              </div>
            </div>
          </button>
        </div>

        {/* CENTER: PRIMARY MENU */}
        <nav className="hidden lg:flex items-center space-x-1">
          {mainNavItems.map((item) => {
            const active = isNavActive(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`relative px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                  active
                    ? 'text-white bg-[#1E293B] shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#1E293B]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {active && (
                  <motion.span
                    layoutId="header-active-pill"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-[#F59E0B] to-[#0284C7] rounded-t-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT: LIVE STATUS BADGE & UTILITIES */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* Engine Status Pill */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1 bg-[#1E293B]/70 border border-[#334155] rounded-full text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <span className="text-slate-400">Records:</span>
            <span className="font-bold text-white">{allHaulageRecords.length}</span>
          </div>

          {/* Discreet Demo Data Badge */}
          <div
            className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B] text-[11px] font-mono font-bold tracking-tight cursor-help hover:bg-[#F59E0B]/20 transition-colors"
            title="Demonstration maritime rate environment with synthetic enterprise contracts."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
            <span>Demo Data</span>
          </div>

          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#1E293B] rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 border border-transparent hover:border-[#334155]"
            title="Quick Navigation & Search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline text-[10px] font-mono text-slate-500 bg-[#1E293B] px-1.5 py-0.5 rounded border border-[#334155]">/</span>
          </button>

          {/* Maritime Operations Assistant Trigger */}
          <button
            type="button"
            onClick={() => setActiveView('ai-assistant')}
            className={`p-2 rounded-lg transition-all cursor-pointer border ${
              activeView === 'ai-assistant'
                ? 'bg-[#0284C7] text-white border-[#38BDF8] shadow-[0_0_12px_rgba(2,132,199,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-[#1E293B] border-transparent hover:border-[#334155]'
            }`}
            title="Open Maritime Operations Assistant"
          >
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          </button>

          {/* Reset Demo Data Trigger */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#1E293B] rounded-lg transition-all cursor-pointer border border-transparent hover:border-[#334155]"
            title="Reset Demonstration Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#1E293B]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0284C7] to-[#0D9488] text-white flex items-center justify-center font-bold text-xs border border-white/20 shadow-xs">
              CA
            </div>
            <div className="hidden 2xl:block text-left leading-tight">
              <span className="text-[11px] font-bold text-slate-200 block">Commercial Analyst</span>
              <span className="text-[9px] text-[#0D9488] font-mono">Maritime Operations</span>
            </div>
          </div>
        </div>
      </header>

      {/* RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 text-slate-800"
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-amber-50 text-[#F59E0B] rounded-xl border border-amber-200 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Demo Data Environment?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    This will reload standard commercial contracts, rate matrices, and weight slabs back to default demo state.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer btn-glow-subtle"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 rounded-xl shadow-xs transition-all cursor-pointer btn-glow-gold"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK SEARCH DIALOG MODAL */}
      <AnimatePresence>
        {showSearchModal && (
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-24 z-50 p-4"
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
                <Search className="w-5 h-5 text-[#0284C7]" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search views, contracts, weight slabs, or tools..."
                  className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs text-slate-700">
                {[
                  { id: 'portfolio-overview', label: 'Platform Overview', category: 'Operations', icon: Compass },
                  { id: 'dashboard', label: 'Executive Dashboard', category: 'Analytics', icon: LayoutDashboard },
                  { id: 'import-workbench', label: 'Import Rate Workbench', category: 'Operations', icon: ArrowDownLeft },
                  { id: 'export-workbench', label: 'Export Rate Workbench', category: 'Operations', icon: ArrowUpRight },
                  { id: 'processing-engine', label: 'Processing Pipeline (8 Stages)', category: 'Processing', icon: Cpu },
                  { id: 'generated-trust', label: 'Generated Haulage Records (44-Cols)', category: 'Processing', icon: FileSpreadsheet },
                  { id: 'weight-slabs', label: 'Weight Slab Rate Intelligence', category: 'Rate Management', icon: Scale },
                  { id: 'contracts', label: 'Contract Portfolio', category: 'Operations', icon: CheckCircle2 },
                  { id: 'traceability', label: 'Operational Traceability', category: 'Governance', icon: Activity },
                  { id: 'vendors', label: 'Vendor Master', category: 'Master Data', icon: CheckCircle2 },
                  { id: 'master-data', label: 'Locations & Terminals', category: 'Master Data', icon: CheckCircle2 },
                  { id: 'help-docs', label: 'Operational User Guide', category: 'Assistance', icon: CheckCircle2 },
                  { id: 'ai-assistant', label: 'Maritime Operations Assistant', category: 'Assistance', icon: Sparkles },
                  { id: 'settings', label: 'Application Settings', category: 'Management', icon: RotateCcw },
                ]
                  .filter(
                    (i) =>
                      i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      i.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveView(item.id);
                          setShowSearchModal(false);
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between text-left cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900">{item.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
