/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Building2,
  MapPin,
  Cpu,
  FileCheck2,
  TrendingUp,
  Workflow,
  Download,
  Settings,
  Search,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HelpTopic {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  summary: string;
  content: string[];
  tips?: string[];
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'overview',
    title: 'Platform Overview',
    category: 'Getting Started',
    icon: BookOpen,
    summary: 'Core concepts, system purpose, and key functional modules.',
    content: [
      'Maritime Haulage Intelligence is an operational container haulage contract and rate management system designed for ocean carriers, freight forwarders, and logistics desks.',
      'The platform structures commercial agreements, manages route matrices across 20 ft and 40 ft equipment, validates pricing integrity, and generates standardized 44-column operational records with full audit traceability.',
      'Key capabilities include import/export rate workbenches, weight slab progression analysis, automated corridor terminal expansion, and downstream record generation.',
    ],
    tips: [
      'Use the top search bar (Ctrl+K) to rapidly navigate between contracts, workbenches, and rate views.',
    ],
  },
  {
    id: 'creating-contract',
    title: 'Creating a Contract',
    category: 'Commercial Setup',
    icon: FileSpreadsheet,
    summary: 'Structuring new commercial agreements, validity windows, and currency terms.',
    content: [
      'Navigate to Contracts > New Contract, or begin directly in either the Import Workbench or Export Workbench.',
      'Specify the Contract Number, Direction (Import or Export), Validity Dates (Valid From and Valid To), Negotiator Name, Carrier Vendor, and Payment Currency.',
      'Define payment terms including Payable At (POL / POD) and Port to Pay UN/LOCODE.',
    ],
    tips: [
      'Contract numbers should follow standard enterprise conventions (e.g. MHI-IMP-2026-001).',
    ],
  },
  {
    id: 'import-workbench',
    title: 'Import Workbench',
    category: 'Operations',
    icon: ArrowDownLeft,
    summary: 'Inbound haulage workflows from discharge ports to inland customer locations.',
    content: [
      'In Import mode, the Pick Up Port/Location is fixed at the contract header level (e.g. Hamburg DEHAM).',
      'The Drop Destination is specified per route row in the rate matrix (e.g. Prague CZPRG, Munich DEMUC).',
      'The system automatically maps discharge terminals (e.g. HHLA TBURC, Eurogate TEURC) for equipment expansion during processing.',
    ],
    tips: [
      'Changing the header pickup location immediately propagates to all linked import routes.',
    ],
  },
  {
    id: 'export-workbench',
    title: 'Export Workbench',
    category: 'Operations',
    icon: ArrowUpRight,
    summary: 'Outbound haulage workflows from inland shippers to loading port terminals.',
    content: [
      'In Export mode, the Return Port/Location is fixed at the contract header level (e.g. Hamburg EDEHAM or Bremerhaven EDEBRV).',
      'The Pick Up Origin is specified per route row in the rate matrix.',
      'Corridor groups such as EDEHAM automatically resolve to loading terminal facilities for standardized operational output.',
    ],
    tips: [
      'Ensure the correct export port code is selected to enable accurate vendor terminal mapping.',
    ],
  },
  {
    id: 'route-entry',
    title: 'Route & Rate Matrix Entry',
    category: 'Operations',
    icon: FileSpreadsheet,
    summary: 'Adding, editing, and bulk-importing corridor route rows.',
    content: [
      'Use + Add Row or + Add 10 Rows to append new corridor lines to the active contract.',
      'Each route requires an origin/destination UN/LOCODE, location name, haulage mode (Road, Rail, Barge, Combined), and pricing amounts.',
      'Excel Clipboard Integration: Copy rows directly from Microsoft Excel (Ctrl+C) and click Paste Excel Data to bulk import dozens of routes instantaneously.',
    ],
    tips: [
      'Pasting from Excel supports multi-column tabular data including origin, destination, mode, and rates.',
    ],
  },
  {
    id: 'lump-sum-pricing',
    title: 'Lump Sum Pricing',
    category: 'Rate Management',
    icon: Scale,
    summary: 'Fixed-rate single amount or separate 20 ft / 40 ft pricing configurations.',
    content: [
      'Lump Sum pricing applies fixed rate amounts per container route without weight tiering.',
      'Single Amount Mode: Applies a single rate column uniformly across all equipment categories.',
      'Equipment-Specific Mode: Provides distinct rate columns for 20 ft and 40 ft containers (e.g. €450 for 20s and €680 for 40s).',
    ],
  },
  {
    id: 'weight-slab-pricing',
    title: 'Weight Slab Pricing',
    category: 'Rate Management',
    icon: Scale,
    summary: 'Configuring 5-band progressive gross weight tiered tariff structures.',
    content: [
      'When Amount Type is set to Weight Slab, 10 rate columns are available (5 tiers for 20 ft and 5 tiers for 40 ft).',
      'Weight thresholds are defined in the Weight Slab Editor (e.g. Band 1: 0–10t, Band 2: 10.01–15t, up to Band 5: >24t).',
      'Click Update Wt. Slab Columns to synchronize the table column header labels with your customized weight thresholds.',
      'In generated operational records, main haulage rows carry AmountType "Wt.Slab" with zero main amount, while child weight slab rows are generated for every active tier.',
    ],
    tips: [
      'Rates must strictly follow ascending progression (each higher weight tier rate must be >= previous tier rate).',
    ],
  },
  {
    id: 'processing-engine',
    title: 'Processing Engine & Generation',
    category: 'Operational Engine',
    icon: Cpu,
    summary: 'Automated 5-stage pipeline for deterministic operational record generation.',
    content: [
      'The processing pipeline executes 5 stages: Contract Parsing -> Master Data Resolution -> Equipment & Terminal Expansion -> Weight Slab Calculation -> Lineage Stamping.',
      'Expansion rule: For each route, terminal entries (e.g. TBURC, TEURC) and equipment types (20s, 40s) expand into discrete 44-column operational rows.',
      'ID generation: Deterministic sequential IDs (starting at 1001 for Import and 2001 for Export) link main records with child weight slabs.',
    ],
  },
  {
    id: 'generated-records',
    title: 'Generated Haulage Records',
    category: 'Operational Engine',
    icon: FileCheck2,
    summary: 'Standardized 44-column canonical dataset, filters, and Excel/CSV export.',
    content: [
      'Generated records display the complete 44-column canonical schema (Contract #, Equipment, Pickup/Drop Terminals, Rate, Validity, Vendor, Lineage Trace).',
      'Use the filter panel to slice records by Direction, Vendor, Corridor, Equipment, and Date Range.',
      'Export formatted Excel (.xlsx) workbooks or UTF-8 CSV datasets directly to your local workstation for TMS integration.',
    ],
  },
  {
    id: 'rate-analytics',
    title: 'Rate Analytics & Weight Slabs',
    category: 'Analytics',
    icon: TrendingUp,
    summary: 'Corridor rate distribution, tier progression curves, and outlier anomaly detection.',
    content: [
      'Weight Slab Progression: Visualizes rate curve steepness across 5 gross weight bands for 20 ft and 40 ft equipment.',
      'Corridor Comparison: Cross-corridor benchmark charts showing rate variations across German, Dutch, and Austrian hinterland hubs.',
      'Statistical Outlier Detection: Identifies inverted rate bands or abnormal unit prices deviating >2.0 standard deviations from corridor averages.',
    ],
  },
  {
    id: 'traceability',
    title: 'Record Lineage & Traceability',
    category: 'Governance',
    icon: Workflow,
    summary: 'Auditing mathematical lineage from source contract cell to output record.',
    content: [
      'Click Explain on any generated haulage record to open the Lineage Inspector Drawer.',
      'Inspect the exact contract number, revision, route sequence, terminal expansion rule, and pricing formula that produced the row.',
      'AI Narrative Assistant: Generates natural language summaries explaining complex terminal mapping and weight tier calculation steps.',
    ],
  },
];

export const HelpView: React.FC = () => {
  const { setActiveView } = useApp();
  const [selectedTopicId, setSelectedTopicId] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedTopic = HELP_TOPICS.find((t) => t.id === selectedTopicId) || HELP_TOPICS[0];

  const filteredTopics = HELP_TOPICS.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.content.some((c) => c.toLowerCase().includes(q))
    );
  });

  const categories = Array.from(new Set(HELP_TOPICS.map((t) => t.category)));

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
            <BookOpen className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Operational Documentation & Knowledge Base
            </h1>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Comprehensive user guide for haulage contract workflows, pricing models, and operational record generation.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation topics..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-hidden focus:border-[#0284C7] shadow-xs font-medium"
          />
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: TOPICS LIST + DETAIL VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TOPICS SIDEBAR */}
        <div className="lg:col-span-4 space-y-4">
          {categories.map((cat) => {
            const catTopics = filteredTopics.filter((t) => t.category === cat);
            if (catTopics.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B] px-2 block">
                  {cat}
                </span>

                <div className="space-y-1">
                  {catTopics.map((topic) => {
                    const Icon = topic.icon;
                    const isSelected = topic.id === selectedTopic.id;

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={`w-full text-left p-3 rounded-2xl text-xs transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-[#0F172A] text-white shadow-enterprise-sm'
                            : 'bg-white text-[#0F172A] hover:bg-slate-50 border border-slate-200/80 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-white/10 text-[#FEF3C7]'
                                : 'bg-slate-100 text-[#0284C7] group-hover:scale-105 transition-transform'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className="font-bold block truncate tracking-tight">{topic.title}</span>
                            <span
                              className={`text-[10px] truncate block ${
                                isSelected ? 'text-slate-300' : 'text-[#64748B]'
                              }`}
                            >
                              {topic.summary}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isSelected
                              ? 'text-[#F59E0B] translate-x-0.5'
                              : 'text-slate-300 group-hover:text-[#0284C7]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* TOPIC DETAIL CONTENT */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-enterprise space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="p-3 bg-blue-50 text-[#0284C7] rounded-2xl border border-blue-200">
              <selectedTopic.icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {selectedTopic.category}
              </span>
              <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight mt-1">
                {selectedTopic.title}
              </h2>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 leading-relaxed">
            {selectedTopic.summary}
          </div>

          {/* Paragraphs */}
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed font-sans">
            {selectedTopic.content.map((p, idx) => (
              <p key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                {p}
              </p>
            ))}
          </div>

          {/* Tips / Operational Best Practices */}
          {selectedTopic.tips && selectedTopic.tips.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Operational Pro-Tip</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800 text-xs">
                {selectedTopic.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Launch Buttons based on topic */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('import-workbench')}
              className="px-4 py-2 bg-slate-50 hover:bg-[#0284C7] hover:text-white text-[#0284C7] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-200 cursor-pointer active:scale-95 shadow-xs"
            >
              <span>Import Workbench</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveView('export-workbench')}
              className="px-4 py-2 bg-slate-50 hover:bg-[#0D9488] hover:text-white text-[#0D9488] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-200 cursor-pointer active:scale-95 shadow-xs"
            >
              <span>Export Workbench</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveView('processing-engine')}
              className="px-4 py-2 bg-slate-50 hover:bg-[#0F172A] hover:text-white text-[#0F172A] rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-200 cursor-pointer active:scale-95 shadow-xs"
            >
              <span>Processing Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
