/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  ContractRoute,
  ContractHeader,
  WeightSlabBand,
  LocationMaster,
  TerminalFacility,
  PickupDropReturnType,
  HaulageMode,
  TripType,
  LadenStatus,
  PayableAt,
  PickupDropTerm,
  AmountType,
  LumpSumMode,
  getCurrencySymbol,
} from '../../types';
import {
  Plus,
  Copy,
  Trash2,
  Lock,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  CheckSquare,
  Square,
  MoreHorizontal,
  ClipboardPaste,
} from 'lucide-react';

interface HaulageRateGridProps {
  header?: ContractHeader;
  routes: ContractRoute[];
  direction?: 'IMPORT' | 'EXPORT';
  locations?: LocationMaster[];
  facilities?: TerminalFacility[];
  slabs20?: WeightSlabBand[];
  slabs40?: WeightSlabBand[];
  headerLabels20?: string[];
  headerLabels40?: string[];
  amountType?: AmountType;
  lumpSumMode?: LumpSumMode;
  onChange?: (newRoutes: ContractRoute[]) => void;
  onChangeRoutes?: (newRoutes: ContractRoute[]) => void;
}

const PICKUP_DROP_TYPES: PickupDropReturnType[] = [
  'Location',
  'Terminal',
  'Depot',
  'Zip/Pin',
  'ZipRange',
];

const TERMS: PickupDropTerm[] = [
  'CY',
  'DEPOT',
  'FI',
  'FL',
  'FO',
  'FT',
  'HOOK',
  'ST',
  'TACKLE',
];

export const HaulageRateGrid: React.FC<HaulageRateGridProps> = ({
  header,
  routes,
  direction = 'IMPORT',
  locations = [],
  facilities = [],
  slabs20 = [],
  slabs40 = [],
  headerLabels20 = [],
  headerLabels40 = [],
  amountType,
  lumpSumMode,
  onChange,
  onChangeRoutes,
}) => {
  const isImport = direction === 'IMPORT';
  const effectiveAmountType = amountType || header?.amountType || 'WEIGHT_SLAB';
  const effectiveLumpSumMode = lumpSumMode || header?.lumpSumMode || 'SINGLE_AMOUNT';

  const isWeightSlab = effectiveAmountType === 'WEIGHT_SLAB';
  const isLumpSumSingle =
    effectiveAmountType === 'LUMPSUM' && effectiveLumpSumMode === 'SINGLE_AMOUNT';
  const isLumpSumSplit =
    effectiveAmountType === 'LUMPSUM' && effectiveLumpSumMode === 'EQUIPMENT_SPECIFIC';

  const notifyChange = onChange || onChangeRoutes || (() => {});

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('sequence');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);

  // Sync header-inherited fields dynamically
  const mergedRoutes = useMemo(() => {
    return routes.map((r) => {
      return {
        ...r,
        // Inherited fields
        pickupLocationName: isImport
          ? header?.pickupLocationName || 'Hamburg'
          : r.pickupLocationName || 'Hamburg',
        pickupLocationCode: isImport
          ? header?.pickupLocationCode || 'DEHAM'
          : r.pickupLocationCode || 'DEHAM',
        pickupType: isImport ? header?.pickupType || 'Location' : r.pickupType,
        pickupTerm: isImport ? header?.pickupTerm || 'CY' : r.pickupTerm,
        dropType: isImport ? r.dropType || header?.dropType || 'Location' : header?.dropType || 'Location',
        dropTerm: isImport ? r.dropTerm || header?.dropTerm || 'CY' : header?.dropTerm || 'CY',
        returnLocationName: !isImport
          ? header?.returnLocationName || 'Hamburg'
          : r.returnLocationName || header?.returnLocationName || 'Hamburg',
        returnLocationCode: !isImport
          ? header?.returnLocationCode || 'DEHAM'
          : r.returnLocationCode || header?.returnLocationCode || 'DEHAM',
        returnType: header?.returnType || 'Location',
        haulageMode: header?.haulageMode || 'Combined',
        ladenStatus: header?.ladenStatus || 'Laden',
        currency: header?.currency || 'EUR',
        payableAt: header?.payableAt || 'POD',
        negotiatedOn: header?.negotiatedOn || '2026-01-01',
        negotiatedBy: header?.negotiatedBy || 'Commercial Desk',
        validFrom: header?.validFrom || '2026-01-01',
        validTo: header?.validTo || '2026-12-31',
        tripType: header?.tripType || 'Live Load',
        vendorCode: header?.vendorCode || 'VEND-001',
      };
    });
  }, [routes, header, isImport]);

  // Filtered and sorted routes
  const displayedRoutes = useMemo(() => {
    let result = [...mergedRoutes];
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (r) =>
          r.dropLocationName?.toLowerCase().includes(q) ||
          r.dropLocationCode?.toLowerCase().includes(q) ||
          r.pickupLocationName?.toLowerCase().includes(q) ||
          r.remarks?.toLowerCase().includes(q) ||
          r.dropFacilityCode?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const valA = (a as any)[sortField];
      const valB = (b as any)[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA || '').localeCompare(String(valB || ''))
        : String(valB || '').localeCompare(String(valA || ''));
    });

    return result;
  }, [mergedRoutes, searchFilter, sortField, sortAsc]);

  // Route update handler
  const handleUpdateRoute = (id: string, updates: Partial<ContractRoute>) => {
    const next = routes.map((r) => (r.id === id ? { ...r, ...updates } : r));
    notifyChange(next);
  };

  const handleUpdateSlabRate = (
    id: string,
    size: 20 | 40,
    bandIdx: number,
    rate: number
  ) => {
    const next = routes.map((r) => {
      if (r.id === id) {
        if (size === 20) {
          const rates = { ...r.slabRates20, [bandIdx]: rate };
          return { ...r, slabRates20: rates };
        } else {
          const rates = { ...r.slabRates40, [bandIdx]: rate };
          return { ...r, slabRates40: rates };
        }
      }
      return r;
    });
    notifyChange(next);
  };

  // Add 1 Row
  const handleAddRow = () => {
    const newSeq = routes.length + 1;
    const defaultDrop = locations.find((l) => l.locationCode === 'CZPRG') || locations[0] || { locationName: 'Prague', locationCode: 'CZPRG' };
    const newRoute: ContractRoute = {
      id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      contractId: header?.id || 'MHI-IMP-001',
      sequence: newSeq,
      pickupLocationName: isImport ? header?.pickupLocationName || 'Hamburg' : 'Hamburg',
      pickupLocationCode: isImport ? header?.pickupLocationCode || 'DEHAM' : 'DEHAM',
      pickupType: header?.pickupType || 'Location',
      pickupFacilityCode: isImport ? 'DEHAMTBURC' : '',
      pickupTerm: header?.pickupTerm || 'CY',
      dropLocationName: isImport ? defaultDrop.locationName : header?.returnLocationName || 'Hamburg',
      dropLocationCode: isImport ? defaultDrop.locationCode : header?.returnLocationCode || 'DEHAM',
      dropType: header?.dropType || 'Location',
      dropFacilityCode: isImport ? 'CZPRGMETR' : 'DEHAMTBURC',
      dropTerm: header?.dropTerm || 'CY',
      returnLocationName: header?.returnLocationName || 'Hamburg',
      returnLocationCode: header?.returnLocationCode || 'DEHAM',
      returnType: header?.returnType || 'Location',
      haulageMode: header?.haulageMode || 'Combined',
      ladenStatus: header?.ladenStatus || 'Laden',
      currency: header?.currency || 'EUR',
      payableAt: header?.payableAt || 'POD',
      portToPay: header?.portToPay || 'DEHAM',
      negotiatedOn: header?.negotiatedOn || '2026-01-01',
      negotiatedBy: header?.negotiatedBy || 'Commercial Officer',
      validFrom: header?.validFrom || '2026-01-01',
      validTo: header?.validTo || '2026-12-31',
      tripType: header?.tripType || 'Live Load',
      vendorCode: header?.vendorCode || 'VEND-001',
      remarks: 'Standard Hinterland Rate',
      generalAmount: 500,
      amount20: 500,
      amount40: 750,
      slabRates20: { 1: 500, 2: 560, 3: 630, 4: 710, 5: 820 },
      slabRates40: { 1: 720, 2: 780, 3: 860, 4: 950, 5: 1080 },
      active: true,
    };
    notifyChange([...routes, newRoute]);
  };

  // Add 10 Rows
  const handleAdd10Rows = () => {
    const startSeq = routes.length + 1;
    const batch: ContractRoute[] = [];
    const sampleLocs = [
      { name: 'Prague', code: 'CZPRG', fac: 'CZPRGMETR' },
      { name: 'Brno', code: 'CZBRQ', fac: 'CZBRQSLAT' },
      { name: 'Vienna', code: 'ATVIE', fac: 'ATVIECONT' },
      { name: 'Munich', code: 'DEMUC', fac: 'DEMUCTRNS' },
      { name: 'Rotterdam', code: 'NLRTM', fac: 'NLRTMECTD' },
      { name: 'Antwerp', code: 'BEANR', fac: 'BEANRTR' },
    ];

    for (let i = 0; i < 10; i++) {
      const loc = sampleLocs[i % sampleLocs.length];
      batch.push({
        id: `r-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        contractId: header?.id || 'MHI-IMP-001',
        sequence: startSeq + i,
        pickupLocationName: isImport ? header?.pickupLocationName || 'Hamburg' : loc.name,
        pickupLocationCode: isImport ? header?.pickupLocationCode || 'DEHAM' : loc.code,
        pickupType: header?.pickupType || 'Location',
        pickupFacilityCode: isImport ? 'DEHAMTBURC' : loc.fac,
        pickupTerm: header?.pickupTerm || 'CY',
        dropLocationName: isImport ? loc.name : header?.returnLocationName || 'Hamburg',
        dropLocationCode: isImport ? loc.code : header?.returnLocationCode || 'DEHAM',
        dropType: header?.dropType || 'Location',
        dropFacilityCode: isImport ? loc.fac : 'DEHAMTBURC',
        dropTerm: header?.dropTerm || 'CY',
        returnLocationName: header?.returnLocationName || 'Hamburg',
        returnLocationCode: header?.returnLocationCode || 'DEHAM',
        returnType: header?.returnType || 'Location',
        haulageMode: header?.haulageMode || 'Combined',
        ladenStatus: header?.ladenStatus || 'Laden',
        currency: header?.currency || 'EUR',
        payableAt: header?.payableAt || 'POD',
        portToPay: header?.portToPay || 'DEHAM',
        negotiatedOn: header?.negotiatedOn || '2026-01-01',
        negotiatedBy: header?.negotiatedBy || 'Commercial Officer',
        validFrom: header?.validFrom || '2026-01-01',
        validTo: header?.validTo || '2026-12-31',
        tripType: header?.tripType || 'Live Load',
        vendorCode: header?.vendorCode || 'VEND-001',
        remarks: `Bulk Rate Row ${startSeq + i}`,
        generalAmount: 550 + i * 20,
        amount20: 550 + i * 20,
        amount40: 780 + i * 30,
        slabRates20: {
          1: 520 + i * 15,
          2: 580 + i * 15,
          3: 650 + i * 20,
          4: 730 + i * 25,
          5: 840 + i * 30,
        },
        slabRates40: {
          1: 750 + i * 25,
          2: 810 + i * 25,
          3: 890 + i * 30,
          4: 980 + i * 35,
          5: 1100 + i * 40,
        },
        active: true,
      });
    }
    notifyChange([...routes, ...batch]);
  };

  // Duplicate Selected / Single
  const handleDuplicate = (route: ContractRoute) => {
    const newSeq = routes.length + 1;
    const duplicated: ContractRoute = {
      ...route,
      id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sequence: newSeq,
      remarks: `${route.remarks || ''} (Copy)`,
    };
    notifyChange([...routes, duplicated]);
  };

  // Delete Single
  const handleDeleteRow = (id: string) => {
    const next = routes
      .filter((r) => r.id !== id)
      .map((r, idx) => ({ ...r, sequence: idx + 1 }));
    notifyChange(next);
    setSelectedRowIds((prev) => {
      const nextSet = new Set(prev);
      nextSet.delete(id);
      return nextSet;
    });
  };

  // Delete Selected
  const handleDeleteSelected = () => {
    if (selectedRowIds.size === 0) return;
    const next = routes
      .filter((r) => !selectedRowIds.has(r.id))
      .map((r, idx) => ({ ...r, sequence: idx + 1 }));
    notifyChange(next);
    setSelectedRowIds(new Set());
  };

  // Select all toggle
  const handleToggleSelectAll = () => {
    if (selectedRowIds.size === displayedRoutes.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(displayedRoutes.map((r) => r.id)));
    }
  };

  // Toggle single selection
  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Excel TSV Paste Support
  const handlePasteExcel = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.includes('\t')) {
        setPasteFeedback('Clipboard does not contain tab-delimited Excel data.');
        setTimeout(() => setPasteFeedback(null), 3000);
        return;
      }

      const rowsText = text.trim().split(/\r?\n/);
      const parsedRoutes: ContractRoute[] = [];
      let seq = routes.length + 1;

      for (const line of rowsText) {
        const cols = line.split('\t');
        if (cols.length < 1) continue;

        // Extract destination/location and rates from pasted columns
        const dest = cols[0]?.trim() || 'Prague';
        const rate1 = parseFloat(cols[1]?.replace(/[^0-9.]/g, '')) || 550;
        const rate2 = parseFloat(cols[2]?.replace(/[^0-9.]/g, '')) || rate1 + 60;
        const rate3 = parseFloat(cols[3]?.replace(/[^0-9.]/g, '')) || rate2 + 70;
        const rate4 = parseFloat(cols[4]?.replace(/[^0-9.]/g, '')) || rate3 + 80;
        const rate5 = parseFloat(cols[5]?.replace(/[^0-9.]/g, '')) || rate4 + 100;

        const locMatch = locations.find(
          (l) =>
            l.locationName.toLowerCase() === dest.toLowerCase() ||
            l.locationCode.toLowerCase() === dest.toLowerCase()
        );

        parsedRoutes.push({
          id: `r-${Date.now()}-${seq}-${Math.random().toString(36).substr(2, 4)}`,
          contractId: header?.id || 'MHI-IMP-001',
          sequence: seq++,
          pickupLocationName: isImport ? header?.pickupLocationName || 'Hamburg' : 'Hamburg',
          pickupLocationCode: isImport ? header?.pickupLocationCode || 'DEHAM' : 'DEHAM',
          pickupType: header?.pickupType || 'Location',
          pickupFacilityCode: isImport ? 'DEHAMTBURC' : '',
          pickupTerm: header?.pickupTerm || 'CY',
          dropLocationName: isImport ? (locMatch ? locMatch.locationName : dest) : header?.returnLocationName || 'Hamburg',
          dropLocationCode: isImport ? (locMatch ? locMatch.locationCode : 'CZPRG') : header?.returnLocationCode || 'DEHAM',
          dropType: header?.dropType || 'Location',
          dropFacilityCode: 'CZPRGMETR',
          dropTerm: header?.dropTerm || 'CY',
          returnLocationName: header?.returnLocationName || 'Hamburg',
          returnLocationCode: header?.returnLocationCode || 'DEHAM',
          returnType: header?.returnType || 'Location',
          haulageMode: header?.haulageMode || 'Combined',
          ladenStatus: header?.ladenStatus || 'Laden',
          currency: header?.currency || 'EUR',
          payableAt: header?.payableAt || 'POD',
          portToPay: header?.portToPay || 'DEHAM',
          negotiatedOn: header?.negotiatedOn || '2026-01-01',
          negotiatedBy: header?.negotiatedBy || 'Commercial Officer',
          validFrom: header?.validFrom || '2026-01-01',
          validTo: header?.validTo || '2026-12-31',
          tripType: header?.tripType || 'Live Load',
          vendorCode: header?.vendorCode || 'VEND-001',
          remarks: 'Imported from Excel Clipboard',
          generalAmount: rate1,
          amount20: rate1,
          amount40: rate3,
          slabRates20: { 1: rate1, 2: rate2, 3: rate3, 4: rate4, 5: rate5 },
          slabRates40: {
            1: Math.round(rate1 * 1.35),
            2: Math.round(rate2 * 1.35),
            3: Math.round(rate3 * 1.35),
            4: Math.round(rate4 * 1.35),
            5: Math.round(rate5 * 1.35),
          },
          active: true,
        });
      }

      if (parsedRoutes.length > 0) {
        notifyChange([...routes, ...parsedRoutes]);
        setPasteFeedback(`Successfully pasted ${parsedRoutes.length} routes from Excel.`);
        setTimeout(() => setPasteFeedback(null), 3500);
      }
    } catch (err) {
      setPasteFeedback('Unable to access clipboard. Please permit clipboard permissions.');
      setTimeout(() => setPasteFeedback(null), 3000);
    }
  };

  const effectiveLabels20 = useMemo(() => {
    if (headerLabels20 && headerLabels20.length === 5) return headerLabels20;
    if (slabs20 && slabs20.length > 0) {
      return slabs20.map((s, idx) => s.label || `20' <${s.to}t`);
    }
    return ["20' <10t", "20' <15t", "20' <20t", "20' <24t", "20' <28t"];
  }, [headerLabels20, slabs20]);

  const effectiveLabels40 = useMemo(() => {
    if (headerLabels40 && headerLabels40.length === 5) return headerLabels40;
    if (slabs40 && slabs40.length > 0) {
      return slabs40.map((s, idx) => s.label || `40' <${s.to}t`);
    }
    return ["40' <14t", "40' <24t", "40' <37t", "40' <45t", "40' <67t"];
  }, [headerLabels40, slabs40]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* GRID TOOLBAR */}
      <div className="bg-[#0B1F33] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-100">
              ROUTE & RATE ENTRY MATRIX
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1769AA] text-white">
              {displayedRoutes.length} Routes
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search destination, code, remarks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-800/80 border border-slate-600 rounded-md pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-400 w-56"
            />
          </div>
        </div>

        {/* Action buttons on Toolbar */}
        <div className="flex items-center space-x-2">
          {pasteFeedback && (
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
              {pasteFeedback}
            </span>
          )}

          <button
            type="button"
            onClick={handlePasteExcel}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-xs font-medium transition-colors"
            title="Paste tab-delimited tabular rows copied from Excel"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paste Excel</span>
          </button>

          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#1769AA] hover:bg-blue-600 text-white rounded text-xs font-bold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>

          <button
            type="button"
            onClick={handleAdd10Rows}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>+10 Rows</span>
          </button>

          {selectedRowIds.size > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedRowIds.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* SPREADSHEET MATRIX TABLE */}
      <div className="overflow-x-auto overflow-y-auto max-h-[580px] border-b border-slate-200">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          {/* STICKY TABLE HEADER */}
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 border-b-2 border-slate-300 font-semibold shadow-xs">
            <tr className="divide-x divide-slate-200 text-[11px]">
              {/* Frozen Selection & Seq */}
              <th className="sticky left-0 z-30 bg-slate-200 px-2 py-2 w-8 text-center">
                <input
                  type="checkbox"
                  checked={
                    displayedRoutes.length > 0 &&
                    selectedRowIds.size === displayedRoutes.length
                  }
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="sticky left-8 z-30 bg-slate-200 px-2.5 py-2 w-10 text-center font-mono">
                #
              </th>

              {/* Col 1: Pick Up Location */}
              <th className="sticky left-[72px] z-30 bg-slate-100 px-3 py-2">
                <div className="flex items-center space-x-1">
                  <span>Pick Up Loc</span>
                  {isImport && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                </div>
              </th>

              {/* Col 2: Pick Up Type */}
              <th className="px-2.5 py-2">Pick Up Type</th>
              {/* Col 3: Pick Up Facility */}
              <th className="px-2.5 py-2">Pick Up Facility</th>
              {/* Col 4: Pick Up Term */}
              <th className="px-2 py-2">Pick Up Term</th>

              {/* Col 5: Drop Location (PRIMARY EDITABLE IN IMPORT) */}
              <th className="px-3 py-2 bg-blue-50/80 text-blue-950 font-bold border-l-2 border-blue-300">
                <div className="flex items-center space-x-1">
                  <span>Drop Location</span>
                  <span className="text-[10px] text-blue-600">*</span>
                </div>
              </th>
              {/* Col 6: Drop Type */}
              <th className="px-2.5 py-2">Drop Type</th>
              {/* Col 7: Drop Facility */}
              <th className="px-2.5 py-2">Drop Facility</th>
              {/* Col 8: Drop Term */}
              <th className="px-2 py-2">Drop Term</th>

              {/* Col 9: H-Mode */}
              <th className="px-2 py-2">H-Mode</th>
              {/* Col 10: LDN/MTY */}
              <th className="px-2 py-2">LDN/MTY</th>
              {/* Col 11: Currency */}
              <th className="px-2 py-2">Cur</th>
              {/* Col 12: Amount Type */}
              <th className="px-2.5 py-2">Amount Type</th>

              {/* Col 13: LUMP SUM DYNAMIC AMOUNT COLUMNS */}
              {isLumpSumSingle && (
                <th className="px-3 py-2 bg-emerald-50 text-emerald-950 font-bold text-right border-l-2 border-emerald-400">
                  Amount ({getCurrencySymbol(header?.currency)})
                </th>
              )}
              {isLumpSumSplit && (
                <>
                  <th className="px-3 py-2 bg-emerald-50 text-emerald-950 font-bold text-right border-l-2 border-emerald-400">
                    20s Amount ({getCurrencySymbol(header?.currency)})
                  </th>
                  <th className="px-3 py-2 bg-emerald-50 text-emerald-950 font-bold text-right">
                    40s Amount ({getCurrencySymbol(header?.currency)})
                  </th>
                </>
              )}

              {/* Col 14: Payable At */}
              <th className="px-2.5 py-2">Payable At</th>

              {/* Col 15-19: 20 FT WEIGHT SLAB COLUMNS */}
              {isWeightSlab && (
                <>
                  {effectiveLabels20.map((lbl, idx) => (
                    <th
                      key={`h20-${idx}`}
                      className="px-2 py-2 bg-blue-50 text-blue-900 text-right font-mono font-bold text-[10px]"
                    >
                      {lbl}
                    </th>
                  ))}
                  {/* Col 20-24: 40 FT WEIGHT SLAB COLUMNS */}
                  {effectiveLabels40.map((lbl, idx) => (
                    <th
                      key={`h40-${idx}`}
                      className="px-2 py-2 bg-indigo-50 text-indigo-900 text-right font-mono font-bold text-[10px]"
                    >
                      {lbl}
                    </th>
                  ))}
                </>
              )}

              {/* Col 25: Port To Pay */}
              <th className="px-2.5 py-2">Port To Pay</th>
              {/* Col 26: Negotiated On */}
              <th className="px-2.5 py-2">Negotiated On</th>
              {/* Col 27: Negotiated By */}
              <th className="px-2.5 py-2">Negotiated By</th>
              {/* Col 28: Return Location */}
              <th className="px-3 py-2">Return Loc</th>
              {/* Col 29: Return Type */}
              <th className="px-2.5 py-2">Return Type</th>
              {/* Col 30: Return Facility */}
              <th className="px-2.5 py-2">Return Facility</th>
              {/* Col 31: Valid From */}
              <th className="px-2.5 py-2">Valid From</th>
              {/* Col 32: Valid To */}
              <th className="px-2.5 py-2">Valid To</th>
              {/* Col 33: Trip Type */}
              <th className="px-2.5 py-2">Trip Type</th>
              {/* Col 34: Vendor Code */}
              <th className="px-2.5 py-2">Vendor Code</th>
              {/* Col 35: Remarks */}
              <th className="px-4 py-2 min-w-[200px]">Remarks</th>
              {/* Action Column */}
              <th className="px-2 py-2 text-center w-16">Action</th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-slate-200">
            {displayedRoutes.map((route, rIdx) => {
              const isSelected = selectedRowIds.has(route.id);

              return (
                <tr
                  key={route.id}
                  className={`hover:bg-blue-50/40 transition-colors divide-x divide-slate-200 ${
                    isSelected ? 'bg-blue-50/70' : rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                  }`}
                >
                  {/* Frozen Select */}
                  <td className="sticky left-0 z-10 bg-inherit px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectRow(route.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Frozen Sequence */}
                  <td className="sticky left-8 z-10 bg-inherit px-2.5 py-1.5 text-center font-mono font-bold text-slate-500">
                    {route.sequence}
                  </td>

                  {/* Col 1: Pick Up Location */}
                  <td
                    className={`sticky left-[72px] z-10 px-3 py-1.5 font-semibold ${
                      isImport
                        ? 'bg-slate-100/90 text-slate-600 select-none'
                        : 'bg-inherit text-slate-800'
                    }`}
                  >
                    {isImport ? (
                      <div className="flex items-center space-x-1">
                        <span>{route.pickupLocationName}</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          ({route.pickupLocationCode})
                        </span>
                      </div>
                    ) : (
                      <select
                        value={route.pickupLocationName}
                        onChange={(e) => {
                          const loc = locations.find(
                            (l) => l.locationName === e.target.value
                          );
                          handleUpdateRoute(route.id, {
                            pickupLocationName: e.target.value,
                            pickupLocationCode: loc ? loc.locationCode : 'DEHAM',
                          });
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.locationName}>
                            {loc.locationName} ({loc.locationCode})
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Col 2: Pick Up Type (Inherited in Import) */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 text-slate-600">
                    {route.pickupType}
                  </td>

                  {/* Col 3: Pick Up Facility */}
                  <td className="px-2.5 py-1.5">
                    <input
                      type="text"
                      value={route.pickupFacilityCode || ''}
                      onChange={(e) =>
                        handleUpdateRoute(route.id, {
                          pickupFacilityCode: e.target.value,
                        })
                      }
                      className="w-24 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </td>

                  {/* Col 4: Pick Up Term */}
                  <td className="px-2 py-1.5 bg-slate-50/60 text-slate-600 font-mono">
                    {route.pickupTerm}
                  </td>

                  {/* Col 5: Drop Location (PRIMARY EDITABLE IN IMPORT) */}
                  <td className="px-3 py-1.5 bg-blue-50/30">
                    {isImport ? (
                      <select
                        value={route.dropLocationName}
                        onChange={(e) => {
                          const loc = locations.find(
                            (l) => l.locationName === e.target.value
                          );
                          const fac = facilities.find(
                            (f) => f.locationCode === (loc ? loc.locationCode : '')
                          );
                          handleUpdateRoute(route.id, {
                            dropLocationName: e.target.value,
                            dropLocationCode: loc ? loc.locationCode : 'CZPRG',
                            dropFacilityCode: fac ? fac.facilityCode : route.dropFacilityCode,
                          });
                        }}
                        className="w-40 bg-white border-2 border-blue-400 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 shadow-2xs"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.locationName}>
                            {loc.locationName} ({loc.locationCode})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-1 text-slate-600 font-semibold">
                        <span>{route.dropLocationName}</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          ({route.dropLocationCode})
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Col 6: Drop Type */}
                  <td className="px-2.5 py-1.5">
                    <select
                      value={route.dropType}
                      onChange={(e) =>
                        handleUpdateRoute(route.id, {
                          dropType: e.target.value as PickupDropReturnType,
                        })
                      }
                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-hidden focus:border-blue-500"
                    >
                      {PICKUP_DROP_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Col 7: Drop Facility */}
                  <td className="px-2.5 py-1.5">
                    <input
                      type="text"
                      value={route.dropFacilityCode || ''}
                      onChange={(e) =>
                        handleUpdateRoute(route.id, {
                          dropFacilityCode: e.target.value,
                        })
                      }
                      className="w-28 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-semibold text-blue-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </td>

                  {/* Col 8: Drop Term */}
                  <td className="px-2 py-1.5 bg-slate-50/60 text-slate-600 font-mono">
                    {route.dropTerm}
                  </td>

                  {/* Col 9: H-Mode */}
                  <td className="px-2 py-1.5 bg-slate-50/60 text-slate-700 font-medium">
                    {route.haulageMode}
                  </td>

                  {/* Col 10: LDN/MTY */}
                  <td className="px-2 py-1.5 bg-slate-50/60 text-slate-700">
                    {route.ladenStatus}
                  </td>

                  {/* Col 11: Currency */}
                  <td className="px-2 py-1.5 bg-slate-50/60 font-mono font-bold text-slate-700">
                    {route.currency}
                  </td>

                  {/* Col 12: Amount Type */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 font-medium text-slate-700">
                    {route.amountType === 'WEIGHT_SLAB' ? 'Wt.Slab' : 'Lumpsum'}
                  </td>

                  {/* Col 13: LUMP SUM AMOUNT FIELDS */}
                  {isLumpSumSingle && (
                    <td className="px-2 py-1.5 bg-emerald-50/30">
                      <input
                        type="number"
                        value={route.generalAmount || ''}
                        onChange={(e) =>
                          handleUpdateRoute(route.id, {
                            generalAmount: parseFloat(e.target.value) || 0,
                            amount20: parseFloat(e.target.value) || 0,
                            amount40: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24 text-right bg-white border-2 border-emerald-400 rounded px-2 py-0.5 text-xs font-mono font-bold text-emerald-900 focus:outline-hidden focus:border-emerald-600 shadow-2xs"
                      />
                    </td>
                  )}
                  {isLumpSumSplit && (
                    <>
                      <td className="px-2 py-1.5 bg-emerald-50/30">
                        <input
                          type="number"
                          value={route.amount20 || ''}
                          onChange={(e) =>
                            handleUpdateRoute(route.id, {
                              amount20: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 text-right bg-white border-2 border-emerald-400 rounded px-2 py-0.5 text-xs font-mono font-bold text-emerald-900 focus:outline-hidden focus:border-emerald-600 shadow-2xs"
                        />
                      </td>
                      <td className="px-2 py-1.5 bg-emerald-50/30">
                        <input
                          type="number"
                          value={route.amount40 || ''}
                          onChange={(e) =>
                            handleUpdateRoute(route.id, {
                              amount40: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 text-right bg-white border-2 border-emerald-400 rounded px-2 py-0.5 text-xs font-mono font-bold text-emerald-900 focus:outline-hidden focus:border-emerald-600 shadow-2xs"
                        />
                      </td>
                    </>
                  )}

                  {/* Col 14: Payable At */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 font-semibold text-slate-700">
                    {route.payableAt}
                  </td>

                  {/* Col 15-24: WEIGHT SLAB RATE INPUTS */}
                  {isWeightSlab && (
                    <>
                      {/* 20 FT BANDS 1 to 5 */}
                      {[1, 2, 3, 4, 5].map((bandIdx) => {
                        const val = route.slabRates20?.[bandIdx] || 0;
                        return (
                          <td
                            key={`r20-${bandIdx}`}
                            className="px-1.5 py-1 bg-blue-50/20"
                          >
                            <input
                              type="number"
                              value={val || ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleUpdateSlabRate(
                                  route.id,
                                  20,
                                  bandIdx,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className={`w-18 text-right border rounded px-1.5 py-0.5 text-xs font-mono font-semibold focus:outline-hidden focus:border-blue-600 ${
                                val > 0
                                  ? 'bg-white border-blue-300 text-blue-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* 40 FT BANDS 1 to 5 */}
                      {[1, 2, 3, 4, 5].map((bandIdx) => {
                        const val = route.slabRates40?.[bandIdx] || 0;
                        return (
                          <td
                            key={`r40-${bandIdx}`}
                            className="px-1.5 py-1 bg-indigo-50/20"
                          >
                            <input
                              type="number"
                              value={val || ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleUpdateSlabRate(
                                  route.id,
                                  40,
                                  bandIdx,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className={`w-18 text-right border rounded px-1.5 py-0.5 text-xs font-mono font-semibold focus:outline-hidden focus:border-indigo-600 ${
                                val > 0
                                  ? 'bg-white border-indigo-300 text-indigo-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            />
                          </td>
                        );
                      })}
                    </>
                  )}

                  {/* Col 25: Port To Pay */}
                  <td className="px-2.5 py-1.5">
                    <input
                      type="text"
                      value={route.portToPay || ''}
                      onChange={(e) =>
                        handleUpdateRoute(route.id, {
                          portToPay: e.target.value,
                        })
                      }
                      className="w-20 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </td>

                  {/* Col 26: Negotiated On */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 font-mono text-[11px] text-slate-600">
                    {route.negotiatedOn}
                  </td>

                  {/* Col 27: Negotiated By */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 text-slate-600 truncate max-w-[120px]">
                    {route.negotiatedBy}
                  </td>

                  {/* Col 28: Return Location */}
                  <td className="px-3 py-1.5 bg-slate-50/60 text-slate-600">
                    {route.returnLocationName} ({route.returnLocationCode})
                  </td>

                  {/* Col 29: Return Type */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 text-slate-600">
                    {route.returnType}
                  </td>

                  {/* Col 30: Return Facility */}
                  <td className="px-2.5 py-1.5">
                    <input
                      type="text"
                      value={route.returnFacilityCode || ''}
                      onChange={(e) =>
                        handleUpdateRoute(route.id, {
                          returnFacilityCode: e.target.value,
                        })
                      }
                      className="w-24 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </td>

                  {/* Col 31: Valid From */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 font-mono text-[11px] text-slate-600">
                    {route.validFrom}
                  </td>

                  {/* Col 32: Valid To */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 font-mono text-[11px] text-slate-600">
                    {route.validTo}
                  </td>

                  {/* Col 33: Trip Type */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 text-slate-600">
                    {route.tripType}
                  </td>

                  {/* Col 34: Vendor Code */}
                  <td className="px-2.5 py-1.5 bg-slate-50/60 font-mono font-bold text-slate-700">
                    {route.vendorCode}
                  </td>

                  {/* Col 35: Remarks */}
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={route.remarks || ''}
                      onChange={(e) =>
                        handleUpdateRoute(route.id, {
                          remarks: e.target.value,
                        })
                      }
                      placeholder="Route notes..."
                      className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </td>

                  {/* Actions Column */}
                  <td className="px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(route)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-200 transition-colors"
                        title="Duplicate Route Row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(route.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Route Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER SUMMARY */}
      <div className="bg-slate-50 px-4 py-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
        <div className="flex items-center space-x-4">
          <span>
            Total Rows: <strong>{routes.length}</strong>
          </span>
          <span>
            Pricing Model:{' '}
            <strong className="text-slate-800">
              {effectiveAmountType === 'WEIGHT_SLAB'
                ? 'Weight Slab (10 bands)'
                : effectiveLumpSumMode === 'SINGLE_AMOUNT'
                ? 'Lump Sum (Single)'
                : 'Lump Sum (20s/40s)'}
            </strong>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] text-slate-500">
            Copy rows from Microsoft Excel & click <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">Paste Excel</code> to bulk import
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900"
          >
            + Add New Route
          </button>
        </div>
      </div>
    </div>
  );
};
