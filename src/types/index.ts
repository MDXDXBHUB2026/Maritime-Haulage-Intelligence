/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HaulageDirection = 'IMPORT' | 'EXPORT';
export type ContractStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'VALIDATED'
  | 'GENERATED'
  | 'EXPIRED'
  | 'PROCESSED'
  | 'EXPORTED';
export type HaulageMode = 'Road' | 'Rail' | 'Barge' | 'Combined' | string;
export type TripType =
  | 'One-Way'
  | 'Round-Trip'
  | 'Live Load'
  | 'Drop'
  | 'Pick Up'
  | 'Drop and Pick Up'
  | string;
export type LadenStatus = 'Laden' | 'Empty' | 'LDN' | 'MTY' | string;
export type AmountType = 'Lumpsum' | 'Wt.Slab' | 'LUMPSUM' | 'WT_SLAB' | string;
export type LumpSumMode =
  | 'SINGLE'
  | 'EQUIPMENT_SPECIFIC'
  | 'SINGLE_AMOUNT'
  | 'SEPARATE_AMOUNTS'
  | string;
export type PayableAt = 'POL' | 'POD' | string;
export type EquipmentSize = '20s' | '40s' | string;
export type PickupDropReturnType =
  | 'CY'
  | 'SD'
  | 'CFS'
  | 'Door'
  | 'Ramp'
  | 'Location'
  | 'Terminal'
  | 'Depot'
  | 'Zip/Pin'
  | 'ZipRange'
  | string;
export type PickupDropTerm =
  | 'Free Out'
  | 'Free In'
  | 'Liner Out'
  | 'Liner In'
  | 'CY/CY'
  | 'Door/Door'
  | 'CY'
  | 'DEPOT'
  | 'FI'
  | 'FL'
  | 'FO'
  | 'FT'
  | 'HOOK'
  | 'ST'
  | 'TACKLE'
  | string;
export type UserRole = 'Executive' | 'Analyst' | 'Auditor' | 'Admin' | string;
export type AppMode = 'DEMO' | 'PRIVATE';

export interface WeightSlabBand {
  index?: number;
  band?: number;
  tier?: number;
  from?: number;
  to?: number;
  fromTon?: number;
  toTon?: number;
  label?: string;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  countryCode?: string;
  currency?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  notes?: string;
  isActive?: boolean;
  active?: boolean;
  contactEmail?: string;
  paymentTermsDays?: number;
  carrierType?: 'Road Haulier' | 'Rail Operator' | 'Barge Carrier' | 'Intermodal' | string;
}

export interface LocationMaster {
  id: string;
  unLocode?: string;
  locationCode?: string;
  locationName: string;
  locationType?: string;
  countryCode: string;
  countryName?: string;
  stateCode?: string;
  state?: string;
  city?: string;
  isSeaport?: boolean;
  isInland?: boolean;
  defaultTransitDays?: number;
  active?: boolean;
  isActive?: boolean;
}

export interface TerminalFacility {
  id: string;
  unLocode?: string;
  portCode?: string;
  locationCode?: string;
  facilityCode: string;
  facilityName: string;
  facilityType: 'Seaport Berth' | 'Rail Ramp' | 'Inland Depot' | 'Barge Terminal' | string;
  city?: string;
  countryCode?: string;
  isActive?: boolean;
  active?: boolean;
}

export interface PortEquipmentMapping {
  id: string;
  portCode?: string;
  portName?: string;
  sourceGroupCode?: string;
  sourceLocationName?: string;
  direction?: HaulageDirection;
  terminalCode: string;
  terminalName: string;
  equipmentCode?: string;
  equipmentSize: EquipmentSize;
  pickupDropType?: PickupDropReturnType;
  pickupDropTerm?: PickupDropTerm;
  transitTime?: string;
  noOfEqpUnits?: string;
  exportOutputCode?: string;
  compositePortEquipmentCode?: string;
  compositeTerminalEquipmentCode?: string;
  importEnabled?: boolean;
  exportEnabled?: boolean;
  isActive?: boolean;
  active?: boolean;
}

export interface ContractRoute {
  id: string;
  contractId?: string;
  sequence: number;
  // Route geometry
  originLocationName?: string;
  originLocationCode?: string;
  pickupLocationName?: string;
  pickupLocationCode?: string;
  originType?: PickupDropReturnType;
  originTerm?: PickupDropTerm;
  pickupType?: PickupDropReturnType;
  pickupTerm?: PickupDropTerm;
  pickupFacilityCode?: string;
  originZipTerminal?: string;
  destinationLocationName?: string;
  destinationLocationCode?: string;
  dropLocationName?: string;
  dropLocationCode?: string;
  destinationType?: PickupDropReturnType;
  destinationTerm?: PickupDropTerm;
  dropType?: PickupDropReturnType;
  dropTerm?: PickupDropTerm;
  dropFacilityCode?: string;
  destinationZipTerminal?: string;
  returnLocationName?: string;
  returnLocationCode?: string;
  returnType?: PickupDropReturnType;
  returnTerm?: PickupDropTerm;
  returnFacilityCode?: string;
  returnZipTerminal?: string;
  viaHubLocationCode?: string;
  haulageMode?: HaulageMode;
  tripType?: TripType;
  ladenStatus?: LadenStatus;
  transitTimeDays?: number;
  transitTime?: string;
  noOfEqpUnits?: string;
  currency?: string;
  payableAt?: string;
  portToPay?: string;
  negotiatedOn?: string;
  negotiatedBy?: string;
  validFrom?: string;
  validTo?: string;
  vendorCode?: string;
  // Pricing amounts
  lumpSumAmount?: number;
  generalAmount?: number;
  amount20?: number;
  amount40?: number;
  // Weight slab pricing (5 bands each for 20s and 40s)
  rate20_slab1?: number;
  rate20_slab2?: number;
  rate20_slab3?: number;
  rate20_slab4?: number;
  rate20_slab5?: number;
  rate40_slab1?: number;
  rate40_slab2?: number;
  rate40_slab3?: number;
  rate40_slab4?: number;
  rate40_slab5?: number;
  slabRates20?: Record<string, number>;
  slabRates40?: Record<string, number>;
  // Metadata & restrictions
  remarks?: string;
  insuranceNo?: string;
  insuranceFromDate?: string;
  insuranceToDate?: string;
  heightRestrictionMm?: number;
  weightRestrictionTon?: number;
  widthRestrictionMm?: number;
  specialInstructions?: string;
  isActive?: boolean;
  active?: boolean;
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
    /** Set by the generation engines; the records page filters and exports on it. */
    direction: HaulageDirection;
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
  // Operational Preferences
  defaultCurrency?: string;
  defaultDateFormat?: string;
  weightUnit?: 'Tonnes' | 'Kilograms';
  defaultEquipmentView?: 'ALL' | '20s' | '40s';
  
  // Workbench Preferences
  defaultOpeningWorkbench?: string;
  defaultHaulageMode?: HaulageMode;
  defaultAmountType?: AmountType;
  defaultLadenStatus?: LadenStatus;
  defaultPayableAt?: PayableAt;
  defaultRowsAdded?: number;
  rememberLastContract?: boolean;

  // Table & Grid Preferences
  compactGridDensity?: boolean;
  freezeKeyColumns?: boolean;
  rowsPerPage?: number;
  showInheritedFields?: boolean;
  highlightEditableCells?: boolean;

  // Analytics Preferences
  defaultAnalyticsPeriod?: string;
  defaultCurrencyFilter?: string;
  showZeroRateSlabs?: boolean;
  showIncompleteContracts?: boolean;

  // Export Preferences
  defaultExportFormat?: 'XLSX' | 'CSV' | 'JSON';
  includeColumnHeaders?: boolean;
  includeEmptyOptionalFields?: boolean;
  filenamePattern?: string;

  // Notifications
  notifyContractExpiry?: boolean;
  notifyMissingRates?: boolean;
  notifyValidationErrors?: boolean;
  notifyProcessingComplete?: boolean;
  notifyDataQualityAlerts?: boolean;

  // Core System
  standardizedExportMode: boolean;
  startRecordId: number;
  activeRole: UserRole;
  appMode: AppMode;
  theme: 'light' | 'dark';
  legacyTrustCompatibility?: boolean;
  startTrustId?: number;
}
