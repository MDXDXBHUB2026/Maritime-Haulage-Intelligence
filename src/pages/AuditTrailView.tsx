/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  User,
  History,
  ShieldCheck,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#0F172A] text-[#FEF3C7] rounded-xl border border-[#F59E0B]/40 shadow-xs">
              <History className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                  Enterprise Audit & Governance Trail
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-[#0284C7] font-mono font-bold border border-blue-200">
                  {auditLogs.length} Events Logged
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Immutable tracking of contract modifications, validation runs, generation executions, and master data changes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
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
            placeholder="Search audit summary, user, contract ID..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-hidden focus:border-[#0284C7] font-medium"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as any)}
          className="bg-slate-50 text-[#0F172A] text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-[#0284C7] cursor-pointer"
        >
          <option value="ALL">All Audit Actions</option>
          <option value="CONTRACT_CREATE">Contract Created</option>
          <option value="CONTRACT_UPDATE">Contract Updated</option>
          <option value="CONTRACT_VALIDATE">Validation Executed</option>
          <option value="RECORDS_GENERATE">Haulage Records Generated</option>
          <option value="DATA_EXPORT">Data Export</option>
          <option value="MASTER_DATA_CHANGE">Master Data Changed</option>
        </select>
      </motion.div>

      {/* Audit Log Timeline Table */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-enterprise"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[#64748B] uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User / Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity & ID</th>
                <th className="px-6 py-4">Operational Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0F172A] font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#64748B] font-sans font-medium">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-[#64748B] whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleDateString()}{' '}
                      <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4 font-sans font-semibold text-[#0F172A]">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-[#0284C7] flex items-center justify-center font-bold text-[10px]">
                          {log.user.slice(0, 1).toUpperCase()}
                        </div>
                        <span>{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          log.action === 'RECORDS_GENERATE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : log.action === 'CONTRACT_VALIDATE'
                            ? 'bg-blue-50 text-[#0284C7] border border-blue-200'
                            : log.action === 'MASTER_DATA_CHANGE'
                            ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0F172A] font-sans">
                      {log.entity}: <span className="text-[#0284C7] font-mono">{log.entityId}</span>
                    </td>
                    <td className="px-6 py-4 font-sans text-[#64748B] leading-relaxed max-w-md">
                      {log.summary}
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
