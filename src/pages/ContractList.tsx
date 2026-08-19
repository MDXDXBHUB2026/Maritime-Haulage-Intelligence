/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Trash2,
  Edit3,
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Contract Master Management</h1>
          <p className="text-xs text-slate-500">
            Define, validate, and orchestrate Import and Export haulage agreements
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleCreate('IMPORT')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Import Contract</span>
          </button>
          <button
            type="button"
            onClick={() => handleCreate('EXPORT')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Export Contract</span>
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
            placeholder="Search contract #, vendor, port, remarks..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Direction Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 rounded-md p-1 border border-slate-200 text-xs">
            {(['ALL', 'IMPORT', 'EXPORT'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setDirectionFilter(dir)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  directionFilter === dir
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
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
            className="bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="VALIDATED">Validated</option>
            <option value="GENERATED">Generated</option>
            <option value="EXPORTED">Exported</option>
            <option value="VALIDATION_FAILED">Validation Failed</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Contract Number</th>
                <th className="px-6 py-3.5">Direction</th>
                <th className="px-6 py-3.5">Vendor</th>
                <th className="px-6 py-3.5">Pricing Structure</th>
                <th className="px-6 py-3.5">Validity</th>
                <th className="px-6 py-3.5">Routes</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    No contracts matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleOpen(c.id, c.direction)}
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 flex items-center space-x-2 font-mono">
                        <span>{c.contractNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-sans font-normal">
                          Rev {c.revision}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.pickupLocationName} ({c.pickupLocationCode})
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          c.direction === 'IMPORT'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
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

                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900">{c.vendorName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{c.vendorCode}</div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-900">
                        {c.amountType === 'WEIGHT_SLAB' ? 'Weight Slabs (5 Bands)' : 'Lump Sum'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.amountType === 'LUMPSUM'
                          ? c.lumpSumMode === 'EQUIPMENT_SPECIFIC'
                            ? '20 ft / 40 ft Specific Rates'
                            : 'Single Corridor Amount'
                          : `${c.currency} Tiered`}
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="text-slate-700 font-mono">
                        {c.validFrom} &rarr; {c.validTo}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Negotiated: {c.negotiatedOn}
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-900 font-mono">{c.routes.length}</span>
                      <span className="text-slate-500 text-[10px] ml-1">Corridors</span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          c.contractStatus === 'GENERATED' || c.contractStatus === 'EXPORTED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : c.contractStatus === 'VALIDATED'
                            ? 'bg-blue-100 text-blue-700'
                            : c.contractStatus === 'VALIDATION_FAILED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.contractStatus}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpen(c.id, c.direction)}
                          className="p-1.5 rounded hover:bg-slate-100 text-blue-600"
                          title="Edit Contract"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateContract(c.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                          title="Duplicate Contract"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteContract(c.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                          title="Archive / Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
