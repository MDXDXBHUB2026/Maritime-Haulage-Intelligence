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
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Info,
  Truck,
  Compass,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-[#E1E7EC] shadow-enterprise-sm p-5 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E1E7EC]">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider bg-[#17212B] text-[#FFF4DB] border border-[#F5A623]/30">
            HEADER CONFIGURATION
          </span>
          <span className="text-xs text-[#5C6B78] font-mono font-bold">
            {header.contractNumber} · Rev {header.revision}
          </span>
        </div>
        <span className="text-[11px] text-[#5C6B78] flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-[#176B9B]" />
          Propagates automatically to corridor matrix
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* GROUP 1: MOVEMENT CONFIGURATION */}
        <div className="bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E1E7EC] space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#18212B] pb-1 border-b border-[#E1E7EC]">
            <Truck className="w-3.5 h-3.5 text-[#176B9B]" />
            <span>Movement Configuration</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                {isImport ? 'Pick Up Gateway' : 'Return Gateway (Port)'} <span className="text-rose-500">*</span>
              </label>
              <div className="flex space-x-1.5">
                <select
                  value={isImport ? header.pickupLocationName : header.returnLocationName}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="flex-1 bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs font-semibold text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.locationName}>
                      {loc.locationName} ({loc.locationCode})
                    </option>
                  ))}
                </select>
                <div className="w-16 bg-white border border-[#E1E7EC] rounded-lg px-1.5 py-1 text-center font-mono font-bold text-xs text-[#176B9B] flex items-center justify-center">
                  {isImport ? header.pickupLocationCode : header.returnLocationCode}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Haulage Mode</label>
                <select
                  value={header.haulageMode}
                  onChange={(e) => onChange({ haulageMode: e.target.value as HaulageMode })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs font-medium text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                >
                  {HAULAGE_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trip Type</label>
                <select
                  value={header.tripType}
                  onChange={(e) => onChange({ tripType: e.target.value as TripType })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs font-medium text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                >
                  {TRIP_TYPES.map((tt) => (
                    <option key={tt} value={tt}>{tt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pick Up Term</label>
                <select
                  value={header.pickupTerm}
                  onChange={(e) => onChange({ pickupTerm: e.target.value as PickupDropTerm })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                >
                  {TERMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Drop Term</label>
                <select
                  value={header.dropTerm}
                  onChange={(e) => onChange({ dropTerm: e.target.value as PickupDropTerm })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                >
                  {TERMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 2: COMMERCIAL TERMS & PRICING */}
        <div className="bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E1E7EC] space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#18212B] pb-1 border-b border-[#E1E7EC]">
            <DollarSign className="w-3.5 h-3.5 text-[#168C8C]" />
            <span>Commercial Terms & Pricing</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount Type</label>
                <select
                  value={header.amountType === 'WEIGHT_SLAB' ? 'Wt.Slab' : 'Lumpsum'}
                  onChange={(e) => {
                    const val = e.target.value === 'Wt.Slab' ? 'WEIGHT_SLAB' : 'LUMPSUM';
                    onAmountTypeChange(val);
                  }}
                  className="w-full bg-white border-2 border-[#176B9B] rounded-lg px-2 py-1 text-xs font-bold text-[#176B9B] focus:outline-hidden shadow-xs"
                >
                  <option value="Wt.Slab">Wt.Slab (Weight Slab)</option>
                  <option value="Lumpsum">Lumpsum (Flat Rate)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Currency</label>
                <select
                  value={header.currency}
                  onChange={(e) => onChange({ currency: e.target.value })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Laden / Empty</label>
                <select
                  value={header.ladenStatus}
                  onChange={(e) => onChange({ ladenStatus: e.target.value as LadenStatus })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                >
                  <option value="Laden">Laden</option>
                  <option value="Empty">Empty</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payable At</label>
                <select
                  value={header.payableAt}
                  onChange={(e) => onChange({ payableAt: e.target.value as PayableAt })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs font-semibold text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                >
                  <option value="POD">POD</option>
                  <option value="POL">POL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Negotiated On</label>
                <input
                  type="date"
                  value={header.negotiatedOn}
                  onChange={(e) => onChange({ negotiatedOn: e.target.value })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Negotiated By</label>
                <input
                  type="text"
                  value={header.negotiatedBy || ''}
                  onChange={(e) => onChange({ negotiatedBy: e.target.value })}
                  placeholder="Officer name"
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* GROUP 3: CONTRACT GOVERNANCE & VENDOR */}
        <div className="bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E1E7EC] space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#18212B] pb-1 border-b border-[#E1E7EC]">
            <Building2 className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Contract Governance & Vendor</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Carrier Vendor</label>
              <select
                value={header.vendorCode}
                onChange={(e) => handleVendorChange(e.target.value)}
                className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.vendorCode}>
                    {v.vendorCode} — {v.vendorName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valid From</label>
                <input
                  type="date"
                  value={header.validFrom}
                  onChange={(e) => onChange({ validFrom: e.target.value })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valid To</label>
                <input
                  type="date"
                  value={header.validTo}
                  onChange={(e) => onChange({ validTo: e.target.value })}
                  className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs text-[#18212B] focus:border-[#176B9B] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contract Remarks</label>
              <textarea
                value={header.remarks || ''}
                onChange={(e) => onChange({ remarks: e.target.value })}
                rows={2}
                placeholder="Reference notes, demurrage instructions..."
                className="w-full bg-white border border-[#E1E7EC] rounded-lg px-2 py-1 text-xs text-[#18212B] focus:border-[#176B9B] focus:outline-hidden resize-none h-[42px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
