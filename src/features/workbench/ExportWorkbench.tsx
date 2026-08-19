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
  CheckCircle2,
  Table,
  ArrowRight,
  Sparkles,
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

  const handleHeaderChange = (updates: Partial<ContractHeader>) => {
    const nextContract: ContractFull = {
      ...localContract,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
  };

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

  const handleSelectLumpSumMode = (mode: LumpSumMode) => {
    const nextContract: ContractFull = {
      ...localContract,
      lumpSumMode: mode,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
  };

  // Direct handlers for updating slabs
  const handleUpdateSlabs20 = (slabs: WeightSlabBand[]) => {
    const labels = slabs.map((s) => s.label || `20' <${s.to}t`);
    setHeaderLabels20(labels);
    const updatedSlabs = slabs.map((s, idx) => ({
      ...s,
      label: labels[idx],
    }));
    const nextContract: ContractFull = {
      ...localContract,
      weightSlabs20: updatedSlabs,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
  };

  const handleUpdateSlabs40 = (slabs: WeightSlabBand[]) => {
    const labels = slabs.map((s) => s.label || `40' <${s.to}t`);
    setHeaderLabels40(labels);
    const updatedSlabs = slabs.map((s, idx) => ({
      ...s,
      label: labels[idx],
    }));
    const nextContract: ContractFull = {
      ...localContract,
      weightSlabs40: updatedSlabs,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
  };

  const handleApply20Headers = () => {
    const slabs = localContract.weightSlabs20 || [];
    const labels = slabs.map((s) => `20' <${s.to}t`);
    setHeaderLabels20(labels);
    const updatedSlabs = slabs.map((s, idx) => ({
      ...s,
      label: labels[idx],
    }));
    const nextContract: ContractFull = {
      ...localContract,
      weightSlabs20: updatedSlabs,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
    setSlabUpdateFeedback(`20ft Weight Slab headers updated: ${labels.join(' | ')}`);
    setTimeout(() => setSlabUpdateFeedback(null), 3500);
    addAuditLog({
      user: 'system.operator@haulage.intelligence',
      action: 'CONTRACT_UPDATE',
      entity: 'Contract',
      entityId: localContract.contractNumber,
      summary: `Applied 20ft weight slab definitions for ${localContract.contractNumber}: ${labels.join(', ')}`,
    });
  };

  const handleApply40Headers = () => {
    const slabs = localContract.weightSlabs40 || [];
    const labels = slabs.map((s) => `40' <${s.to}t`);
    setHeaderLabels40(labels);
    const updatedSlabs = slabs.map((s, idx) => ({
      ...s,
      label: labels[idx],
    }));
    const nextContract: ContractFull = {
      ...localContract,
      weightSlabs40: updatedSlabs,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
    setSlabUpdateFeedback(`40ft Weight Slab headers updated: ${labels.join(' | ')}`);
    setTimeout(() => setSlabUpdateFeedback(null), 3500);
    addAuditLog({
      user: 'system.operator@haulage.intelligence',
      action: 'CONTRACT_UPDATE',
      entity: 'Contract',
      entityId: localContract.contractNumber,
      summary: `Applied 40ft weight slab definitions for ${localContract.contractNumber}: ${labels.join(', ')}`,
    });
  };

  const handleRoutesChange = (newRoutes: ContractRoute[]) => {
    const nextContract: ContractFull = {
      ...localContract,
      routes: newRoutes,
      updatedAt: new Date().toISOString(),
    };
    setLocalContract(nextContract);
    updateContract(nextContract);
  };

  const handleRunGeneration = async () => {
    if (!runValidation.canRun) return;
    setIsGenerating(true);
    try {
      const run = await executeGenerationForContract(localContract);
      setGenerationSuccess(
        `EXPORT RUN completed: Generated ${run.mainRecordsCount} haulage records for export group (EDEHAM/EDEBRV) and ${run.weightSlabRecordsCount} child Weight Slab rows.`
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
    <div className="p-5 max-w-[1720px] mx-auto space-y-4 text-slate-800">
      {/* PAGE TITLE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#0F8B8D] text-white rounded-md">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Haulage Input Sheet for Export
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                Original Excel/VBA Interactive Export Rate Workbench (EDEHAM / EDEBRV Group Generation)
              </p>
            </div>
          </div>
        </div>

        {/* Contract Selector / Quick Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs bg-white border border-slate-300 rounded px-2.5 py-1">
            <span className="text-slate-500 font-medium">Contract:</span>
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
              className="font-bold text-slate-800 bg-transparent focus:outline-hidden"
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
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition-colors"
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Generated Records</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {slabUpdateFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{slabUpdateFeedback}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
            Matrix Headers Synced
          </span>
        </div>
      )}

      {/* GENERATION SUCCESS NOTIFICATION */}
      {generationSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{generationSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('generated-trust')}
            className="flex items-center space-x-1 text-emerald-800 hover:text-emerald-950 font-bold underline text-xs"
          >
            <span>Open Generated Haulage Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP CONFIGURATION & WEIGHT SLABS SPLIT LAYOUT */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* LEFT CONFIGURATION BLOCK (7-Row Header Form) */}
        <div className="col-span-12 xl:col-span-7">
          <ContractHeaderForm
            header={localContract}
            direction="EXPORT"
            vendors={vendors}
            locations={locations}
            onChange={handleHeaderChange}
            onAmountTypeChange={handleAmountTypeChange}
          />
        </div>

        {/* RIGHT WEIGHT SLAB CONFIGURATION BLOCK & ACTIONS */}
        <div className="col-span-12 xl:col-span-5">
          <WeightSlabEditor
            slabs20={localContract.weightSlabs20 || []}
            slabs40={localContract.weightSlabs40 || []}
            onUpdateSlabs20={handleUpdateSlabs20}
            onUpdateSlabs40={handleUpdateSlabs40}
            onApply20Headers={handleApply20Headers}
            onApply40Headers={handleApply40Headers}
            onRunGeneration={handleRunGeneration}
            onClearOutput={handleClearOutput}
            onOpenHelp={() => setIsHelpOpen(true)}
            direction="EXPORT"
            isRunDisabled={!runValidation.canRun || isGenerating}
            disabledReason={runValidation.reason}
            isGenerated={Boolean(existingRun || localContract.generatedAt)}
          />
        </div>
      </div>

      {/* MAIN ROUTE / RATE ENTRY MATRIX */}
      <div className="pt-2">
        <HaulageRateGrid
          header={localContract}
          routes={localContract.routes || []}
          direction="EXPORT"
          locations={locations}
          facilities={facilities}
          slabs20={localContract.weightSlabs20 || []}
          slabs40={localContract.weightSlabs40 || []}
          headerLabels20={headerLabels20}
          headerLabels40={headerLabels40}
          onChangeRoutes={handleRoutesChange}
        />
      </div>

      {/* LUMP SUM MODE DIALOG */}
      <LumpSumModeDialog
        isOpen={isLumpSumModalOpen}
        currentMode={localContract.lumpSumMode}
        onSelectMode={handleSelectLumpSumMode}
        onClose={() => setIsLumpSumModalOpen(false)}
      />

      {/* IN-APP HELP DRAWER */}
      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        direction="EXPORT"
      />
    </div>
  );
};
