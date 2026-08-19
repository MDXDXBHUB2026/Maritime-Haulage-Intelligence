/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Ship,
  ArrowRight,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Terminal,
  ShieldCheck,
  Layers,
  Scale,
  ExternalLink,
  Code2,
  Cpu,
  Workflow,
  Zap,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PortfolioOverview: React.FC = () => {
  const { setActiveView, setSelectedContractId } = useApp();
  const [activeTab, setActiveTab] = useState<'flow' | 'architecture' | 'rules' | 'comparison'>('flow');

  const startDemoTour = () => {
    setSelectedContractId('hc-2026-001');
    setActiveView('dashboard');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Hero Banner with Geometric Balance Gradient */}
      <section className="bg-gradient-to-r from-indigo-700 to-blue-800 rounded-xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Public Portfolio Demonstration & Case Study</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Maritime Haulage Contract Intelligence
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-2 leading-relaxed opacity-95">
            Modernized cloud reconstruction of an enterprise maritime logistics platform. This demonstration environment simulates end-to-end processing converting negotiated commercial contracts into validated canonical haulage logistics records.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={startDemoTour}
            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-md text-xs font-bold shadow-md transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Live Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-xs font-semibold text-white transition-colors"
          >
            Architecture
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-xs font-semibold text-white transition-colors"
          >
            Logic Specs
          </button>
        </div>
      </section>

      {/* 4-Column Stat Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Seeded Vendors</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-900">05</span>
            <span className="text-xs text-slate-500 italic">DEMO001-005</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Seeded Locations</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-900">08</span>
            <span className="text-xs text-slate-500 italic">Hamburg / Prague</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Demo Contracts</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-900">05</span>
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">+ READY</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Haulage Records</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-900">124</span>
            <span className="text-xs text-slate-500 italic">Deterministic</span>
          </div>
        </div>
      </div>

      {/* Key Modernization Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">The Legacy Challenge (2015)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In 2015–2016, maritime rate contracts spanned hundreds of inland routes, varying terminal codes (e.g. DEHAMTBURC / TEURC), 20ft/40ft equipment tiers, and 5-band weight slabs. Conversion required fragile Excel worksheets, manual copy-pasting, and unmaintainable VBA macros.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Deterministic Rules Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Rebuilt in pure TypeScript with mathematical separation: all pricing rules, 4-way terminal expansions (DEHAM 20s/40s × 2), weight-slab child record creations, and legacy column serializers run deterministically without AI interference.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">AI Intelligence Layer</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Gemini assists with unstructured rate agreement extraction, plain-language validation error diagnostics, rate anomaly detection, and interactive natural-language queries — never silently altering commercial numbers.
          </p>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 space-x-6 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'flow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Business Process Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Modern Architecture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Terminal Expansion Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'comparison'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2015 Excel vs 2026 Web</span>
          </button>
        </div>

        {/* Tab 1: Business Process Flow */}
        {activeTab === 'flow' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">End-to-End Enterprise Transformation Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-blue-700">1. Contract Intake</div>
                <p className="text-slate-600 leading-relaxed">
                  Vendor selection, direction (Import/Export), validity dates, transport modes, and route pricing matrix.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">Optional AI text extraction</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-indigo-700">2. Multi-Level Validation</div>
                <p className="text-slate-600 leading-relaxed">
                  Exact vendor lookup, location code mapping, non-negative rate verification, and ascending weight-slab bounds.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">Blocks invalid generation</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-amber-700">3. Terminal Expansion</div>
                <p className="text-slate-600 leading-relaxed">
                  Generates combinations across active port facilities (e.g. DEHAM → DEHAMTBURC & TEURC for 20s/40s).
                </p>
                <div className="text-[10px] text-slate-400 font-mono">Deterministic mapping matrix</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-emerald-700">4. Haulage Generation</div>
                <p className="text-slate-600 leading-relaxed">
                  Creates canonical 44-column records with sequential IDs (1001+) and child weight-slab records sharing parent ID.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">Zero slabs omitted</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-purple-700">5. Enterprise Export</div>
                <p className="text-slate-600 leading-relaxed">
                  Export to Enterprise Haulage XLSX (with Import vs Export column ordering), CSV, and structured JSON.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">Standard serializer compatible</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Modern Architecture */}
        {activeTab === 'architecture' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Full-Stack Application Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-blue-700 text-xs uppercase tracking-wider">Frontend & Operational UI</h4>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>React 19 + TypeScript + Vite with strict type safety</li>
                  <li>Geometric Balance light aesthetic with dark Slate navigation</li>
                  <li>Deterministic state stores & local persistence for seamless recruiter demo</li>
                  <li>Explain Record drawer for audit & visual pipeline lineage</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-indigo-700 text-xs uppercase tracking-wider">Server & Intelligence Engine</h4>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Express backend proxying Gemini AI securely</li>
                  <li>Pure TypeScript deterministic rule & serialization engines</li>
                  <li>Automated regression runner with sub-5ms in-memory assertions</li>
                  <li>Direction-aware XLSX / CSV legacy column serializers</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Terminal Expansion Rules */}
        {activeTab === 'rules' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Deterministic Hamburg (DEHAM) & Bremerhaven (DEBRV) Rules</h3>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-700 space-y-2">
              <div className="font-bold text-slate-900">Hamburg (DEHAM) 4-Way Expansion Rule:</div>
              <div>• DEHAM × 20s ➔ Facility: DEHAMTBURC (Burchardkai) | Amount: 20s Rate</div>
              <div>• DEHAM × 40s ➔ Facility: DEHAMTBURC (Burchardkai) | Amount: 40s Rate</div>
              <div>• DEHAM × 20s ➔ Facility: DEHAMTEURC (Eurogate) | Amount: 20s Rate</div>
              <div>• DEHAM × 40s ➔ Facility: DEHAMTEURC (Eurogate) | Amount: 40s Rate</div>
              <div className="pt-2 font-bold text-slate-900">Bremerhaven (DEBRV) 2-Way Expansion Rule:</div>
              <div>• DEBRV × 20s ➔ Facility: DEBRVTECTB (Eurogate CTB) | Amount: 20s Rate</div>
              <div>• DEBRV × 40s ➔ Facility: DEBRVTECTB (Eurogate CTB) | Amount: 40s Rate</div>
            </div>
          </div>
        )}

        {/* Tab 4: 2015 Excel vs 2026 Web */}
        {activeTab === 'comparison' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Evolution of the System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200 space-y-2 text-rose-900">
                <h4 className="font-bold uppercase tracking-wider text-rose-700">2015–2016 Legacy State (VBA / Excel)</h4>
                <ul className="space-y-1.5 list-disc list-inside text-rose-800">
                  <li>Single-user desktop Excel workbooks (.xlsm) prone to corruption</li>
                  <li>Hard-coded VBA loops with fragile row indexing</li>
                  <li>Manual VLOOKUP operations for vendor and location codes</li>
                  <li>No audit trail or change history logging</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2 text-emerald-900">
                <h4 className="font-bold uppercase tracking-wider text-emerald-700">2026 Modernized State (Maritime Haulage Web)</h4>
                <ul className="space-y-1.5 list-disc list-inside text-emerald-800">
                  <li>Modern Web Architecture accessible on any device</li>
                  <li>100% deterministic TypeScript engines with automated test runner</li>
                  <li>Centralized master data governance for vendors, UN/LOCODEs, facilities</li>
                  <li>Complete event audit logging and deep record lineage drawer</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
