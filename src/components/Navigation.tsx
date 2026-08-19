/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  FileText,
  LayoutDashboard,
  History,
  Settings,
  Sparkles,
  Route,
  ChevronRight,
  Cpu,
  Compass,
  Building2,
  MapPin,
  Box,
  PanelLeftClose,
  PanelLeftOpen,
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItemProps {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  currentView: string;
  isCollapsed: boolean;
  onSelect: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  id,
  label,
  icon: Icon,
  badge,
  badgeColor = 'bg-[#1E293B] text-slate-300 border border-[#334155]',
  currentView,
  isCollapsed,
  onSelect,
}) => {
  const isActive =
    currentView === id ||
    (id === 'portfolio-overview' && (currentView === 'portfolio' || currentView === 'overview')) ||
    (id === 'import-workbench' && (currentView === 'import-contract' || currentView === 'import')) ||
    (id === 'export-workbench' && (currentView === 'export-contract' || currentView === 'export')) ||
    (id === 'generated-trust' && (currentView === 'generated-trust' || currentView === 'generated-haulage')) ||
    (id === 'help-docs' && (currentView === 'help' || currentView === 'docs'));

  return (
    <button
      type="button"
      id={`sidebar-nav-${id}`}
      title={isCollapsed ? label : undefined}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(id);
      }}
      className={`w-full flex items-center ${
        isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
      } text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer select-none group relative ${
        isActive
          ? 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-enterprise-xs'
          : 'text-slate-400 hover:text-slate-100 hover:bg-[#1E293B]/70 active:scale-[0.98]'
      }`}
    >
      {/* Active Gold Left Indicator Pip */}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#F59E0B] rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
      )}

      <div className="flex items-center space-x-2.5 truncate">
        <div
          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isActive
              ? 'text-[#FEF3C7]'
              : 'text-slate-400 group-hover:text-[#0D9488]'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        {!isCollapsed && <span className="truncate tracking-tight">{label}</span>}
      </div>

      {!isCollapsed && (
        <div className="flex items-center space-x-1">
          {badge !== undefined && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full ${
                isActive ? 'bg-[#0F172A] text-[#FEF3C7] border border-[#F59E0B]/40' : badgeColor
              }`}
            >
              {badge}
            </span>
          )}
          {isActive && <ChevronRight className="w-3 h-3 text-[#FEF3C7] shrink-0" />}
        </div>
      )}
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

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav
      className={`${
        isCollapsed ? 'w-[68px]' : 'w-[230px]'
      } bg-[#0F172A] h-full flex flex-col shrink-0 border-r border-[#1E293B] text-slate-300 z-30 select-none shadow-xl transition-all duration-200`}
    >
      {/* Sidebar Collapse Toggle Header */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-[#1E293B]">
        {!isCollapsed && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Operations Menu
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 text-slate-400 hover:text-white hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#F59E0B]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {/* 1. OPERATIONS */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              OPERATIONS
            </div>
          )}
          <NavItem
            id="portfolio-overview"
            label="Overview"
            icon={Compass}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="import-workbench"
            label="Import Workbench"
            icon={ArrowDownLeft}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="export-workbench"
            label="Export Workbench"
            icon={ArrowUpRight}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="contracts"
            label="Contracts"
            icon={FileText}
            badge={contracts.length}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
        </div>

        {/* 2. RATE MANAGEMENT */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              RATE MANAGEMENT
            </div>
          )}
          <NavItem
            id="weight-slabs"
            label="Weight Slab Analytics"
            icon={Scale}
            badge={allWeightSlabs.length}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
        </div>

        {/* 3. PROCESSING */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              PROCESSING
            </div>
          )}
          <NavItem
            id="processing-engine"
            label="Processing Engine"
            icon={Cpu}
            badge="8-Stage"
            badgeColor="bg-[#1E293B] text-[#F59E0B] border border-[#F59E0B]/30"
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="generated-trust"
            label="Generated Records"
            icon={FileSpreadsheet}
            badge={allHaulageRecords.length}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="traceability"
            label="Audit & Traceability"
            icon={Route}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
        </div>

        {/* 4. MASTER DATA */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              MASTER DATA
            </div>
          )}
          <NavItem
            id="vendors"
            label="Vendors"
            icon={Building2}
            badge={vendors.length}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="master-data"
            label="Locations & Terminals"
            icon={MapPin}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="migration"
            label="Port Equipment Matrix"
            icon={Box}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
        </div>

        {/* 5. MANAGEMENT */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              MANAGEMENT
            </div>
          )}
          <NavItem
            id="audit-trail"
            label="Audit Trail"
            icon={History}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="settings"
            label="System Settings"
            icon={Settings}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
        </div>

        {/* 6. ASSISTANCE */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              ASSISTANCE
            </div>
          )}
          <NavItem
            id="help-docs"
            label="Help & User Guide"
            icon={HelpCircle}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
          <NavItem
            id="ai-assistant"
            label="Operations Assistant"
            icon={Sparkles}
            currentView={activeView}
            isCollapsed={isCollapsed}
            onSelect={setActiveView}
          />
        </div>
      </div>
    </nav>
  );
};
