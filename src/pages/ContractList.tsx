/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Trash2,
  Edit3,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HaulageDirection, ContractStatus } from '../types';

export const ContractList: React.FC = () => {
  const {
    contracts,
    setSelectedContractId,
    setActiveView,
    createContract,
    duplicateContract,
    deleteContract,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | HaulageDirection>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ContractStatus>('ALL');

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchSearch =
        c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.pickupLocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.remarks && c.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDir = directionFilter === 'ALL' || c.direction === directionFilter;
      const matchStat = statusFilter === 'ALL' || c.contractStatus === statusFilter;

      return matchSearch && matchDir && matchStat;
    });
  }, [contracts, searchTerm, directionFilter, statusFilter]);

  const handleOpen = (id: string, direction: HaulageDirection) => {
    setSelectedContractId(id);
    setActiveView(direction === 'IMPORT' ? 'import-contract' : 'export-contract');
  };

  const handleCreate = (direction: HaulageDirection) => {
    const newC = createContract({ direction });
    setSelectedContractId(newC.id);
    setActiveView(direction === 'IMPORT' ? 'import-contract' : 'export-contract');
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
      className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#0F172A]"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#0F172A] text-[#FEF3C7] rounded-xl border border-[#F59E0B]/40 shadow-xs">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Contract Master Management</h1>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Define, validate, and orchestrate Import and Export haulage agreements
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleCreate('IMPORT')}
            className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer btn-glow-blue"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Import Contract</span>
          </button>
          <button
            type="button"
            onClick={() => handleCreate('EXPORT')}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-[#FEF3C7] rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all border border-[#F59E0B]/40 cursor-pointer btn-glow-gold"
          >
            <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>New Export Contract</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contract #, vendor, port, remarks..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-hidden focus:border-[#0284C7] font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Direction Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            {(['ALL', 'IMPORT', 'EXPORT'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDirectionFilter(dir)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  directionFilter === dir
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {dir === 'ALL' ? 'All Directions' : dir}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 text-[#0F172A] text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-[#0284C7] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="VALIDATED">Validated</option>
            <option value="GENERATED">Generated</option>
            <option value="EXPORTED">Exported</option>
            <option value="VALIDATION_FAILED">Validation Failed</option>
          </select>
        </div>
      </motion.div>

      {/* Contracts Table */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-enterprise"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[#64748B] uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Contract Number</th>
                <th className="px-6 py-4">Direction</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Pricing Structure</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4">Routes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0F172A]">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#64748B] font-medium">
                    No contracts matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() => handleOpen(c.id, c.direction)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F172A] flex items-center space-x-2 font-mono">
                        <span className="text-sm">{c.contractNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-sans font-bold">
                          Rev {c.revision}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        {c.pickupLocationName} ({c.pickupLocationCode})
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          c.direction === 'IMPORT'
                            ? 'bg-blue-50 text-[#0284C7] border border-blue-200'
                            : 'bg-amber-50 text-[#D97706] border border-amber-200'
                        }`}
                      >
                        {c.direction === 'IMPORT' ? (
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        )}
                        {c.direction}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F172A]">{c.vendorName}</div>
                      <div className="text-[10px] font-mono text-[#64748B]">{c.vendorCode}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F172A]">
                        {c.amountType === 'WEIGHT_SLAB' ? 'Weight Slabs (5 Bands)' : 'Lump Sum'}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {c.amountType === 'LUMPSUM'
                          ? c.lumpSumMode === 'EQUIPMENT_SPECIFIC'
                            ? '20 ft / 40 ft Specific Rates'
                            : 'Single Corridor Amount'
                          : `${c.currency} Tiered`}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-[#0F172A] font-mono font-medium">
                        {c.validFrom} &rarr; {c.validTo}
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        Negotiated: {c.negotiatedOn}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-[#0F172A] font-mono text-sm">{c.routes.length}</span>
                      <span className="text-[#64748B] text-[11px] ml-1">Corridors</span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          c.contractStatus === 'GENERATED' || c.contractStatus === 'EXPORTED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : c.contractStatus === 'VALIDATED'
                            ? 'bg-blue-50 text-[#0284C7] border border-blue-200'
                            : c.contractStatus === 'VALIDATION_FAILED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {c.contractStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpen(c.id, c.direction)}
                          className="p-2 rounded-xl hover:bg-sky-50 text-[#0284C7] transition-all cursor-pointer"
                          title="Edit Contract"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateContract(c.id)}
                          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                          title="Duplicate Contract"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteContract(c.id)}
                          className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-all cursor-pointer"
                          title="Archive / Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
