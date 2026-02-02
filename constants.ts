
import { MaterialDatabaseItem } from './types';

export const MATERIALS_DB: MaterialDatabaseItem[] = [
  {
    name: "Elastic Resin F80",
    type: 'Elastomer',
    shore: "80A",
    cas: "9003-01-4",
    hazards: "Skin Irrit. 2, Eye Irrit. 2",
    applications: ["3D printing catheter tips", "Flexible prototypes"],
    suppliers: ["Formlabs", "Henkel"],
    compliance: ["ISO 10993-5", "USP Class VI"],
    weldability: "Excellent bonding",
    toxicityNote: "Photopolymer - avoid uncured contact"
  },
  {
    name: "Pebax 7233",
    type: 'Polymer',
    shore: "72A",
    cas: "24937-16-4",
    hazards: "None - Non-hazardous",
    applications: ["Catheter shafts", "Proximal sections"],
    suppliers: ["Arkema", "Zeus"],
    compliance: ["ISO 10993-4", "USP Class VI"],
    weldability: "Excellent",
    toxicityNote: "2025: Fully biocompatible"
  },
  {
    name: "PTFE Lubricant",
    type: 'Fluoropolymer',
    shore: "N/A",
    cas: "9002-84-0",
    hazards: "H315 - Skin irritation",
    applications: ["Liner", "Lubricious coating"],
    suppliers: ["Zeus(SC)", "Fluortek"],
    compliance: ["FDA 21 CFR", "ISO 10993"],
    weldability: "Poor",
    toxicityNote: "Biocompatible, inert"
  },
  {
    name: "Stainless Steel 316L",
    type: 'Metal',
    shore: "N/A",
    cas: "65997-19-5",
    hazards: "None in solid form",
    applications: ["Mandrels", "Stent frames"],
    suppliers: ["Sandvik", "Carpenter Technology"],
    compliance: ["ASTM F138"],
    weldability: "Excellent - TIG/Laser",
    toxicityNote: "Standard surgical grade"
  },
  {
    name: "Silicone MDX4-4210",
    type: 'Elastomer',
    shore: "40A",
    cas: "68083-19-2",
    hazards: "Non-hazardous",
    applications: ["Valves", "Sealants"],
    suppliers: ["NuSil", "Dow"],
    compliance: ["ISO 10993"],
    weldability: "Primer required",
    toxicityNote: "Long-term implant grade"
  }
];

export const DEFAULT_DEVICE_NAME = "Advanced Steerable Catheter";

export const DEFAULT_ARCHITECTURE = `Architecture:
Description: Guidewire
Length (cm): 275
Distal curve height (mm): 3
Labeled OD (in / mm): 0.035 / 0.89`;

export const DEFAULT_SIMULATION_TARGETS = `- Max Burst Pressure: 450 PSI
- Deflection: 90° at tip
- Flow Rate: >5 ml/s saline
- Working Temp: 37°C constant`;

export const DEFAULT_CLINICAL_MATRIX = `SURFACE: Anti-coagulant, non-oxidizing properties.
THERMAL: Thermally inert at human body temperature (37°C).
SOFTNESS: Material softness specified as Shore A.`;

export const DEFAULT_MATERIAL_REQS = `CLINICAL MATERIAL SPECIFICATIONS:
1. SURFACE: Anti-coagulant (low-thrombogenicity) & non-oxidizing.
2. THERMAL: Thermally inert at human body temperature (37°C).
3. SOFTNESS: Shore A hardness for vascular atraumaticity.
4. COMPLIANCE: FDA/ASTM approved medical grade components.
5. VALIDATION: Latest 2025 ISO 10993-5 toxicity study results required.
6. SUPPLY: North America (NA) availability with CMO/Supplier list.
7. ASSEMBLY: Weld/paste usability analysis for secure component integration.`;
