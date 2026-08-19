/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HaulageDirection = 'IMPORT' | 'EXPORT';

export type ContractStatus =
  | 'DRAFT'
  | 'VALIDATION_FAILED'
  | 'VALIDATED'
  | 'PROCESSED'
  | 'GENERATED'
  | 'EXPORTED'
  | 'ARCHIVED';

export type PickupDropReturnType =
  | 'Location'
  | 'Terminal'
  | 'Depot'
  | 'Zip/Pin'
  | 'ZipRange';

export type HaulageMode = 'Road' | 'Rail' | 'Barge' | 'Combined';

export type TripType = 'Pick Up' | 'Drop' | 'Drop and Pick Up' | 'Live Load';

export type AmountType = 'LUMPSUM' | 'WEIGHT_SLAB';

export type LumpSumMode = 'SINGLE_AMOUNT' | 'EQUIPMENT_SPECIFIC';

export type EquipmentSize = '20s' | '40s';

export type LadenStatus = 'Laden' | 'Empty';

export type PayableAt = 'POL' | 'POD';

export type PickupDropTerm =
  | 'CY'
  | 'DEPOT'
  | 'FI'
  | 'FL'
  | 'FO'
  | 'FT'
  | 'HOOK'
  | 'ST'
  | 'TACKLE';

export type UserRole = 'Admin' | 'Analyst' | 'Viewer';

export type AppMode = 'DEMO' | 'PRIVATE';

export interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  active: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  notes?: string;
}

export interface LocationMaster {
  id: string;
  locationName: string;
  locationCode: string;
  countryCode: string;
  countryName: string;
  state?: string;
  city?: string;
  locationType: 'Port' | 'Inland City' | 'Rail Hub' | 'Border Point';
  active: boolean;
}

export interface TerminalFacility {
  id: string;
  facilityName: string;
  facilityCode: string;
  facilityType: 'Terminal' | 'Depot' | 'Rail Terminal' | 'CY' | 'Inland Depot';
  portCode: string;
  locationCode: string;
  city: string;
  countryCode: string;
  active: boolean;
}

export interface PortEquipmentMapping {
  id: string;
  portCode: string;
  portName: string;
  terminalName: string;
  terminalCode: string;
  equipmentSize: EquipmentSize;
  equipmentCode: string;
  compositeTerminalEquipmentCode: string;
  compositePortEquipmentCode: string;
  importEnabled: boolean;
  exportEnabled: boolean;
  exportOutputCode: string; // e.g. EDEHAM, EDEBRV
  active: boolean;
}

export interface WeightSlabBand {
  index: number; // 1 to 5
  from: number;
  to: number;
  label: string; // e.g. "0-13 t" or "< 13t"
}

export interface ContractRoute {
  id: string;
  contractId: string;
  sequence: number;
  pickupLocationName: string;
  pickupLocationCode: string;
  pickupType: PickupDropReturnType;
  pickupFacilityCode?: string;
  pickupTerm: PickupDropTerm;
  dropLocationName: string;
  dropLocationCode: string;
  dropType: PickupDropReturnType;
  dropFacilityCode?: string;
  dropTerm: PickupDropTerm;
  returnLocationName: string;
  returnLocationCode: string;
  returnType: PickupDropReturnType;
  returnFacilityCode?: string;
  haulageMode: HaulageMode;
  ladenStatus: LadenStatus;
  currency: string;
  payableAt: PayableAt;
  portToPay: string;
  negotiatedOn: string;
  negotiatedBy: string;
  validFrom: string;
  validTo: string;
  tripType: TripType;
  vendorCode: string;
  remarks?: string;
  generalAmount?: number;
  amount20?: number;
  amount40?: number;
  slabRates20: Record<number, number>; // index 1..5 -> rate
  slabRates40: Record<number, number>; // index 1..5 -> rate
  active: boolean;
}

export interface ContractHeader {
  id: string;
  contractNumber: string;
  revision: number;
  direction: HaulageDirection;
  contractStatus: ContractStatus;
  pickupLocationName: string;
  pickupLocationCode: string;
  pickupType: PickupDropReturnType;
  pickupTerm: PickupDropTerm;
  dropType: PickupDropReturnType;
  dropTerm: PickupDropTerm;
  returnType: PickupDropReturnType;
  returnLocationName: string;
  returnLocationCode: string;
  haulageMode: HaulageMode;
  tripType: TripType;
  ladenStatus: LadenStatus;
  currency: string;
  amountType: AmountType;
  lumpSumMode: LumpSumMode;
  payableAt: PayableAt;
  portToPay: string;
  negotiatedOn: string;
  negotiatedBy: string;
  validFrom: string;
  validTo: string;
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  remarks?: string;
  weightSlabs20: WeightSlabBand[];
  weightSlabs40: WeightSlabBand[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  validatedAt?: string;
  generatedAt?: string;
  version: number;
}

export interface ContractFull extends ContractHeader {
  routes: ContractRoute[];
}

export type RouteItem = ContractRoute;
export type AuditAction = AuditEntry['action'];

/**
 * Standardized Main Haulage Record
 * Canonical 44-Column Operational Schema
 */
export interface HaulageMainRecord {
  pickupLocation: string; // Col 1
  pickupType: string; // Col 2
  pickupZipDepotTerminal: string; // Col 3
  pickupTerm: string; // Col 4
  dropLocation: string; // Col 5
  dropType: string; // Col 6
  dropZipDepotTerminal: string; // Col 7
  dropTerm: string; // Col 8
  equipment: string; // Col 9: "20s" or "40s"
  transitTime: string; // Col 10
  noOfEqpUnits: string; // Col 11
  hMode: string; // Col 12
  ldnMty: string; // Col 13: "LDN" or "MTY"
  currency: string; // Col 14
  amountType: string; // Col 15: "Lumpsum" or "Wt.Slab"
  amount: number; // Col 16: 0 for Wt.Slab, calculated for Lumpsum
  portToPay: string; // Col 17 (Import) / Col 18 (Export)
  payableAt: string; // Col 18 (Import) / Col 17 (Export)
  negotiatedOn: string; // Col 19
  negotiatedBy: string; // Col 20
  returnLocation: string; // Col 21
  returnType: string; // Col 22
  returnZipDepotTerminal: string; // Col 23
  validFrom: string; // Col 24
  validTo: string; // Col 25
  pickupCountryCode: string; // Col 26
  viaHubLocationCode: string; // Col 27
  dropCountryCode: string; // Col 28
  tripType: string; // Col 29
  vendorCode: string; // Col 30
  remarks: string; // Col 31
  insuranceNo: string; // Col 32
  insuranceFromDate: string; // Col 33
  insuranceToDate: string; // Col 34
  heightRestrictionMm: string; // Col 35
  weightRestrictionTon: string; // Col 36
  widthRestrictionMm: string; // Col 37
  id: number; // Col 38: Sequential integer starting at 1001
  pickupState: string; // Col 39
  pickupCity: string; // Col 40
  dropState: string; // Col 41
  dropCity: string; // Col 42
  defaultVendor: string; // Col 43
  updateFlag: string; // Col 44

  // Traceability metadata (Deterministic Audit Link)
  _trace: {
    generationRunId: string;
    contractId: string;
    contractNumber: string;
    contractRevision: number;
    routeId: string;
    routeSequence: number;
    mappingId: string;
    terminalCode: string;
    terminalName: string;
    equipmentSize: EquipmentSize;
    pricingSource: 'SINGLE_AMOUNT' | 'EQUIPMENT_SPECIFIC' | 'WEIGHT_SLAB';
    sourceAmountField: string;
    rawAmount: number;
    weightSlabsGenerated: number;
    generatedAt: string;
    generatedBy: string;
    explanationText: string;
  };
}

// Backward-compatible alias
export type TrustMainRecord = HaulageMainRecord;

export interface WeightSlabRecord {
  size: EquipmentSize; // '20s' | '40s'
  from: number;
  to: number;
  amount: number;
  id: number; // Matches the Parent Record ID
  contractId: string;
  contractNumber: string;
  routeId: string;
  routeSequence: number;
  vendorCode: string;
  direction: HaulageDirection;
  traceDetails: string;
}

export interface GenerationRun {
  id: string;
  runNumber: string;
  contractId: string;
  contractNumber: string;
  revision: number;
  direction: HaulageDirection;
  vendorCode: string;
  vendorName: string;
  portCode: string;
  totalRoutesProcessed: number;
  mainRecordsCount: number;
  weightSlabRecordsCount: number;
  count20s: number;
  count40s: number;
  skippedZeroSlabsCount: number;
  warningsCount: number;
  errorsCount: number;
  durationMs: number;
  generatedBy: string;
  timestamp: string;
  records: HaulageMainRecord[];
  weightSlabs: WeightSlabRecord[];
}

export interface ValidationIssue {
  id: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  category: string;
  message: string;
  routeSequence?: number;
  routeId?: string;
  field?: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  validRouteCount: number;
  totalRouteCount: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action:
    | 'LOGIN'
    | 'CONTRACT_CREATE'
    | 'CONTRACT_UPDATE'
    | 'CONTRACT_VALIDATE'
    | 'RECORDS_GENERATE'
    | 'RECORDS_EXPORT'
    | 'MASTER_DATA_CHANGE'
    | 'MIGRATION_IMPORT'
    | 'AI_EXTRACTION_APPLIED'
    | 'TEST_SUITE_RUN';
  entity: string;
  entityId: string;
  summary: string;
  details?: Record<string, any>;
  generationRunId?: string;
}

export interface SystemSettings {
  standardizedExportMode: boolean;
  startRecordId: number;
  activeRole: UserRole;
  appMode: AppMode;
  theme: 'light' | 'dark';
  // Aliases for compatibility
  legacyTrustCompatibility?: boolean;
  startTrustId?: number;
}
