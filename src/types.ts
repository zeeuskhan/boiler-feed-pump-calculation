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
  unitSystem: UnitSystem;
  staticHead: number; // m in Metric, ft in Imperial
  frictionLoss: number; // m in Metric, ft in Imperial
  velocityHead: number; // m in Metric, ft in Imperial
  safetyFactor: number; // percentage (e.g. 10)
}

export interface CapacityInputs {
  unitSystem: UnitSystem;
  boilerCapacity: number; // kg/hr in Metric, lb/hr in Imperial
  blowdownRate: number; // % (e.g. 5)
  makeupFactor: number; // % (e.g. 10)
}

export interface PowerInputs {
  flowRate: number; // m3/hr
  totalHead: number; // meters
  fluidDensity: number; // kg/m3 (default 1000)
  pumpEfficiency: number; // % (e.g. 75)
  motorEfficiency: number; // % (e.g. 90)
}

export interface HeadResults {
  totalHeadMetric: number; // m
  totalHeadImperial: number; // ft
}

export interface CapacityResults {
  flowRateKgHr: number;
  flowRateLbHr: number;
  flowRateM3Hr: number;
  flowRateGPM: number;
}

export interface PowerResults {
  hydraulicPowerKw: number;
  hydraulicPowerHp: number;
  shaftPowerKw: number;
  shaftPowerHp: number;
  motorPowerKw: number;
  motorPowerHp: number;
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
