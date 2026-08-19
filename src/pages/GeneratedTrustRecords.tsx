/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HaulageDirection } from '../types';
import {
  generateTrustExcelWorkbook,
  serializeTrustRecordsToCsv,
  downloadFile,
} from '../business-rules/legacyTrustSerializer';

export const GeneratedTrustRecords: React.FC = () => {
  const {
    allTrustRecords,
    allWeightSlabs,
    contracts,
    setInspectedRecord,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractFilter, setSelectedContractFilter] = useState<string>('ALL');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('ALL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | HaulageDirection>('ALL');

  const filteredRecords = useMemo(() => {
    return allTrustRecords.filter((r) => {
      const matchSearch =
        String(r.id).includes(searchTerm) ||
        r.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.pickupZipDepotTerminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dropZipDepotTerminal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vendorCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchContract =
        selectedContractFilter === 'ALL' || r._trace.contractId === selectedContractFilter;

      const matchEquipment =
        equipmentFilter === 'ALL' || r.equipment === equipmentFilter;

      const matchDirection =
        directionFilter === 'ALL' || r._trace.direction === directionFilter;

      return matchSearch && matchContract && matchEquipment && matchDirection;
    });
  }, [allTrustRecords, searchTerm, selectedContractFilter, equipmentFilter, directionFilter]);

  const handleExportXlsx = (direction: HaulageDirection) => {
    const subset = allTrustRecords.filter((r) => r._trace.direction === direction);
    const subsetSlabs = allWeightSlabs.filter((ws) =>
      subset.some((r) => r.id === ws.id)
    );

    const bytes = generateTrustExcelWorkbook({
      records: subset,
      weightSlabs: subsetSlabs,
      direction,
      contractNumber: 'ALL_ACTIVE',
      revision: 1,
      legacyMode: settings.legacyTrustCompatibility,
    });

    downloadFile(
      bytes,
      `HAULAGE_${direction}_ALL_RECORDS.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  };

  const handleExportCsv = (direction: HaulageDirection) => {
    const subset = allTrustRecords.filter((r) => r._trace.direction === direction);
    const csv = serializeTrustRecordsToCsv(subset, direction, settings.legacyTrustCompatibility);
    downloadFile(csv, `HAULAGE_${direction}_ALL_RECORDS.csv`, 'text/csv');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Generated Haulage Records</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-mono font-bold">
              {allTrustRecords.length} Generated
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Canonical 44-column records with deterministic terminal expansion, 20ft/40ft equipment separation, and lineage audit
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleExportXlsx('IMPORT')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Import (XLSX)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportXlsx('EXPORT')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Export (XLSX)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Record ID, terminal, port, vendor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          {/* Direction Filter */}
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value as any)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="ALL">All Directions</option>
            <option value="IMPORT">Import Only</option>
            <option value="EXPORT">Export Only</option>
          </select>

          {/* Equipment Filter */}
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="ALL">All Equipment</option>
            <option value="20s">20s Containers</option>
            <option value="40s">40s Containers</option>
          </select>

          {/* Contract Filter */}
          <select
            value={selectedContractFilter}
            onChange={(e) => setSelectedContractFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-hidden max-w-xs truncate"
          >
            <option value="ALL">All Source Contracts</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contractNumber} ({c.vendorCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generated Records Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-16">ID #</th>
                <th className="px-4 py-3.5">Pickup</th>
                <th className="px-4 py-3.5">Drop</th>
                <th className="px-4 py-3.5">Terminal / Depot</th>
                <th className="px-4 py-3.5">Equipment</th>
                <th className="px-4 py-3.5">Mode</th>
                <th className="px-4 py-3.5">Amount Type</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Payable At</th>
                <th className="px-4 py-3.5">Vendor</th>
                <th className="px-4 py-3.5 text-right">Audit Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No generated haulage records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={`${record._trace.generationRunId}-${record.id}`}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-3 font-bold text-amber-600">
                      #{record.id}
                    </td>

                    {/* Pickup */}
                    <td className="px-4 py-3 font-sans">
                      <span className="font-semibold text-slate-900">{record.pickupLocation}</span>
                      <span className="text-[10px] text-slate-500 ml-1 font-mono">({record.pickupCountryCode})</span>
                    </td>

                    {/* Drop */}
                    <td className="px-4 py-3 font-sans">
                      <span className="font-semibold text-slate-900">{record.dropLocation}</span>
                      <span className="text-[10px] text-slate-500 ml-1 font-mono">({record.dropCountryCode})</span>
                    </td>

                    {/* Terminal */}
                    <td className="px-4 py-3">
                      <span className="text-blue-600 font-bold">
                        {record.pickupZipDepotTerminal || record.dropZipDepotTerminal || '—'}
                      </span>
                    </td>

                    {/* Equipment */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          record.equipment === '20s'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {record.equipment}
                      </span>
                    </td>

                    {/* Mode */}
                    <td className="px-4 py-3 font-sans text-slate-600">
                      {record.hMode}
                    </td>

                    {/* Amount Type */}
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          record.amountType === 'Wt.Slab'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {record.amountType}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-bold">
                      {record.amountType === 'Wt.Slab' ? (
                        <span className="text-slate-400 text-[11px]">0.00 (In Slabs)</span>
                      ) : (
                        <span className="text-emerald-700">
                          {record.currency} {record.amount.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Payable */}
                    <td className="px-4 py-3 text-[11px] text-slate-600 font-sans">
                      {record.payableAt} @ {record.portToPay}
                    </td>

                    {/* Vendor */}
                    <td className="px-4 py-3 text-slate-700">
                      {record.vendorCode}
                    </td>

                    {/* Action Trace Drawer */}
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => setInspectedRecord(record)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center space-x-1 ml-auto transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Explain Trace</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
