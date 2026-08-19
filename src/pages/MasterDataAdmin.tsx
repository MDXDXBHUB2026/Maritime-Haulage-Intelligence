/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Anchor,
  Layers,
  Plus,
  Check,
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
      user: 'User Action',
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
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Enterprise Master Data Governance</span>
          </h1>
          <p className="text-xs text-slate-500">
            Maintain strict deterministic lookup entities for vendors, UN/LOCODEs, facilities, and port equipment mappings
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'vendors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Vendors ({vendors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'locations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Locations & UN/LOCODEs ({locations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facilities')}
          className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'facilities'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Terminals & Facilities ({facilities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mappings')}
          className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'mappings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
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
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Approved Haulage Vendors
            </h2>
            <button
              type="button"
              onClick={() => setShowAddVendor(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vendor Master</span>
            </button>
          </div>

          {showAddVendor && (
            <div className="p-4 rounded-lg bg-white border border-blue-200 shadow-xs flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Vendor Code (e.g. DEMO006)"
                value={newVendorCode}
                onChange={(e) => setNewVendorCode(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-1.5 rounded-md font-mono focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Vendor Company Name"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-1.5 rounded-md flex-1 min-w-[200px] focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Country (DE, NL, etc.)"
                value={newVendorCountry}
                onChange={(e) => setNewVendorCountry(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-1.5 rounded-md w-24 font-mono focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddVendor}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddVendor(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Vendor Code</th>
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-6 py-3.5">Country</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-bold text-slate-900">{v.vendorCode}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{v.vendorName}</td>
                    <td className="px-6 py-3 font-mono text-slate-500">EU</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          v.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {v.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleVendor(v.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
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
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">UN/LOCODE</th>
                  <th className="px-6 py-3.5">Location Name</th>
                  <th className="px-6 py-3.5">Country</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-bold text-blue-600">{loc.locationCode}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">{loc.locationName}</td>
                    <td className="px-6 py-3 font-mono text-slate-500">{loc.countryCode}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          loc.locationType === 'Port'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {loc.locationType}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-emerald-700 font-bold">Active</span>
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
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Facility Code</th>
                  <th className="px-6 py-3.5">Facility Name</th>
                  <th className="px-6 py-3.5">Port Code</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-bold text-amber-700">{fac.facilityCode}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">{fac.facilityName}</td>
                    <td className="px-6 py-3 font-mono text-blue-600 font-bold">{fac.portCode}</td>
                    <td className="px-6 py-3">{fac.facilityType}</td>
                    <td className="px-6 py-3">
                      <span className="text-emerald-700 font-bold">Active</span>
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
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Port</th>
                  <th className="px-6 py-3.5">Facility Code</th>
                  <th className="px-6 py-3.5">Equipment</th>
                  <th className="px-6 py-3.5">Import Enabled</th>
                  <th className="px-6 py-3.5">Export Enabled</th>
                  <th className="px-6 py-3.5">Legacy Output Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {mappings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-bold text-slate-900">{m.portCode}</td>
                    <td className="px-6 py-3 text-blue-600 font-bold">{m.terminalCode}</td>
                    <td className="px-6 py-3 text-amber-700 font-bold">{m.equipmentSize}</td>
                    <td className="px-6 py-3">
                      <span className={m.importEnabled ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                        {String(m.importEnabled).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={m.exportEnabled ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                        {String(m.exportEnabled).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{m.exportOutputCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
