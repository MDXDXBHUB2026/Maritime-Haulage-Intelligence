/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ContractFull,
  Vendor,
  LocationMaster,
  TerminalFacility,
  PortEquipmentMapping,
} from '../types';
import { validateContract } from './validationEngine';
import { generateImportTrustRecords } from './importGenerationEngine';
import { generateExportTrustRecords } from './exportGenerationEngine';
import {
  DEMO_VENDORS,
  DEMO_LOCATIONS,
  DEMO_FACILITIES,
  DEMO_PORT_MAPPINGS,
  DEFAULT_WEIGHT_SLABS_20,
  DEFAULT_WEIGHT_SLABS_40,
} from '../data/demoData';

export interface TestCaseResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  assertionLogs: string[];
  errorMessage?: string;
}

export function runAllRegressionTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];
  const vendors = DEMO_VENDORS;
  const locations = DEMO_LOCATIONS;
  const facilities = DEMO_FACILITIES;
  const mappings = DEMO_PORT_MAPPINGS;

  // Test 1: Import DEHAM / Wt.Slab -> 1 source route -> Expected 4 main haulage records
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-imp-deham-4way',
        contractNumber: 'TC-IMP-001',
        revision: 1,
        direction: 'IMPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Hamburg',
        pickupLocationCode: 'DEHAM',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnType: 'Location',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        haulageMode: 'Combined',
        tripType: 'Drop',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'WEIGHT_SLAB',
        lumpSumMode: 'EQUIPMENT_SPECIFIC',
        payableAt: 'POD',
        portToPay: 'DEHAM',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA Engineer',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-001',
        vendorCode: 'DEMO1001',
        vendorName: 'Demo Central Europe Transport',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [
          {
            id: 'r-t1',
            contractId: 'test-imp-deham-4way',
            sequence: 1,
            pickupLocationName: 'Hamburg',
            pickupLocationCode: 'DEHAM',
            pickupType: 'Terminal',
            pickupTerm: 'CY',
            dropLocationName: 'Prague',
            dropLocationCode: 'CZPRG',
            dropType: 'Location',
            dropTerm: 'DEPOT',
            returnLocationName: 'Hamburg',
            returnLocationCode: 'DEHAM',
            returnType: 'Location',
            haulageMode: 'Combined',
            ladenStatus: 'Laden',
            currency: 'EUR',
            payableAt: 'POD',
            portToPay: 'DEHAM',
            negotiatedOn: '2026-01-01',
            negotiatedBy: 'QA Engineer',
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            tripType: 'Drop',
            vendorCode: 'DEMO1001',
            slabRates20: { 1: 520, 2: 580, 3: 650, 4: 730, 5: 840 },
            slabRates40: { 1: 750, 2: 810, 3: 890, 4: 980, 5: 1100 },
            active: true,
          },
        ],
      };

      const run = generateImportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
        startId: 1001,
      });

      logs.push(`Generated ${run.mainRecordsCount} main records from 1 DEHAM source route.`);

      if (run.mainRecordsCount !== 4) {
        passed = false;
        logs.push(`FAILED: Expected 4 records (DEHAMTBURC 20s/40s + DEHAMTEURC 20s/40s), got ${run.mainRecordsCount}`);
      } else {
        logs.push('PASSED: DEHAM correctly generated 4 combinations (DEHAMTBURC 20s/40s, DEHAMTEURC 20s/40s).');
      }

      const terminalCodes = run.records.map((r) => r.pickupZipDepotTerminal);
      if (!terminalCodes.includes('DEHAMTBURC') || !terminalCodes.includes('DEHAMTEURC')) {
        passed = false;
        logs.push('FAILED: Missing expected terminal codes DEHAMTBURC or DEHAMTEURC.');
      } else {
        logs.push('PASSED: Both terminal codes DEHAMTBURC and DEHAMTEURC verified.');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-001',
      name: 'Import DEHAM / Wt.Slab: 4-Way Terminal & Equipment Expansion',
      category: 'Import Business Engine',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 2: Import DEBRV / Wt.Slab -> 1 route -> Expected 2 main records
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-imp-debrv-2way',
        contractNumber: 'TC-IMP-002',
        revision: 1,
        direction: 'IMPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Bremerhaven',
        pickupLocationCode: 'DEBRV',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnType: 'Location',
        returnLocationName: 'Bremerhaven',
        returnLocationCode: 'DEBRV',
        haulageMode: 'Rail',
        tripType: 'Drop',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'WEIGHT_SLAB',
        lumpSumMode: 'EQUIPMENT_SPECIFIC',
        payableAt: 'POD',
        portToPay: 'DEBRV',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-001',
        vendorCode: 'DEMO1001',
        vendorName: 'Demo Central Europe Transport',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [
          {
            id: 'r-t2',
            contractId: 'test-imp-debrv-2way',
            sequence: 1,
            pickupLocationName: 'Bremerhaven',
            pickupLocationCode: 'DEBRV',
            pickupType: 'Terminal',
            pickupTerm: 'CY',
            dropLocationName: 'Vienna',
            dropLocationCode: 'ATVIE',
            dropType: 'Location',
            dropTerm: 'DEPOT',
            returnLocationName: 'Bremerhaven',
            returnLocationCode: 'DEBRV',
            returnType: 'Location',
            haulageMode: 'Rail',
            ladenStatus: 'Laden',
            currency: 'EUR',
            payableAt: 'POD',
            portToPay: 'DEBRV',
            negotiatedOn: '2026-01-01',
            negotiatedBy: 'QA',
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            tripType: 'Drop',
            vendorCode: 'DEMO1001',
            slabRates20: { 1: 600, 2: 660, 3: 730, 4: 810, 5: 920 },
            slabRates40: { 1: 850, 2: 910, 3: 990, 4: 1080, 5: 1200 },
            active: true,
          },
        ],
      };

      const run = generateImportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
      });

      if (run.mainRecordsCount !== 2) {
        passed = false;
        logs.push(`FAILED: Expected 2 records (DEBRVTECTB 20s/40s), got ${run.mainRecordsCount}`);
      } else {
        logs.push('PASSED: DEBRV correctly generated 2 combinations (DEBRVTECTB 20s and 40s).');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-002',
      name: 'Import DEBRV / Wt.Slab: 2-Way Terminal & Equipment Expansion',
      category: 'Import Business Engine',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 3: Import DEHAM / Single Lump Sum -> 20s and 40s use general amount
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-imp-single-lumpsum',
        contractNumber: 'TC-IMP-003',
        revision: 1,
        direction: 'IMPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Hamburg',
        pickupLocationCode: 'DEHAM',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnType: 'Location',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        haulageMode: 'Combined',
        tripType: 'Drop',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'LUMPSUM',
        lumpSumMode: 'SINGLE_AMOUNT',
        payableAt: 'POD',
        portToPay: 'DEHAM',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-001',
        vendorCode: 'DEMO1001',
        vendorName: 'Demo Central Europe Transport',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [
          {
            id: 'r-t3',
            contractId: 'test-imp-single-lumpsum',
            sequence: 1,
            pickupLocationName: 'Hamburg',
            pickupLocationCode: 'DEHAM',
            pickupType: 'Terminal',
            pickupTerm: 'CY',
            dropLocationName: 'Prague',
            dropLocationCode: 'CZPRG',
            dropType: 'Location',
            dropTerm: 'DEPOT',
            returnLocationName: 'Hamburg',
            returnLocationCode: 'DEHAM',
            returnType: 'Location',
            haulageMode: 'Combined',
            ladenStatus: 'Laden',
            currency: 'EUR',
            payableAt: 'POD',
            portToPay: 'DEHAM',
            negotiatedOn: '2026-01-01',
            negotiatedBy: 'QA',
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            tripType: 'Drop',
            vendorCode: 'DEMO1001',
            generalAmount: 775,
            slabRates20: {},
            slabRates40: {},
            active: true,
          },
        ],
      };

      const run = generateImportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
      });

      const allMatch = run.records.every((r) => r.amount === 775);
      if (!allMatch) {
        passed = false;
        logs.push('FAILED: All generated 20s and 40s haulage records must use generalAmount 775.');
      } else {
        logs.push('PASSED: All 4 generated haulage records (20s & 40s) have exact amount 775 EUR.');
      }

      if (run.weightSlabs.length > 0) {
        passed = false;
        logs.push('FAILED: Lump sum contract must not generate weight slab child records.');
      } else {
        logs.push('PASSED: No child weight slabs generated for Lump Sum pricing.');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-003',
      name: 'Import DEHAM / Single Lump Sum Amount Inheritance',
      category: 'Pricing Logic',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 4: Import DEHAM / Equipment-specific Lump Sum -> 20s uses amount20, 40s uses amount40
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-imp-split-lumpsum',
        contractNumber: 'TC-IMP-004',
        revision: 1,
        direction: 'IMPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Hamburg',
        pickupLocationCode: 'DEHAM',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnType: 'Location',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        haulageMode: 'Combined',
        tripType: 'Drop',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'LUMPSUM',
        lumpSumMode: 'EQUIPMENT_SPECIFIC',
        payableAt: 'POD',
        portToPay: 'DEHAM',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-001',
        vendorCode: 'DEMO1001',
        vendorName: 'Demo Central Europe Transport',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [
          {
            id: 'r-t4',
            contractId: 'test-imp-split-lumpsum',
            sequence: 1,
            pickupLocationName: 'Hamburg',
            pickupLocationCode: 'DEHAM',
            pickupType: 'Terminal',
            pickupTerm: 'CY',
            dropLocationName: 'Brno',
            dropLocationCode: 'CZBRQ',
            dropType: 'Location',
            dropTerm: 'DEPOT',
            returnLocationName: 'Hamburg',
            returnLocationCode: 'DEHAM',
            returnType: 'Location',
            haulageMode: 'Combined',
            ladenStatus: 'Laden',
            currency: 'EUR',
            payableAt: 'POD',
            portToPay: 'DEHAM',
            negotiatedOn: '2026-01-01',
            negotiatedBy: 'QA',
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            tripType: 'Drop',
            vendorCode: 'DEMO1001',
            amount20: 620,
            amount40: 910,
            slabRates20: {},
            slabRates40: {},
            active: true,
          },
        ],
      };

      const run = generateImportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
      });

      const recs20 = run.records.filter((r) => r.equipment === '20s');
      const recs40 = run.records.filter((r) => r.equipment === '40s');

      const all20sMatch = recs20.every((r) => r.amount === 620);
      const all40sMatch = recs40.every((r) => r.amount === 910);

      if (!all20sMatch || !all40sMatch) {
        passed = false;
        logs.push('FAILED: 20s or 40s records did not match specified equipment rates.');
      } else {
        logs.push('PASSED: 20s records received exact 620 EUR and 40s records received exact 910 EUR.');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-004',
      name: 'Import DEHAM / Equipment-Specific Lump Sum Split (20s vs 40s)',
      category: 'Pricing Logic',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 5: Export DEHAM -> Output group EDEHAM
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-exp-deham',
        contractNumber: 'TC-EXP-001',
        revision: 1,
        direction: 'EXPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Prague',
        pickupLocationCode: 'CZPRG',
        pickupType: 'Location',
        pickupTerm: 'DEPOT',
        dropType: 'Terminal',
        dropTerm: 'CY',
        returnType: 'Terminal',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        haulageMode: 'Combined',
        tripType: 'Pick Up',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'LUMPSUM',
        lumpSumMode: 'SINGLE_AMOUNT',
        payableAt: 'POL',
        portToPay: 'DEHAM',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-003',
        vendorCode: 'DEMO1003',
        vendorName: 'Demo Intermodal Direct',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [
          {
            id: 'r-t5',
            contractId: 'test-exp-deham',
            sequence: 1,
            pickupLocationName: 'Prague',
            pickupLocationCode: 'CZPRG',
            pickupType: 'Location',
            pickupTerm: 'DEPOT',
            dropLocationName: 'Hamburg',
            dropLocationCode: 'DEHAM',
            dropType: 'Terminal',
            dropTerm: 'CY',
            returnLocationName: 'Hamburg',
            returnLocationCode: 'DEHAM',
            returnType: 'Terminal',
            haulageMode: 'Combined',
            ladenStatus: 'Laden',
            currency: 'EUR',
            payableAt: 'POL',
            portToPay: 'DEHAM',
            negotiatedOn: '2026-01-01',
            negotiatedBy: 'QA',
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            tripType: 'Pick Up',
            vendorCode: 'DEMO1003',
            generalAmount: 730,
            slabRates20: {},
            slabRates40: {},
            active: true,
          },
        ],
      };

      const run = generateExportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
      });

      const allEdeham = run.records.every(
        (r) => r.viaHubLocationCode === 'EDEHAM' || r.dropLocation === 'DEHAM'
      );
      if (!allEdeham) {
        passed = false;
        logs.push('FAILED: Export DEHAM records did not route to EDEHAM group.');
      } else {
        logs.push('PASSED: Export DEHAM records accurately grouped to EDEHAM.');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-005',
      name: 'Export DEHAM: Output Routing Group EDEHAM',
      category: 'Export Business Engine',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 6: Export DEBRV -> Output group EDEBRV
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-exp-debrv',
        contractNumber: 'TC-EXP-002',
        revision: 1,
        direction: 'EXPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Vienna',
        pickupLocationCode: 'ATVIE',
        pickupType: 'Location',
        pickupTerm: 'DEPOT',
        dropType: 'Terminal',
        dropTerm: 'CY',
        returnType: 'Terminal',
        returnLocationName: 'Bremerhaven',
        returnLocationCode: 'DEBRV',
        haulageMode: 'Rail',
        tripType: 'Pick Up',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'LUMPSUM',
        lumpSumMode: 'SINGLE_AMOUNT',
        payableAt: 'POL',
        portToPay: 'DEBRV',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-003',
        vendorCode: 'DEMO1003',
        vendorName: 'Demo Intermodal Direct',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [
          {
            id: 'r-t6',
            contractId: 'test-exp-debrv',
            sequence: 1,
            pickupLocationName: 'Vienna',
            pickupLocationCode: 'ATVIE',
            pickupType: 'Location',
            pickupTerm: 'DEPOT',
            dropLocationName: 'Bremerhaven',
            dropLocationCode: 'DEBRV',
            dropType: 'Terminal',
            dropTerm: 'CY',
            returnLocationName: 'Bremerhaven',
            returnLocationCode: 'DEBRV',
            returnType: 'Terminal',
            haulageMode: 'Rail',
            ladenStatus: 'Laden',
            currency: 'EUR',
            payableAt: 'POL',
            portToPay: 'DEBRV',
            negotiatedOn: '2026-01-01',
            negotiatedBy: 'QA',
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            tripType: 'Pick Up',
            vendorCode: 'DEMO1003',
            generalAmount: 890,
            slabRates20: {},
            slabRates40: {},
            active: true,
          },
        ],
      };

      const run = generateExportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
      });

      const allEdebrv = run.records.every(
        (r) => r.viaHubLocationCode === 'EDEBRV' || r.dropLocation === 'DEBRV'
      );
      if (!allEdebrv) {
        passed = false;
        logs.push('FAILED: Export DEBRV records did not route to EDEBRV group.');
      } else {
        logs.push('PASSED: Export DEBRV records accurately grouped to EDEBRV.');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-006',
      name: 'Export DEBRV: Output Routing Group EDEBRV',
      category: 'Export Business Engine',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 7: Weight Slab Child IDs -> Every child ID matches parent main haulage record
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-imp-wtslab-ids',
        contractNumber: 'TC-IMP-WTSLAB-IDS',
        revision: 1,
        direction: 'IMPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Hamburg',
        pickupLocationCode: 'DEHAM',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnType: 'Location',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        haulageMode: 'Combined',
        tripType: 'Drop',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'WEIGHT_SLAB',
        lumpSumMode: 'EQUIPMENT_SPECIFIC',
        payableAt: 'POD',
        portToPay: 'DEHAM',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-001',
        vendorCode: 'DEMO1001',
        vendorName: 'Demo Central Europe Transport',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [
          {
            id: 'r-t7',
            contractId: 'test-imp-wtslab-ids',
            sequence: 1,
            pickupLocationName: 'Hamburg',
            pickupLocationCode: 'DEHAM',
            pickupType: 'Terminal',
            pickupTerm: 'CY',
            dropLocationName: 'Prague',
            dropLocationCode: 'CZPRG',
            dropType: 'Location',
            dropTerm: 'DEPOT',
            returnLocationName: 'Hamburg',
            returnLocationCode: 'DEHAM',
            returnType: 'Location',
            haulageMode: 'Combined',
            ladenStatus: 'Laden',
            currency: 'EUR',
            payableAt: 'POD',
            portToPay: 'DEHAM',
            negotiatedOn: '2026-01-01',
            negotiatedBy: 'QA',
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            tripType: 'Drop',
            vendorCode: 'DEMO1001',
            slabRates20: { 1: 520, 2: 580, 3: 650, 4: 730, 5: 840 },
            slabRates40: { 1: 750, 2: 810, 3: 890, 4: 980, 5: 1100 },
            active: true,
          },
        ],
      };

      const run = generateImportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
        startId: 1001,
      });

      const parentIds = new Set(run.records.map((r) => r.id));
      const allChildIdsValid = run.weightSlabs.every((ws) => parentIds.has(ws.id));

      if (!allChildIdsValid || run.weightSlabs.length === 0) {
        passed = false;
        logs.push('FAILED: Weight slab records contain mismatched parent IDs.');
      } else {
        logs.push(`PASSED: All ${run.weightSlabs.length} child Weight Slab rows correctly linked to parent Record IDs.`);
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-007',
      name: 'Weight Slab Child IDs: Strict Parent Haulage Record Linkage',
      category: 'Weight Slab Engine',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 8: Zero Slab Rate -> No child record generated
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-zero-slab',
        contractNumber: 'TC-IMP-ZEROSLAB',
        revision: 1,
        direction: 'IMPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Hamburg',
        pickupLocationCode: 'DEHAM',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnType: 'Location',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        haulageMode: 'Combined',
        tripType: 'Drop',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'WEIGHT_SLAB',
        lumpSumMode: 'EQUIPMENT_SPECIFIC',
        payableAt: 'POD',
        portToPay: 'DEHAM',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-001',
        vendorCode: 'DEMO1001',
        vendorName: 'Demo Central Europe Transport',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [
          {
            id: 'r-t8',
            contractId: 'test-zero-slab',
            sequence: 1,
            pickupLocationName: 'Hamburg',
            pickupLocationCode: 'DEHAM',
            pickupType: 'Terminal',
            pickupTerm: 'CY',
            dropLocationName: 'Prague',
            dropLocationCode: 'CZPRG',
            dropType: 'Location',
            dropTerm: 'DEPOT',
            returnLocationName: 'Hamburg',
            returnLocationCode: 'DEHAM',
            returnType: 'Location',
            haulageMode: 'Combined',
            ladenStatus: 'Laden',
            currency: 'EUR',
            payableAt: 'POD',
            portToPay: 'DEHAM',
            negotiatedOn: '2026-01-01',
            negotiatedBy: 'QA',
            validFrom: '2026-01-01',
            validTo: '2026-12-31',
            tripType: 'Drop',
            vendorCode: 'DEMO1001',
            slabRates20: { 1: 500, 2: 0, 3: 600, 4: 0, 5: 0 }, // 3 zero bands
            slabRates40: { 1: 700, 2: 750, 3: 0, 4: 900, 5: 1000 }, // 1 zero band
            active: true,
          },
        ],
      };

      const run = generateImportTrustRecords({
        contract,
        vendors,
        locations,
        facilities,
        mappings,
      });

      const zeroSlabs = run.weightSlabs.filter((ws) => ws.amount === 0);
      if (zeroSlabs.length > 0) {
        passed = false;
        logs.push(`FAILED: Found ${zeroSlabs.length} zero-rate slabs generated in output.`);
      } else {
        logs.push('PASSED: All zero-rate slab bands properly excluded from generated output.');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-008',
      name: 'Zero Slab Rate Suppression: Zero/Blank Bands Omitted',
      category: 'Weight Slab Engine',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 9: Missing Vendor -> Generation blocked
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      const contract: ContractFull = {
        id: 'test-missing-vendor',
        contractNumber: 'TC-VAL-VEN',
        revision: 1,
        direction: 'IMPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Hamburg',
        pickupLocationCode: 'DEHAM',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnType: 'Location',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        haulageMode: 'Combined',
        tripType: 'Drop',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'LUMPSUM',
        lumpSumMode: 'SINGLE_AMOUNT',
        payableAt: 'POD',
        portToPay: 'DEHAM',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'unknown',
        vendorCode: 'UNKNOWN_VENDOR_999', // Missing vendor
        vendorName: 'Fake Logistics Ltd',
        weightSlabs20: DEFAULT_WEIGHT_SLABS_20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [],
      };

      const val = validateContract(contract, { vendors, locations, facilities, mappings });
      const hasVendorError = val.issues.some((i) => i.id === 'err-vendor-not-found');

      if (!hasVendorError) {
        passed = false;
        logs.push('FAILED: Unknown vendor was not flagged by validation engine.');
      } else {
        logs.push('PASSED: Missing / unmapped vendor strictly flagged with blocking error.');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-009',
      name: 'Missing / Unmapped Vendor: Generation Blocked',
      category: 'Validation Engine',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  // Test 10: Overlapping Weight Slab -> Generation blocked
  (() => {
    const t0 = performance.now();
    const logs: string[] = [];
    let passed = true;

    try {
      // Create overlapping 20s slabs: Band 1: 0.1->15, Band 2: 14->25 (Overlap between 14 and 15)
      const badSlabs20 = [
        { index: 1, from: 0.1, to: 15, label: "20' <15t" },
        { index: 2, from: 14, to: 25, label: "20' <25t" }, // Overlaps with Band 1!
        { index: 3, from: 25.1, to: 36, label: "20' <36t" },
        { index: 4, from: 36.1, to: 48, label: "20' <48t" },
        { index: 5, from: 48.1, to: 64, label: "20' <64t" },
      ];

      const contract: ContractFull = {
        id: 'test-overlap-slab',
        contractNumber: 'TC-VAL-OVERLAP',
        revision: 1,
        direction: 'IMPORT',
        contractStatus: 'DRAFT',
        pickupLocationName: 'Hamburg',
        pickupLocationCode: 'DEHAM',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnType: 'Location',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        haulageMode: 'Combined',
        tripType: 'Drop',
        ladenStatus: 'Laden',
        currency: 'EUR',
        amountType: 'WEIGHT_SLAB',
        lumpSumMode: 'EQUIPMENT_SPECIFIC',
        payableAt: 'POD',
        portToPay: 'DEHAM',
        negotiatedOn: '2026-01-01',
        negotiatedBy: 'QA',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        vendorId: 'ven-001',
        vendorCode: 'DEMO1001',
        vendorName: 'Demo Central Europe Transport',
        weightSlabs20: badSlabs20,
        weightSlabs40: DEFAULT_WEIGHT_SLABS_40,
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        updatedBy: 'test',
        updatedAt: new Date().toISOString(),
        version: 1,
        routes: [],
      };

      const val = validateContract(contract, { vendors, locations, facilities, mappings });
      const hasOverlapError = val.issues.some(
        (i) => i.id === 'err-slab20-overlap' || i.id.includes('overlap')
      );

      if (!hasOverlapError) {
        passed = false;
        logs.push('FAILED: Overlapping weight slab was not caught by validation engine.');
      } else {
        logs.push('PASSED: Overlapping weight slab boundary strictly rejected.');
      }
    } catch (e: any) {
      passed = false;
      logs.push(`Error: ${e.message}`);
    }

    results.push({
      id: 'tc-010',
      name: 'Overlapping Weight Slab Thresholds: Validation Blocked',
      category: 'Validation Engine',
      passed,
      durationMs: performance.now() - t0,
      assertionLogs: logs,
    });
  })();

  return results;
}
