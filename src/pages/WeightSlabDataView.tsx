/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  Download,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { serializeWeightSlabsToCsv, downloadFile } from '../business-rules/legacyTrustSerializer';

export const WeightSlabDataView: React.FC = () => {
  const { allWeightSlabs, allTrustRecords, setInspectedRecord } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');

  const filteredSlabs = useMemo(() => {
    return allWeightSlabs.filter((s) => {
      const matchSearch =
        String(s.id).includes(searchTerm) ||
        String(s.from).includes(searchTerm) ||
        String(s.to).includes(searchTerm) ||
        String(s.amount).includes(searchTerm);

      const matchSize = sizeFilter === 'ALL' || s.size === sizeFilter;

      return matchSearch && matchSize;
    });
  }, [allWeightSlabs, searchTerm, sizeFilter]);

  const handleExportCsv = () => {
    const csv = serializeWeightSlabsToCsv(allWeightSlabs);
    downloadFile(csv, 'WEIGHT_SLAB_DATA_CANONICAL.csv', 'text/csv');
  };

  const handleInspectParent = (parentId: number) => {
    const parentRecord = allTrustRecords.find((r) => r.id === parentId);
    if (parentRecord) {
      setInspectedRecord(parentRecord);
    }
  };

  const count20 = allWeightSlabs.filter((s) => s.size === '20s').length;
  const count40 = allWeightSlabs.filter((s) => s.size === '40s').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Weight Slab Enterprise Data</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">
              {allWeightSlabs.length} Active Bands
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            5-Column canonical haulage weight tiering format with deterministic parent record ID linkage
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Weight Slabs (CSV)</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">20 ft Container Bands</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{count20} Records</div>
          </div>
          <Scale className="w-6 h-6 text-amber-500/40" />
        </div>

        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">40 ft Container Bands</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{count40} Records</div>
          </div>
          <Scale className="w-6 h-6 text-blue-500/40" />
        </div>

        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Zero-Rate Filtering</div>
            <div className="text-xs font-bold text-emerald-700 flex items-center space-x-1 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero amounts omitted per rule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search parent Record ID, weight, amount..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Equipment Size:</span>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-hidden"
          >
            <option value="ALL">All Sizes (20s & 40s)</option>
            <option value="20s">20s Only</option>
            <option value="40s">40s Only</option>
          </select>
        </div>
      </div>

      {/* 5-Column Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-mono">Size</th>
                <th className="px-6 py-3.5 font-mono">From (Ton)</th>
                <th className="px-6 py-3.5 font-mono">To (Ton)</th>
                <th className="px-6 py-3.5 font-mono">Amount (EUR)</th>
                <th className="px-6 py-3.5 font-mono">Id (Parent Record ID)</th>
                <th className="px-6 py-3.5 text-right">Lineage Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredSlabs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-sans">
                    No weight slab records found.
                  </td>
                </tr>
              ) : (
                filteredSlabs.map((slab, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          slab.size === '20s'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {slab.size}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900">
                      {slab.from.toFixed(1)} t
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900">
                      {slab.to.toFixed(1)} t
                    </td>
                    <td className="px-6 py-3 font-bold text-emerald-700">
                      EUR {slab.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        type="button"
                        onClick={() => handleInspectParent(slab.id)}
                        className="text-amber-700 hover:text-amber-800 font-bold underline decoration-dotted underline-offset-2"
                        title="Click to inspect parent generated record"
                      >
                        #{slab.id}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleInspectParent(slab.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium inline-flex items-center space-x-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Inspect Parent</span>
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
