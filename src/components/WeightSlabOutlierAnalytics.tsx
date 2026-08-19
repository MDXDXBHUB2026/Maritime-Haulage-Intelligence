/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sliders,
  Sparkles,
  Zap,
  Layers,
  BarChart3,
  Scale,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';

export interface EnrichedSlabItem {
  id: number;
  size: '20s' | '40s';
  from: number;
  to: number;
  amount: number;
  parentContractId: string;
  vendorCode: string;
  direction: string;
  currency: string;
  pickupLoc: string;
  dropLoc: string;
  bandKey: string;
}

interface WeightSlabOutlierAnalyticsProps {
  slabs: EnrichedSlabItem[];
  onInspectRecord: (recordId: number) => void;
}

import { getCurrencySymbol } from '../types';

// Custom Tooltip for Analytics Charts
const OutlierChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    const currSym = getCurrencySymbol(data?.currency);
    return (
      <div className="bg-[#0F172A] border border-[#F59E0B]/50 p-4 rounded-2xl shadow-2xl text-white text-xs font-sans space-y-2.5 z-50 max-w-xs backdrop-blur-md">
        <div className="font-mono font-bold text-[#FEF3C7] border-b border-slate-700/80 pb-2 flex items-center justify-between gap-2">
          <span className="truncate">{label || data?.corridorLabel || 'Corridor'}</span>
          {data?.isOutlier ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700 animate-pulse">
              OUTLIER ({data?.deviationPercent > 0 ? '+' : ''}{data?.deviationPercent}%)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600">
              BENCHMARK
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-[11px]">
          {data?.amount !== undefined && (
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">Actual Rate:</span>
              <span className="font-mono font-bold text-white text-sm">{currSym}{Number(data?.amount).toFixed(2)}</span>
            </div>
          )}
          {data?.tierAvg !== undefined && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Tier Benchmark:</span>
              <span className="font-mono font-bold text-[#F59E0B]">{currSym}{Number(data?.tierAvg).toFixed(2)}</span>
            </div>
          )}
          {data?.avg20 !== undefined && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">20 ft Avg Rate:</span>
              <span className="font-mono font-bold text-[#38BDF8]">{currSym}{Number(data?.avg20).toFixed(2)}</span>
            </div>
          )}
          {data?.avg40 !== undefined && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">40 ft Avg Rate:</span>
              <span className="font-mono font-bold text-[#2DD4BF]">{currSym}{Number(data?.avg40).toFixed(2)}</span>
            </div>
          )}
          {data?.lowerBound !== undefined && data?.upperBound !== undefined && (
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Corridor Band:</span>
              <span className="font-mono text-slate-300">
                {currSym}{Number(data?.lowerBound).toFixed(0)} – {currSym}{Number(data?.upperBound).toFixed(0)}
              </span>
            </div>
          )}
          {data?.deviationPercent !== undefined && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/80">
              <span className="text-slate-400">Variance Delta:</span>
              <span
                className={`font-mono font-extrabold ${
                  data?.deviationPercent > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {data?.deviationPercent > 0 ? `+${data?.deviationPercent}%` : `${data?.deviationPercent}%`}
              </span>
            </div>
          )}
          {data?.bandKey && (
            <div className="text-[10px] text-slate-400 font-mono pt-0.5">
              {data?.size === '20s' ? '20 ft Standard' : '40 ft Standard'} · {data?.bandKey}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const WeightSlabOutlierAnalytics: React.FC<WeightSlabOutlierAnalyticsProps> = ({
  slabs,
  onInspectRecord,
}) => {
  // Configurable Outlier Sensitivity Threshold (15%, 20%, 25%, 35%)
  const [varianceThreshold, setVarianceThreshold] = useState<number>(20);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<'ALL' | '20s' | '40s'>('ALL');
  const [outlierOnlyFilter, setOutlierOnlyFilter] = useState<boolean>(false);
  const [chartViewMode, setChartViewMode] = useState<'tier-progression' | 'corridor-rates'>('tier-progression');

  // Compute Outlier Statistics per Tier and Equipment Size
  const { analyzedData, outliers, summaryStats, tierProgressionData, corridorData, topDeviations } = useMemo(() => {
    // Group slabs by Tier Band + Size
    const tierGroups: Record<string, number[]> = {};
    slabs.forEach((s) => {
      const key = `${s.size}_${s.to}`;
      if (!tierGroups[key]) tierGroups[key] = [];
      if (s.amount > 0) tierGroups[key].push(s.amount);
    });

    // Calculate statistical benchmarks for each group (Mean, Median, Standard Deviation, Bounds)
    const statsMap: Record<string, { avg: number; stdDev: number; q1: number; q3: number; lower: number; upper: number }> = {};
    Object.entries(tierGroups).forEach(([key, rates]) => {
      if (rates.length === 0) {
        statsMap[key] = { avg: 500, stdDev: 50, q1: 450, q3: 550, lower: 400, upper: 650 };
        return;
      }
      const sorted = [...rates].sort((a, b) => a - b);
      const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
      const variance = rates.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / rates.length;
      const stdDev = Math.sqrt(variance);

      const q1 = sorted[Math.floor(sorted.length * 0.25)] || sorted[0];
      const q3 = sorted[Math.floor(sorted.length * 0.75)] || sorted[sorted.length - 1];
      const iqr = q3 - q1;

      // Upper and Lower bounds modulated by the sensitivity threshold
      const thresholdFactor = 1 + varianceThreshold / 100;
      const lowerFactor = 1 - varianceThreshold / 100;
      const upper = Math.max(q3 + 1.2 * iqr, avg * thresholdFactor);
      const lower = Math.max(30, Math.min(q1 - 1.2 * iqr, avg * lowerFactor));

      statsMap[key] = { avg, stdDev, q1, q3, lower, upper };
    });

    // Score and tag each slab record
    const scored = slabs.map((s, index) => {
      const key = `${s.size}_${s.to}`;
      const benchmark = statsMap[key] || { avg: 500, stdDev: 50, q1: 450, q3: 550, lower: 400, upper: 650 };
      const devPercent = benchmark.avg > 0 ? Math.round(((s.amount - benchmark.avg) / benchmark.avg) * 100) : 0;
      const isHighOutlier = s.amount > benchmark.upper || devPercent >= varianceThreshold;
      const isLowOutlier = s.amount < benchmark.lower || devPercent <= -varianceThreshold || s.amount <= 0;
      const isOutlier = isHighOutlier || isLowOutlier;

      return {
        ...s,
        index: index + 1,
        tierAvg: Math.round(benchmark.avg),
        lowerBound: Math.round(benchmark.lower),
        upperBound: Math.round(benchmark.upper),
        deviationPercent: devPercent,
        isOutlier,
        outlierType: isHighOutlier ? ('HIGH' as const) : isLowOutlier ? ('LOW' as const) : ('NORMAL' as const),
        route: `${s.pickupLoc} → ${s.dropLoc}`,
        displayLabel: `${s.dropLoc || s.pickupLoc} · ${s.bandKey} (${s.size})`,
      };
    });

    const flaggedOutliers = scored.filter((s) => s.isOutlier);
    const highCount = flaggedOutliers.filter((s) => s.outlierType === 'HIGH').length;
    const lowCount = flaggedOutliers.filter((s) => s.outlierType === 'LOW').length;

    // 1. TIER PROGRESSION ENVELOPES (0t -> 30t)
    const uniqueTiers = Array.from(new Set<number>(slabs.map((s) => Number(s.to)))).sort((a: number, b: number) => a - b);
    const progression = uniqueTiers.map((t) => {
      const key20 = `20s_${t}`;
      const key40 = `40s_${t}`;
      const b20 = statsMap[key20] || { avg: 450, lower: 380, upper: 550 };
      const b40 = statsMap[key40] || { avg: 720, lower: 600, upper: 890 };

      // Find actual slab rates in this tier
      const tierSlabs20 = slabs.filter((s) => s.size === '20s' && Number(s.to) === t);
      const tierSlabs40 = slabs.filter((s) => s.size === '40s' && Number(s.to) === t);

      return {
        tierLabel: `Band <${t}t`,
        tonnage: t,
        avg20: Math.round(b20.avg),
        lower20: Math.round(b20.lower),
        upper20: Math.round(b20.upper),
        avg40: Math.round(b40.avg),
        lower40: Math.round(b40.lower),
        upper40: Math.round(b40.upper),
        benchmarkAvg: Math.round((b20.avg + b40.avg) / 2),
        count20: tierSlabs20.length,
        count40: tierSlabs40.length,
      };
    });

    // 2. CORRIDOR BENCHMARK AGGREGATION
    const corridorMap: Record<string, { route: string; drop: string; avg20: number; avg40: number; benchmark: number; count: number }> = {};
    scored.forEach((s) => {
      const key = `${s.pickupLoc}→${s.dropLoc}`;
      if (!corridorMap[key]) {
        corridorMap[key] = {
          route: key,
          drop: s.dropLoc,
          avg20: 0,
          avg40: 0,
          benchmark: 0,
          count: 0,
        };
      }
      corridorMap[key].count += 1;
    });

    const corridorList = Object.values(corridorMap).slice(0, 10).map((c) => {
      const matching20 = scored.filter((s) => `${s.pickupLoc}→${s.dropLoc}` === c.route && s.size === '20s');
      const matching40 = scored.filter((s) => `${s.pickupLoc}→${s.dropLoc}` === c.route && s.size === '40s');
      const avg20 = matching20.length > 0 ? Math.round(matching20.reduce((sum, s) => sum + s.amount, 0) / matching20.length) : 0;
      const avg40 = matching40.length > 0 ? Math.round(matching40.reduce((sum, s) => sum + s.amount, 0) / matching40.length) : 0;
      return {
        ...c,
        avg20,
        avg40,
        benchmark: Math.round((avg20 + avg40) / 2),
        upperLimit: Math.round(((avg20 + avg40) / 2) * (1 + varianceThreshold / 100)),
      };
    });

    // 3. TOP VARIANCE DEVIATIONS (Distinct and cleanly formatted)
    const deviationPool = flaggedOutliers.length >= 6 ? flaggedOutliers : scored;
    const sortedDeviations = [...deviationPool]
      .sort((a, b) => Math.abs(b.deviationPercent) - Math.abs(a.deviationPercent))
      .slice(0, 8)
      .map((item) => ({
        ...item,
        cleanLabel: `${item.dropLoc || item.pickupLoc} · ${item.bandKey.split(' ')[0]} (${item.size})`,
      }));

    return {
      analyzedData: scored,
      outliers: flaggedOutliers,
      summaryStats: {
        totalAnalyzed: scored.length,
        outliersCount: flaggedOutliers.length,
        highCount,
        lowCount,
        normalCount: scored.length - flaggedOutliers.length,
        anomalyPercentage: scored.length > 0 ? ((flaggedOutliers.length / scored.length) * 100).toFixed(1) : '0.0',
      },
      tierProgressionData: progression,
      corridorData: corridorList,
      topDeviations: sortedDeviations,
    };
  }, [slabs, varianceThreshold]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-enterprise p-6 sm:p-8 space-y-6">
      {/* 1. SECTION HEADER & REFINED OUTLIER CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0F172A] text-[#FEF3C7] text-[11px] font-mono font-bold border border-[#F59E0B]/40 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>MARITIME PRICING INTELLIGENCE · RATE SPREAD & ANOMALY ANALYTICS</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight flex items-center space-x-2">
            <span>Weight Slab Rate Distribution & Outlier Identification</span>
          </h2>
          <p className="text-xs text-[#64748B] font-medium">
            Identify commercial pricing anomalies, tariff spikes, and rate bracket deviations across weight slabs at a glance.
          </p>
        </div>

        {/* CONTROLS: Sensitivity Threshold & Filter Modes */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Outlier Filter Toggle */}
          <button
            type="button"
            onClick={() => setOutlierOnlyFilter(!outlierOnlyFilter)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer border shadow-xs ${
              outlierOnlyFilter
                ? 'bg-rose-600 text-white border-rose-700 btn-glow-rose'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 btn-glow-subtle'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${outlierOnlyFilter ? 'text-white' : 'text-rose-600'}`} />
            <span>{outlierOnlyFilter ? 'Showing Outliers Only' : 'Flag Outliers Only'}</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                outlierOnlyFilter ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {summaryStats.outliersCount}
            </span>
          </button>

          {/* Equipment Size Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedSizeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSizeFilter === 'ALL'
                  ? 'bg-white text-[#0F172A] shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Sizes
            </button>
            <button
              type="button"
              onClick={() => setSelectedSizeFilter('20s')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSizeFilter === '20s'
                  ? 'bg-[#0284C7] text-white shadow-xs btn-glow-blue'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              20 FT
            </button>
            <button
              type="button"
              onClick={() => setSelectedSizeFilter('40s')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSizeFilter === '40s'
                  ? 'bg-[#0D9488] text-white shadow-xs btn-glow-teal'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              40 FT
            </button>
          </div>

          {/* Sensitivity Threshold Selector */}
          <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-600">Sensitivity:</span>
            <select
              value={varianceThreshold}
              onChange={(e) => setVarianceThreshold(Number(e.target.value))}
              className="bg-transparent text-xs font-mono font-bold text-[#0284C7] focus:outline-hidden cursor-pointer"
            >
              <option value={15}>±15% (Strict)</option>
              <option value={20}>±20% (Standard)</option>
              <option value={25}>±25% (Moderate)</option>
              <option value={35}>±35% (Broad)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. OUTLIER SCORECARD STATS (PREMIUM GLOW CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-sm card-glow-interactive">
          <div className="flex items-center justify-between text-[#64748B] text-[10px] font-mono font-bold uppercase">
            <span>Total Evaluated</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F172A] font-mono mt-1.5 tracking-tight">
            {summaryStats.totalAnalyzed} <span className="text-xs font-sans text-slate-500 font-normal">Records</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{summaryStats.normalCount} within target corridor</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-enterprise-sm card-glow-rose">
          <div className="flex items-center justify-between text-rose-700 text-[10px] font-mono font-bold uppercase">
            <span>Flagged Outliers</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 font-mono mt-1.5 tracking-tight">
            {summaryStats.outliersCount} <span className="text-xs font-sans text-rose-600 font-normal">Anomalies</span>
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">
            {summaryStats.anomalyPercentage}% rate deviation rate
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-enterprise-sm card-glow-gold">
          <div className="flex items-center justify-between text-amber-800 text-[10px] font-mono font-bold uppercase">
            <span>High Surcharges</span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-800 font-mono mt-1.5 tracking-tight">
            {summaryStats.highCount} <span className="text-xs font-sans text-amber-700 font-normal">High Rates</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold mt-1">
            Exceeding +{varianceThreshold}% threshold
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-enterprise-sm card-glow-interactive">
          <div className="flex items-center justify-between text-[#0284C7] text-[10px] font-mono font-bold uppercase">
            <span>Low / Discount Bands</span>
            <ArrowDownRight className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0284C7] font-mono mt-1.5 tracking-tight">
            {summaryStats.lowCount} <span className="text-xs font-sans text-[#0284C7] font-normal">Discounted</span>
          </div>
          <div className="text-[11px] text-[#0284C7] font-bold mt-1">
            Under -{varianceThreshold}% baseline
          </div>
        </div>
      </div>

      {/* 3. TWO HIGH-CLARITY ENTERPRISE VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: TIER PROGRESSION & RATE ENVELOPE (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-50/70 p-5 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-50 text-[#0284C7] rounded-lg border border-blue-200">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Weight Slab Progression & Corridor Benchmark
                </h3>
                <span className="text-[10px] text-[#64748B]">
                  Average freight rate progression curves across gross weight bands
                </span>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setChartViewMode('tier-progression')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  chartViewMode === 'tier-progression'
                    ? 'bg-[#0F172A] text-[#FEF3C7] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Weight Tiers
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('corridor-rates')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  chartViewMode === 'corridor-rates'
                    ? 'bg-[#0F172A] text-[#FEF3C7] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                By Corridor
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'tier-progression' ? (
                <ComposedChart
                  data={tierProgressionData}
                  margin={{ top: 15, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="tierLabel"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }}
                    tickFormatter={(val) => `€${val}`}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<OutlierChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10, fontWeight: 600 }}
                    formatter={(value) => <span className="text-[#0F172A]">{value}</span>}
                  />

                  {/* 40 ft Confidence Corridor Band */}
                  <Area
                    type="monotone"
                    dataKey="upper40"
                    name="Expected Corridor Upper"
                    stroke="#CBD5E1"
                    strokeDasharray="4 4"
                    fill="#0284C7"
                    fillOpacity={0.07}
                  />

                  {/* 20 ft Rate Progression Line */}
                  <Line
                    type="monotone"
                    dataKey="avg20"
                    name="20 ft Benchmark (€)"
                    stroke="#0284C7"
                    strokeWidth={3}
                    dot={{ fill: '#0284C7', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 7, fill: '#0284C7' }}
                  />

                  {/* 40 ft Rate Progression Line */}
                  <Line
                    type="monotone"
                    dataKey="avg40"
                    name="40 ft Benchmark (€)"
                    stroke="#0D9488"
                    strokeWidth={3}
                    dot={{ fill: '#0D9488', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 7, fill: '#0D9488' }}
                  />

                  {/* Mean Overall Benchmark */}
                  <Line
                    type="monotone"
                    dataKey="benchmarkAvg"
                    name="Combined Mean (€)"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart
                  data={corridorData}
                  margin={{ top: 15, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="drop"
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }}
                    tickFormatter={(val) => `€${val}`}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<OutlierChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 10, fontWeight: 600 }}
                    formatter={(value) => <span className="text-[#0F172A]">{value}</span>}
                  />

                  <Bar dataKey="avg20" name="20 ft Average (€)" fill="#0284C7" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="avg40" name="40 ft Average (€)" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={16} />
                  <Line type="monotone" dataKey="upperLimit" name="Surcharge Limit (€)" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: CLEAN HORIZONTAL VARIANCE SPREAD (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50/70 p-5 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-200">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Outlier Variance Deviation
                </h3>
                <span className="text-[10px] text-[#64748B]">
                  % Delta divergence vs corridor benchmark
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              {summaryStats.outliersCount} Flagged
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topDeviations}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val}%`}
                  domain={[-40, 40]}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="cleanLabel"
                  tick={{ fontSize: 10, fill: '#0F172A', fontWeight: 600 }}
                  width={110}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <Tooltip content={<OutlierChartTooltip />} />
                <ReferenceLine x={0} stroke="#475569" strokeWidth={2} />
                <ReferenceLine x={varianceThreshold} stroke="#E11D48" strokeDasharray="3 3" label={{ value: `+${varianceThreshold}%`, position: 'top', fill: '#E11D48', fontSize: 10 }} />
                <ReferenceLine x={-varianceThreshold} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: `-${varianceThreshold}%`, position: 'top', fill: '#F59E0B', fontSize: 10 }} />
                <Bar
                  dataKey="deviationPercent"
                  name="Variance %"
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                >
                  {topDeviations.map((entry, index) => (
                    <Cell
                      key={`dev-cell-${index}`}
                      fill={
                        entry.deviationPercent >= varianceThreshold
                          ? '#E11D48'
                          : entry.deviationPercent <= -varianceThreshold
                          ? '#F59E0B'
                          : '#0284C7'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. QUICK FLAGGED OUTLIER ACTION CARDS WITH GLOW BUTTONS */}
      {outliers.length > 0 ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-2 font-mono">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Flagged Commercial Outliers — Quick Audit Inspection</span>
            </h3>
            <span className="text-[11px] font-mono text-[#64748B]">
              Click &quot;Inspect Lineage&quot; to review origin rules in drawer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outliers.slice(0, 6).map((outlier) => (
              <div
                key={`outlier-card-${outlier.id}-${outlier.size}-${outlier.from}`}
                className="p-4 rounded-2xl border border-rose-200 bg-white hover:border-rose-400 transition-all flex flex-col justify-between space-y-3 shadow-enterprise-sm card-glow-rose group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {outlier.outlierType === 'HIGH' ? 'SURCHARGE SPIKE' : 'DISCOUNT OUTLIER'}
                    </span>
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {outlier.deviationPercent > 0 ? `+${outlier.deviationPercent}%` : `${outlier.deviationPercent}%`}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#0284C7] transition-colors">
                    {outlier.route}
                  </div>
                  <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                    <span>
                      {outlier.size === '20s' ? '20 ft Standard' : '40 ft Standard'} ({outlier.bandKey})
                    </span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      Actual: €{outlier.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Tier Avg: €{outlier.tierAvg} · Contract: {outlier.parentContractId || 'MHI-2026-001'}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">Record ID #{outlier.id}</span>
                  <button
                    type="button"
                    onClick={() => onInspectRecord(outlier.id)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-[#0284C7] hover:text-white text-[#0284C7] border border-slate-200 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs btn-glow-blue active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Lineage</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">No Commercial Outliers Detected:</span> All current weight slab rates are within the configured ±{varianceThreshold}% benchmark envelope.
          </div>
        </div>
      )}
    </div>
  );
};
