
export interface MaterialMatch {
  component: string;
  material: string;
  shore: string;
  propertiesAlignment: string;
  complianceFDA: string;
  toxicityStudies: string;
  availabilityNA: string;
  suppliersCMOs: string[];
  weldabilityAnalysis: string;
}

export interface SDSSection {
  id: number;
  heading: string;
  content: string;
}

export interface GHSClassification {
  category: string;
  class: string;
}

export interface PrecautionaryStatements {
  prevention: string[];
  response: string[];
  storage: string[];
  disposal: string[];
}

export interface SDSData {
  productName: string;
  casNumber: string;
  otherIdentifiers?: string;
  recommendedUse?: string;
  supplierInfo?: string;
  emergencyContacts?: string;
  hazards: string;
  classification: GHSClassification[];
  precautionaryStatements: PrecautionaryStatements;
  pictograms: string[];
  signalWord: string;
  sections: SDSSection[];
  revisionDate: string;
  validationHash: string;
}

export interface SimulationMetric {
  label: string;
  value: string | number;
  unit: string;
  description: string;
  status: 'OPTIMAL' | 'CRITICAL' | 'WARNING';
}

export interface SimulationData {
  metrics: SimulationMetric[];
  engineeringSummary: string;
  safetyFactor: number;
}

export interface GeometricSpecs {
  od_mm: number;
  tolerance: string;
  wallThickness: number;
  bellowsCount: number;
  tendonChannelsCount: number;
  labels: string[];
}

export type DeviceType = 'CATHETER' | 'STENT' | 'BONE_PLATE' | 'GENERIC';

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface DeviceDesign {
  deviceName: string;
  deviceType: DeviceType;
  materials: MaterialMatch[];
  specs: GeometricSpecs;
  simulation: SimulationData;
  sdsLibrary: SDSData[];
  groundingSources?: GroundingSource[];
  rawJson?: string;
  cadImageUrl?: string;
}

// Fix: Exporting MaterialDatabaseItem interface used in constants.ts
export interface MaterialDatabaseItem {
  name: string;
  type: string;
  shore: string;
  cas: string;
  hazards: string;
  applications: string[];
  suppliers: string[];
  compliance: string[];
  weldability: string;
  toxicityNote: string;
}

// Fix: Exporting SDCDocument interface used in SDCDocument.tsx
export interface SDCDocument {
  title: string;
  validationHash: string;
  sections: {
    heading: string;
    content: string;
  }[];
}
