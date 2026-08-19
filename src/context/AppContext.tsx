/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Vendor,
  LocationMaster,
  TerminalFacility,
  PortEquipmentMapping,
  ContractFull,
  GenerationRun,
  HaulageMainRecord,
  TrustMainRecord,
  WeightSlabRecord,
  AuditEntry,
  UserRole,
  AppMode,
  SystemSettings,
  ValidationResult,
} from '../types';
import {
  DEMO_VENDORS,
  DEMO_LOCATIONS,
  DEMO_FACILITIES,
  DEMO_PORT_MAPPINGS,
  DEMO_CONTRACTS,
  DEMO_AUDIT_TRAIL,
} from '../data/demoData';
import { generateImportTrustRecords } from '../business-rules/importGenerationEngine';
import { generateExportTrustRecords } from '../business-rules/exportGenerationEngine';
import { validateContract } from '../business-rules/validationEngine';

interface AppContextType {
  // Navigation
  activeView: string;
  setActiveView: (view: string) => void;

  // Master Data
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  locations: LocationMaster[];
  setLocations: React.Dispatch<React.SetStateAction<LocationMaster[]>>;
  facilities: TerminalFacility[];
  setFacilities: React.Dispatch<React.SetStateAction<TerminalFacility[]>>;
  mappings: PortEquipmentMapping[];
  setMappings: React.Dispatch<React.SetStateAction<PortEquipmentMapping[]>>;

  // Contracts
  contracts: ContractFull[];
  setContracts: React.Dispatch<React.SetStateAction<ContractFull[]>>;
  selectedContractId: string | null;
  setSelectedContractId: (id: string | null) => void;
  selectedContract: ContractFull | null;

  // Generation Runs & Records
  generationRuns: GenerationRun[];
  allHaulageRecords: HaulageMainRecord[];
  allTrustRecords: HaulageMainRecord[]; // backward compatibility alias
  allWeightSlabs: WeightSlabRecord[];

  // Actions
  createContract: (contract: Partial<ContractFull>) => ContractFull;
  updateContract: (contract: ContractFull) => void;
  deleteContract: (id: string) => void;
  duplicateContract: (id: string) => ContractFull;
  runValidationForContract: (contract: ContractFull) => ValidationResult;
  executeGenerationForContract: (contract: ContractFull) => Promise<GenerationRun>;

  // Audit
  auditLogs: AuditEntry[];
  addAuditLog: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  toggleTheme: () => void;
  resetDemoData: () => void;

  // Selected Record Inspection
  inspectedRecord: HaulageMainRecord | null;
  setInspectedRecord: (record: HaulageMainRecord | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('import-workbench');
  const [selectedContractId, setSelectedContractId] = useState<string | null>('mhi-imp-001');
  const [inspectedRecord, setInspectedRecord] = useState<HaulageMainRecord | null>(null);

  // System Settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('mhi_settings') || localStorage.getItem('hci_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          standardizedExportMode: parsed.standardizedExportMode ?? true,
          startRecordId: parsed.startRecordId ?? parsed.startTrustId ?? 1001,
          activeRole: parsed.activeRole ?? 'Analyst',
          appMode: parsed.appMode ?? 'DEMO',
          theme: parsed.theme ?? 'light',
          legacyTrustCompatibility: parsed.legacyTrustCompatibility ?? true,
          startTrustId: parsed.startRecordId ?? parsed.startTrustId ?? 1001,
        };
      } catch (e) {
        // fallback
      }
    }
    return {
      standardizedExportMode: true,
      startRecordId: 1001,
      activeRole: 'Analyst',
      appMode: 'DEMO',
      theme: 'light',
      legacyTrustCompatibility: true,
      startTrustId: 1001,
    };
  });

  // Dark mode class sync with DOM
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Master Data
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('mhi_vendors') || localStorage.getItem('hci_vendors');
    return saved ? JSON.parse(saved) : DEMO_VENDORS;
  });

  const [locations, setLocations] = useState<LocationMaster[]>(() => {
    const saved = localStorage.getItem('mhi_locations') || localStorage.getItem('hci_locations');
    return saved ? JSON.parse(saved) : DEMO_LOCATIONS;
  });

  const [facilities, setFacilities] = useState<TerminalFacility[]>(() => {
    const saved = localStorage.getItem('mhi_facilities') || localStorage.getItem('hci_facilities');
    return saved ? JSON.parse(saved) : DEMO_FACILITIES;
  });

  const [mappings, setMappings] = useState<PortEquipmentMapping[]>(() => {
    const saved = localStorage.getItem('mhi_mappings') || localStorage.getItem('hci_mappings');
    return saved ? JSON.parse(saved) : DEMO_PORT_MAPPINGS;
  });

  // Contracts
  const [contracts, setContracts] = useState<ContractFull[]>(() => {
    const saved = localStorage.getItem('mhi_contracts') || localStorage.getItem('hci_contracts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEMO_CONTRACTS;
  });

  // Generation Runs
  const [generationRuns, setGenerationRuns] = useState<GenerationRun[]>(() => {
    const saved = localStorage.getItem('mhi_generation_runs') || localStorage.getItem('hci_generation_runs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }

    // Pre-generate runs for seeded demo contracts
    const preRuns: GenerationRun[] = [];

    const c1 = DEMO_CONTRACTS.find((c) => c.id === 'mhi-imp-001' || c.id === 'demo-imp-001');
    if (c1) {
      const run1 = generateImportTrustRecords({
        contract: c1,
        vendors: DEMO_VENDORS,
        locations: DEMO_LOCATIONS,
        facilities: DEMO_FACILITIES,
        mappings: DEMO_PORT_MAPPINGS,
        startId: 1001,
        generatedBy: 'System Demo Seed',
      });
      preRuns.push(run1);
    }

    const c4 = DEMO_CONTRACTS.find((c) => c.id === 'mhi-exp-001' || c.id === 'demo-exp-001');
    if (c4) {
      const run4 = generateExportTrustRecords({
        contract: c4,
        vendors: DEMO_VENDORS,
        locations: DEMO_LOCATIONS,
        facilities: DEMO_FACILITIES,
        mappings: DEMO_PORT_MAPPINGS,
        startId: 1017,
        generatedBy: 'System Demo Seed',
      });
      preRuns.push(run4);
    }

    return preRuns;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => {
    const saved = localStorage.getItem('mhi_audit_logs') || localStorage.getItem('hci_audit_logs');
    return saved ? JSON.parse(saved) : DEMO_AUDIT_TRAIL;
  });

  // Save to localStorage when state updates
  useEffect(() => {
    localStorage.setItem('mhi_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mhi_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('mhi_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('mhi_facilities', JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem('mhi_mappings', JSON.stringify(mappings));
  }, [mappings]);

  useEffect(() => {
    localStorage.setItem('mhi_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('mhi_generation_runs', JSON.stringify(generationRuns));
  }, [generationRuns]);

  useEffect(() => {
    localStorage.setItem('mhi_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Aggregate all main records and weight slabs across generation runs
  const allHaulageRecords = useMemo(() => {
    return generationRuns.flatMap((run) => run.records);
  }, [generationRuns]);

  const allWeightSlabs = useMemo(() => {
    return generationRuns.flatMap((run) => run.weightSlabs);
  }, [generationRuns]);

  const selectedContract = useMemo(() => {
    return contracts.find((c) => c.id === selectedContractId) || contracts[0] || null;
  }, [contracts, selectedContractId]);

  const addAuditLog = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const resetDemoData = () => {
    setVendors(DEMO_VENDORS);
    setLocations(DEMO_LOCATIONS);
    setFacilities(DEMO_FACILITIES);
    setMappings(DEMO_PORT_MAPPINGS);
    setContracts(DEMO_CONTRACTS);
    setAuditLogs(DEMO_AUDIT_TRAIL);

    // Re-generate seeded runs
    const preRuns: GenerationRun[] = [];
    const c1 = DEMO_CONTRACTS.find((c) => c.id === 'mhi-imp-001' || c.id === 'demo-imp-001');
    if (c1) {
      preRuns.push(
        generateImportTrustRecords({
          contract: c1,
          vendors: DEMO_VENDORS,
          locations: DEMO_LOCATIONS,
          facilities: DEMO_FACILITIES,
          mappings: DEMO_PORT_MAPPINGS,
          startId: 1001,
          generatedBy: 'System Demo Seed',
        })
      );
    }
    const c4 = DEMO_CONTRACTS.find((c) => c.id === 'mhi-exp-001' || c.id === 'demo-exp-001');
    if (c4) {
      preRuns.push(
        generateExportTrustRecords({
          contract: c4,
          vendors: DEMO_VENDORS,
          locations: DEMO_LOCATIONS,
          facilities: DEMO_FACILITIES,
          mappings: DEMO_PORT_MAPPINGS,
          startId: 1017,
          generatedBy: 'System Demo Seed',
        })
      );
    }
    setGenerationRuns(preRuns);
    setSelectedContractId('mhi-imp-001');

    addAuditLog({
      user: 'User Action',
      action: 'MASTER_DATA_CHANGE',
      entity: 'System',
      entityId: 'ALL',
      summary: 'Reset application dataset to standard maritime demonstration master data.',
    });
  };

  const createContract = (contractData: Partial<ContractFull>): ContractFull => {
    const dir = contractData.direction || 'IMPORT';
    const randNum = String(Math.floor(100 + Math.random() * 900));
    const newId = `mhi-${dir.toLowerCase()}-${randNum}`;
    const newContract: ContractFull = {
      id: newId,
      contractNumber: contractData.contractNumber || `MHI-${dir === 'IMPORT' ? 'IMP' : 'EXP'}-${randNum}`,
      revision: 1,
      direction: dir,
      contractStatus: 'DRAFT',
      pickupLocationName: contractData.pickupLocationName || 'Hamburg',
      pickupLocationCode: contractData.pickupLocationCode || 'DEHAM',
      pickupType: contractData.pickupType || 'Terminal',
      pickupTerm: contractData.pickupTerm || 'CY',
      dropType: contractData.dropType || 'Location',
      dropTerm: contractData.dropTerm || 'DEPOT',
      returnType: contractData.returnType || 'Location',
      returnLocationName: contractData.returnLocationName || 'Hamburg',
      returnLocationCode: contractData.returnLocationCode || 'DEHAM',
      haulageMode: contractData.haulageMode || 'Combined',
      tripType: contractData.tripType || 'Live Load',
      ladenStatus: contractData.ladenStatus || 'Laden',
      currency: contractData.currency || 'EUR',
      amountType: contractData.amountType || 'LUMPSUM',
      lumpSumMode: contractData.lumpSumMode || 'SINGLE_AMOUNT',
      payableAt: contractData.payableAt || (dir === 'EXPORT' ? 'POL' : 'POD'),
      portToPay: contractData.portToPay || 'DEHAM',
      negotiatedOn: contractData.negotiatedOn || new Date().toISOString().split('T')[0],
      negotiatedBy: contractData.negotiatedBy || 'Maritime Haulage Team',
      validFrom: contractData.validFrom || new Date().toISOString().split('T')[0],
      validTo: contractData.validTo || '2026-12-31',
      vendorId: contractData.vendorId || 'ven-1001',
      vendorCode: contractData.vendorCode || 'DEMO1001',
      vendorName: contractData.vendorName || 'NorthSea Inland Logistics',
      remarks: contractData.remarks || '',
      weightSlabs20: contractData.weightSlabs20 || [
        { index: 1, from: 0.1, to: 13, label: "20' <13t" },
        { index: 2, from: 13.1, to: 26, label: "20' <26t" },
        { index: 3, from: 26.1, to: 36, label: "20' <36t" },
        { index: 4, from: 36.1, to: 48, label: "20' <48t" },
        { index: 5, from: 48.1, to: 64, label: "20' <64t" },
      ],
      weightSlabs40: contractData.weightSlabs40 || [
        { index: 1, from: 0.1, to: 14, label: "40' <14t" },
        { index: 2, from: 14.1, to: 24, label: "40' <24t" },
        { index: 3, from: 24.1, to: 37, label: "40' <37t" },
        { index: 4, from: 37.1, to: 45, label: "40' <45t" },
        { index: 5, from: 45.1, to: 67, label: "40' <67t" },
      ],
      createdBy: 'user@haulage.intelligence',
      createdAt: new Date().toISOString(),
      updatedBy: 'user@haulage.intelligence',
      updatedAt: new Date().toISOString(),
      version: 1,
      routes: contractData.routes || [
        {
          id: `r-${Date.now()}-1`,
          contractId: newId,
          sequence: 1,
          pickupLocationName: contractData.pickupLocationName || 'Hamburg',
          pickupLocationCode: contractData.pickupLocationCode || 'DEHAM',
          pickupType: contractData.pickupType || 'Terminal',
          pickupFacilityCode: 'DEHAMTBURC',
          pickupTerm: contractData.pickupTerm || 'CY',
          dropLocationName: 'Prague',
          dropLocationCode: 'CZPRG',
          dropType: 'Location',
          dropFacilityCode: 'CZPRGMETR',
          dropTerm: 'DEPOT',
          returnLocationName: contractData.returnLocationName || 'Hamburg',
          returnLocationCode: contractData.returnLocationCode || 'DEHAM',
          returnType: contractData.returnType || 'Location',
          haulageMode: contractData.haulageMode || 'Combined',
          ladenStatus: contractData.ladenStatus || 'Laden',
          currency: contractData.currency || 'EUR',
          payableAt: contractData.payableAt || (dir === 'EXPORT' ? 'POL' : 'POD'),
          portToPay: contractData.portToPay || 'DEHAM',
          negotiatedOn: contractData.negotiatedOn || new Date().toISOString().split('T')[0],
          negotiatedBy: contractData.negotiatedBy || 'Maritime Haulage Team',
          validFrom: contractData.validFrom || new Date().toISOString().split('T')[0],
          validTo: contractData.validTo || '2026-12-31',
          tripType: contractData.tripType || 'Live Load',
          vendorCode: contractData.vendorCode || 'DEMO1001',
          remarks: 'Standard corridor route',
          generalAmount: 750,
          amount20: 600,
          amount40: 850,
          slabRates20: { 1: 520, 2: 570, 3: 630, 4: 710, 5: 800 },
          slabRates40: { 1: 750, 2: 820, 3: 900, 4: 1000, 5: 1150 },
          active: true,
        },
      ],
    };

    setContracts((prev) => [newContract, ...prev]);
    setSelectedContractId(newContract.id);

    addAuditLog({
      user: 'User Action',
      action: 'CONTRACT_CREATE',
      entity: 'Contract',
      entityId: newContract.contractNumber,
      summary: `Created new ${newContract.direction} contract ${newContract.contractNumber} (${newContract.vendorCode}).`,
    });

    return newContract;
  };

  const updateContract = (updatedContract: ContractFull) => {
    let finalContract = { ...updatedContract, updatedAt: new Date().toISOString() };
    if (updatedContract.contractStatus === 'GENERATED' || updatedContract.contractStatus === 'PROCESSED' || updatedContract.contractStatus === 'EXPORTED') {
      finalContract.revision = (updatedContract.revision || 1) + 1;
      finalContract.contractStatus = 'DRAFT';
    }

    setContracts((prev) =>
      prev.map((c) => (c.id === finalContract.id ? finalContract : c))
    );

    addAuditLog({
      user: 'User Action',
      action: 'CONTRACT_UPDATE',
      entity: 'Contract',
      entityId: finalContract.contractNumber,
      summary: `Updated contract ${finalContract.contractNumber} (Revision ${finalContract.revision}).`,
    });
  };

  const deleteContract = (id: string) => {
    const contract = contracts.find((c) => c.id === id);
    if (!contract) return;
    setContracts((prev) => prev.filter((c) => c.id !== id));
    if (selectedContractId === id) {
      setSelectedContractId(contracts[0]?.id || null);
    }
    addAuditLog({
      user: 'User Action',
      action: 'CONTRACT_UPDATE',
      entity: 'Contract',
      entityId: contract.contractNumber,
      summary: `Archived/Removed contract ${contract.contractNumber}.`,
    });
  };

  const duplicateContract = (id: string): ContractFull => {
    const source = contracts.find((c) => c.id === id);
    if (!source) throw new Error('Contract not found');

    const newNumber = `${source.contractNumber}-COPY`;
    const newId = `mhi-copy-${Date.now()}`;
    const duplicated: ContractFull = {
      ...source,
      id: newId,
      contractNumber: newNumber,
      revision: 1,
      contractStatus: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validatedAt: undefined,
      generatedAt: undefined,
      routes: source.routes.map((r, i) => ({
        ...r,
        id: `r-copy-${Date.now()}-${i}`,
        contractId: newId,
      })),
    };

    setContracts((prev) => [duplicated, ...prev]);
    setSelectedContractId(duplicated.id);

    addAuditLog({
      user: 'User Action',
      action: 'CONTRACT_CREATE',
      entity: 'Contract',
      entityId: duplicated.contractNumber,
      summary: `Duplicated contract from ${source.contractNumber} to ${duplicated.contractNumber}.`,
    });

    return duplicated;
  };

  const runValidationForContract = (contract: ContractFull): ValidationResult => {
    const result = validateContract(contract, {
      vendors,
      locations,
      facilities,
      mappings,
    });

    // Update contract status based on validation result
    const newStatus = result.isValid ? 'VALIDATED' : 'VALIDATION_FAILED';
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contract.id
          ? {
              ...c,
              contractStatus: newStatus,
              validatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    addAuditLog({
      user: 'User Action',
      action: 'CONTRACT_VALIDATE',
      entity: 'Contract',
      entityId: contract.contractNumber,
      summary: `Validated contract ${contract.contractNumber}: ${result.errorCount} Errors, ${result.warningCount} Warnings (${result.validRouteCount}/${result.totalRouteCount} Routes Valid).`,
    });

    return result;
  };

  const executeGenerationForContract = async (
    contract: ContractFull
  ): Promise<GenerationRun> => {
    // Determine start record ID
    let maxId = settings.startRecordId || settings.startTrustId || 1001;
    generationRuns.forEach((run) => {
      run.records.forEach((r) => {
        if (r.id >= maxId) maxId = r.id + 1;
      });
    });

    let run: GenerationRun;
    if (contract.direction === 'IMPORT') {
      run = generateImportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
        startId: maxId,
        generatedBy: `${settings.activeRole} (${settings.appMode} Mode)`,
      });
    } else {
      run = generateExportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
        startId: maxId,
        generatedBy: `${settings.activeRole} (${settings.appMode} Mode)`,
      });
    }

    // Save run
    setGenerationRuns((prev) => [run, ...prev]);

    // Update contract status
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contract.id
          ? {
              ...c,
              contractStatus: 'PROCESSED',
              generatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    addAuditLog({
      user: `${settings.activeRole}`,
      action: 'RECORDS_GENERATE',
      entity: 'GenerationRun',
      entityId: run.id,
      summary: `Generated ${run.mainRecordsCount} main haulage records and ${run.weightSlabRecordsCount} Weight Slab child records from contract ${contract.contractNumber}.`,
      generationRunId: run.id,
    });

    return run;
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        vendors,
        setVendors,
        locations,
        setLocations,
        facilities,
        setFacilities,
        mappings,
        setMappings,
        contracts,
        setContracts,
        selectedContractId,
        setSelectedContractId,
        selectedContract,
        generationRuns,
        allHaulageRecords,
        allTrustRecords: allHaulageRecords,
        allWeightSlabs,
        createContract,
        updateContract,
        deleteContract,
        duplicateContract,
        runValidationForContract,
        executeGenerationForContract,
        auditLogs,
        addAuditLog,
        settings,
        updateSettings,
        toggleTheme,
        resetDemoData,
        inspectedRecord,
        setInspectedRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
