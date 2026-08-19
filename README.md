# Maritime Haulage Contract Intelligence (TRUST 2.0)

> **Enterprise Inland Logistics Contract Automation & Standardized Data Generator**  
> *Modern reconstruction of a 2015–2016 enterprise business-process automation solution.*

---

## 🌊 Overview & Business Context

In global shipping and maritime container transportation, **carrier haulage agreements** govern the inland movement of ocean containers via road, rail, and barge between seaport container terminals and inland dry ports or customer distribution centers.

Historically (circa 2015–2016), commercial rate agreements were negotiated with inland transport vendors across hundreds of corridors. Converting these agreements into the strict format required by enterprise logistics systems (such as **TRUST**) required fragile desktop Excel workbooks (`.xlsm`), manual VLOOKUP operations, and monolithic VBA scripts.

**Haulage Contract Intelligence** reconstructs and elevates this mission-critical capability into a modern full-stack application built with **React 19, TypeScript, and Node.js**, featuring **deterministic business rule engines** and a non-invasive **Gemini AI intelligence layer**.

---

## 🚀 Key Functional Capabilities

### 1. Deterministic Contract Transformation Engine
- **Terminal & Equipment Expansion**: Automatically expands high-level port contracts into specific physical terminal facilities (e.g. Hamburg `DEHAM` expands into `DEHAMTBURC` Burchardkai and `DEHAMTEURC` Eurogate for both `20s` and `40s` equipment tiers).
- **Weight Slab Data Generation**: Converts tiered weight pricing into canonical 5-column child records (`Size, From, To, Amount, Id`), dynamically zeroing the main record amount and omitting zero-rate slab bands.
- **Direction-Aware Column Formatting**: Strict adherence to legacy enterprise formats, including swapping Column 17 (`Payable At`) and Column 18 (`Port To Pay`) for Export contracts.
- **Sequential ID Integrity**: Assigns sequential record IDs (starting at 1001+) and guarantees parent-to-child ID linkage.

### 2. Multi-Level Validation & Audit Governance
- Exact lookup validation for approved vendors and UN/LOCODE master entities.
- Date validity consistency checks (`Valid From <= Valid To`).
- Full immutable event audit logging of all contract modifications, validation runs, and generation executions.

### 3. Non-Invasive Gemini AI Assistance
- **Neural Contract Extraction**: Parses unstructured rate schedules or emails into structured draft contracts.
- **Validation Diagnostics**: Explains blocking master data or pricing errors in plain maritime logistics language.
- **Yield & Rate Anomaly Detection**: Highlights potential price inversions or unusual corridor step-rates without altering commercial numbers.

---

## 🏗️ Architecture

```
[ Unstructured Agreement / Excel ] ──> [ Intake / Gemini Extractor ]
                                                  │
                                                  ▼
                                       [ Contract Master State ]
                                                  │
                                                  ▼
                                     [ Deterministic Validator ]
                                                  │
                                                  ▼
                                   [ Terminal Expansion Engine ]
                                                  │
                                                  ▼
                                   [ Weight Slab Record Engine ]
                                                  │
                                                  ▼
                                    [ Sequential TRUST ID Map ]
                                                  │
                                                  ▼
                        [ Legacy XLSX / CSV / JSON Serializer ]
```

---

## 🧪 Automated Regression Suite

The application includes an in-memory regression suite verifying zero-defect operations:
1. **Import DEHAM 4-way Expansion**: Verifies `DEHAMTBURC` and `DEHAMTEURC` across `20s` and `40s`.
2. **Import DEBRV 2-way Expansion**: Verifies `DEBRVTECTB` terminal mapping.
3. **Lump Sum Equipment Separation**: Validates 20ft vs 40ft rate isolation.
4. **Export Routing & Legacy Output Code**: Validates `EDEHAM` / `EDEBRV` group assignments.
5. **Weight Slab ID Linkage**: Verifies parent ID inheritance and zero-rate filtering.
6. **Date Sanity Assertions**: Rejects invalid validity intervals.
7. **Exact Master Data Lookup**: Rejects unregistered vendor codes.

---

## 🔒 Confidentiality & Portfolio Notice

This software is a clean-room, sanitized portfolio modernization based on historical enterprise business processes. All demonstration vendors (*NorthSea Haulage GmbH*, *Euro Inland Logistics BV*, etc.), rates, and operational datasets are purely synthetic. No confidential or proprietary client data is contained within this repository.
