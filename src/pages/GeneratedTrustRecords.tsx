/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Download,
  ShieldCheck,
  Table,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
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
    // Export the filtered view the user can see, not the entire record set.
    const subset = filteredRecords.filter((r) => r._trace.direction === direction);
    if (subset.length === 0) {
      alert(
        `No ${direction} records to export. Generate records in the Processing Engine, ` +
          `or widen the filters above.`
      );
      return;
    }
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
    const subset = filteredRecords.filter((r) => r._trace.direction === direction);
    if (subset.length === 0) {
      alert(
        `No ${direction} records to export. Generate records in the Processing Engine, ` +
          `or widen the filters above.`
      );
      return;
    }
    const csv = serializeTrustRecordsToCsv(subset, direction, settings.legacyTrustCompatibility);
    downloadFile(csv, `HAULAGE_${direction}_ALL_RECORDS.csv`, 'text/csv');
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
      {/* PAGE HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#0F172A] text-[#FEF3C7] rounded-xl border border-[#F59E0B]/40 shadow-xs">
            <Table className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Generated Haulage Records
              </h1>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{allTrustRecords.length} Rows Compiled</span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Canonical 44-column records with deterministic terminal expansion, equipment separation, and audit lineage.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleExportXlsx('IMPORT')}
            className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Import (XLSX)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportXlsx('EXPORT')}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-[#FEF3C7] rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-xs border border-[#F59E0B]/40 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-[#F59E0B]" />
            <span>Export Export (XLSX)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <motion.div
        variants={itemVariants}
        className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Record ID, terminal, port, vendor..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-hidden focus:border-[#0284C7] font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          {/* Direction Filter */}
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value as any)}
            className="bg-slate-50 text-[#0F172A] border border-slate-200 rounded-xl px-3.5 py-2 font-bold focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Directions</option>
            <option value="IMPORT">Import Only</option>
            <option value="EXPORT">Export Only</option>
          </select>

          {/* Equipment Filter */}
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="bg-slate-50 text-[#0F172A] border border-slate-200 rounded-xl px-3.5 py-2 font-bold focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Equipment</option>
            <option value="20s">20s Containers</option>
            <option value="40s">40s Containers</option>
          </select>

          {/* Contract Filter */}
          <select
            value={selectedContractFilter}
            onChange={(e) => setSelectedContractFilter(e.target.value)}
            className="bg-slate-50 text-[#0F172A] border border-slate-200 rounded-xl px-3.5 py-2 font-bold focus:outline-hidden max-w-xs truncate cursor-pointer"
          >
            <option value="ALL">All Source Contracts</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contractNumber} ({c.vendorCode})
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Generated Records Table */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-enterprise"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[#64748B] uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4.5 py-4 w-20">ID #</th>
                <th className="px-4.5 py-4">Pickup</th>
                <th className="px-4.5 py-4">Drop</th>
                <th className="px-4.5 py-4">Terminal / Depot</th>
                <th className="px-4.5 py-4">Equipment</th>
                <th className="px-4.5 py-4">Mode</th>
                <th className="px-4.5 py-4">Amount Type</th>
                <th className="px-4.5 py-4">Amount</th>
                <th className="px-4.5 py-4">Payable At</th>
                <th className="px-4.5 py-4">Vendor</th>
                <th className="px-4.5 py-4 text-right">Audit Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0F172A] font-mono">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-[#64748B] font-sans">
                    No generated haulage records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={`${record._trace.generationRunId}-${record.id}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* ID */}
                    <td className="px-4.5 py-3.5 font-bold text-[#F59E0B]">
                      #{record.id}
                    </td>

                    {/* Pickup */}
                    <td className="px-4.5 py-3.5 font-sans">
                      <span className="font-bold text-[#0F172A]">{record.pickupLocation}</span>
                      <span className="text-[10px] text-[#64748B] ml-1 font-mono">({record.pickupCountryCode})</span>
                    </td>

                    {/* Drop */}
                    <td className="px-4.5 py-3.5 font-sans">
                      <span className="font-bold text-[#0F172A]">{record.dropLocation}</span>
                      <span className="text-[10px] text-[#64748B] ml-1 font-mono">({record.dropCountryCode})</span>
                    </td>

                    {/* Terminal */}
                    <td className="px-4.5 py-3.5">
                      <span className="text-[#0284C7] font-bold">
                        {record.pickupZipDepotTerminal || record.dropZipDepotTerminal || '—'}
                      </span>
                    </td>

                    {/* Equipment */}
                    <td className="px-4.5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          record.equipment === '20s'
                            ? 'bg-blue-50 text-[#0284C7] border border-blue-200'
                            : 'bg-teal-50 text-[#0D9488] border border-teal-200'
                        }`}
                      >
                        {record.equipment}
                      </span>
                    </td>

                    {/* Mode */}
                    <td className="px-4.5 py-3.5 font-sans text-[#64748B]">
                      {record.hMode}
                    </td>

                    {/* Amount Type */}
                    <td className="px-4.5 py-3.5 font-sans">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          record.amountType === 'Wt.Slab'
                            ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {record.amountType}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4.5 py-3.5 font-bold">
                      {record.amountType === 'Wt.Slab' ? (
                        <span className="text-[#64748B] text-[11px]">0.00 (In Slabs)</span>
                      ) : (
                        <span className="text-emerald-700">
                          {record.currency} {record.amount.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Payable */}
                    <td className="px-4.5 py-3.5 text-[11px] text-[#64748B] font-sans">
                      {record.payableAt} @ {record.portToPay}
                    </td>

                    {/* Vendor */}
                    <td className="px-4.5 py-3.5 text-[#0F172A] font-bold">
                      {record.vendorCode}
                    </td>

                    {/* Action Trace Drawer */}
                    <td className="px-4.5 py-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => setInspectedRecord(record)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-[#0284C7] hover:text-white text-[#0F172A] rounded-xl text-xs font-bold flex items-center space-x-1.5 ml-auto transition-all cursor-pointer border border-slate-200 shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7] group-hover:text-white" />
                        <span>Lineage Trace</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
