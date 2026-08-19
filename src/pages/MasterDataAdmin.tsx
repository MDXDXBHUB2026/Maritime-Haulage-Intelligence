/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  MapPin,
  Anchor,
  Layers,
  Plus,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vendor } from '../types';

interface MasterDataAdminProps {
  initialTab?: 'vendors' | 'locations' | 'facilities' | 'mappings';
}

export const MasterDataAdmin: React.FC<MasterDataAdminProps> = ({ initialTab = 'vendors' }) => {
  const {
    vendors,
    setVendors,
    locations,
    facilities,
    mappings,
    addAuditLog,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'vendors' | 'locations' | 'facilities' | 'mappings'>(initialTab);

  // Add Vendor Modal / Inline
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorCode, setNewVendorCode] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCountry, setNewVendorCountry] = useState('DE');

  const handleAddVendor = () => {
    if (!newVendorCode || !newVendorName) return;
    const v: Vendor = {
      id: `ven-${Date.now()}`,
      vendorCode: newVendorCode.toUpperCase().trim(),
      vendorName: newVendorName.trim(),
      active: true,
      effectiveFrom: '2026-01-01',
      effectiveTo: '2099-12-31',
    };
    setVendors((prev) => [...prev, v]);
    addAuditLog({
      user: 'Operations Lead',
      action: 'MASTER_DATA_CHANGE',
      entity: 'Vendor',
      entityId: v.vendorCode,
      summary: `Added vendor master entry ${v.vendorCode} (${v.vendorName}).`,
    });
    setNewVendorCode('');
    setNewVendorName('');
    setShowAddVendor(false);
  };

  const handleToggleVendor = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#0F172A]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#0F172A] text-[#FEF3C7] rounded-xl border border-[#F59E0B]/40 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Enterprise Master Data Governance
              </h1>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Deterministic lookup entities for approved carriers, UN/LOCODEs, maritime terminals, and equipment specs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'vendors'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Vendors & Carriers ({vendors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'locations'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Locations & UN/LOCODEs ({locations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facilities')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'facilities'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Terminals & Facilities ({facilities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mappings')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'mappings'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Port Equipment Mappings ({mappings.length})</span>
        </button>
      </div>

      {/* Tab Content: Vendors */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-mono">
              Approved Haulage Carriers & Vendors
            </h2>
            <button
              type="button"
              onClick={() => setShowAddVendor(true)}
              className="px-3.5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vendor Master</span>
            </button>
          </div>

          <AnimatePresence>
            {showAddVendor && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-white border border-sky-200 shadow-enterprise flex flex-wrap gap-3 items-center"
              >
                <input
                  type="text"
                  placeholder="Vendor Code (e.g. DEMO006)"
                  value={newVendorCode}
                  onChange={(e) => setNewVendorCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[#0F172A] text-xs px-3.5 py-2 rounded-xl font-mono font-bold focus:outline-hidden focus:border-[#0284C7]"
                />
                <input
                  type="text"
                  placeholder="Vendor Company Name"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[#0F172A] text-xs px-3.5 py-2 rounded-xl flex-1 min-w-[200px] font-medium focus:outline-hidden focus:border-[#0284C7]"
                />
                <input
                  type="text"
                  placeholder="Country (DE, NL, etc.)"
                  value={newVendorCountry}
                  onChange={(e) => setNewVendorCountry(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[#0F172A] text-xs px-3.5 py-2 rounded-xl w-28 font-mono font-bold focus:outline-hidden focus:border-[#0284C7]"
                />
                <button
                  type="button"
                  onClick={handleAddVendor}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddVendor(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-enterprise">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[#64748B] uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Vendor Code</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-[#0F172A]">{v.vendorCode}</td>
                    <td className="px-6 py-3.5 font-semibold text-[#0F172A]">{v.vendorName}</td>
                    <td className="px-6 py-3.5 font-mono text-[#64748B]">EU Central</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.active
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {v.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleVendor(v.id)}
                        className="text-xs text-[#0284C7] hover:underline font-bold cursor-pointer"
                      >
                        {v.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Locations */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-enterprise">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[#64748B] uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">UN/LOCODE</th>
                  <th className="px-6 py-4">Location Name</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-[#0284C7]">{loc.locationCode}</td>
                    <td className="px-6 py-3.5 font-bold text-[#0F172A]">{loc.locationName}</td>
                    <td className="px-6 py-3.5 font-mono text-[#64748B]">{loc.countryCode}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          loc.locationType === 'Port'
                            ? 'bg-blue-50 text-[#0284C7] border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {loc.locationType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Facilities */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-enterprise">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[#64748B] uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Facility Code</th>
                  <th className="px-6 py-4">Facility Name</th>
                  <th className="px-6 py-4">Port Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-[#F59E0B]">{fac.facilityCode}</td>
                    <td className="px-6 py-3.5 font-bold text-[#0F172A]">{fac.facilityName}</td>
                    <td className="px-6 py-3.5 font-mono text-[#0284C7] font-bold">{fac.portCode}</td>
                    <td className="px-6 py-3.5 text-[#64748B] font-medium">{fac.facilityType}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Mappings */}
      {activeTab === 'mappings' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-enterprise">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-[#64748B] uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Port</th>
                  <th className="px-6 py-4">Facility Code</th>
                  <th className="px-6 py-4">Equipment</th>
                  <th className="px-6 py-4">Import Enabled</th>
                  <th className="px-6 py-4">Export Enabled</th>
                  <th className="px-6 py-4">Standard Output Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0F172A] font-mono">
                {mappings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-[#0F172A]">{m.portCode}</td>
                    <td className="px-6 py-3.5 text-[#0284C7] font-bold">{m.terminalCode}</td>
                    <td className="px-6 py-3.5 text-[#F59E0B] font-bold">{m.equipmentSize}</td>
                    <td className="px-6 py-3.5">
                      <span className={m.importEnabled ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                        {String(m.importEnabled).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={m.exportEnabled ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {String(m.exportEnabled).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#64748B]">{m.exportOutputCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};
