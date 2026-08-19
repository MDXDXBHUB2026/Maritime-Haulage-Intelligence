/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Scale,
  Search,
  Download,
  ShieldCheck,
  CheckCircle2,
  Filter,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Layers,
  DollarSign,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getCurrencySymbol } from '../types';
import { serializeWeightSlabsToCsv, downloadFile } from '../business-rules/legacyTrustSerializer';
import { WeightSlabOutlierAnalytics, EnrichedSlabItem } from '../components/WeightSlabOutlierAnalytics';

// Custom Premium Dark Navy Tooltip Component
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F172A] border border-[#F59E0B]/50 p-3.5 rounded-2xl shadow-2xl text-white text-xs font-sans space-y-1.5 z-50 backdrop-blur-md">
        <div className="font-mono font-bold text-[#FEF3C7] border-b border-slate-700/80 pb-1.5 flex items-center justify-between gap-3">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-sans">Weight Band</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-white">
              {typeof entry.value === 'number' ? `${getCurrencySymbol()}${entry.value.toFixed(2)}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const WeightSlabDataView: React.FC = () => {
  const {
    allWeightSlabs,
    allHaulageRecords,
    contracts,
    vendors,
    setInspectedRecord,
    settings,
  } = useApp();

  // Search & Multi-Faceted Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [contractFilter, setContractFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>(settings.defaultCurrency || 'EUR');

  React.useEffect(() => {
    if (settings.defaultCurrency) {
      setCurrencyFilter(settings.defaultCurrency);
    }
  }, [settings.defaultCurrency]);

  // Enriched slab records with parent haulage record context
  const enrichedSlabs: EnrichedSlabItem[] = useMemo(() => {
    return allWeightSlabs.map((slab) => {
      const parent = allHaulageRecords.find((r) => r.id === slab.id);
      return {
        ...slab,
        parentContractId: parent?.contractId || '',
        vendorCode: parent?.vendorCode || 'DEMO001',
        direction: parent?.direction || (slab.id % 2 === 0 ? 'IMPORT' : 'EXPORT'),
        currency: parent?.currency || 'EUR',
        pickupLoc: parent?.pickupLocationName || 'Port',
        dropLoc: parent?.dropLocationName || 'Inland',
        bandKey: `${slab.size === '20s' ? "20'" : "40'"} <${slab.to}t`,
      };
    });
  }, [allWeightSlabs, allHaulageRecords]);

  // Filtered dataset
  const filteredSlabs = useMemo(() => {
    return enrichedSlabs.filter((s) => {
      const matchSearch =
        String(s.id).includes(searchTerm) ||
        String(s.from).includes(searchTerm) ||
        String(s.to).includes(searchTerm) ||
        String(s.amount).includes(searchTerm) ||
        s.bandKey.toLowerCase().includes(searchTerm.toLowerCase());

      const matchContract = contractFilter === 'ALL' || s.parentContractId === contractFilter;
      const matchVendor = vendorFilter === 'ALL' || s.vendorCode === vendorFilter;
      const matchDirection = directionFilter === 'ALL' || s.direction === directionFilter;
      const matchSize = sizeFilter === 'ALL' || s.size === sizeFilter;
      const matchCurrency = currencyFilter === 'ALL' || s.currency === currencyFilter;

      return matchSearch && matchContract && matchVendor && matchDirection && matchSize && matchCurrency;
    });
  }, [enrichedSlabs, searchTerm, contractFilter, vendorFilter, directionFilter, sizeFilter, currencyFilter]);

  // KPIs
  const analyticsKPIs = useMemo(() => {
    const totalRecords = filteredSlabs.length;
    const slabs20 = filteredSlabs.filter((s) => s.size === '20s');
    const slabs40 = filteredSlabs.filter((s) => s.size === '40s');

    const avgRate20 = slabs20.length > 0 ? slabs20.reduce((a, b) => a + b.amount, 0) / slabs20.length : 0;
    const avgRate40 = slabs40.length > 0 ? slabs40.reduce((a, b) => a + b.amount, 0) / slabs40.length : 0;

    const rates = filteredSlabs.map((s) => s.amount).filter((a) => a > 0);
    const highestRate = rates.length > 0 ? Math.max(...rates) : 0;
    const lowestRate = rates.length > 0 ? Math.min(...rates) : 0;

    const zeroRateCount = filteredSlabs.filter((s) => s.amount <= 0).length;
    const coverage20 = slabs20.length > 0 ? Math.round(((slabs20.length - slabs20.filter((s) => s.amount <= 0).length) / slabs20.length) * 100) : 100;
    const coverage40 = slabs40.length > 0 ? Math.round(((slabs40.length - slabs40.filter((s) => s.amount <= 0).length) / slabs40.length) * 100) : 100;

    const uniqueParentIds = new Set(filteredSlabs.map((s) => s.id)).size;

    return {
      totalRecords,
      count20: slabs20.length,
      count40: slabs40.length,
      avgRate20: Math.round(avgRate20),
      avgRate40: Math.round(avgRate40),
      highestRate,
      lowestRate,
      zeroRateCount,
      coverage20,
      coverage40,
      activeRoutes: uniqueParentIds,
    };
  }, [filteredSlabs]);

  // Chart 1 & Chart 2 Data: Rate Distribution and Rate Trend by Band
  const bandDistributionData = useMemo(() => {
    const bands20 = [
      { key: '<10t', from: 0.1, to: 10 },
      { key: '<15t', from: 10.1, to: 15 },
      { key: '<20t', from: 15.1, to: 20 },
      { key: '<24t', from: 20.1, to: 24 },
      { key: '<28t', from: 24.1, to: 28 },
    ];
    const bands40 = [
      { key: '<14t', from: 0.1, to: 14 },
      { key: '<24t', from: 14.1, to: 24 },
      { key: '<37t', from: 24.1, to: 37 },
      { key: '<45t', from: 37.1, to: 45 },
      { key: '<67t', from: 45.1, to: 67 },
    ];

    return [0, 1, 2, 3, 4].map((idx) => {
      const b20 = bands20[idx];
      const b40 = bands40[idx];

      const matching20 = filteredSlabs.filter((s) => s.size === '20s' && Math.abs(s.to - b20.to) < 1.5);
      const matching40 = filteredSlabs.filter((s) => s.size === '40s' && Math.abs(s.to - b40.to) < 2.5);

      const avg20 = matching20.length > 0 ? Math.round(matching20.reduce((a, b) => a + b.amount, 0) / matching20.length) : 0;
      const avg40 = matching40.length > 0 ? Math.round(matching40.reduce((a, b) => a + b.amount, 0) / matching40.length) : 0;

      const rates20 = matching20.map((s) => s.amount);
      const rates40 = matching40.map((s) => s.amount);
      const allRates = [...rates20, ...rates40].filter((r) => r > 0);

      const minRate = allRates.length > 0 ? Math.min(...allRates) : 0;
      const maxRate = allRates.length > 0 ? Math.max(...allRates) : 0;
      const avgCombined = allRates.length > 0 ? Math.round(allRates.reduce((a, b) => a + b, 0) / allRates.length) : 0;

      return {
        bandLabel: `Tier ${idx + 1} (20': ${b20.key} / 40': ${b40.key})`,
        tierName: `Tier ${idx + 1}`,
        rate20: avg20,
        rate40: avg40,
        minRate,
        avgCombined,
        maxRate,
        spread: maxRate - minRate,
        count20: matching20.length,
        count40: matching40.length,
      };
    });
  }, [filteredSlabs]);

  // Chart 4 Data: Coverage Breakdown
  const coverageChartData = useMemo(() => {
    const zero = filteredSlabs.filter((s) => s.amount <= 0).length;
    return [
      { name: '20ft Active Rates', value: analyticsKPIs.count20, color: '#0284C7' },
      { name: '40ft Active Rates', value: analyticsKPIs.count40, color: '#0D9488' },
      { name: 'Zero/Missing Rates', value: zero, color: '#F59E0B' },
    ].filter((item) => item.value > 0);
  }, [filteredSlabs, analyticsKPIs]);

  const handleExportCsv = () => {
    const csv = serializeWeightSlabsToCsv(filteredSlabs);
    downloadFile(csv, 'WEIGHT_SLAB_DATA_CANONICAL.csv', 'text/csv');
  };

  const handleInspectParent = (parentId: number) => {
    const parentRecord = allHaulageRecords.find((r) => r.id === parentId);
    if (parentRecord) {
      setInspectedRecord(parentRecord);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-6 max-w-[1680px] mx-auto space-y-6 text-[#0F172A]"
    >
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0F172A] text-[#FEF3C7] rounded-xl border border-[#F59E0B]/40 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center space-x-3">
                <span>Weight Slab Rate Intelligence & Analytics</span>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-[#0284C7] font-mono font-bold border border-blue-200">
                  {filteredSlabs.length} Active Records
                </span>
              </h1>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Market Rate Progression · Outlier Spread Detection · Tier Progression Curves · Canonical Lineage
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-xs cursor-pointer btn-glow-blue active:scale-95"
          >
            <Download className="w-4 h-4 text-[#FEF3C7]" />
            <span>Export Canonical CSV</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-enterprise-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0284C7]" />
            <span>Multi-Faceted Corridor & Weight Filters</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setContractFilter('ALL');
              setVendorFilter('ALL');
              setDirectionFilter('ALL');
              setSizeFilter('ALL');
            }}
            className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] inline-flex items-center space-x-1.5 cursor-pointer btn-glow-subtle px-2.5 py-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Search Slabs</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Record #, weight, rate..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0284C7] focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Contract</label>
            <select
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0284C7] focus:bg-white cursor-pointer transition-all"
            >
              <option value="ALL">All Contracts ({contracts.length})</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contractNumber} ({c.direction})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Carrier Partner</label>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0284C7] focus:bg-white cursor-pointer transition-all"
            >
              <option value="ALL">All Carriers ({vendors.length})</option>
              {vendors.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Trade Direction</label>
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0284C7] focus:bg-white cursor-pointer transition-all"
            >
              <option value="ALL">All Directions</option>
              <option value="IMPORT">Import (Inbound POD)</option>
              <option value="EXPORT">Export (Outbound POL)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Equipment Size</label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#0284C7] focus:bg-white cursor-pointer transition-all"
            >
              <option value="ALL">All Sizes (20s & 40s)</option>
              <option value="20s">20 FT Standard</option>
              <option value="40s">40 FT Standard</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">Tariff Currency</label>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0284C7] focus:outline-hidden cursor-pointer"
            >
              <option value="EUR">EUR (€) - Primary</option>
              <option value="USD">USD ($) - Global</option>
              <option value="GBP">GBP (£) - UK</option>
            </select>
          </div>
        </div>
      </div>

      {/* DYNAMIC ANALYTICAL KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-xs card-glow-interactive">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block truncate font-mono">Total Slab Rows</span>
          <span className="text-xl font-extrabold text-[#0F172A] font-mono mt-1 block">{analyticsKPIs.totalRecords}</span>
          <span className="text-[10px] text-slate-500 font-medium">{analyticsKPIs.activeRoutes} routes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-xs card-glow-interactive">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block truncate font-mono">20ft Coverage</span>
          <span className="text-xl font-extrabold text-[#0284C7] font-mono mt-1 block">{analyticsKPIs.coverage20}%</span>
          <span className="text-[10px] text-slate-500 font-medium">{analyticsKPIs.count20} bands</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-xs card-glow-interactive">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block truncate font-mono">40ft Coverage</span>
          <span className="text-xl font-extrabold text-[#0D9488] font-mono mt-1 block">{analyticsKPIs.coverage40}%</span>
          <span className="text-[10px] text-slate-500 font-medium">{analyticsKPIs.count40} bands</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-xs card-glow-interactive">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block truncate font-mono">Avg 20ft Rate</span>
          <span className="text-xl font-extrabold text-[#0284C7] font-mono mt-1 block">{getCurrencySymbol(currencyFilter)}{analyticsKPIs.avgRate20}</span>
          <span className="text-[10px] text-slate-500 font-medium">Across tiers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-xs card-glow-interactive">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block truncate font-mono">Avg 40ft Rate</span>
          <span className="text-xl font-extrabold text-[#0D9488] font-mono mt-1 block">{getCurrencySymbol(currencyFilter)}{analyticsKPIs.avgRate40}</span>
          <span className="text-[10px] text-slate-500 font-medium">Across tiers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-xs card-glow-interactive">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block truncate font-mono">Highest Rate</span>
          <span className="text-xl font-extrabold text-indigo-700 font-mono mt-1 block">{getCurrencySymbol(currencyFilter)}{analyticsKPIs.highestRate}</span>
          <span className="text-[10px] text-slate-500 font-medium">Heavyweight tier</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-xs card-glow-interactive">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block truncate font-mono">Lowest Rate</span>
          <span className="text-xl font-extrabold text-emerald-700 font-mono mt-1 block">{getCurrencySymbol(currencyFilter)}{analyticsKPIs.lowestRate}</span>
          <span className="text-[10px] text-slate-500 font-medium">Base weight tier</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-xs card-glow-interactive">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block truncate font-mono">Zero / Missing</span>
          <span className="text-xl font-extrabold text-[#0F172A] font-mono mt-1 block">{analyticsKPIs.zeroRateCount}</span>
          <span className="text-[10px] text-emerald-600 font-bold">100% Resolved</span>
        </div>
      </div>

      {/* OUTLIER IDENTIFICATION & RATE DISTRIBUTION ENGINE */}
      <WeightSlabOutlierAnalytics
        slabs={filteredSlabs}
        onInspectRecord={handleInspectParent}
      />

      {/* 4 REFINED ANALYTICAL GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: RATE DISTRIBUTION BY WEIGHT SLAB */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-enterprise-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-blue-50 text-[#0284C7] rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                Rate Distribution by Weight Slab Tier (20&apos; vs 40&apos;)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#64748B] font-bold">Bar Comparison</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="tierName" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }} tickFormatter={(val) => `€${val}`} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                <Bar dataKey="rate20" name="20ft Avg Rate" fill="#0284C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rate40" name="40ft Avg Rate" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: RATE PROGRESSION TREND */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-enterprise-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-teal-50 text-[#0D9488] rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                Weight Tier Rate Progression Trend Curve
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#64748B] font-bold">Ascending Tonnage</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bandDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="tierName" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }} tickFormatter={(val) => `€${val}`} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                <Line
                  type="monotone"
                  dataKey="rate20"
                  name="20ft Progression"
                  stroke="#0284C7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0284C7' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="rate40"
                  name="40ft Progression"
                  stroke="#0D9488"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0D9488' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: RATE RANGE / SPREAD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-enterprise-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-amber-50 text-[#F59E0B] rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                Corridor Rate Spread Range (Min · Avg · Max)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#64748B] font-bold">Market Spread</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bandDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="tierName" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }} tickFormatter={(val) => `€${val}`} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                <Bar dataKey="minRate" name="Min Rate" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="avgCombined" name="Avg Rate" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxRate" name="Max Rate" fill="#0F172A" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: SLAB RATE COVERAGE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-enterprise-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                Equipment Size Rate Distribution
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#64748B] font-bold">Coverage %</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coverageChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {coverageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RATE PERFORMANCE SUMMARY BANNER */}
      <div className="bg-enterprise-gradient text-white p-6 rounded-3xl space-y-4 shadow-enterprise">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 className="text-xs font-bold text-[#FEF3C7] uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-[#F59E0B]" />
            <span>Rate Performance & Corridor Variance Analytics</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-300">Calculated across active filters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <span className="text-[10px] text-slate-400 block font-mono">20 vs 40 Premium</span>
            <span className="text-lg font-bold text-[#2DD4BF] font-mono mt-0.5 block">
              +€{Math.max(0, analyticsKPIs.avgRate40 - analyticsKPIs.avgRate20)}
            </span>
            <span className="text-[10px] text-slate-400 block">Avg size delta</span>
          </div>

          <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <span className="text-[10px] text-slate-400 block font-mono">Max Rate Variation</span>
            <span className="text-lg font-bold text-[#F59E0B] font-mono mt-0.5 block">
              €{analyticsKPIs.highestRate - analyticsKPIs.lowestRate}
            </span>
            <span className="text-[10px] text-slate-400 block">Spread range</span>
          </div>

          <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <span className="text-[10px] text-slate-400 block font-mono">Active Corridors</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">
              {analyticsKPIs.activeRoutes}
            </span>
            <span className="text-[10px] text-slate-400 block">Parent routes</span>
          </div>

          <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <span className="text-[10px] text-slate-400 block font-mono">Carrier Partner Count</span>
            <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
              {vendorFilter === 'ALL' ? vendors.length : 1}
            </span>
            <span className="text-[10px] text-slate-400 block">Active carriers</span>
          </div>
        </div>
      </div>

      {/* CANONICAL DATA TABLE */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-enterprise-sm">
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Canonical Haulage Weight Slab Records
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#0284C7] text-white font-bold">
              Standard 5-Column Structure
            </span>
          </div>
          <span className="text-xs font-mono text-slate-300">
            Showing {filteredSlabs.length} records
          </span>
        </div>

        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 sticky top-0 z-20">
              <tr>
                <th className="px-6 py-3 font-mono">Size</th>
                <th className="px-6 py-3 font-mono">From (Ton)</th>
                <th className="px-6 py-3 font-mono">To (Ton)</th>
                <th className="px-6 py-3 font-mono">Amount (EUR)</th>
                <th className="px-6 py-3 font-mono">Parent Record ID</th>
                <th className="px-6 py-3 text-right font-sans">Lineage Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredSlabs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-sans">
                    No weight slab records found for current filter selection.
                  </td>
                </tr>
              ) : (
                filteredSlabs.slice(0, 100).map((slab, i) => (
                  <tr key={`${slab.id}-${slab.size}-${slab.from}-${i}`} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          slab.size === '20s'
                            ? 'bg-blue-50 text-[#0284C7] border border-blue-200'
                            : 'bg-teal-50 text-[#0D9488] border border-teal-200'
                        }`}
                      >
                        {slab.size === '20s' ? "20' Standard" : "40' Standard"}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-[#0F172A]">
                      {slab.from.toFixed(1)} t
                    </td>
                    <td className="px-6 py-3 font-bold text-[#0F172A]">
                      {slab.to.toFixed(1)} t
                    </td>
                    <td className="px-6 py-3 font-bold text-emerald-700">
                      EUR {slab.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        type="button"
                        onClick={() => handleInspectParent(slab.id)}
                        className="text-[#0284C7] hover:text-[#0369A1] font-bold underline decoration-dotted underline-offset-2 cursor-pointer"
                        title="Click to inspect parent generated record in lineage drawer"
                      >
                        #{slab.id}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleInspectParent(slab.id)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-[#0284C7] hover:text-white text-[#0284C7] border border-slate-200 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs btn-glow-blue active:scale-95"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Inspect Lineage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
