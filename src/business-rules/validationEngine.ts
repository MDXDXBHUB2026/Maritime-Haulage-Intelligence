/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ContractFull,
  ValidationResult,
  ValidationIssue,
  Vendor,
  LocationMaster,
  TerminalFacility,
  PortEquipmentMapping,
} from '../types';
import {
  resolveVendorByCode,
  resolveLocationByCode,
  getActivePortEquipmentMappings,
} from './masterDataResolver';
import { validateWeightSlabBands } from './weightSlabEngine';

export interface ValidationEngineContext {
  vendors: Vendor[];
  locations: LocationMaster[];
  facilities: TerminalFacility[];
  mappings: PortEquipmentMapping[];
}

/**
 * Deterministic Validation Engine
 * Validates contract header, routes, master data references, dates, and amounts
 */
export function validateContract(
  contract: ContractFull,
  context: ValidationEngineContext
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const { vendors, locations, mappings } = context;

  // 1. Header Validation
  if (!contract.contractNumber || contract.contractNumber.trim() === '') {
    issues.push({
      id: 'err-contract-num',
      severity: 'ERROR',
      category: 'Contract Header',
      message: 'Contract number is required.',
      field: 'contractNumber',
    });
  }

  // Vendor Lookup
  if (!contract.vendorCode || contract.vendorCode.trim() === '') {
    issues.push({
      id: 'err-vendor-empty',
      severity: 'ERROR',
      category: 'Vendor Master',
      message: 'Vendor Code is required.',
      field: 'vendorCode',
    });
  } else {
    const resolvedVendor = resolveVendorByCode(contract.vendorCode, vendors);
    if (!resolvedVendor) {
      issues.push({
        id: 'err-vendor-not-found',
        severity: 'ERROR',
        category: 'Vendor Master',
        message: `Vendor code '${contract.vendorCode}' was not found in active Vendor Master.`,
        field: 'vendorCode',
      });
    }
  }

  // Dates Validation
  if (!contract.validFrom) {
    issues.push({
      id: 'err-valid-from',
      severity: 'ERROR',
      category: 'Contract Validity',
      message: 'Valid From date is required.',
      field: 'validFrom',
    });
  }
  if (!contract.validTo) {
    issues.push({
      id: 'err-valid-to',
      severity: 'ERROR',
      category: 'Contract Validity',
      message: 'Valid To date is required.',
      field: 'validTo',
    });
  }
  if (contract.validFrom && contract.validTo) {
    const fromDate = new Date(contract.validFrom);
    const toDate = new Date(contract.validTo);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      issues.push({
        id: 'err-date-format',
        severity: 'ERROR',
        category: 'Contract Validity',
        message: 'Valid From or Valid To contains an invalid date format.',
      });
    } else if (fromDate > toDate) {
      issues.push({
        id: 'err-date-range',
        severity: 'ERROR',
        category: 'Contract Validity',
        message: `Valid To (${contract.validTo}) cannot be earlier than Valid From (${contract.validFrom}).`,
        field: 'validTo',
      });
    }
  }

  // Location Validation
  const portCode =
    contract.direction === 'IMPORT'
      ? contract.pickupLocationCode
      : contract.returnLocationCode;

  if (!portCode || portCode.trim() === '') {
    issues.push({
      id: 'err-port-code',
      severity: 'ERROR',
      category: 'Port Reference',
      message: `${contract.direction === 'IMPORT' ? 'Pickup' : 'Return / Destination'} Port Code is required.`,
    });
  } else {
    const resolvedPort = resolveLocationByCode(portCode, locations);
    if (!resolvedPort) {
      issues.push({
        id: 'err-port-not-found',
        severity: 'ERROR',
        category: 'Location Master',
        message: `Port location '${portCode}' does not exist in Location Master.`,
      });
    } else {
      // Check for port equipment mappings
      const activeMappings = getActivePortEquipmentMappings(
        portCode,
        contract.direction,
        mappings
      );
      if (activeMappings.length === 0) {
        issues.push({
          id: 'err-no-mappings',
          severity: 'ERROR',
          category: 'Port Equipment Mapping',
          message: `No active ${contract.direction} terminal/equipment mappings found for port '${portCode}'.`,
        });
      }
    }
  }

  // Weight Slab Configuration Validation
  if (contract.amountType === 'WEIGHT_SLAB') {
    const slabIssues20 = validateWeightSlabBands(contract.weightSlabs20, '20s');
    const slabIssues40 = validateWeightSlabBands(contract.weightSlabs40, '40s');
    issues.push(...slabIssues20, ...slabIssues40);
  }

  // 2. Route Validation
  if (!contract.routes || contract.routes.length === 0) {
    issues.push({
      id: 'err-no-routes',
      severity: 'ERROR',
      category: 'Routes Matrix',
      message: 'Contract must contain at least one route row.',
    });
  } else {
    const routeKeys = new Set<string>();
    let validRoutes = 0;

    contract.routes.forEach((route, index) => {
      const seq = route.sequence || index + 1;
      let routeHasError = false;

      // Check for pickup and drop
      if (!route.pickupLocationCode) {
        issues.push({
          id: `err-route-pickup-${seq}`,
          severity: 'ERROR',
          category: 'Route Data',
          message: `Route #${seq}: Pickup location code is missing.`,
          routeSequence: seq,
          routeId: route.id,
        });
        routeHasError = true;
      }
      if (!route.dropLocationCode) {
        issues.push({
          id: `err-route-drop-${seq}`,
          severity: 'ERROR',
          category: 'Route Data',
          message: `Route #${seq}: Drop location code is missing.`,
          routeSequence: seq,
          routeId: route.id,
        });
        routeHasError = true;
      }

      // Check duplicate route combinations
      const duplicateKey = `${route.pickupLocationCode}-${route.dropLocationCode}-${route.tripType}-${route.haulageMode}`;
      if (routeKeys.has(duplicateKey)) {
        issues.push({
          id: `warn-route-dup-${seq}`,
          severity: 'WARNING',
          category: 'Route Optimization',
          message: `Route #${seq}: Duplicate route combination detected (${route.pickupLocationCode} -> ${route.dropLocationCode}, ${route.haulageMode}, ${route.tripType}).`,
          routeSequence: seq,
          routeId: route.id,
        });
      } else {
        routeKeys.add(duplicateKey);
      }

      // Pricing Validation
      if (contract.amountType === 'LUMPSUM') {
        if (contract.lumpSumMode === 'SINGLE_AMOUNT') {
          if (
            route.generalAmount === undefined ||
            route.generalAmount === null ||
            route.generalAmount <= 0
          ) {
            issues.push({
              id: `err-route-amt-${seq}`,
              severity: 'ERROR',
              category: 'Pricing',
              message: `Route #${seq}: Lump sum amount is missing or not greater than 0.`,
              routeSequence: seq,
              routeId: route.id,
              field: 'generalAmount',
            });
            routeHasError = true;
          }
        } else if (contract.lumpSumMode === 'EQUIPMENT_SPECIFIC') {
          if (
            route.amount20 === undefined ||
            route.amount20 === null ||
            route.amount20 <= 0
          ) {
            issues.push({
              id: `err-route-amt20-${seq}`,
              severity: 'ERROR',
              category: 'Pricing',
              message: `Route #${seq}: 20 ft lump sum amount is missing or not greater than 0.`,
              routeSequence: seq,
              routeId: route.id,
              field: 'amount20',
            });
            routeHasError = true;
          }
          if (
            route.amount40 === undefined ||
            route.amount40 === null ||
            route.amount40 <= 0
          ) {
            issues.push({
              id: `err-route-amt40-${seq}`,
              severity: 'ERROR',
              category: 'Pricing',
              message: `Route #${seq}: 40 ft lump sum amount is missing or not greater than 0.`,
              routeSequence: seq,
              routeId: route.id,
              field: 'amount40',
            });
            routeHasError = true;
          }
        }
      } else if (contract.amountType === 'WEIGHT_SLAB') {
        const rates20Count = Object.values(route.slabRates20 || {}).filter(
          (r) => r > 0
        ).length;
        const rates40Count = Object.values(route.slabRates40 || {}).filter(
          (r) => r > 0
        ).length;

        if (rates20Count === 0 && rates40Count === 0) {
          issues.push({
            id: `err-route-slabs-empty-${seq}`,
            severity: 'ERROR',
            category: 'Pricing',
            message: `Route #${seq}: No valid 20 ft or 40 ft weight slab rates configured.`,
            routeSequence: seq,
            routeId: route.id,
          });
          routeHasError = true;
        } else if (rates20Count === 0) {
          issues.push({
            id: `warn-route-slabs-20-${seq}`,
            severity: 'WARNING',
            category: 'Pricing',
            message: `Route #${seq}: No 20 ft weight slab rates entered. Only 40 ft records will be produced.`,
            routeSequence: seq,
            routeId: route.id,
          });
        } else if (rates40Count === 0) {
          issues.push({
            id: `warn-route-slabs-40-${seq}`,
            severity: 'WARNING',
            category: 'Pricing',
            message: `Route #${seq}: No 40 ft weight slab rates entered. Only 20 ft records will be produced.`,
            routeSequence: seq,
            routeId: route.id,
          });
        }
      }

      if (!routeHasError) {
        validRoutes++;
      }
    });

    // Count totals
    const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
    const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
    const infoCount = issues.filter((i) => i.severity === 'INFO').length;

    return {
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      infoCount,
      issues,
      validRouteCount: validRoutes,
      totalRouteCount: contract.routes.length,
    };
  }

  const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
  const infoCount = issues.filter((i) => i.severity === 'INFO').length;

  return {
    isValid: errorCount === 0,
    errorCount,
    warningCount,
    infoCount,
    issues,
    validRouteCount: 0,
    totalRouteCount: contract.routes?.length || 0,
  };
}
