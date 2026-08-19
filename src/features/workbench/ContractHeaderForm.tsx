/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ContractHeader,
  Vendor,
  LocationMaster,
  PickupDropReturnType,
  HaulageMode,
  TripType,
  LadenStatus,
  PayableAt,
  PickupDropTerm,
  AmountType,
} from '../../types';
import { Building2, MapPin, Calendar, DollarSign, FileText, Info } from 'lucide-react';

interface ContractHeaderFormProps {
  header: ContractHeader;
  direction: 'IMPORT' | 'EXPORT';
  vendors: Vendor[];
  locations: LocationMaster[];
  onChange: (updatedHeader: Partial<ContractHeader>) => void;
  onAmountTypeChange: (newAmountType: AmountType) => void;
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

const HAULAGE_MODES: HaulageMode[] = ['Combined', 'Road', 'Rail', 'Barge'];
const TRIP_TYPES: TripType[] = ['Live Load', 'Drop', 'Pick Up', 'Drop and Pick Up'];
const CURRENCIES = ['EUR', 'USD', 'GBP', 'AED', 'CZK'];

export const ContractHeaderForm: React.FC<ContractHeaderFormProps> = ({
  header,
  direction,
  vendors,
  locations,
  onChange,
  onAmountTypeChange,
}) => {
  const isImport = direction === 'IMPORT';

  const handleLocationChange = (locName: string) => {
    const loc = locations.find((l) => l.locationName.toLowerCase() === locName.toLowerCase());
    const locCode = loc ? loc.locationCode : locName.substring(0, 5).toUpperCase();
    if (isImport) {
      onChange({
        pickupLocationName: locName,
        pickupLocationCode: locCode,
        returnLocationName: locName,
        returnLocationCode: locCode,
        portToPay: locCode,
      });
    } else {
      onChange({
        returnLocationName: locName,
        returnLocationCode: locCode,
        portToPay: locCode,
      });
    }
  };

  const handleVendorChange = (vCode: string) => {
    const v = vendors.find((vend) => vend.vendorCode === vCode);
    onChange({
      vendorCode: vCode,
      vendorName: v ? v.vendorName : '',
      vendorId: v ? v.id : '',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#0B1F33] text-white">
            HEADER CONFIGURATION
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {header.contractNumber} (Rev {header.revision})
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          Auto-propagates to all route lines
        </span>
      </div>

      <div className="grid grid-cols-12 gap-x-3 gap-y-2.5 text-xs">
        {/* ROW 1 */}
        <div className="col-span-4">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {isImport ? 'Pick Up Location' : 'Return Location (Port)'} <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-1.5">
            <select
              value={isImport ? header.pickupLocationName : header.returnLocationName}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.locationName}>
                  {loc.locationName} ({loc.locationCode})
                </option>
              ))}
            </select>
            <div className="w-16 bg-slate-100 border border-slate-200 rounded px-1.5 py-1 text-center font-mono font-bold text-xs text-blue-700 select-all">
              {isImport ? header.pickupLocationCode : header.returnLocationCode}
            </div>
          </div>
        </div>

        <div className="col-span-5 row-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Contract Remarks / Invoicing Notes
          </label>
          <textarea
            value={header.remarks || ''}
            onChange={(e) => onChange({ remarks: e.target.value })}
            rows={3}
            placeholder="Contract reference notes, demurrage instructions, special conditions..."
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden resize-none h-[72px]"
          />
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Haulage Mode <span className="text-red-500">*</span>
          </label>
          <select
            value={header.haulageMode}
            onChange={(e) => onChange({ haulageMode: e.target.value as HaulageMode })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            {HAULAGE_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* ROW 2 */}
        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Pick Up Term
          </label>
          <select
            value={header.pickupTerm}
            onChange={(e) => onChange({ pickupTerm: e.target.value as PickupDropTerm })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Pick Up Type
          </label>
          <select
            value={header.pickupType}
            onChange={(e) => onChange({ pickupType: e.target.value as PickupDropReturnType })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            {PICKUP_DROP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Drop Term
          </label>
          <select
            value={header.dropTerm}
            onChange={(e) => onChange({ dropTerm: e.target.value as PickupDropTerm })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* ROW 3 */}
        <div className="col-span-4">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Trip Type
          </label>
          <select
            value={header.tripType}
            onChange={(e) => onChange({ tripType: e.target.value as TripType })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            {TRIP_TYPES.map((tt) => (
              <option key={tt} value={tt}>
                {tt}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Currency
          </label>
          <select
            value={header.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Laden / Empty
          </label>
          <select
            value={header.ladenStatus}
            onChange={(e) => onChange({ ladenStatus: e.target.value as LadenStatus })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            <option value="Laden">Laden</option>
            <option value="Empty">Empty</option>
          </select>
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Drop Type
          </label>
          <select
            value={header.dropType}
            onChange={(e) => onChange({ dropType: e.target.value as PickupDropReturnType })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            {PICKUP_DROP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* ROW 4 */}
        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Negotiated On
          </label>
          <input
            type="date"
            value={header.negotiatedOn}
            onChange={(e) => onChange({ negotiatedOn: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Valid From
          </label>
          <input
            type="date"
            value={header.validFrom}
            onChange={(e) => onChange({ validFrom: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Valid To
          </label>
          <input
            type="date"
            value={header.validTo}
            onChange={(e) => onChange({ validTo: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-blue-900 mb-1 flex items-center justify-between">
            <span>Amount Type</span>
            <span className="text-[10px] font-mono text-blue-600 font-normal">CRITICAL</span>
          </label>
          <select
            value={header.amountType === 'WEIGHT_SLAB' ? 'Wt.Slab' : 'Lumpsum'}
            onChange={(e) => {
              const val = e.target.value === 'Wt.Slab' ? 'WEIGHT_SLAB' : 'LUMPSUM';
              onAmountTypeChange(val);
            }}
            className="w-full bg-blue-50 border-2 border-blue-400 rounded px-2 py-1 text-xs font-bold text-blue-900 focus:bg-white focus:border-blue-600 focus:outline-hidden shadow-2xs"
          >
            <option value="Wt.Slab">Wt.Slab (Weight Slab)</option>
            <option value="Lumpsum">Lumpsum (Flat Rate)</option>
          </select>
        </div>

        {/* ROW 5 */}
        <div className="col-span-4">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Negotiated By (Free Text)
          </label>
          <input
            type="text"
            value={header.negotiatedBy || ''}
            onChange={(e) => onChange({ negotiatedBy: e.target.value })}
            placeholder="Analyst / Commercial Officer"
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Payable At
          </label>
          <select
            value={header.payableAt}
            onChange={(e) => onChange({ payableAt: e.target.value as PayableAt })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            <option value="POD">POD</option>
            <option value="POL">POL</option>
          </select>
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Return Type
          </label>
          <select
            value={header.returnType}
            onChange={(e) => onChange({ returnType: e.target.value as PickupDropReturnType })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            {PICKUP_DROP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-3">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Port To Pay
          </label>
          <input
            type="text"
            value={header.portToPay || ''}
            onChange={(e) => onChange({ portToPay: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* ROW 6 & 7: VENDOR SECTION */}
        <div className="col-span-4">
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Vendor Code</span>
            <span className="text-[10px] text-amber-600 font-medium">Demo Fictional</span>
          </label>
          <select
            value={header.vendorCode}
            onChange={(e) => handleVendorChange(e.target.value)}
            className="w-full bg-amber-50/50 border border-amber-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.vendorCode}>
                {v.vendorCode} — {v.vendorName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-8">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Resolved Vendor Name (Read-Only)
          </label>
          <div className="bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-700 truncate">
            {header.vendorName || 'Auto-resolved from Vendor Master'}
          </div>
        </div>
      </div>
    </div>
  );
};
