/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EquipmentSize,
  WeightSlabBand,
  WeightSlabRecord,
  ValidationIssue,
  HaulageDirection,
} from '../types';

/**
 * Deterministically validate Weight Slab bands (e.g. 5 bands for 20s or 40s)
 */
export function validateWeightSlabBands(
  bands: WeightSlabBand[],
  equipmentSize: EquipmentSize
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const prefix = equipmentSize === '20s' ? '20 ft' : '40 ft';

  if (!bands || bands.length === 0) {
    issues.push({
      id: `err-slab-empty-${equipmentSize}`,
      severity: 'ERROR',
      category: 'Weight Slabs',
      message: `No weight slab bands configured for ${prefix} equipment.`,
    });
    return issues;
  }

  let previousTo = 0;

  bands.forEach((band, i) => {
    if (band.from === 0 && band.to === 0 && i > 0) {
      return;
    }

    if (isNaN(band.from) || isNaN(band.to)) {
      issues.push({
        id: `err-slab-nan-${equipmentSize}-${band.index}`,
        severity: 'ERROR',
        category: 'Weight Slabs',
        message: `${prefix} Band ${band.index}: From and To weights must be valid numbers.`,
      });
      return;
    }

    if (band.from < 0 || band.to < 0) {
      issues.push({
        id: `err-slab-neg-${equipmentSize}-${band.index}`,
        severity: 'ERROR',
        category: 'Weight Slabs',
        message: `${prefix} Band ${band.index}: Weights cannot be negative (${band.from}-${band.to} t).`,
      });
    }

    if (band.from >= band.to) {
      issues.push({
        id: `err-slab-order-${equipmentSize}-${band.index}`,
        severity: 'ERROR',
        category: 'Weight Slabs',
        message: `${prefix} Band ${band.index}: 'From' weight (${band.from}t) must be strictly less than 'To' weight (${band.to}t).`,
      });
    }

    if (i > 0 && band.from < previousTo) {
      issues.push({
        id: `err-slab-overlap-${equipmentSize}-${band.index}`,
        severity: 'ERROR',
        category: 'Weight Slabs',
        message: `${prefix} Band ${band.index}: Overlaps with previous band (starts at ${band.from}t but previous band ended at ${previousTo}t).`,
      });
    }

    previousTo = band.to;
  });

  return issues;
}

export interface WeightSlabGenParams {
  recordId: number;
  trustId?: number;
  contractId: string;
  contractNumber: string;
  routeId: string;
  routeSequence: number;
  vendorCode: string;
  direction: HaulageDirection;
  equipmentSize: EquipmentSize;
  bands: WeightSlabBand[];
  slabRates: Record<number, number>;
}

/**
 * Generate child Weight Slab records for a specific main haulage record
 */
export function generateWeightSlabRecordsForHaulage(params: WeightSlabGenParams): WeightSlabRecord[] {
  const {
    recordId,
    trustId,
    contractId,
    contractNumber,
    routeId,
    routeSequence,
    vendorCode,
    direction,
    equipmentSize,
    bands,
    slabRates,
  } = params;

  const parentId = recordId ?? trustId ?? 1001;
  const records: WeightSlabRecord[] = [];

  bands.forEach((band) => {
    const rate = slabRates[band.index];
    // Exclude zero-rate or unconfigured slab records per business rule
    if (rate !== undefined && rate !== null && rate > 0) {
      records.push({
        size: equipmentSize,
        from: band.from,
        to: band.to,
        amount: Number(rate),
        id: parentId, // Parent Record ID linkage
        contractId,
        contractNumber,
        routeId,
        routeSequence,
        vendorCode,
        direction,
        traceDetails: `${direction} ${contractNumber} Route #${routeSequence} | ${equipmentSize} ${band.from}-${band.to}t @ EUR ${rate} (Parent Record ID: ${parentId})`,
      });
    }
  });

  return records;
}

export const generateWeightSlabRecordsForTrust = generateWeightSlabRecordsForHaulage;
