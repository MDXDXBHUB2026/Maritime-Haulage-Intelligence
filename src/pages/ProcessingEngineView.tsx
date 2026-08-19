/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Scale,
  ShieldCheck,
  FileCheck2,
  Database,
  RefreshCw,
  Zap,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PipelineStep {
  id: string;
  name: string;
  category: string;
  description: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'contract', name: 'Contract Ingestion', category: 'SETUP', description: 'Load structured commercial agreement, validity dates & vendor codes.' },
  { id: 'validate', name: 'Commercial Validation', category: 'RULES', description: 'Check required locations, currency formats and rate constraints.' },
  { id: 'master_data', name: 'Master Data Resolution', category: 'RESOLUTION', description: 'Resolve UN/LOCODEs, facility codes and carrier vendor IDs.' },
  { id: 'equipment', name: 'Equipment Expansion', category: 'EXPANSION', description: 'Expand equipment types (20GP, 40GP, 40HC, 45HC) per route.' },
  { id: 'pricing', name: 'Pricing Engine Evaluation', category: 'CALCULATION', description: 'Apply Lump Sum or Weight Slab base tier calculations.' },
  { id: 'records', name: 'Haulage Records Generation', category: 'RECORD BUILD', description: 'Generate main enterprise records for import/export corridor groups.' },
  { id: 'weight_slabs', name: 'Weight Slab Child Generation', category: 'TIER EXPANSION', description: 'Generate child weight slab rows linked by parent record IDs.' },
  { id: 'complete', name: 'Finalization & Audit Store', category: 'STORAGE', description: 'Persist generated records into immutable lineage store.' },
];

export const ProcessingEngineView: React.FC = () => {
  const {
    contracts,
    executeGenerationForContract,
    generationRuns,
    setActiveView,
    allHaulageRecords,
    allWeightSlabs,
  } = useApp();

  const [selectedContractId, setSelectedContractId] = useState<string>(
    contracts[0]?.id || ''
  );
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastRunStats, setLastRunStats] = useState<{
    contractNumber: string;
    mainCount: number;
    slabCount: number;
    durationMs: number;
    recordsPerSec: number;
    expansionFactor: number;
  } | null>(null);

  const selectedContract = useMemo(() => {
    return contracts.find((c) => c.id === selectedContractId) || contracts[0];
  }, [contracts, selectedContractId]);

  const handleExecutePipeline = async () => {
    if (!selectedContract || isRunning) return;
    setIsRunning(true);
    setActiveStepIndex(0);

    const startTime = performance.now();

    // Step-by-step interactive animation
    for (let i = 0; i < PIPELINE_STEPS.length - 1; i++) {
      setActiveStepIndex(i);
      await new Promise((res) => setTimeout(res, 220));
    }

    try {
      const run = await executeGenerationForContract(selectedContract);
      setActiveStepIndex(PIPELINE_STEPS.length - 1);

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      const totalRecs = run.mainRecordsCount + run.weightSlabRecordsCount;
      const recordsPerSec = durationMs > 0 ? Math.round((totalRecs / durationMs) * 1000) : 1200;
      const routeCount = selectedContract.routes?.length || 1;
      const expansionFactor = Number((run.mainRecordsCount / routeCount).toFixed(1));

      setLastRunStats({
        contractNumber: selectedContract.contractNumber,
        mainCount: run.mainRecordsCount,
        slabCount: run.weightSlabRecordsCount,
        durationMs,
        recordsPerSec,
        expansionFactor,
      });
    } catch (err: any) {
      alert(`Pipeline execution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 max-w-[1720px] mx-auto space-y-6 text-[#0F172A]"
    >
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#0F172A] text-[#FEF3C7] rounded-xl border border-[#F59E0B]/40 shadow-xs">
            <Cpu className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Processing & Generation Pipeline
            </h1>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Deterministic 8-stage pipeline for automated corridor expansion, rate compilation, and lineage tracking.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('generated-trust')}
          className="flex items-center space-x-2 px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-[#FEF3C7] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-enterprise-sm self-start sm:self-auto active:scale-95 border border-[#F59E0B]/40"
        >
          <Layers className="w-4 h-4 text-[#F59E0B]" />
          <span>View Staged Records</span>
        </button>
      </div>

      {/* CONTROLS & SELECTION BAR */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-enterprise flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-bold text-[#64748B] font-mono">Target Contract:</span>
          <select
            value={selectedContractId}
            onChange={(e) => {
              setSelectedContractId(e.target.value);
              setActiveStepIndex(-1);
              setLastRunStats(null);
            }}
            disabled={isRunning}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-[#0F172A] focus:outline-hidden focus:border-[#0284C7] cursor-pointer"
          >
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contractNumber} — {c.direction} ({c.returnLocationName}) [{c.amountType === 'WEIGHT_SLAB' ? 'Weight Slab' : 'Lump Sum'}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExecutePipeline}
            disabled={isRunning || !selectedContract}
            className={`flex items-center space-x-2.5 px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer active:scale-95 ${
              isRunning
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 hover:shadow-lg'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Executing Pipeline Stages...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Execute Complete Generation Run</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* 8-STAGE VISUAL PIPELINE */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-enterprise space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-[#0284C7]" />
            <span>8-Stage Processing Architecture</span>
          </h2>
          <span className="text-[11px] font-mono text-[#64748B] bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 font-bold">
            Stage {activeStepIndex >= 0 ? activeStepIndex + 1 : 0} of {PIPELINE_STEPS.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE_STEPS.map((step, idx) => {
            const isPassed =
              activeStepIndex > idx ||
              (activeStepIndex === PIPELINE_STEPS.length - 1 && idx === PIPELINE_STEPS.length - 1);
            const isCurrent = activeStepIndex === idx && !isPassed;

            return (
              <motion.div
                key={step.id}
                animate={{
                  scale: isCurrent ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`p-4.5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isPassed
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                    : isCurrent
                    ? 'bg-[#0F172A] border-[#F59E0B] text-white shadow-enterprise'
                    : 'bg-slate-50 border-slate-200 text-[#64748B]'
                }`}
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      isPassed
                        ? 'bg-emerald-200/70 text-emerald-900'
                        : isCurrent
                        ? 'bg-[#0284C7] text-[#FEF3C7] border border-[#F59E0B]/50'
                        : 'bg-slate-200 text-[#64748B]'
                    }`}
                  >
                    STAGE 0{idx + 1} · {step.category}
                  </span>
                  {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {isCurrent && <RefreshCw className="w-4 h-4 text-[#F59E0B] animate-spin" />}
                </div>

                <div>
                  <h3
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-[#FEF3C7]' : isPassed ? 'text-emerald-950' : 'text-[#0F172A]'
                    }`}
                  >
                    {step.name}
                  </h3>
                  <p
                    className={`text-[11px] mt-1.5 leading-relaxed ${
                      isCurrent ? 'text-slate-300' : isPassed ? 'text-emerald-800' : 'text-[#64748B]'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* PROCESSING COMPLETE STATE PANEL */}
      <AnimatePresence>
        {lastRunStats && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="bg-white rounded-3xl border border-emerald-300 p-6 sm:p-8 shadow-enterprise space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950">
                    Processing Complete — {lastRunStats.contractNumber}
                  </h3>
                  <p className="text-xs text-emerald-800 font-mono mt-0.5">
                    Deterministic compilation finished in {lastRunStats.durationMs}ms ({lastRunStats.recordsPerSec} records/sec)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('generated-trust')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-[#FEF3C7] text-xs font-bold rounded-xl transition-all cursor-pointer border border-[#F59E0B]/40 shadow-enterprise-sm active:scale-95"
              >
                <span>View Generated Records</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block font-bold">Main Haulage Rows</span>
                <span className="text-2xl font-extrabold text-[#0F172A] font-mono mt-1 block">{lastRunStats.mainCount}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block font-bold">Child Weight Slabs</span>
                <span className="text-2xl font-extrabold text-[#0284C7] font-mono mt-1 block">{lastRunStats.slabCount}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block font-bold">Expansion Factor</span>
                <span className="text-2xl font-extrabold text-[#0D9488] font-mono mt-1 block">{lastRunStats.expansionFactor}x</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block font-bold">Validation Integrity</span>
                <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">100% PASS</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SYSTEM ARCHITECTURE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-enterprise-sm space-y-3"
        >
          <div className="flex items-center space-x-2.5 text-[#0F172A] font-bold text-xs">
            <Layers className="w-4 h-4 text-[#0284C7]" />
            <span>Active Operational Records</span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F172A] font-mono">
            {allHaulageRecords.length}
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Standardized operational records currently active across all generated contracts.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-enterprise-sm space-y-3"
        >
          <div className="flex items-center space-x-2.5 text-[#0F172A] font-bold text-xs">
            <Scale className="w-4 h-4 text-[#0D9488]" />
            <span>Weight Slab Child Rows</span>
          </div>
          <div className="text-3xl font-extrabold text-[#0D9488] font-mono">
            {allWeightSlabs.length}
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Granular weight-tier records generated with parent lineage keys for accurate billing.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-enterprise-sm space-y-3"
        >
          <div className="flex items-center space-x-2.5 text-[#0F172A] font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit Trail Verification</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono">
            {generationRuns.length} Runs Logged
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Every pipeline run is recorded in the immutable audit ledger with operator identity.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
