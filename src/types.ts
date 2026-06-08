export enum UnitSystem {
  Metric = 'Metric',
  Imperial = 'Imperial'
}

export enum CalcTab {
  Head = 'Head',
  FlowRate = 'FlowRate',
  Power = 'Power'
}

export interface HeadInputs {
  dischargePressure: number; // bar in Metric, psi in Imperial
  suctionPressure: number; // bar in Metric, psi in Imperial
  velocityHead: number; // m in Metric, ft in Imperial
  frictionSuction: number; // m in Metric, ft in Imperial
  frictionDischarge: number; // m in Metric, ft in Imperial
  staticHead: number; // m in Metric, ft in Imperial
  safetyFactor: number; // % margin
}

export interface CapacityInputs {
  boilerCapacity: number; // kg/hr in Metric, lb/hr in Imperial
  blowdownRate: number; // %
  safetyFactor: number; // %
  feedwaterTemp: number; // °C in Metric, °F in Imperial
}

export interface PowerInputs {
  flowRate: number; // m3/hr standard
  totalHead: number; // meters standard
  fluidDensity: number; // kg/m3 standard
  pumpEfficiency: number; // %
  motorEfficiency: number; // %
  mechanicalEfficiency: number; // %
  powerRateCustom: number; // currency unit per kWh
  motorRPM: number; // RPM e.g. 2900
}

export interface HeadResults {
  diffPressureHead: number;
  systemResistanceHead: number;
  totalHead: number;
  totalHeadMetric: number;
  totalHeadImperial: number;
  recommendedRange: string;
}

export interface CapacityResults {
  requiredMassFlow: number;
  flowKgHr: number;
  flowM3Hr: number;
  flowGPM: number;
  flowLMin: number;
  recommendedPipeDiameter: number; // mm
  recommendedPipeDiameterInches: number; // inches
}

export interface PowerResults {
  hydraulicPowerKw: number;
  hydraulicPowerHp: number;
  shaftPowerKw: number;
  shaftPowerHp: number;
  motorPowerKw: number;
  motorPowerHp: number;
  systemEfficiency: number;
  annualCost: number;
  carbonEmissions: number;
  specificSpeed: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

export interface RelatedTool {
  name: string;
  description: string;
  href: string;
}
