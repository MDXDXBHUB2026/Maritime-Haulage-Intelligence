/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import {
  HaulageMainRecord,
  TrustMainRecord,
  WeightSlabRecord,
  HaulageDirection,
} from '../types';

export const HAULAGE_IMPORT_HEADERS = [
  'Pick Up Location',
  'Pick Up Type',
  'Pick Up Zip/Depot/Terminal',
  'Pick Up Term',
  'Drop Location',
  'Drop Type',
  'Drop Zip/Depot/Terminal',
  'Drop Term',
  'Equipment',
  'Transit Time',
  'No. of Eqp. Units',
  'H-Mode',
  'LDN/MTY',
  'Currency',
  'AmountType',
  'Amount',
  'Port To Pay', // Col 17 in Import
  'Payable At', // Col 18 in Import
  'Negotiated On',
  'Negotiated By',
  'Return Location',
  'Return Type',
  'Return Zip/Depot/Terminal',
  'Valid From',
  'Valid To',
  'Pick Up Country Code',
  'via Hub Location Code',
  'Drop Country Code',
  'Trip Type',
  'Vendor Code',
  'Remarks',
  'Insurance No',
  'Insurance From Date',
  'Insurance To Date',
  'Height Restriction (mm)',
  'Weight Restriction (ton)',
  'Width Restriction (mm)',
  'ID',
  'Pick Up State',
  'Pick Up City',
  'Drop State',
  'Drop City',
  'Default Vendor',
  'Update Flag',
];

export const HAULAGE_EXPORT_HEADERS = [
  'Pick Up Location',
  'Pick Up Type',
  'Pick Up Zip/Depot/Terminal',
  'Pick Up Term',
  'Drop Location',
  'Drop Type',
  'Drop Zip/Depot/Terminal',
  'Drop Term',
  'Equipment',
  'Transit Time',
  'No. of Eqp. Units',
  'H-Mode',
  'LDN/MTY',
  'Currency',
  'AmountType',
  'Amount',
  'Payable At', // Col 17 in Export Standard
  'Port To Pay', // Col 18 in Export Standard
  'Negotiated On',
  'Negotiated By',
  'Return Location',
  'Return Type',
  'Return Zip/Depot/Terminal',
  'Valid From',
  'Valid To',
  'Pick Up Country Code',
  'via Hub Location Code',
  'Drop Country Code',
  'Trip Type',
  'Vendor Code',
  'Remarks',
  'Insurance No',
  'Insurance From Date',
  'Insurance To Date',
  'Height Restriction (mm)',
  'Weight Restriction (ton)',
  'Width Restriction (mm)',
  'ID',
  'Pick Up State',
  'Pick Up City',
  'Drop State',
  'Drop City',
  'Default Vendor',
  'Update Flag',
];

// Compatibility aliases
export const TRUST_IMPORT_HEADERS = HAULAGE_IMPORT_HEADERS;
export const TRUST_EXPORT_LEGACY_HEADERS = HAULAGE_EXPORT_HEADERS;
export const WEIGHT_SLAB_HEADERS = ['Size', 'From', 'To', 'Amount', 'Id'];

/**
 * Convert HaulageMainRecord into canonical array matching direction
 */
export function recordToRowArray(
  record: HaulageMainRecord,
  direction: HaulageDirection,
  standardMode = true
): (string | number)[] {
  const isExportStandard = direction === 'EXPORT' && standardMode;

  const col17 = isExportStandard ? record.payableAt : record.portToPay;
  const col18 = isExportStandard ? record.portToPay : record.payableAt;

  return [
    record.pickupLocation,
    record.pickupType,
    record.pickupZipDepotTerminal,
    record.pickupTerm,
    record.dropLocation,
    record.dropType,
    record.dropZipDepotTerminal,
    record.dropTerm,
    record.equipment,
    record.transitTime,
    record.noOfEqpUnits,
    record.hMode,
    record.ldnMty,
    record.currency,
    record.amountType,
    record.amount,
    col17,
    col18,
    record.negotiatedOn,
    record.negotiatedBy,
    record.returnLocation,
    record.returnType,
    record.returnZipDepotTerminal,
    record.validFrom,
    record.validTo,
    record.pickupCountryCode,
    record.viaHubLocationCode,
    record.dropCountryCode,
    record.tripType,
    record.vendorCode,
    record.remarks,
    record.insuranceNo,
    record.insuranceFromDate,
    record.insuranceToDate,
    record.heightRestrictionMm,
    record.weightRestrictionTon,
    record.widthRestrictionMm,
    record.id,
    record.pickupState,
    record.pickupCity,
    record.dropState,
    record.dropCity,
    record.defaultVendor,
    record.updateFlag,
  ];
}

/**
 * Generate CSV string for Haulage records
 */
export function serializeHaulageRecordsToCsv(
  records: HaulageMainRecord[],
  direction: HaulageDirection,
  standardMode = true
): string {
  const headers =
    direction === 'EXPORT' && standardMode
      ? HAULAGE_EXPORT_HEADERS
      : HAULAGE_IMPORT_HEADERS;

  const rows = records.map((r) => recordToRowArray(r, direction, standardMode));

  const csvRows = [headers.join(',')];
  rows.forEach((row) => {
    const escapedRow = row.map((val) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    });
    csvRows.push(escapedRow.join(','));
  });

  return csvRows.join('\n');
}

export const serializeTrustRecordsToCsv = serializeHaulageRecordsToCsv;

/**
 * Generate CSV string for Weight Slab records
 */
export function serializeWeightSlabsToCsv(
  slabs: WeightSlabRecord[]
): string {
  const csvRows = [WEIGHT_SLAB_HEADERS.join(',')];
  slabs.forEach((s) => {
    csvRows.push([s.size, s.from, s.to, s.amount, s.id].join(','));
  });
  return csvRows.join('\n');
}

/**
 * Generate Enterprise XLSX Workbook for Haulage Records & Weight Slabs
 */
export function generateHaulageExcelWorkbook(params: {
  records: HaulageMainRecord[];
  weightSlabs: WeightSlabRecord[];
  direction: HaulageDirection;
  contractNumber: string;
  revision: number;
  standardMode?: boolean;
  legacyMode?: boolean;
}): Uint8Array {
  const {
    records,
    weightSlabs,
    direction,
    contractNumber,
    revision,
    standardMode = params.legacyMode ?? true,
  } = params;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Main Haulage Records
  const headers =
    direction === 'EXPORT' && standardMode
      ? HAULAGE_EXPORT_HEADERS
      : HAULAGE_IMPORT_HEADERS;

  const rowsData = [
    headers,
    ...records.map((r) => recordToRowArray(r, direction, standardMode)),
  ];
  const wsMain = XLSX.utils.aoa_to_sheet(rowsData);

  const mainSheetName =
    direction === 'IMPORT' ? 'HAULAGE_IMPORT' : 'HAULAGE_EXPORT';
  XLSX.utils.book_append_sheet(wb, wsMain, mainSheetName);

  // Sheet 2: Weight Slab Records (if any)
  if (weightSlabs && weightSlabs.length > 0) {
    const slabRows = [
      WEIGHT_SLAB_HEADERS,
      ...weightSlabs.map((s) => [s.size, s.from, s.to, s.amount, s.id]),
    ];
    const wsSlabs = XLSX.utils.aoa_to_sheet(slabRows);
    const slabSheetName =
      direction === 'IMPORT' ? 'Wt. Slab Data IMP' : 'Wt. Slab Data EXP';
    XLSX.utils.book_append_sheet(wb, wsSlabs, slabSheetName);
  }

  const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(wbOut);
}

export const generateTrustExcelWorkbook = generateHaulageExcelWorkbook;

/**
 * Trigger browser file download
 */
export function downloadFile(
  content: Uint8Array | string,
  filename: string,
  mimeType: string
) {
  const blob =
    typeof content === 'string'
      ? new Blob([content], { type: mimeType })
      : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
