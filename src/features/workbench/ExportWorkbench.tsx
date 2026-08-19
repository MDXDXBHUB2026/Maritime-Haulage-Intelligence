/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ContractHeaderForm } from './ContractHeaderForm';
import { WeightSlabEditor } from './WeightSlabEditor';
import { HaulageRateGrid } from './HaulageRateGrid';
import { LumpSumModeDialog } from './LumpSumModeDialog';
import { HelpDrawer } from './HelpDrawer';
import {
  ContractFull,
  ContractRoute,
  ContractHeader,
  WeightSlabBand,
  AmountType,
  LumpSumMode,
} from '../../types';
import {
  ArrowUpRight,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Table,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Play,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const ExportWorkbench: React.FC = () => {
  const {
    contracts,
    updateContract,
    vendors,
    locations,
    facilities,
    executeGenerationForContract,
    generationRuns,
    setActiveView,
    addAuditLog,
  } = useApp();

  // Find default Export contract
  const activeContract = useMemo(() => {
    const found = contracts.find(
      (c) => c.direction === 'EXPORT' && c.contractNumber === 'MHI-EXP-001'
    );
    if (found) return found;
    const fallback = contracts.find((c) => c.direction === 'EXPORT');
    return fallback || contracts[0];
  }, [contracts]);

  const [localContract, setLocalContract] = useState<ContractFull>(activeContract);
  const [isLumpSumModalOpen, setIsLumpSumModalOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);
  const [slabUpdateFeedback, setSlabUpdateFeedback] = useState<string | null>(null);

  // Dynamic Slab Captions
  const [headerLabels20, setHeaderLabels20] = useState<string[]>(() =>
    (localContract.weightSlabs20 || []).map((s) => s.label || `20' <${s.to}t`)
  );
  const [headerLabels40, setHeaderLabels40] = useState<string[]>(() =>
    (localContract.weightSlabs40 || []).map((s) => s.label || `40' <${s.to}t`)
  );

  useEffect(() => {
    if (activeContract && activeContract.id !== localContract.id) {
      setLocalContract(activeContract);
      setHeaderLabels20((activeContract.weightSlabs20 || []).map((s) => s.label || `20' <${s.to}t`));
      setHeaderLabels40((activeContract.weightSlabs40 || []).map((s) => s.label || `40' <${s.to}t`));
    }
  }, [activeContract?.id]);

  const existingRun = useMemo(() => {
    return generationRuns.find((r) => r.contractId === localContract.id);
  }, [generationRuns, localContract.id]);

  // Validation state for EXPORT RUN button
  const runValidation = useMemo(() => {
    if (!localContract.routes || localContract.routes.length === 0) {
      return { canRun: false, reason: 'At least one route row is required in the rate matrix.' };
    }

    const missingPickup = localContract.routes.some((r) => !r.pickupLocationName || !r.pickupLocationCode);
    if (missingPickup) {
      return { canRun: false, reason: 'Every export route must specify a valid Pick Up Origin Location.' };
    }

    if (!localContract.vendorCode) {
      return { canRun: false, reason: 'Vendor Code is required.' };
    }

    if (localContract.amountType === 'LUMPSUM') {
      if (localContract.lumpSumMode === 'SINGLE_AMOUNT') {
        const missingAmount = localContract.routes.some((r) => (r.generalAmount || 0) <= 0);
        if (missingAmount) {
          return { canRun: false, reason: 'Lump Sum Single Amount requires positive rate values.' };
        }
      } else {
        const missingSplit = localContract.routes.some(
          (r) => (r.amount20 || 0) <= 0 && (r.amount40 || 0) <= 0
        );
        if (missingSplit) {
          return { canRun: false, reason: 'Separate 20s/40s Lump Sum amounts must be entered.' };
        }
      }
    }

    return { canRun: true, reason: '' };
  }, [localContract]);

  // Handle Header field change
  const handleHeaderChange = (updates: Partial<ContractHeader>) => {
    const nextContract: ContractFull = {
      ...localContract,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
  };

  // Handle Amount Type change
  const handleAmountTypeChange = (newAmountType: AmountType) => {
    const nextContract: ContractFull = {
      ...localContract,
      amountType: newAmountType,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);

    if (newAmountType === 'LUMPSUM') {
      setIsLumpSumModalOpen(true);
    }
  };

  // Handle Lump Sum Mode change from Dialog
  const handleSaveLumpSumMode = (mode: LumpSumMode) => {
    const nextContract: ContractFull = {
      ...localContract,
      lumpSumMode: mode,
      amountType: 'LUMPSUM',
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
    setIsLumpSumModalOpen(false);
  };

  // Handle Slab updates from WeightSlabEditor
  const handleSlabs20Change = (newSlabs: WeightSlabBand[]) => {
    const labels = newSlabs.map((s) => s.label || `20' <${s.to}t`);
    const nextContract: ContractFull = {
      ...localContract,
      weightSlabs20: newSlabs,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    setHeaderLabels20(labels);
    updateContract(nextContract);
    setSlabUpdateFeedback(`20ft weight slabs updated (${labels.join(', ')}). Rate matrix columns dynamically synchronised.`);
    setTimeout(() => setSlabUpdateFeedback(null), 5000);

    addAuditLog({
      user: 'system.operator@haulage.intelligence',
      action: 'SLABS_UPDATE',
      entity: 'WeightSlabs20',
      entityId: localContract.contractNumber,
      summary: `Applied 20ft weight slab definitions for ${localContract.contractNumber}: ${labels.join(', ')}`,
    });
  };

  const handleSlabs40Change = (newSlabs: WeightSlabBand[]) => {
    const labels = newSlabs.map((s) => s.label || `40' <${s.to}t`);
    const nextContract: ContractFull = {
      ...localContract,
      weightSlabs40: newSlabs,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    setHeaderLabels40(labels);
    updateContract(nextContract);
    setSlabUpdateFeedback(`40ft weight slabs updated (${labels.join(', ')}). Rate matrix columns dynamically synchronised.`);
    setTimeout(() => setSlabUpdateFeedback(null), 5000);

    addAuditLog({
      user: 'system.operator@haulage.intelligence',
      action: 'SLABS_UPDATE',
      entity: 'WeightSlabs40',
      entityId: localContract.contractNumber,
      summary: `Applied 40ft weight slab definitions for ${localContract.contractNumber}: ${labels.join(', ')}`,
    });
  };

  // Handle Routes modification
  const handleRoutesChange = (newRoutes: ContractRoute[]) => {
    const nextContract: ContractFull = {
      ...localContract,
      routes: newRoutes,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
  };

  // Execute EXPORT RUN
  const handleRunGeneration = async () => {
    if (!runValidation.canRun) return;
    setIsGenerating(true);
    try {
      const run = await executeGenerationForContract(localContract);
      setGenerationSuccess(
        `EXPORT RUN completed: Generated ${run.mainRecordsCount} haulage records and ${run.weightSlabRecordsCount} child Weight Slab rows with dual POL group routing (EDEHAM/EDEBRV).`
      );
      addAuditLog({
        user: 'system.operator@haulage.intelligence',
        action: 'RECORDS_GENERATE',
        entity: 'Contract',
        entityId: localContract.contractNumber,
        summary: `Executed deterministic Export haulage run for ${localContract.contractNumber} (${run.mainRecordsCount} records).`,
      });
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear Generated Output
  const handleClearOutput = () => {
    const nextContract: ContractFull = {
      ...localContract,
      contractStatus: 'DRAFT',
      generatedAt: undefined,
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
    setGenerationSuccess(null);
    addAuditLog({
      user: 'system.operator@haulage.intelligence',
      action: 'CONTRACT_UPDATE',
      entity: 'Contract',
      entityId: localContract.contractNumber,
      summary: `Cleared generated staging sheets for ${localContract.contractNumber}.`,
    });
  };

  return (
    <div className="p-6 max-w-[1720px] mx-auto space-y-5 text-[#18212B]">
      {/* PAGE TITLE BAR (Requirement 20) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E1E7EC]">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#17212B] text-[#FFF4DB] rounded-lg border border-[#F5A623]/40 shadow-xs">
              <ArrowUpRight className="w-5 h-5 text-[#168C8C]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#18212B] tracking-tight">
                Export Rate Workbench
              </h1>
              <p className="text-xs text-[#5C6B78] font-mono">
                Configure outbound haulage routes and contract pricing for enterprise processing.
              </p>
            </div>
          </div>
        </div>

        {/* Contract Selector / Quick Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs bg-white border border-[#E1E7EC] rounded-lg px-3 py-1.5 shadow-enterprise-sm">
            <span className="text-[#5C6B78] font-bold">Contract:</span>
            <select
              value={localContract.id}
              onChange={(e) => {
                const found = contracts.find((c) => c.id === e.target.value);
                if (found) {
                  setLocalContract(found);
                  setHeaderLabels20((found.weightSlabs20 || []).map((s) => s.label || `20' <${s.to}t`));
                  setHeaderLabels40((found.weightSlabs40 || []).map((s) => s.label || `40' <${s.to}t`));
                  setGenerationSuccess(null);
                  setSlabUpdateFeedback(null);
                }
              }}
              className="font-bold text-[#18212B] bg-transparent focus:outline-hidden cursor-pointer"
            >
              {contracts
                .filter((c) => c.direction === 'EXPORT')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contractNumber} — {c.returnLocationName} ({c.amountType === 'WEIGHT_SLAB' ? 'Weight Slab' : 'Lump Sum'})
                  </option>
                ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('generated-trust')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#17212B] hover:bg-[#202D39] text-[#FFF4DB] rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-enterprise-sm"
          >
            <Table className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>View Generated Records</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {slabUpdateFeedback && (
        <div className="bg-blue-50 border border-blue-200 text-[#176B9B] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-enterprise-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#176B9B] shrink-0" />
            <span className="font-semibold">{slabUpdateFeedback}</span>
          </div>
          <span className="text-[11px] font-mono text-[#176B9B] bg-blue-100/60 px-2 py-0.5 rounded">
            Matrix Columns Synchronized
          </span>
        </div>
      )}

      {/* GENERATION SUCCESS NOTIFICATION */}
      {generationSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-enterprise-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{generationSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('generated-trust')}
            className="flex items-center space-x-1 text-emerald-800 hover:text-emerald-950 font-bold underline text-xs cursor-pointer"
          >
            <span>Inspect Outputs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. CONTRACT HEADER CONFIGURATION */}
      <ContractHeaderForm
        header={localContract}
        direction="EXPORT"
        vendors={vendors}
        locations={locations}
        onChange={handleHeaderChange}
        onAmountTypeChange={handleAmountTypeChange}
      />

      {/* 2. DYNAMIC WEIGHT SLAB DEFINITIONS */}
      {localContract.amountType === 'WEIGHT_SLAB' && (
        <WeightSlabEditor
          direction="EXPORT"
          slabs20={localContract.weightSlabs20 || []}
          slabs40={localContract.weightSlabs40 || []}
          onUpdate20={handleSlabs20Change}
          onUpdate40={handleSlabs40Change}
        />
      )}

      {/* 3. ROUTE & RATE MATRIX */}
      <HaulageRateGrid
        header={localContract}
        direction="EXPORT"
        routes={localContract.routes || []}
        amountType={localContract.amountType}
        lumpSumMode={localContract.lumpSumMode || 'SINGLE_AMOUNT'}
        headerLabels20={headerLabels20}
        headerLabels40={headerLabels40}
        locations={locations}
        onChange={handleRoutesChange}
      />

      {/* 4. WORKBENCH FOOTER ACTIONS */}
      <div className="bg-white rounded-2xl border border-[#E1E7EC] shadow-enterprise p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs">
          <div className="p-2 bg-[#F5F7FA] rounded-lg border border-[#E1E7EC]">
            <Sparkles className="w-4 h-4 text-[#168C8C]" />
          </div>
          <div>
            <div className="font-bold text-[#18212B] flex items-center gap-2">
              <span>Operational Pipeline Status</span>
              {existingRun ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  RUN EXECUTED ({existingRun.recordsCount} Rows)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  DRAFT / UNPROCESSED
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#5C6B78]">
              {runValidation.canRun
                ? 'All route entries valid. Ready to generate canonical haulage records.'
                : `Action needed: ${runValidation.reason}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {existingRun && (
            <button
              type="button"
              onClick={handleClearOutput}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Staging</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRunGeneration}
            disabled={!runValidation.canRun || isGenerating}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
              runValidation.canRun && !isGenerating
                ? 'bg-[#F5A623] hover:bg-[#DF8B0B] text-[#17212B]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isGenerating ? 'Processing Pipeline...' : 'Run Export Generation'}</span>
          </button>
        </div>
      </div>

      {/* Lump Sum Mode Configuration Modal */}
      {isLumpSumModalOpen && (
        <LumpSumModeDialog
          isOpen={isLumpSumModalOpen}
          initialMode={localContract.lumpSumMode || 'SINGLE_AMOUNT'}
          onSave={handleSaveLumpSumMode}
          onClose={() => setIsLumpSumModalOpen(false)}
        />
      )}

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        context="EXPORT"
      />
    </div>
  );
};
