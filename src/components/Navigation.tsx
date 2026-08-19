/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  Scale,
  FileText,
  LayoutDashboard,
  Terminal,
  History,
  Database,
  Settings,
  Sparkles,
  BookOpen,
  Route,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItemProps {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  currentView: string;
  onSelect: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  id,
  label,
  icon: Icon,
  badge,
  badgeColor = 'bg-slate-800 text-slate-300 border border-slate-700',
  currentView,
  onSelect,
}) => {
  const isActive =
    currentView === id ||
    (id === 'import-workbench' && currentView === 'import-contract') ||
    (id === 'export-workbench' && currentView === 'export-contract') ||
    (id === 'generated-trust' && (currentView === 'generated-trust' || currentView === 'generated-haulage'));

  return (
    <button
      type="button"
      id={`nav-item-${id}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(id);
      }}
      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none group relative ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
      }`}
    >
      <div className="flex items-center space-x-2.5 truncate">
        <div
          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-700'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="truncate tracking-tight">{label}</span>
      </div>

      <div className="flex items-center space-x-1">
        {badge !== undefined && (
          <span
            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
              isActive ? 'bg-white/20 text-white' : badgeColor
            }`}
          >
            {badge}
          </span>
        )}
        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />}
      </div>
    </button>
  );
};

export const Navigation: React.FC = () => {
  const {
    activeView,
    setActiveView,
    contracts,
    allHaulageRecords,
    allWeightSlabs,
    vendors,
  } = useApp();

  return (
    <nav className="w-64 bg-[#0B132B] h-full flex flex-col shrink-0 border-r border-slate-800/80 text-slate-300 z-30 select-none shadow-xl">
      {/* Brand Header */}
      <div
        className="p-4 flex items-center space-x-3 cursor-pointer border-b border-slate-800 hover:bg-slate-900/60 transition-colors"
        onClick={() => setActiveView('dashboard')}
        id="nav-brand-header"
      >
        <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
          <span className="text-white font-black text-sm tracking-wider">MH</span>
        </div>
        <div className="min-w-0">
          <span className="text-white font-bold tracking-tight text-sm block truncate">
            Maritime Haulage
          </span>
          <span className="text-[10px] text-blue-400 font-mono tracking-wider font-semibold block">
            Processing Engine
          </span>
        </div>
      </div>

      {/* Nav List with custom scrollbar */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {/* ANALYTICS */}
        <div className="space-y-1">
          <div className="px-2 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center justify-between">
            <span>ANALYTICS</span>
            <span className="text-[9px] text-blue-400 font-mono">LIVE</span>
          </div>
          <NavItem
            id="dashboard"
            label="Executive Dashboard"
            icon={LayoutDashboard}
            badge="Charts"
            badgeColor="bg-blue-950 text-blue-300 border border-blue-800"
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="regression-tests"
            label="Regression Suite"
            icon={Terminal}
            badge="10/10"
            badgeColor="bg-emerald-950 text-emerald-300 border border-emerald-800"
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="traceability"
            label="Traceability Audit"
            icon={Route}
            currentView={activeView}
            onSelect={setActiveView}
          />
        </div>

        {/* OPERATIONS */}
        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <div className="px-2 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            OPERATIONS
          </div>
          <NavItem
            id="import-workbench"
            label="Import Workbench"
            icon={ArrowDownLeft}
            badge="Sheet"
            badgeColor="bg-sky-950 text-sky-300 border border-sky-800"
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="export-workbench"
            label="Export Workbench"
            icon={ArrowUpRight}
            badge="Sheet"
            badgeColor="bg-amber-950 text-amber-300 border border-amber-800"
            currentView={activeView}
            onSelect={setActiveView}
          />
        </div>

        {/* PROCESSING */}
        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <div className="px-2 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            PROCESSING
          </div>
          <NavItem
            id="generated-trust"
            label="Generated Haulage Data"
            icon={Layers}
            badge={allHaulageRecords.length}
            badgeColor="bg-emerald-950 text-emerald-300 border border-emerald-800"
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="weight-slabs"
            label="Weight Slab Data"
            icon={Scale}
            badge={allWeightSlabs.length}
            badgeColor="bg-purple-950 text-purple-300 border border-purple-800"
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="contracts"
            label="Contracts Master"
            icon={FileText}
            badge={contracts.length}
            currentView={activeView}
            onSelect={setActiveView}
          />
        </div>

        {/* ADMINISTRATION */}
        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <div className="px-2 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            ADMINISTRATION
          </div>
          <NavItem
            id="vendors"
            label="Vendor Master"
            icon={Database}
            badge={vendors.length}
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="master-data"
            label="Master Data"
            icon={Database}
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="audit-trail"
            label="Audit Trail"
            icon={History}
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="settings"
            label="Settings"
            icon={Settings}
            currentView={activeView}
            onSelect={setActiveView}
          />
        </div>

        {/* SUPPORT */}
        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <div className="px-2 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            SUPPORT & CASE STUDY
          </div>
          <NavItem
            id="ai-assistant"
            label="AI Assistant"
            icon={Sparkles}
            badge="Gemini"
            badgeColor="bg-indigo-950 text-indigo-300 border border-indigo-800"
            currentView={activeView}
            onSelect={setActiveView}
          />
          <NavItem
            id="portfolio-overview"
            label="Project Overview"
            icon={BookOpen}
            currentView={activeView}
            onSelect={setActiveView}
          />
        </div>
      </div>

      {/* Build Info Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/80 m-2 rounded-lg text-center">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="font-semibold text-slate-300">PROCESSING ENGINE</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        <div className="text-[9px] text-slate-500 mt-0.5 truncate font-mono">
          Deterministic Rule Engine
        </div>
      </div>
    </nav>
  );
};
