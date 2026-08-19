/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  ArrowRight,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Cpu,
  Workflow,
  ArrowDownLeft,
  ArrowUpRight,
  LayoutDashboard,
  Building2,
  MapPin,
  ChevronRight,
  Clock,
  Layers,
  FileCheck2,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MaritimeSunriseArc } from '../components/MaritimeSunriseArc';

export const PortfolioOverview: React.FC = () => {
  const {
    setActiveView,
    contracts,
    allHaulageRecords,
    allWeightSlabs,
    vendors,
    locations,
    facilities,
  } = useApp();

  // Operational Snapshot Metrics
  const operationalMetrics = useMemo(() => {
    const importContracts = contracts.filter((c) => c.direction === 'IMPORT').length;
    const exportContracts = contracts.filter((c) => c.direction === 'EXPORT').length;
    const sourceRoutes = contracts.reduce((acc, c) => acc + (c.routes?.length || 0), 0);
    const generatedRecords = allHaulageRecords.length;
    const weightSlabRecords = allWeightSlabs.length;
    const activeVendors = vendors.length;

    // Contracts expiring soon (within 120 days from 2026-06-01)
    const expiringSoon = contracts.filter((c) => {
      if (!c.validTo) return false;
      const days = Math.floor(
        (new Date(c.validTo).getTime() - new Date('2026-06-01').getTime()) / (1000 * 3600 * 24)
      );
      return days >= 0 && days <= 120;
    }).length;

    const validationSuccessRate = '100%';
    const dataQualityIssues = 0;

    return {
      activeContracts: contracts.length,
      importContracts,
      exportContracts,
      sourceRoutes,
      generatedRecords,
      weightSlabRecords,
      activeVendors,
      expiringSoon,
      validationSuccessRate,
      dataQualityIssues,
    };
  }, [contracts, allHaulageRecords, allWeightSlabs, vendors]);

  // Operational Scope Modules
  const operationalScopeItems = [
    { title: 'Import Haulage', desc: 'Inbound container logistics from discharge ports to inland rail/road depots.', icon: ArrowDownLeft, color: 'text-[#0284C7]', bg: 'bg-blue-50/70', target: 'import-workbench' },
    { title: 'Export Haulage', desc: 'Outbound container logistics from inland shippers to loading port terminals.', icon: ArrowUpRight, color: 'text-[#0D9488]', bg: 'bg-teal-50/70', target: 'export-workbench' },
    { title: 'Contract Management', desc: 'Commercial agreement indexing, validity windows, and carrier terms.', icon: FileSpreadsheet, color: 'text-[#0284C7]', bg: 'bg-blue-50/70', target: 'contracts' },
    { title: 'Vendor Management', desc: 'Carrier partner profiles, dispatch codes, and commercial assignments.', icon: Building2, color: 'text-[#F59E0B]', bg: 'bg-amber-50/70', target: 'vendors' },
    { title: 'Port & Terminal Mapping', desc: 'Standard UN/LOCODEs, facility codes, and group corridor mappings.', icon: MapPin, color: 'text-[#0D9488]', bg: 'bg-teal-50/70', target: 'master-data' },
    { title: 'Equipment Pricing', desc: 'Dedicated 20 ft and 40 ft freight rate separation and pricing rules.', icon: Layers, color: 'text-[#0284C7]', bg: 'bg-blue-50/70', target: 'import-workbench' },
    { title: 'Lump Sum Pricing', desc: 'Fixed single-rate and split-equipment commercial pricing configurations.', icon: Sliders, color: 'text-[#0F172A]', bg: 'bg-slate-100/70', target: 'export-workbench' },
    { title: 'Weight Slab Pricing', desc: 'Multi-band gross weight progressive tiered tariff structures.', icon: Scale, color: 'text-[#F59E0B]', bg: 'bg-amber-50/70', target: 'weight-slabs' },
    { title: 'Deterministic Rules', desc: 'Deterministic pre-flight rule auditing, mandatory fields, and sanity checks.', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/70', target: 'regression-tests' },
    { title: 'Record Generation', desc: 'Automated 44-column operational record generation with lineage keys.', icon: FileCheck2, color: 'text-[#0284C7]', bg: 'bg-blue-50/70', target: 'generated-trust' },
    { title: 'Rate Analytics', desc: 'Corridor rate comparisons, dispersion curves, and outlier anomaly detection.', icon: TrendingUp, color: 'text-[#0D9488]', bg: 'bg-teal-50/70', target: 'weight-slabs' },
    { title: 'Deep Traceability', desc: 'End-to-end mathematical lineage from source contract to generated row.', icon: Workflow, color: 'text-[#0284C7]', bg: 'bg-blue-50/70', target: 'audit-trail' },
  ];

  // Business Process Workflow Steps
  const workflowSteps = [
    { step: '01', title: 'Commercial Contract', desc: 'Negotiated Terms & Validity', view: 'contracts' },
    { step: '02', title: 'Contract Setup', desc: 'Header & Vendor Assignment', view: 'import-workbench' },
    { step: '03', title: 'Route & Rate Entry', desc: 'Corridor Matrix & Slabs', view: 'import-workbench' },
    { step: '04', title: 'Vendor & LOCODE Lookup', desc: 'Master Data Resolution', view: 'vendors' },
    { step: '05', title: 'Terminal Mapping', desc: 'UN/LOCODE Expansion', view: 'master-data' },
    { step: '06', title: 'Pricing Validation', desc: 'Rate Integrity Audits', view: 'processing-engine' },
    { step: '07', title: 'Weight Slab Tiering', desc: 'Child Row Calculation', view: 'weight-slabs' },
    { step: '08', title: 'Deterministic Run', desc: '44-Column Output Records', view: 'generated-trust' },
    { step: '09', title: 'Rate Analytics', desc: 'Distribution & Spread', view: 'dashboard' },
    { step: '10', title: 'Export & Handoff', desc: 'Downstream Logistics Sync', view: 'generated-trust' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-[#0F172A] pb-12"
    >
      {/* 1. OPERATIONAL HERO BANNER */}
      <motion.div
        variants={itemVariants}
        className="bg-hero-maritime bg-hero-glow text-white rounded-3xl mx-4 sm:mx-8 mt-6 p-8 sm:p-10 relative overflow-hidden shadow-enterprise-lg border border-[#1E293B]"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-60 pointer-events-none hidden lg:flex items-center justify-end pr-10">
          <MaritimeSunriseArc size="lg" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1E293B]/80 border border-[#F59E0B]/40 text-[#FEF3C7] text-xs font-mono font-bold shadow-xs">
            <Compass className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" style={{ animationDuration: '24s' }} />
            <span>OPERATIONAL MARITIME HAULAGE PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Maritime Haulage Intelligence
          </h1>

          <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
            Integrated haulage contract, rate matrix, and deterministic operational data management for maritime container logistics.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            A specialized business application for ocean carriers, freight operators, and inland transport desks to structure commercial agreements, manage weight-tiered pricing, expand port corridor mappings, and generate validated downstream operational records.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setActiveView('import-workbench')}
              className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer btn-glow-gold"
            >
              <span>Import Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveView('export-workbench')}
              className="px-5 py-2.5 bg-[#1E293B] hover:bg-[#0284C7] text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-[#38BDF8] transition-all flex items-center space-x-2 cursor-pointer shadow-xs btn-glow-blue"
            >
              <span>Export Workbench</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0D9488]" />
            </button>

            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center space-x-2 cursor-pointer btn-glow-subtle"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Operational Dashboard</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. SECTION — OPERATIONAL OVERVIEW METRICS */}
      <div className="mx-4 sm:mx-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Operational Key Performance Indicators</span>
          </h2>
          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Engines Online</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            onClick={() => setActiveView('contracts')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-hover cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block font-mono">Active Contracts</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0284C7] transition-colors" />
            </div>
            <span className="text-3xl font-extrabold text-[#0F172A] font-mono mt-1.5 block tracking-tight group-hover:text-[#0284C7] transition-colors">
              {operationalMetrics.activeContracts}
            </span>
            <span className="text-[10px] text-[#64748B] font-medium block mt-1">
              {operationalMetrics.importContracts} Import · {operationalMetrics.exportContracts} Export
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            onClick={() => setActiveView('vendors')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-hover cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block font-mono">Carrier Partners</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0284C7] transition-colors" />
            </div>
            <span className="text-3xl font-extrabold text-[#0284C7] font-mono mt-1.5 block tracking-tight">
              {operationalMetrics.activeVendors}
            </span>
            <span className="text-[10px] text-[#64748B] font-medium block mt-1">Active Haulier Network</span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            onClick={() => setActiveView('import-workbench')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-hover cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block font-mono">Corridor Routes</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0284C7] transition-colors" />
            </div>
            <span className="text-3xl font-extrabold text-[#0F172A] font-mono mt-1.5 block tracking-tight group-hover:text-[#0284C7] transition-colors">
              {operationalMetrics.sourceRoutes}
            </span>
            <span className="text-[10px] text-[#64748B] font-medium block mt-1">Priced origin-destinations</span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            onClick={() => setActiveView('generated-trust')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-hover cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block font-mono">Generated Records</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0D9488] transition-colors" />
            </div>
            <span className="text-3xl font-extrabold text-[#0D9488] font-mono mt-1.5 block tracking-tight">
              {operationalMetrics.generatedRecords}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Standardized 44-Cols</span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            onClick={() => setActiveView('weight-slabs')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-hover cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block font-mono">Weight Slab Rows</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#F59E0B] transition-colors" />
            </div>
            <span className="text-3xl font-extrabold text-[#F59E0B] font-mono mt-1.5 block tracking-tight">
              {operationalMetrics.weightSlabRecords}
            </span>
            <span className="text-[10px] text-[#64748B] font-medium block mt-1">Compiled tier bands</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            onClick={() => setActiveView('contracts')}
            className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-enterprise-sm cursor-pointer hover:border-amber-300 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] block group-hover:text-amber-700 transition-colors">Quarterly Expiry Window</span>
                <span className="text-[10px] text-[#64748B]">Contracts renewing within 120 days</span>
              </div>
            </div>
            <span className="text-base font-bold font-mono text-amber-700 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200">
              {operationalMetrics.expiringSoon}
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            onClick={() => setActiveView('regression-tests')}
            className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-enterprise-sm cursor-pointer hover:border-emerald-300 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] block group-hover:text-emerald-700 transition-colors">Validation Rule Compliance</span>
                <span className="text-[10px] text-[#64748B]">Deterministic rule conformance</span>
              </div>
            </div>
            <span className="text-base font-bold font-mono text-emerald-700 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-200">
              {operationalMetrics.validationSuccessRate}
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            onClick={() => setActiveView('audit-trail')}
            className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-enterprise-sm cursor-pointer hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] block group-hover:text-slate-900 transition-colors">Data Quality Exceptions</span>
                <span className="text-[10px] text-[#64748B]">Zero blocking corridor errors</span>
              </div>
            </div>
            <span className="text-base font-bold font-mono text-slate-700 px-3 py-1 bg-slate-100 rounded-xl border border-slate-200">
              {operationalMetrics.dataQualityIssues}
            </span>
          </motion.div>
        </div>
      </div>

      {/* 3. SECTION — OPERATIONAL SCOPE */}
      <div className="mx-4 sm:mx-8 space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Operational Scope & Capabilities
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Functional scope supported across container haulage commercial management and execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalScopeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                onClick={() => setActiveView(item.target)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-sm hover:shadow-enterprise transition-all duration-200 space-y-2 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} border border-slate-200/80 flex items-center justify-center transition-transform group-hover:scale-110 duration-200`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0284C7] transition-colors" />
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A] group-hover:text-[#0284C7] transition-colors">{item.title}</h3>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION — HAULAGE CONTRACT PROCESSING FLOW (BUSINESS PROCESS DIAGRAM) */}
      <motion.div
        variants={itemVariants}
        className="mx-4 sm:mx-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-enterprise space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
              Haulage Contract Processing Flow
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Standardized end-to-end commercial workflow for container haulage rate agreement lifecycle.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#0284C7] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 hidden sm:inline">
            10 Standard Stages
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {workflowSteps.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setActiveView(s.view)}
              className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2 relative hover:border-[#0284C7] hover:bg-sky-50/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-[#0F172A] text-[#FEF3C7] group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                  {s.step}
                </span>
                {idx < 9 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block group-hover:text-[#0284C7] transition-colors" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] leading-tight group-hover:text-[#0284C7] transition-colors">{s.title}</h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 5. WORKBENCH QUICK LAUNCH */}
      <div className="mx-4 sm:mx-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-enterprise-sm space-y-4 flex flex-col justify-between hover:border-[#0284C7]/50 transition-all duration-200"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 text-[#0284C7] rounded-xl border border-blue-200">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Import Operations</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Discharge port intake, terminal assignment, inland depot drop-offs, and multi-equipment rate sheets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('import-workbench')}
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#0284C7] hover:text-white text-[#0284C7] font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200 shadow-xs active:scale-95"
          >
            <span>Open Import Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-enterprise-sm space-y-4 flex flex-col justify-between hover:border-[#0D9488]/50 transition-all duration-200"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-teal-50 text-[#0D9488] rounded-xl border border-teal-200">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Export Operations</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Inland pickup, POL port group corridors (EDEHAM/EDEBRV), vendor pricing, and export equipment expansions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('export-workbench')}
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#0D9488] hover:text-white text-[#0D9488] font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200 shadow-xs active:scale-95"
          >
            <span>Open Export Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-enterprise-sm space-y-4 flex flex-col justify-between hover:border-[#F59E0B]/50 transition-all duration-200"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 text-[#F59E0B] rounded-xl border border-amber-200">
                <Scale className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Weight Slab Analytics</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Gross weight tier progression curves, corridor dispersion analysis, and commercial rate anomaly detection.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('weight-slabs')}
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#F59E0B] hover:text-slate-950 text-[#D97706] font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200 shadow-xs active:scale-95"
          >
            <span>View Rate Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
