/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ContractFull,
  HaulageMainRecord,
  TrustMainRecord,
  WeightSlabRecord,
  GenerationRun,
  Vendor,
  LocationMaster,
  TerminalFacility,
  PortEquipmentMapping,
} from '../types';
import {
  resolveLocationByCode,
  resolveVendorByCode,
  getActivePortEquipmentMappings,
} from './masterDataResolver';
import { generateWeightSlabRecordsForHaulage } from './weightSlabEngine';

export interface ExportGenerationParams {
  contract: ContractFull;
  vendors: Vendor[];
  locations: LocationMaster[];
  facilities: TerminalFacility[];
  mappings: PortEquipmentMapping[];
  startId?: number;
  generatedBy?: string;
}

export function generateExportHaulageRecords(
  params: ExportGenerationParams
): GenerationRun {
  const startTime = Date.now();
  const {
    contract,
    vendors,
    locations,
    mappings,
    startId = 1001,
    generatedBy = 'System User',
  } = params;

  let currentId = startId;
  const mainRecords: HaulageMainRecord[] = [];
  const weightSlabRecords: WeightSlabRecord[] = [];

  // In Export, the gateway port is the return / drop destination
  const portCode = contract.returnLocationCode || (contract.routes[0]?.dropLocationCode) || 'DEHAM';
  const activeMappings = getActivePortEquipmentMappings(
    portCode,
    'EXPORT',
    mappings
  );

  const vendor = resolveVendorByCode(contract.vendorCode, vendors);
  const vendorName = vendor ? vendor.vendorName : contract.vendorName;

  let count20s = 0;
  let count40s = 0;
  let skippedZeroSlabsCount = 0;

  contract.routes.forEach((route) => {
    if (!route.active) return;

    // Expand route across each applicable Export PortEquipmentMapping
    activeMappings.forEach((mapping) => {
      const eqSize = mapping.equipmentSize; // '20s' or '40s'
      let recordAmount = 0;
      let pricingSource: 'SINGLE_AMOUNT' | 'EQUIPMENT_SPECIFIC' | 'WEIGHT_SLAB' =
        'SINGLE_AMOUNT';
      let sourceAmountField = 'generalAmount';

      if (contract.amountType === 'LUMPSUM') {
        if (contract.lumpSumMode === 'SINGLE_AMOUNT') {
          recordAmount = route.generalAmount || 0;
          pricingSource = 'SINGLE_AMOUNT';
          sourceAmountField = 'generalAmount';
        } else {
          pricingSource = 'EQUIPMENT_SPECIFIC';
          if (eqSize === '20s') {
            recordAmount = route.amount20 || 0;
            sourceAmountField = 'amount20';
          } else {
            recordAmount = route.amount40 || 0;
            sourceAmountField = 'amount40';
          }
        }
      } else {
        // WEIGHT_SLAB: Main haulage amount is 0
        recordAmount = 0;
        pricingSource = 'WEIGHT_SLAB';
        sourceAmountField =
          eqSize === '20s' ? 'slabRates20' : 'slabRates40';
      }

      const pickupLoc = resolveLocationByCode(
        route.pickupLocationCode || contract.pickupLocationCode,
        locations
      );
      const dropLoc = resolveLocationByCode(
        route.dropLocationCode,
        locations
      );

      const recordId = currentId++;

      if (eqSize === '20s') count20s++;
      else count40s++;

      // Canonical 44-Column Main Haulage Record
      const mainRecord: HaulageMainRecord = {
        pickupLocation: route.pickupLocationName || contract.pickupLocationName,
        pickupType: route.pickupType || contract.pickupType,
        pickupZipDepotTerminal: route.pickupFacilityCode || '',
        pickupTerm: route.pickupTerm || contract.pickupTerm,
        dropLocation: route.dropLocationName,
        dropType: route.dropType || contract.dropType,
        dropZipDepotTerminal: route.dropFacilityCode || mapping.terminalCode,
        dropTerm: route.dropTerm || contract.dropTerm,
        equipment: eqSize,
        transitTime: '0',
        noOfEqpUnits: '1',
        hMode: route.haulageMode || contract.haulageMode,
        ldnMty:
          (route.ladenStatus || contract.ladenStatus) === 'Laden'
            ? 'LDN'
            : 'MTY',
        currency: route.currency || contract.currency || 'EUR',
        amountType:
          contract.amountType === 'WEIGHT_SLAB' ? 'Wt.Slab' : 'Lumpsum',
        amount: recordAmount,
        payableAt: route.payableAt || contract.payableAt || 'POL',
        portToPay: route.portToPay || contract.portToPay || portCode,
        negotiatedOn: route.negotiatedOn || contract.negotiatedOn,
        negotiatedBy: route.negotiatedBy || contract.negotiatedBy,
        returnLocation:
          route.returnLocationName || contract.returnLocationName || portCode,
        returnType: route.returnType || contract.returnType,
        returnZipDepotTerminal: route.returnFacilityCode || mapping.terminalCode,
        validFrom: route.validFrom || contract.validFrom,
        validTo: route.validTo || contract.validTo,
        pickupCountryCode: pickupLoc ? pickupLoc.countryCode : 'CZ',
        viaHubLocationCode: mapping.exportOutputCode || `E${portCode}`, // e.g. EDEHAM, EDEBRV
        dropCountryCode: dropLoc ? dropLoc.countryCode : 'DE',
        tripType: route.tripType || contract.tripType,
        vendorCode: route.vendorCode || contract.vendorCode,
        remarks: route.remarks || contract.remarks || '',
        insuranceNo: '',
        insuranceFromDate: '',
        insuranceToDate: '',
        heightRestrictionMm: '',
        weightRestrictionTon: '',
        widthRestrictionMm: '',
        id: recordId,
        pickupState: pickupLoc?.state || '',
        pickupCity: pickupLoc?.city || '',
        dropState: dropLoc?.state || '',
        dropCity: dropLoc?.city || '',
        defaultVendor: 'Y',
        updateFlag: 'I',
        _trace: {
          generationRunId: '',
          direction: 'EXPORT',
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          contractRevision: contract.revision,
          routeId: route.id,
          routeSequence: route.sequence,
          mappingId: mapping.id,
          terminalCode: mapping.terminalCode,
          terminalName: mapping.terminalName,
          equipmentSize: eqSize,
          pricingSource,
          sourceAmountField,
          rawAmount: recordAmount,
          weightSlabsGenerated: 0,
          generatedAt: new Date().toISOString(),
          generatedBy,
          explanationText: `Export route from ${route.pickupLocationName} expanded for ${mapping.terminalName} (${mapping.terminalCode}) in ${eqSize}. Pricing applied from ${sourceAmountField} (${contract.amountType}).`,
        },
      };

      // If WEIGHT_SLAB, generate child weight slab records
      if (contract.amountType === 'WEIGHT_SLAB') {
        const bands =
          eqSize === '20s'
            ? contract.weightSlabs20
            : contract.weightSlabs40;
        const rates =
          eqSize === '20s' ? route.slabRates20 : route.slabRates40;

        const childSlabs = generateWeightSlabRecordsForHaulage({
          recordId,
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          routeId: route.id,
          routeSequence: route.sequence,
          vendorCode: contract.vendorCode,
          direction: 'EXPORT',
          equipmentSize: eqSize,
          bands,
          slabRates: rates || {},
        });

        mainRecord._trace.weightSlabsGenerated = childSlabs.length;
        weightSlabRecords.push(...childSlabs);

        const totalBands = bands.length;
        skippedZeroSlabsCount += Math.max(0, totalBands - childSlabs.length);
      }

      mainRecords.push(mainRecord);
    });
  });

  const durationMs = Date.now() - startTime;
  const runId = `RUN-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  mainRecords.forEach((r) => {
    r._trace.generationRunId = runId;
  });

  return {
    id: runId,
    runNumber: runId,
    contractId: contract.id,
    contractNumber: contract.contractNumber,
    revision: contract.revision,
    direction: 'EXPORT',
    vendorCode: contract.vendorCode,
    vendorName: vendorName || contract.vendorCode,
    portCode,
    totalRoutesProcessed: contract.routes.length,
    mainRecordsCount: mainRecords.length,
    weightSlabRecordsCount: weightSlabRecords.length,
    count20s,
    count40s,
    skippedZeroSlabsCount,
    warningsCount: 0,
    errorsCount: 0,
    durationMs,
    generatedBy,
    timestamp: new Date().toISOString(),
    records: mainRecords,
    weightSlabs: weightSlabRecords,
  };
}

export const generateExportTrustRecords = generateExportHaulageRecords;
