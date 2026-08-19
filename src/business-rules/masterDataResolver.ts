/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vendor, LocationMaster, TerminalFacility, PortEquipmentMapping } from '../types';

export interface MasterDataContext {
  vendors: Vendor[];
  locations: LocationMaster[];
  facilities: TerminalFacility[];
  mappings: PortEquipmentMapping[];
}

/**
 * Exact Vendor Lookup (never uses approximate matching like legacy Excel VLOOKUP)
 */
export function resolveVendorByCode(
  vendorCode: string,
  vendors: Vendor[]
): Vendor | undefined {
  if (!vendorCode) return undefined;
  const cleanCode = vendorCode.trim().toUpperCase();
  return vendors.find(
    (v) => v.vendorCode.toUpperCase() === cleanCode && v.active
  );
}

/**
 * Exact Location Lookup
 */
export function resolveLocationByCode(
  locationCode: string,
  locations: LocationMaster[]
): LocationMaster | undefined {
  if (!locationCode) return undefined;
  const cleanCode = locationCode.trim().toUpperCase();
  return locations.find(
    (l) => l.locationCode.toUpperCase() === cleanCode && l.active
  );
}

/**
 * Exact Location Lookup by Name
 */
export function resolveLocationByName(
  locationName: string,
  locations: LocationMaster[]
): LocationMaster | undefined {
  if (!locationName) return undefined;
  const cleanName = locationName.trim().toLowerCase();
  return locations.find(
    (l) => l.locationName.toLowerCase() === cleanName && l.active
  );
}

/**
 * Exact Facility Lookup
 */
export function resolveFacilityByCode(
  facilityCode: string,
  facilities: TerminalFacility[]
): TerminalFacility | undefined {
  if (!facilityCode) return undefined;
  const cleanCode = facilityCode.trim().toUpperCase();
  return facilities.find(
    (f) => f.facilityCode.toUpperCase() === cleanCode && f.active
  );
}

/**
 * Get active Port Equipment Mappings for a Port
 */
export function getActivePortEquipmentMappings(
  portCode: string,
  direction: 'IMPORT' | 'EXPORT',
  mappings: PortEquipmentMapping[]
): PortEquipmentMapping[] {
  if (!portCode) return [];
  const cleanPort = portCode.trim().toUpperCase();

  return mappings.filter((m) => {
    if (!m.active || m.portCode.toUpperCase() !== cleanPort) return false;
    return direction === 'IMPORT' ? m.importEnabled : m.exportEnabled;
  });
}
