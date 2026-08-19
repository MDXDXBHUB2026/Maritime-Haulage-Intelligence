/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditAction } from '../types';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | AuditAction>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchSearch && matchAction;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Enterprise Audit & Governance Trail</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold">
              {auditLogs.length} Events
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable tracking of all contract modifications, validation runs, haulage generation executions, and master data changes
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit summary, user, contract ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as any)}
          className="bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-hidden"
        >
          <option value="ALL">All Audit Actions</option>
          <option value="CONTRACT_CREATE">Contract Created</option>
          <option value="CONTRACT_UPDATE">Contract Updated</option>
          <option value="CONTRACT_VALIDATE">Validation Executed</option>
          <option value="RECORDS_GENERATE">Haulage Records Generated</option>
          <option value="DATA_EXPORT">Data Export</option>
          <option value="MASTER_DATA_CHANGE">Master Data Changed</option>
        </select>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">User / Actor</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Entity & ID</th>
                <th className="px-6 py-3.5">Operational Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-sans">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleDateString()}{' '}
                      <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-3 font-sans font-medium text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'RECORDS_GENERATE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'CONTRACT_VALIDATE'
                            ? 'bg-blue-100 text-blue-800'
                            : log.action === 'MASTER_DATA_CHANGE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900 font-sans">
                      {log.entity}: <span className="text-blue-600 font-mono">{log.entityId}</span>
                    </td>
                    <td className="px-6 py-3 font-sans text-slate-600 leading-relaxed max-w-md">
                      {log.summary}
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
