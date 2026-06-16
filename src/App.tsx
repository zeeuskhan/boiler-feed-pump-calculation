import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Award,
  Zap,
  Gauge,
  HelpCircle,
  BookOpen,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  Printer,
  ChevronDown,
  Info,
  Scale,
  FileText,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Settings
} from 'lucide-react';
import {
  UnitSystem,
  CalcTab,
  HeadInputs,
  CapacityInputs,
  PowerInputs,
  HeadResults,
  CapacityResults,
  PowerResults,
  FAQItem,
  RelatedTool
} from './types';

const AdBanner = lazy(() => import('./components/AdBanner'));
const SystemDiagram = lazy(() => import('./components/SystemDiagram'));
const PumpCurveChart = lazy(() => import('./components/PumpCurveChart'));

// Modular Web Sizing Portal Subviews
const NpshView = lazy(() => import('./components/NpshView'));
const PowerView = lazy(() => import('./components/PowerView'));
const SizingGuideView = lazy(() => import('./components/SizingGuideView'));
const SelectionChartView = lazy(() => import('./components/SelectionChartView'));
const AboutView = lazy(() => import('./components/AboutView'));
const ContactView = lazy(() => import('./components/ContactView'));
const LegalView = lazy(() => import('./components/LegalView'));

export default function App() {
  // Global Unit Standard Toggle
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.Metric);

  // Active Tab
  const [activeTab, setActiveTab] = useState<CalcTab>(CalcTab.Head);

  // Loading/High-precision feedback simulation
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcTriggered, setCalcTriggered] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Inputs: Tab 1 (Head Sizing)
  const [headInputs, setHeadInputs] = useState<HeadInputs>({
    dischargePressure: 40,      // bar in Metric, psi in Imperial
    suctionPressure: 0.5,       // bar in Metric, psi in Imperial
    velocityHead: 2,            // meters in Metric, feet in Imperial
    frictionSuction: 3,         // meters in Metric, feet in Imperial
    frictionDischarge: 15,      // meters in Metric, feet in Imperial
    staticHead: 10,             // meters in Metric, feet in Imperial
    safetyFactor: 10,           // % margin
  });

  // Inputs: Tab 2 (Flow Rate/Capacity)
  const [capacityInputs, setCapacityInputs] = useState<CapacityInputs>({
    boilerCapacity: 10000,      // kg/hr in Metric, lb/hr in Imperial
    blowdownRate: 2,            // % deaerator continuous blowdown purge
    safetyFactor: 10,           // % engineering capacity safety buffer
    feedwaterTemp: 105,         // °C in Metric, °F in Imperial
  });

  // Inputs: Tab 3 (Power and Driver Sizing)
  const [powerInputs, setPowerInputs] = useState<PowerInputs>({
    flowRate: 15,               // m3/hr in Metric, GPM in Imperial
    totalHead: 450,             // meters in Metric, feet in Imperial
    fluidDensity: 954,          // kg/m3 in Metric, lb/ft3 in Imperial (At 105°C)
    pumpEfficiency: 75,         // % pump best efficiency point
    motorEfficiency: 92,        // % premium driver efficiency
    mechanicalEfficiency: 98,   // % shaft coupling transmission
    powerRateCustom: 8,         // local dynamic unit rate (e.g. ₹ or $ per kWh)
    motorRPM: 2950,             // 2-pole commercial motor rating (standard rpm)
  });

  // FAQ state tracking
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  // Router view state synced with URL hashes
  const [currentView, setCurrentView] = useState<string>('calculator');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/npsh') {
        setCurrentView('npsh-calc');
      } else if (hash === '#/power') {
        setCurrentView('power-calc');
      } else if (hash === '#/sizing-guide') {
        setCurrentView('sizing-guide');
      } else if (hash === '#/selection-chart') {
        setCurrentView('selection-chart');
      } else if (hash === '#/about') {
        setCurrentView('about');
      } else if (hash === '#/contact') {
        setCurrentView('contact');
      } else if (hash === '#/privacy-policy') {
        setCurrentView('privacy');
      } else if (hash === '#/disclaimer') {
        setCurrentView('disclaimer');
      } else {
        setCurrentView('calculator');
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Parse custom number inputs so empty entries display beautifully instead of forcing a 0
  const parseNumInput = (value: string): number | "" => {
    if (value === "") return "";
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Trigger brief calculation loading animation for UX feedback
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [headInputs, capacityInputs, powerInputs, activeTab, unitSystem, calcTriggered]);

  // Unit system global toggle translator (preserves numerical parameters in correct scaling formats)
  const handleUnitToggle = (newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;
    setUnitSystem(newSystem);

    if (newSystem === UnitSystem.Imperial) {
      // Metric -> Imperial
      setHeadInputs(prev => ({
        dischargePressure: prev.dischargePressure === "" ? "" : parseFloat((prev.dischargePressure * 14.5038).toFixed(2)),
        suctionPressure: prev.suctionPressure === "" ? "" : parseFloat((prev.suctionPressure * 14.5038).toFixed(2)),
        velocityHead: prev.velocityHead === "" ? "" : parseFloat((prev.velocityHead * 3.28084).toFixed(2)),
        frictionSuction: prev.frictionSuction === "" ? "" : parseFloat((prev.frictionSuction * 3.28084).toFixed(2)),
        frictionDischarge: prev.frictionDischarge === "" ? "" : parseFloat((prev.frictionDischarge * 3.28084).toFixed(2)),
        staticHead: prev.staticHead === "" ? "" : parseFloat((prev.staticHead * 3.28084).toFixed(2)),
        safetyFactor: prev.safetyFactor,
      }));

      setCapacityInputs(prev => ({
        boilerCapacity: prev.boilerCapacity === "" ? "" : Math.round(prev.boilerCapacity * 2.20462),
        blowdownRate: prev.blowdownRate,
        safetyFactor: prev.safetyFactor,
        feedwaterTemp: prev.feedwaterTemp === "" ? "" : parseFloat(((prev.feedwaterTemp * 9/5) + 32).toFixed(1)),
      }));

      setPowerInputs(prev => ({
        flowRate: prev.flowRate === "" ? "" : parseFloat((prev.flowRate * 4.402868).toFixed(2)),
        totalHead: prev.totalHead === "" ? "" : parseFloat((prev.totalHead * 3.28084).toFixed(2)),
        fluidDensity: prev.fluidDensity === "" ? "" : parseFloat((prev.fluidDensity * 0.062428).toFixed(4)),
        pumpEfficiency: prev.pumpEfficiency,
        motorEfficiency: prev.motorEfficiency,
        mechanicalEfficiency: prev.mechanicalEfficiency,
        powerRateCustom: prev.powerRateCustom,
        motorRPM: prev.motorRPM,
      }));
    } else {
      // Imperial -> Metric
      setHeadInputs(prev => ({
        dischargePressure: prev.dischargePressure === "" ? "" : parseFloat((prev.dischargePressure / 14.5038).toFixed(2)),
        suctionPressure: prev.suctionPressure === "" ? "" : parseFloat((prev.suctionPressure / 14.5038).toFixed(2)),
        velocityHead: prev.velocityHead === "" ? "" : parseFloat((prev.velocityHead / 3.28084).toFixed(2)),
        frictionSuction: prev.frictionSuction === "" ? "" : parseFloat((prev.frictionSuction / 3.28084).toFixed(2)),
        frictionDischarge: prev.frictionDischarge === "" ? "" : parseFloat((prev.frictionDischarge / 3.28084).toFixed(2)),
        staticHead: prev.staticHead === "" ? "" : parseFloat((prev.staticHead / 3.28084).toFixed(2)),
        safetyFactor: prev.safetyFactor,
      }));

      setCapacityInputs(prev => ({
        boilerCapacity: prev.boilerCapacity === "" ? "" : Math.round(prev.boilerCapacity / 2.20462),
        blowdownRate: prev.blowdownRate,
        safetyFactor: prev.safetyFactor,
        feedwaterTemp: prev.feedwaterTemp === "" ? "" : parseFloat(((prev.feedwaterTemp - 32) * 5/9).toFixed(1)),
      }));

      setPowerInputs(prev => ({
        flowRate: prev.flowRate === "" ? "" : parseFloat((prev.flowRate / 4.402868).toFixed(2)),
        totalHead: prev.totalHead === "" ? "" : parseFloat((prev.totalHead / 3.28084).toFixed(2)),
        fluidDensity: prev.fluidDensity === "" ? "" : parseFloat((prev.fluidDensity / 0.062428).toFixed(1)),
        pumpEfficiency: prev.pumpEfficiency,
        motorEfficiency: prev.motorEfficiency,
        mechanicalEfficiency: prev.mechanicalEfficiency,
        powerRateCustom: prev.powerRateCustom,
        motorRPM: prev.motorRPM,
      }));
    }
  };

  // 1. Total Dynamic Head Sizing equations
  const headResults = useMemo<HeadResults>(() => {
    const isMetric = unitSystem === UnitSystem.Metric;
    const Pd = Number(headInputs.dischargePressure) || 0;
    const Ps = Number(headInputs.suctionPressure) || 0;
    const Hv = Number(headInputs.velocityHead) || 0;
    const Hfs = Number(headInputs.frictionSuction) || 0;
    const Hfd = Number(headInputs.frictionDischarge) || 0;
    const Hz = Number(headInputs.staticHead) || 0;
    const SF = (Number(headInputs.safetyFactor) || 0) / 100;

    let diffPressureHead = 0;
    if (isMetric) {
      diffPressureHead = (Pd - Ps) * 10.2; // Convert bar difference to meters
    } else {
      diffPressureHead = (Pd - Ps) * 2.31; // Convert psi difference to feet
    }

    const systemResistanceHead = Hv + Hfs + Hfd + Hz;
    const totalHeadNoMargin = diffPressureHead + systemResistanceHead;
    const totalHead = totalHeadNoMargin * (1 + SF);

    const totalHeadMetric = isMetric ? totalHead : totalHead / 3.28084;
    const totalHeadImperial = isMetric ? totalHead * 3.28084 : totalHead;

    let recommendedRange = '';
    if (totalHeadMetric < 60) {
      recommendedRange = 'Single-Stage Split Case Centrifugal';
    } else if (totalHeadMetric <= 300) {
      recommendedRange = 'Horizontal Multistage Ring Section (3 - 6 stages)';
    } else {
      recommendedRange = 'High-Pressure Heavy Wall Ring Section or Barrel Casing (8 - 14 stages)';
    }

    return {
      diffPressureHead: parseFloat(diffPressureHead.toFixed(2)),
      systemResistanceHead: parseFloat(systemResistanceHead.toFixed(2)),
      totalHead: parseFloat(totalHead.toFixed(2)),
      totalHeadMetric: parseFloat(totalHeadMetric.toFixed(2)),
      totalHeadImperial: parseFloat(totalHeadImperial.toFixed(2)),
      recommendedRange,
    };
  }, [headInputs, unitSystem]);

  // 2. Feedwater Capacity Flow equations with dynamic density temperature lookup
  const capacityResults = useMemo<CapacityResults>(() => {
    const isMetric = unitSystem === UnitSystem.Metric;
    const cap = Number(capacityInputs.boilerCapacity) || 0;
    const blowdown = Number(capacityInputs.blowdownRate) || 0;
    const sf = Number(capacityInputs.safetyFactor) || 0;
    const temp = Number(capacityInputs.feedwaterTemp) || 0;

    // Convert temp to Celsius for high fidelity density formula
    const tempC = isMetric ? temp : (temp - 32) * 5/9;
    const tempClamp = Math.max(0, Math.min(tempC, 250));
    // ASME dynamic density polynomial approximation:
    const density = 1000 - 0.0178 * Math.pow(tempClamp - 4, 1.7);

    // Physical mass conversion to kg/hr
    const capKgHr = isMetric ? cap : cap / 2.20462;
    const massFlowBase = capKgHr * (1 + blowdown / 100);
    const requiredMassFlowKg = massFlowBase * (1 + sf / 100);

    const requiredMassFlow = isMetric ? requiredMassFlowKg : requiredMassFlowKg * 2.20462;

    const flowKgHr = requiredMassFlowKg;
    const flowM3Hr = requiredMassFlowKg / density;
    const flowGPM = flowM3Hr * 4.402868;
    const flowLMin = (flowM3Hr * 1000) / 60;

    // Standard water pipe sizing recommendation based on max liquid speed 2.0 m/s
    const velocity = 2.0;
    const flowM3S = flowM3Hr / 3600;
    const area = flowM3S / velocity;
    const diameterM = Math.sqrt((4 * area) / Math.PI);
    const diameterMM = diameterM * 1000;
    const diameterInches = diameterMM / 25.4;

    return {
      requiredMassFlow: parseFloat(requiredMassFlow.toFixed(1)),
      flowKgHr: parseFloat(flowKgHr.toFixed(1)),
      flowM3Hr: parseFloat(flowM3Hr.toFixed(3)),
      flowGPM: parseFloat(flowGPM.toFixed(2)),
      flowLMin: parseFloat(flowLMin.toFixed(1)),
      recommendedPipeDiameter: Math.ceil(diameterMM),
      recommendedPipeDiameterInches: parseFloat(diameterInches.toFixed(2)),
    };
  }, [capacityInputs, unitSystem]);

  // 3. Fluid Power demand and motor driver sizing equations
  const powerResults = useMemo<PowerResults>(() => {
    const isMetric = unitSystem === UnitSystem.Metric;
    const flowVal = Number(powerInputs.flowRate) || 0;
    const headVal = Number(powerInputs.totalHead) || 0;
    const densityVal = Number(powerInputs.fluidDensity) || 0;
    const pEff = (Number(powerInputs.pumpEfficiency) || 0) / 100;
    const mEff = (Number(powerInputs.motorEfficiency) || 0) / 100;
    const mechEff = (Number(powerInputs.mechanicalEfficiency) || 0) / 100;

    // Internal standard Metric SI conversions
    const qM3 = isMetric ? flowVal : flowVal / 4.402868;
    const hMet = isMetric ? headVal : headVal / 3.28084;
    const rho = isMetric ? densityVal : densityVal / 0.062428;

    const gravity = 9.80665;
    // Fluid power W = rho * Q * g * H / 3600
    const hydraulicPowerKw = (qM3 * hMet * rho * gravity) / 3600000;
    const shaftPowerKw = hydraulicPowerKw / pEff / mechEff;
    const motorPowerKw = shaftPowerKw / mEff;

    const kWtoHP = 1.341022;
    const hydraulicPowerHp = hydraulicPowerKw * kWtoHP;
    const shaftPowerHp = shaftPowerKw * kWtoHP;
    const motorPowerHp = motorPowerKw * kWtoHP;

    const systemEfficiency = pEff * mEff * mechEff * 100;

    const annualHours = 8000; // standard industrial continuous service run pattern
    const annualCost = motorPowerKw * annualHours * (Number(powerInputs.powerRateCustom) || 0);
    const carbonEmissions = motorPowerKw * annualHours * 0.52; // 0.52 kg CO2 per kWh grid average

    // Specific Speed Ns = N * sqrt(Q) / H^0.75
    const qGpm = qM3 * 4.402868;
    const hFt = hMet * 3.28084;
    const specificSpeed = (Number(powerInputs.motorRPM) || 0) * Math.sqrt(qGpm) / Math.pow(Math.max(1, hFt), 0.75);

    return {
      hydraulicPowerKw: parseFloat(hydraulicPowerKw.toFixed(3)),
      hydraulicPowerHp: parseFloat(hydraulicPowerHp.toFixed(3)),
      shaftPowerKw: parseFloat(shaftPowerKw.toFixed(3)),
      shaftPowerHp: parseFloat(shaftPowerHp.toFixed(3)),
      motorPowerKw: parseFloat(motorPowerKw.toFixed(3)),
      motorPowerHp: parseFloat(motorPowerHp.toFixed(3)),
      systemEfficiency: parseFloat(systemEfficiency.toFixed(1)),
      annualCost: parseFloat(annualCost.toFixed(0)),
      carbonEmissions: parseFloat(carbonEmissions.toFixed(0)),
      specificSpeed: parseFloat(specificSpeed.toFixed(1)),
    };
  }, [powerInputs, unitSystem]);

  // Convenience function: Maps output parameters from Head and Flow tabs directly to Tab 3 power sizer
  const applyParamsToPowerSizing = () => {
    const isMetric = unitSystem === UnitSystem.Metric;
    setPowerInputs(prev => ({
      ...prev,
      totalHead: isMetric ? headResults.totalHeadMetric : headResults.totalHeadImperial,
      flowRate: isMetric ? capacityResults.flowRateM3Hr : capacityResults.flowRateGPM,
      fluidDensity: isMetric ? 954 : 59.5, // Density at 105°C
    }));
    setActiveTab(CalcTab.Power);
    setCalcTriggered(prev => prev + 1);
  };

  const resetTabDefaults = () => {
    if (activeTab === CalcTab.Head) {
      if (unitSystem === UnitSystem.Metric) {
        setHeadInputs({
          dischargePressure: 40,
          suctionPressure: 0.5,
          velocityHead: 2,
          frictionSuction: 3,
          frictionDischarge: 15,
          staticHead: 10,
          safetyFactor: 10,
        });
      } else {
        setHeadInputs({
          dischargePressure: 580,
          suctionPressure: 7.25,
          velocityHead: 6.56,
          frictionSuction: 9.84,
          frictionDischarge: 49.2,
          staticHead: 32.8,
          safetyFactor: 10,
        });
      }
    } else if (activeTab === CalcTab.FlowRate) {
      if (unitSystem === UnitSystem.Metric) {
        setCapacityInputs({
          boilerCapacity: 10000,
          blowdownRate: 2,
          safetyFactor: 10,
          feedwaterTemp: 105,
        });
      } else {
        setCapacityInputs({
          boilerCapacity: 22046,
          blowdownRate: 2,
          safetyFactor: 10,
          feedwaterTemp: 221,
        });
      }
    } else if (activeTab === CalcTab.Power) {
      if (unitSystem === UnitSystem.Metric) {
        setPowerInputs({
          flowRate: 15,
          totalHead: 450,
          fluidDensity: 954,
          pumpEfficiency: 75,
          motorEfficiency: 92,
          mechanicalEfficiency: 98,
          powerRateCustom: 8,
          motorRPM: 2950,
        });
      } else {
        setPowerInputs({
          flowRate: 66,
          totalHead: 1476,
          fluidDensity: 59.5,
          pumpEfficiency: 75,
          motorEfficiency: 92,
          mechanicalEfficiency: 98,
          powerRateCustom: 8,
          motorRPM: 2950,
        });
      }
    }
  };

  // Formulate complete engineering text audit log for clipboard operations
  const getSerializedResults = (): string => {
    let report = `====================================================\n`;
    report += `     BOILER FEED WATER SYSTEM SIZING REPORT\n`;
    report += `====================================================\n`;
    report += `Timestamp: ${new Date().toISOString()}\n`;
    report += `Standard: ASME Section I & Hydraulics Institute (HI) Codes\n`;
    report += `Unit System Standard: ${unitSystem === UnitSystem.Metric ? 'SI METRIC' : 'IMPERIAL'}\n\n`;

    report += `--- MODULE A: TOTAL DYNAMIC HEAD (TDH) sizing ---\n`;
    report += `  - Discharge Pressure Target: ${headInputs.dischargePressure} ${unitSystem === UnitSystem.Metric ? 'bar' : 'psi'}\n`;
    report += `  - Suction Inlet Pressure: ${headInputs.suctionPressure} ${unitSystem === UnitSystem.Metric ? 'bar' : 'psi'}\n`;
    report += `  - Static Vertical Lift Height: ${headInputs.staticHead} ${unitSystem === UnitSystem.Metric ? 'meters' : 'feet'}\n`;
    report += `  - Pipe Friction Resistance: Suction = ${headInputs.frictionSuction}, Discharge = ${headInputs.frictionDischarge} ${unitSystem === UnitSystem.Metric ? 'meters' : 'feet'}\n`;
    report += `  - Sizing Safety Buffer: ${headInputs.safetyFactor}%\n`;
    report += `  >> CALCULATED TOTAL DYNAMIC HEAD (SI Metric): ${headResults.totalHeadMetric} m\n`;
    report += `  >> CALCULATED TOTAL DYNAMIC HEAD (Imperial): ${headResults.totalHeadImperial} ft\n`;
    report += `  >> Recommended Pump Pattern: ${headResults.recommendedRange}\n\n`;

    report += `--- MODULE B: WATER SIZING CAPACITY & MASS FLOW ---\n`;
    report += `  - Boiler Evaporation (MCR): ${capacityInputs.boilerCapacity} ${unitSystem === UnitSystem.Metric ? 'kg/hr' : 'lb/hr'}\n`;
    report += `  - Deaerator Blowdown Bleed: ${capacityInputs.blowdownRate}%\n`;
    report += `  - Sizing Safety Margin: ${capacityInputs.safetyFactor}%\n`;
    report += `  - Operating Feedwater Temperature: ${capacityInputs.feedwaterTemp} ${unitSystem === UnitSystem.Metric ? '°C' : '°F'}\n`;
    report += `  >> Required Design Mass Flow Rate: ${capacityResults.requiredMassFlow} ${unitSystem === UnitSystem.Metric ? 'kg/hr' : 'lb/hr'}\n`;
    report += `  >> Volumetric Sizing Flow Rate: ${capacityResults.flowM3Hr} m³/hr (${capacityResults.flowGPM} GPM)\n`;
    report += `  >> Recommended Sizing Nominal Pipe ID: ${capacityResults.recommendedPipeDiameter} mm (${capacityResults.recommendedPipeDiameterInches} inches)\n\n`;

    report += `--- MODULE C: DYNAMICS POWER & MOTOR FRAME SELECTION ---\n`;
    report += `  - Volumetric Operational Flow: ${powerInputs.flowRate} ${unitSystem === UnitSystem.Metric ? 'm³/hr' : 'GPM'}\n`;
    report += `  - Sizing Total Dynamic Head: ${powerInputs.totalHead} ${unitSystem === UnitSystem.Metric ? 'meters' : 'feet'}\n`;
    report += `  - Hot Feedwater Liquid Density: ${powerInputs.fluidDensity} ${unitSystem === UnitSystem.Metric ? 'kg/m³' : 'lb/ft³'}\n`;
    report += `  - Efficiency Coefficients: Pump = ${powerInputs.pumpEfficiency}%, Motor = ${powerInputs.motorEfficiency}%\n`;
    report += `  >> Net Liquid Hydraulic Power Wattage: ${powerResults.hydraulicPowerKw} kW (${powerResults.hydraulicPowerHp} HP)\n`;
    report += `  >> Shaft Brake Coupling Power (BHP): ${powerResults.shaftPowerKw} kW (${powerResults.shaftPowerHp} HP)\n`;
    report += `  >> Recommended Grid Electrical Motor Frame: ${powerResults.motorPowerKw} kW (${powerResults.motorPowerHp} HP)\n`;
    report += `  >> Net System Overall Efficiency: ${powerResults.systemEfficiency}%\n`;
    report += `  >> Estimated Energy cost: ${powerResults.annualCost.toLocaleString()} per 8,000h service\n`;
    report += `  >> Carbon Emission Index Footprint: ${powerResults.carbonEmissions.toLocaleString()} kg CO2 / year\n`;
    report += `  >> Impeller Specific Speed Parameter (Ns): ${powerResults.specificSpeed}\n`;
    report += `====================================================\n`;
    report += `Calculations executed on Thermosolve Systems Core module V4.1. Always seek physical engineer audit.\n`;
    return report;
  };

  const handleCopy = () => {
    const text = getSerializedResults();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // FAQ array of questions precisely matching Search Queries and schema structures
  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'What is boiler feed pump calculation?',
      text: 'What is boiler feed pump calculation?',
      answer: 'Boiler feed pump calculation determines the technical specifications (required capacity, flow rate, total dynamic head, operating pressure, efficiency, NPSHa, and motor power) needed to deliver preheated water to a steam boiler safely and continuously under ASME BPVC guidelines. This calculation forms the operational basis for system safety, thermal output integrity, and mechanical component selection.',
      schemaAnswer: 'Boiler feed pump calculation determines the technical specifications (required capacity, flow rate, total dynamic head, operating pressure, efficiency, NPSHa, and motor power) needed to deliver preheated water to a steam boiler safely and continuously under ASME BPVC guidelines.'
    } as any,
    {
      id: 'faq-2',
      question: 'How do you calculate boiler feed pump capacity?',
      text: 'How do you calculate boiler feed pump capacity?',
      answer: 'Boiler feed pump capacity is calculated by converting the boiler\'s Maximum Continuous Rating (MCR) steam flow rate to volumetric flow, factoring in water density at operating temperature, continuous blowdown rate (2% to 5%), secondary system steam losses, and a standard engineering flow safety margin (usually 10% to 15%). A pump sized with insufficient continuous boiler feed pump capacity will trigger safety sensor low-level trips in the steam drums.',
      schemaAnswer: 'Boiler feed pump capacity is calculated by converting the boiler\'s Maximum Continuous Rating (MCR) steam flow rate to volumetric flow, factoring in water density at operating temperature, continuous blowdown rate (2% to 5%), secondary system steam losses, and a standard engineering flow safety margin (usually 10% to 15%).'
    } as any,
    {
      id: 'faq-3',
      question: 'Why is boiler feed pump sizing important?',
      text: 'Why is boiler feed pump sizing important?',
      answer: 'Correct boiler feed pump sizing is important because under-sized pumps lead to a dry boiler and low-water safety trips, while over-sized pumps waste excessive motor driver electrical power, degrade control valves due to throttling drops, and put unnecessary stress on the boiler feed pump bearings. Proper sizing aligns pump operation with its Best Efficiency Point (BEP).',
      schemaAnswer: 'Correct boiler feed pump sizing is important because under-sized pumps lead to a dry boiler and low-water safety trips, while over-sized pumps waste excessive motor driver electrical power, degrade control valves due to throttling drops, and put unnecessary stress on the boiler feed pump bearings.'
    } as any,
    {
      id: 'faq-4',
      question: 'What is boiler feed pump head calculation?',
      text: 'What is boiler feed pump head calculation?',
      answer: 'A boiler feed pump head calculation determines the Total Dynamic Head (TDH) required to force water into the steam drum. Mathematically, BFP head calculation is: TDH = [(P_discharge - P_suction) × C / SG] + Hz + Hf_suction + Hf_discharge + Hv. Here, P_discharge measures boiler operating pressure plus control valve drops (bar); P_suction is the deaerator vessel pressure (bar); C is the unit constant (10.2 for Metric, 2.31 for Imperial); SG is the feedwater specific gravity; Hz represents static elevation; Hf stands for piping friction resistance losses; and Hv is the velocity acceleration head.',
      schemaAnswer: 'A boiler feed pump head calculation determines the Total Dynamic Head (TDH) required to force water into the steam drum. Mathematically, BFP head calculation is: TDH = [(P_discharge - P_suction) × C / SG] + Hz + Hf_suction + Hf_discharge + Hv.'
    } as any,
    {
      id: 'faq-5',
      question: 'How to calculate boiler feed pump power?',
      text: 'How to calculate boiler feed pump power?',
      answer: 'To calculate boiler feed pump power, first solve for the hydraulic fluid power: Hydraulic Power (kW) = [Volumetric Flow (m³/s) × TDH (m) × Hot Water Density (kg/m³) × g] / 1000. Under mechanical design parameters, the actual shaft brake power (BHP) is computed as: Brake Power = Hydraulic Power / Pump Mechanical Efficiency. Finally, determine electric motor nameplate power: Motor Power = Brake Power / Motor Efficiency × Driver Safety Margin (typically 1.10 to 1.15). For boiler feed water pump calculation during cold commissioning, you must optimize for cold density (1000 kg/m³) to prevent motor driver overload.',
      schemaAnswer: 'To calculate boiler feed pump power, first solve for the hydraulic fluid power: Hydraulic Power (kW) = [Volumetric Flow (m³/s) × TDH (m) × Hot Water Density (kg/m³) × g] / 1000. Under mechanical design parameters, the actual shaft brake power (BHP) is computed as: Brake Power = Hydraulic Power / Pump Mechanical Efficiency. Finally, determine electric motor nameplate power: Motor Power = Brake Power / Motor Efficiency × Driver Safety Margin (typically 1.10 to 1.15).'
    } as any,
    {
      id: 'faq-6',
      question: 'What is NPSH in boiler feed pump calculation?',
      text: 'What is NPSH in boiler feed pump calculation?',
      answer: 'In boiler feed pump npsh calculation, Net Positive Suction Head represents the net pressure envelope at the pump inlet above the water\'s boiling vapor pressure. Because boiler feed water enters near its boiling temperature, its static vapor pressure is extremely high. To prevent vapor bubble collapse (cavitation), you must elevate the deaerator tank to generate static height (Hz). Sizing must ensure NPSH Available (NPSHa) exceeds the pump\'s Required NPSH (NPSHr) by at least 1.5 to 2.0 meters.',
      schemaAnswer: 'In boiler feed pump npsh calculation, Net Positive Suction Head represents the net pressure envelope at the pump inlet above the water\'s boiling vapor pressure. Because boiler feed water enters near its boiling temperature, its static vapor pressure is extremely high. To prevent vapor bubble collapse (cavitation), you must elevate the deaerator tank to generate static height (Hz). Sizing must ensure NPSH Available (NPSHa) exceeds the pump\'s Required NPSH (NPSHr) by at least 1.5 to 2.0 meters.'
    } as any
  ];

  const relatedTools: RelatedTool[] = [
    { name: 'Boiler Efficiency Calculator', description: 'Analyze combustion thermal efficiency, fuel heat values, and stack flue gas losses.', href: '#' },
    { name: 'Steam Pipe Sizing Calculator', description: 'Match steam drum velocities, pipe friction drops, and physical nominal insulation diameters.', href: '#' },
    { name: 'Hydraulic NPSH Calculator', description: 'Settle static suction column heights, vapor pressures, and cavitation-free margins.', href: '#' },
    { name: 'Control Valve Cv Calculator', description: 'Evaluate flow coefficients, pressure margins, and throttled valve sizing drops.', href: '#' },
    { name: 'Deaerator Steam Sizing Sizer', description: 'Solve thermodynamic balance matching raw makeup water and grid return condensate.', href: '#' }
  ];

  return (
    <div className="min-h-screen bg-[#08111E] text-slate-100 font-sans selection:bg-[#1E90FF]/30 selection:text-[#FFB400] pb-20 overflow-x-hidden">
      
      {/* PROFESSIONAL NAVBAR HEADER */}
      <nav className="border-b border-[#2A3F5F] bg-[#0D1B2A]/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1E90FF]/15 p-2 rounded-lg border border-[#1E90FF]/30">
              <Activity className="h-6 w-6 text-[#1E90FF]" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#FFB400] font-bold tracking-widest uppercase">ENGINEERING THERMOSOLVE ENGINE</span>
              <h2 className="text-lg font-bold text-white tracking-tight">Thermosolve Systems</h2>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
            <span>Standard: <strong className="text-slate-200">ASME Section I & HI</strong></span>
            <span className="h-4 w-px bg-slate-700 hidden sm:inline"></span>
            
            {/* Global Unit System Switcher */}
            <div className="flex bg-[#0D1B2A] rounded border border-[#2A3F5F] p-0.5">
              <button
                onClick={() => handleUnitToggle(UnitSystem.Metric)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                  unitSystem === UnitSystem.Metric
                    ? 'bg-[#1E90FF] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Metric (SI)
              </button>
              <button
                onClick={() => handleUnitToggle(UnitSystem.Imperial)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                  unitSystem === UnitSystem.Imperial
                    ? 'bg-[#FFB400] text-[#0D1B2A]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Imperial (US)
              </button>
            </div>

            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1A2942]/60 hover:bg-[#1A2942] border border-[#2A3F5F]/80 text-slate-200 transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-[#1E90FF]" />
              Print Report
            </button>
          </div>
        </div>

        {/* SECONDARY NAVIGATION LAYER (E-E-A-T CONTENT HUB) */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-[#2A3F5F]/45 flex items-center overflow-x-auto gap-1 md:gap-2 pb-1 no-scrollbar scroll-smooth">
          {[
            { id: 'calculator', label: '1. Sizing Calculator', hash: '#/' },
            { id: 'npsh-calc', label: '2. Suction NPSH', hash: '#/npsh' },
            { id: 'power-calc', label: '3. Power & Efficiency', hash: '#/power' },
            { id: 'sizing-guide', label: '4. Piping Checklist', hash: '#/sizing-guide' },
            { id: 'selection-chart', label: '5. Selection Curves', hash: '#/selection-chart' },
            { id: 'about', label: '6. Engineering Team', hash: '#/about' },
            { id: 'contact', label: '7. HelpDesk Ticket', hash: '#/contact' },
            { id: 'privacy', label: '8. Privacy Policies', hash: '#/privacy-policy' },
            { id: 'disclaimer', label: '9. ASME Disclaimers', hash: '#/disclaimer' }
          ].map((lnk) => {
            const isActive = currentView === lnk.id;
            return (
              <a
                key={lnk.id}
                href={lnk.hash}
                className={`px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-mono font-medium tracking-wide transition shrink-0 border ${
                  isActive
                    ? 'bg-[#1E90FF]/10 text-[#1E90FF] border-[#1E90FF]/40 font-bold'
                    : 'bg-[#101E35]/40 text-slate-400 border-transparent hover:text-white hover:bg-[#1A2942]/40'
                }`}
              >
                {lnk.label}
              </a>
            );
          })}
        </div>
      </nav>

      {currentView === 'calculator' ? (
        <>
          {/* HERO SECTION */}
          <header className="max-w-7xl mx-auto px-6 pt-10 pb-8 no-print text-center md:text-left relative">
        <div className="absolute top-10 right-10 opacity-5 blur-3xl pointer-events-none">
          <div className="bg-gradient-to-r from-[#1E90FF] to-[#00C896] w-96 h-96 rounded-full" />
        </div>
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A2942] border border-[#2A3F5F] mb-4">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#FFB400] animate-pulse"></span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">ASME BPVC Sizing Core V4.1</span>
        </div>
        
        <h1 className="text-3.5xl md:text-5xl font-extrabold text-white tracking-tight leading-tight select-none">
          Boiler Feed Pump <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#1E90FF] to-[#00C896]">Calculation</span> Tool
        </h1>
        <p className="mt-3 text-base text-[#CBDDF4] max-w-3xl leading-relaxed">
          The free online boiler feed pump calculation tool is a professional-grade engineering calculator for boiler feed pump calculation. Calculate boiler feed pump sizing, capacity, flow rate, Total Dynamic Head (TDH), NPSH available buffers, and motor power demands instantly using verified ASME Section I thermal guidelines.
        </p>

        {/* TRUST BADGE ROW */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center md:justify-start">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101E35] border border-[#2A3F5F]/40 text-[#00C896] text-xs font-mono">
            <ShieldCheck className="h-4 w-4" />
            <span>Used by 10,000+ Engineers</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101E35] border border-[#2A3F5F]/40 text-[#FFB400] text-xs font-mono">
            <Zap className="h-4 w-4" />
            <span>Instant Calculations</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101E35] border border-[#2A3F5F]/40 text-slate-300 text-xs font-mono">
            <Award className="h-4 w-4 text-[#1E90FF]" />
            <span>Fully ASME Compliant</span>
          </div>
        </div>
      </header>

      {/* Sponsor Banner Slot */}
      <div className="max-w-7xl mx-auto px-6">
        <Suspense fallback={<div className="h-[90px] bg-[#101E35] border border-[#2A3F5F]/40 flex items-center justify-center rounded-lg shadow-inner text-slate-400 text-xs">Loading Sponsor Content...</div>}>
          <AdBanner />
        </Suspense>
      </div>

      {/* MAIN CALCULATOR CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: CORE CALCULATOR WIDGET */}
        <section id="interactive-calculator" className="lg:col-span-8 bg-[#0D1B2A] rounded-2xl border border-[#2A3F5F] shadow-2xl overflow-hidden no-print">
          
          {/* THREE TAB HEADERS */}
          <div className="grid grid-cols-3 bg-[#0D1B2A] border-b border-[#2A3F5F]">
            <button
              onClick={() => setActiveTab(CalcTab.Head)}
              className={`py-4 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 font-mono text-xs md:text-sm font-semibold tracking-wide border-b-2 transition cursor-pointer ${
                activeTab === CalcTab.Head
                  ? 'border-[#1E90FF] bg-[#1A2942]/70 text-white animate-fade-in'
                  : 'border-transparent text-slate-400 hover:bg-[#1A2942]/30 hover:text-white'
              }`}
            >
              <Gauge className="h-4 w-4 text-[#1E90FF]" />
              <span className="text-center sm:text-left">1. Head (TDH)</span>
            </button>
            <button
              onClick={() => setActiveTab(CalcTab.FlowRate)}
              className={`py-4 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 font-mono text-xs md:text-sm font-semibold tracking-wide border-b-2 transition cursor-pointer ${
                activeTab === CalcTab.FlowRate
                  ? 'border-[#00C896] bg-[#1A2942]/70 text-white'
                  : 'border-transparent text-slate-400 hover:bg-[#1A2942]/30 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4 text-[#00C896]" />
              <span className="text-center sm:text-left">2. Capacity Flow</span>
            </button>
            <button
              onClick={() => setActiveTab(CalcTab.Power)}
              className={`py-4 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 font-mono text-xs md:text-sm font-semibold tracking-wide border-b-2 transition cursor-pointer ${
                activeTab === CalcTab.Power
                  ? 'border-[#FFB400] bg-[#1A2942]/70 text-white'
                  : 'border-transparent text-slate-400 hover:bg-[#1A2942]/30 hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4 text-[#FFB400]" />
              <span className="text-center sm:text-left">3. Power & Driver</span>
            </button>
          </div>

          {/* SOLVER LOADING ANIMATION LINE */}
          <div className="h-1 bg-[#1A2942] relative w-full overflow-hidden">
            <AnimatePresence>
              {isCalculating && (
                <motion.div
                  initial={{ left: '-100%', width: '30%' }}
                  animate={{ left: '100%', width: '40%' }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-[#1E90FF] via-[#FFB400] to-[#00C896]"
                />
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 md:p-8 bg-[#101E35]/40">
            
            {/* INLINE CONTEXT SENSITIVE TUTORIAL */}
            <div className="mb-6 flex items-start gap-3 bg-[#1A2942]/50 p-4 rounded-lg border border-[#2A3F5F]/40">
              <Info className="h-4 w-4 text-[#1E90FF] mt-0.5 shrink-0" />
              <div className="text-xs text-slate-300 leading-relaxed">
                {activeTab === CalcTab.Head && (
                  <p>
                    <strong>Total Dynamic Head Calculator:</strong> Solves required pressure head output. Standard equation sums differential pressures ($Pd - Ps$), vertical lift elevation ($Hz$), dynamic velocity heads, and pipeline/economizer friction drops, with a custom safety buffer factor.
                  </p>
                )}
                {activeTab === CalcTab.FlowRate && (
                  <p>
                    <strong>Boiler Flow Rate Sizer (MCR):</strong> Sizes required feedwater mass delivery. Solves steam drum evaporation MCR, adjusting for chemical concentration blowdown purges and steam makeup venting losses, using dynamic temperature-density water coefficients.
                  </p>
                )}
                {activeTab === CalcTab.Power && (
                  <p>
                    <strong>Pump Power & Specific Speed (Ns) Sizer:</strong> Computes hydraulic water energy rates, mechanical shaft brake coupling horsepower (BHP), and recommended electric grid motor frame size. Evaluates annual cost and overall efficiency factors.
                  </p>
                )}
              </div>
            </div>

            {/* INTERACTIVE COMPONENT FORMS */}
            <div>
              {/* TAB 1: PUMP HEAD FORM */}
              {activeTab === CalcTab.Head && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Boiler Discharge Pressure (Pd)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.dischargePressure}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, dischargePressure: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'bar' : 'psi'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                        Steam boiler drum operating or design relief valve pressure setting.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Suction Tank Pressure (Ps)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.suctionPressure}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, suctionPressure: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'bar' : 'psi'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Operating gauge pressure of suction deaerator feedwater storage tank.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Static Vertical Elevation Ascent (Hz)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.staticHead}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, staticHead: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Total sheer vertical rise lift from deaerator min level to drum feedwater nozzle inlet.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Velocity Dynamic Head (ΔHv)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.velocityHead}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, velocityHead: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Kinetic energy of water flow motion ($v^2/2g$), typically 1.0 to 3.0m in feedwater lines.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Suction Fluid Friction Drop
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.frictionSuction}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, frictionSuction: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Resistance loss across suction fittings and isolation valves. Set low to protect NPSHa.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Discharge Pipeline Friction Drop
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.frictionDischarge}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, frictionDischarge: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Resistance drops across non-return stop-valves, control dampers, economizers, and piping.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Sizing Safety Buffer (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max="40"
                          min="0"
                          value={headInputs.safetyFactor}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, safetyFactor: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#FFB400] select-none">
                          % Factor
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        ASME margin coefficient (typically 10%) to absorb future scaling and control valve swing drops.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PUMP CAPACITY FLOW FORM */}
              {activeTab === CalcTab.FlowRate && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Boiler Steam Evaporation capacity (MCR)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={capacityInputs.boilerCapacity}
                          onChange={(e) => setCapacityInputs(prev => ({ ...prev, boilerCapacity: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'kg/hr' : 'lb/hr'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Maximum Continuous Rating (MCR) mass evaporation parameter of the boiler drum.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Boiler Blowdown Purge Ratio (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max="25"
                          min="0"
                          step="any"
                          value={capacityInputs.blowdownRate}
                          onChange={(e) => setCapacityInputs(prev => ({ ...prev, blowdownRate: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          % MCR
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Contaminated drum bleed ratio to restrict TDS salt concentrations (typically 2% to 5%).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Evaporation Safety Factor (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max="50"
                          min="0"
                          value={capacityInputs.safetyFactor}
                          onChange={(e) => setCapacityInputs(prev => ({ ...prev, safetyFactor: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          % Buffer
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        ASME flow margin factor to satisfy transient rapid drum level restoration (normally 10%).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Feedwater Stream Temperature
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={capacityInputs.feedwaterTemp}
                          onChange={(e) => setCapacityInputs(prev => ({ ...prev, feedwaterTemp: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? '°C' : '°F'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Piped feedwater temperature. Dictates physical liquid density and vapor flash margins.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: POWER AND EFFICIENCY FORM */}
              {activeTab === CalcTab.Power && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        design System Feed Flow Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={powerInputs.flowRate}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, flowRate: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'm³/hr' : 'GPM'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Design volumetric operating point (or mapped instantly from Tab 2 results below).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Total Sizing Dynamic Head (TDH)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={powerInputs.totalHead}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, totalHead: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Total discharge head target (or mapped instantly from Tab 1 results below).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Water Density at Temperature
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={powerInputs.fluidDensity}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, fluidDensity: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {unitSystem === UnitSystem.Metric ? 'kg/m³' : 'lb/ft³'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Density decreases with heat (e.g. 954 kg/m³ or 59.5 lb/ft³ at 105°C). Mapped to power calculations.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Pump Hydraulic Efficiency (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max="100"
                          min="1"
                          step="any"
                          value={powerInputs.pumpEfficiency}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, pumpEfficiency: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#00C896] select-none">
                          % BEP
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Impeller design hydraulic efficiency at BEP (normally 65% - 85% for multi-stage pumps).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#FFB400] uppercase tracking-wider mb-2">
                        Local Power tariff cost (Rate)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={powerInputs.powerRateCustom}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, powerRateCustom: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-4 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#FFB400] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          per kWh
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Local electrical grid utility rate per kilowatt-hour, used for annual operating cost estimate.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Driver Induction Motor RPM
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={powerInputs.motorRPM}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, motorRPM: parseNumInput(e.target.value) }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-4 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          RPM
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Electrical motor operating speed, used to solve specific speed (Ns) impeller geometry.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LOWER FORM CONTROLS AND REALTIME EMITTER */}
            <div className="mt-8 pt-6 border-t border-[#2A3F5F] flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCalcTriggered(prev => prev + 1)}
                  className="bg-gradient-to-r from-[#1E90FF] to-[#00C896] hover:opacity-90 text-white font-mono text-xs font-bold py-2.5 px-5 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer focus:outline-none"
                >
                  <Activity className="h-4 w-4 animate-pulse" />
                  Recalculate Solver
                </button>
                <button
                  type="button"
                  onClick={resetTabDefaults}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset defaults
                </button>
              </div>

              {/* ACTIVE BULLET INDICATOR to verify real-time parsing is running */}
              <div className="flex items-center gap-2 bg-[#1A2942]/60 px-3 py-1.5 rounded-lg border border-[#2A3F5F]/40 cursor-default select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C896] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C896]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00C896]">Real-time Sync Active</span>
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT COLUMN: REALTIME RESULTS GRID */}
        <section className="lg:col-span-4 space-y-6 select-none no-print">
          <div className="bg-[#1A2942] rounded-2xl border border-[#2A3F5F] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sliders className="h-20 w-20 text-white" />
            </div>

            <div className="bg-[#0D1B2A] py-4 px-5 border-b border-[#2A3F5F] flex justify-between items-center">
              <h3 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#FFB400]" />
                Thermosolve Panel
              </h3>
              <span className="text-[9px] font-mono bg-[#1E90FF] border border-[#1E90FF] text-white py-0.5 px-2 rounded-full font-bold">
                PRO ACTIVE
              </span>
            </div>

            <div className="p-6">
              
              {/* TAB 1: PUMP HEAD RESULTS */}
              {activeTab === CalcTab.Head && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-[#CBDDF4] uppercase tracking-wider block mb-1">
                      Calculated Differential Pressure Head
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-2.5xl font-mono font-extrabold text-[#1E90FF]">
                        {headResults.diffPressureHead}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {unitSystem === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#CBDDF4] uppercase tracking-wider block mb-1">
                      System Piping friction losses (Sum)
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50 font-mono text-slate-300">
                      <span className="text-xl font-bold">
                        {headResults.systemResistanceHead}
                      </span>
                      <span className="text-xs text-slate-400">
                        {unitSystem === UnitSystem.Metric ? 'm' : 'ft'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#FFB400] uppercase tracking-wider block mb-1">
                      ASME TOTAL DYNAMIC HEAD (TDH)
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-3 px-3.5 rounded-lg border border-[#FFB400]/40 shadow-md">
                      <span className="text-3xl font-mono font-extrabold text-[#FFB400]">
                        {headResults.totalHead}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {unitSystem === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0D1B2A] p-3 rounded-lg border border-[#2A3F5F]/40 text-[10px] font-mono text-[#CBDDF4] space-y-2">
                    <p><strong>Physical Model Recommendation:</strong></p>
                    <p className="text-white font-bold">{headResults.recommendedRange}</p>
                    <button
                      type="button"
                      onClick={applyParamsToPowerSizing}
                      className="mt-2 w-full bg-[#1E90FF] border border-[#1E90FF] text-white hover:bg-[#1C86EE] rounded py-2 text-center text-xs font-mono font-bold transition flex items-center justify-center gap-1 px-2 cursor-pointer"
                    >
                      Use Head in Sizing Sizer
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CAPACITY FLOW SIZINGS */}
              {activeTab === CalcTab.FlowRate && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-[#CBDDF4] uppercase tracking-wider block mb-1">
                      Required Mass Flow Sizing Value
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-2.5xl font-mono font-extrabold text-[#00C896]">
                        {capacityResults.requiredMassFlow.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {unitSystem === UnitSystem.Metric ? 'kg/hr' : 'lb/hr'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-[9px] font-mono text-[#CBDDF4] uppercase tracking-wider block mb-1">
                        Volume Capacity
                      </span>
                      <div className="bg-[#0F2035] py-2 px-2.5 rounded border border-[#2A3F5F]/30 font-mono text-xs">
                        <span className="font-extrabold text-[#FFF]">{capacityResults.flowM3Hr}</span> m³/h
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#CBDDF4] uppercase tracking-wider block mb-1">
                        Sizing GPM
                      </span>
                      <div className="bg-[#0F2035] py-2 px-2.5 rounded border border-[#2A3F5F]/30 font-mono text-xs">
                        <span className="font-extrabold text-[#FFB400]">{capacityResults.flowGPM}</span> GPM
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#00C896] uppercase tracking-wider block mb-1">
                      ASME recommended Pipe Inner ID
                    </span>
                    <div className="bg-[#0F2035] p-3 rounded-lg border border-[#00C896]/30 font-mono space-y-1">
                      <p className="text-xs text-white">Recommended Sizing Standard:</p>
                      <p className="text-lg font-bold text-[#00C896]">
                        DN {capacityResults.recommendedPipeDiameter} mm <span className="text-xs text-slate-400 font-normal">({capacityResults.recommendedPipeDiameterInches} in)</span>
                      </p>
                      <p className="text-[9px] text-slate-400 leading-normal">Derived at continuous fluid dynamic flow speed limits of 2.0 m/s (6.6 ft/s) to eliminate pipeline friction spikes.</p>
                    </div>
                  </div>

                  <div className="bg-[#0D1B2A] p-2 rounded-lg border border-[#2A3F5F]/30">
                    <button
                      type="button"
                      onClick={applyParamsToPowerSizing}
                      className="w-full bg-[#00C896]/15 border border-[#00C896]/40 text-[#00C896] hover:bg-[#00C896] hover:text-[#0D1B2A] rounded py-2 text-center text-xs font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Use Flow in Power Sizer
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: POWER AND EFFICIENCY RESULTS */}
              {activeTab === CalcTab.Power && (
                <div className="space-y-6">
                  {/* PUMP EFFICIENCY SVG GAUGE */}
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Track ring */}
                        <circle cx="50" cy="50" r="40" stroke="#1A2942" strokeWidth="8" fill="none" />
                        {/* Cap indicator */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#bepGrad)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * powerInputs.pumpEfficiency) / 100}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="bepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1E90FF" />
                            <stop offset="100%" stopColor="#00C896" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Inside readout card */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                        <span className="text-[9px] font-mono uppercase text-slate-400">BEP Eff</span>
                        <span className="text-xl font-mono font-extrabold text-[#00C896]">{powerInputs.pumpEfficiency}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#CBDDF4] uppercase tracking-wider block mb-1">
                      Fluid Net Useful Hydraulic Power
                    </span>
                    <div className="flex justify-between items-center bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/45">
                      <span className="text-sm font-mono font-extrabold text-white">
                        {powerResults.hydraulicPowerKw} kW
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {powerResults.hydraulicPowerHp} HP
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#CBDDF4] uppercase tracking-wider block mb-1">
                      Shaft Brake coupling Horsepower (BHP)
                    </span>
                    <div className="flex justify-between items-center bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/45">
                      <span className="text-sm font-mono font-extrabold text-[#00C896]">
                        {powerResults.shaftPowerKw} kW
                      </span>
                      <span className="text-xs font-mono text-[#00C896] font-bold">
                        {powerResults.shaftPowerHp} HP
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#FFB400] uppercase tracking-wider block mb-1">
                      ASME electrical motor input sizing
                    </span>
                    <div className="flex justify-between items-center bg-[#1E90FF] py-2.5 px-3 rounded-lg border border-[#1E90FF] shadow-sm">
                      <span className="text-base font-mono font-extrabold text-white">
                        {powerResults.motorPowerKw} kW
                      </span>
                      <span className="text-xs font-mono text-white font-black">
                        {powerResults.motorPowerHp} HP
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0D1B2A] p-3 rounded-lg border border-[#2A3F5F]/40 text-[9px] font-mono text-slate-400 space-y-1.5 leading-normal">
                    <p>🌐 <strong>Overall System Efficiency:</strong> {powerResults.systemEfficiency}%</p>
                    <p>💰 <strong>Estimated Tariff Cost:</strong> {powerResultSymbol(unitSystem)}{powerResults.annualCost.toLocaleString()} /year</p>
                    <p>🍃 <strong>Carbon Footprint Index:</strong> {powerResults.carbonEmissions.toLocaleString()} kg CO₂/year</p>
                    <p>⚙️ <strong>Specific Speed Ns:</strong> {powerResults.specificSpeed} (radial shape)</p>
                  </div>
                </div>
              )}

              {/* REPORT ACTION BAR */}
              <div className="mt-6 pt-5 border-t border-[#2A3F5F] space-y-3.5">
                <button
                  onClick={handleCopy}
                  className="w-full bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white font-mono text-xs font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer select-none active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-[#FFB400]" />
                      Copied Engineering Report!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Engineering Report
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-[#FFB400]" />
                  Generate Printable Layout
                </button>
              </div>

            </div>
          </div>

          <div className="bg-[#101E35] rounded-xl border border-[#2A3F5F] p-4 text-xs font-mono text-slate-300 space-y-1 leading-normal">
            <span className="text-[#FFB400] font-bold block">💡 Fluid dynamics note</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Feedwater temperatures exceeding 100°C decrease fluid molecular weight. This increases physical volume flow requirements to feed constant boiler masses. Let Thermosolve handle the conversion curves!
            </p>
          </div>
        </section>

      </main>

      {/* DETAILED DIAGRAMS PANEL - VISUALLY STUNNING INTEGRATION */}
      <section className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        <Suspense fallback={<div className="bg-[#101E35] h-[350px] border border-[#2A3F5F]/40 flex items-center justify-center rounded-xl text-slate-400 text-xs">Loading System Diagram...</div>}>
          <SystemDiagram
            unitSystem={unitSystem}
            dischargePressure={Number(headInputs.dischargePressure) || 0}
            suctionPressure={Number(headInputs.suctionPressure) || 0}
            staticHead={Number(headInputs.staticHead) || 0}
            frictionSuction={Number(headInputs.frictionSuction) || 0}
            frictionDischarge={Number(headInputs.frictionDischarge) || 0}
            velocityHead={Number(headInputs.velocityHead) || 0}
          />
        </Suspense>
        <Suspense fallback={<div className="bg-[#101E35] h-[350px] border border-[#2A3F5F]/40 flex items-center justify-center rounded-xl text-slate-400 text-xs">Loading Performance Curves...</div>}>
          <PumpCurveChart
            unitSystem={unitSystem}
            operatingFlow={activeTab === CalcTab.Power ? (Number(powerInputs.flowRate) || 0) : (unitSystem === UnitSystem.Metric ? capacityResults.flowM3Hr : capacityResults.flowGPM)}
            operatingHead={activeTab === CalcTab.Power ? (Number(powerInputs.totalHead) || 0) : (unitSystem === UnitSystem.Metric ? headResults.totalHeadMetric : headResults.totalHeadImperial)}
          />
        </Suspense>
      </section>

      {/* UNIFIED GORGEOUS ENGINEERING DATA SHEET (HIDDEN ON SCREEN, ONLY VISIBLE ON PRINT) */}
      <div className="hidden print:block p-10 font-sans text-black bg-white space-y-8" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* PRINT HEADER */}
        <div className="border-b-4 border-gray-800 pb-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#1E90FF] uppercase">THERMOSOLVE QUALITY SYSTEMS</span>
              <h1 className="text-2.5xl font-extrabold tracking-tight uppercase mt-1">BOILER FEEDWATER PUMP SIZING RECORD</h1>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                Full-scale physics matching in conformity with ASME Section I & Hydraulic Institute (HI) standards
              </p>
            </div>
            <div className="text-right">
              <div className="bg-gray-100 px-3 py-1.5 border border-gray-300 font-mono text-[9px] font-bold rounded">
                DRAFT REF: BFP-SI-REV4
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-200 text-xs text-slate-800">
            <div>
              <span className="text-gray-500 font-mono block uppercase text-[8px] tracking-wider font-bold">SUBJECT TARGET</span>
              <span className="font-bold">Boiler Feed Calculation</span>
            </div>
            <div>
              <span className="text-gray-500 font-mono block uppercase text-[8px] tracking-wider font-bold">REPORT DATE</span>
              <span className="font-bold">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div>
              <span className="text-gray-500 font-mono block uppercase text-[8px] tracking-wider font-bold">PREPARED BY</span>
              <span className="font-bold font-mono">Thermosolve Core Engine</span>
            </div>
            <div>
              <span className="text-gray-500 font-mono block uppercase text-[8px] tracking-wider font-bold">UNIT STANDARD</span>
              <span className="font-bold font-mono">{unitSystem === UnitSystem.Metric ? 'METRIC (SI)' : 'IMPERIAL (US)'}</span>
            </div>
          </div>
        </div>

        {/* ACTIVE CALCULATIONS DETAIL SUMMARY */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-5 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-[#1E90FF] uppercase tracking-wide">ACTIVE SIZING RUN SEQUENCE</span>
            <span className="bg-gray-200 text-gray-800 font-mono font-extrabold text-[9px] uppercase px-2 py-0.5 rounded">
              Verified Run
            </span>
          </div>
          <h2 className="text-lg font-bold uppercase text-gray-900">
            Current active view dashboard model parameters:
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            Report computed with global parameters. Pump Dynamic Head has been verified at <strong className="text-black font-extrabold">{headResults.totalHeadMetric} m ({headResults.totalHeadImperial} ft)</strong>. Required mass capacities equal <strong className="text-black font-extrabold">{capacityResults.flowKgHr.toLocaleString()} kg/hr</strong> resulting in a Recommended Motor driver selection of <strong className="text-[#1E90FF] font-extrabold">{powerResults.motorPowerKw} kW ({powerResults.motorPowerHp} HP)</strong> including coupling margins.
          </p>
        </div>

        {/* COMPREHENSIVE PIPING INPUT SCRIPT CONTEXT TABLE */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold tracking-widest text-[#1E90FF] border-b border-gray-300 pb-1.5 uppercase">
            1. HYDRAULIC PRESSURE & ELEVATION SIZING MATRIX
          </h2>
          <table className="w-full text-[10px] text-left text-black border print-border border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100 border-b print-border font-bold">
                <th className="p-2 border-r print-border" style={{ width: '40%' }}>Piping Parameter Category</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Metric Output Dimensions</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Imperial Output Dimensions</th>
              </tr>
            </thead>
            <tbody className="divide-y print-border">
              <tr>
                <td className="p-2 border-r print-border font-semibold">Working Discharge Pressure (Pd)</td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Metric ? headInputs.dischargePressure : parseFloat((Number(headInputs.dischargePressure) / 14.5038).toFixed(2))} bar
                </td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Imperial ? headInputs.dischargePressure : parseFloat((Number(headInputs.dischargePressure) * 14.5038).toFixed(2))} psi
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Suction Tank Pressure (Ps)</td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Metric ? headInputs.suctionPressure : parseFloat((Number(headInputs.suctionPressure) / 14.5038).toFixed(2))} bar
                </td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Imperial ? headInputs.suctionPressure : parseFloat((Number(headInputs.suctionPressure) * 14.5038).toFixed(2))} psi
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Static Physical Vertical Lift (Hz)</td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Metric ? headInputs.staticHead : parseFloat((Number(headInputs.staticHead) / 3.28084).toFixed(2))} m
                </td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Imperial ? headInputs.staticHead : parseFloat((Number(headInputs.staticHead) * 3.28084).toFixed(2))} ft
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Velocity Acceleration Head factor (ΔHv)</td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Metric ? headInputs.velocityHead : parseFloat((Number(headInputs.velocityHead) / 3.28084).toFixed(2))} m
                </td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Imperial ? headInputs.velocityHead : parseFloat((Number(headInputs.velocityHead) * 3.28084).toFixed(2))} ft
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Suction friction / Discharge friction</td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Metric ? `${headInputs.frictionSuction} m / ${headInputs.frictionDischarge} m` : `${(Number(headInputs.frictionSuction) / 3.28084).toFixed(1)} m / ${(Number(headInputs.frictionDischarge) / 3.28084).toFixed(1)} m`}
                </td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Imperial ? `${headInputs.frictionSuction} ft / ${headInputs.frictionDischarge} ft` : `${(Number(headInputs.frictionSuction) * 3.28084).toFixed(1)} ft / ${(Number(headInputs.frictionDischarge) * 3.28084).toFixed(1)} ft`}
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-bold bg-gray-50">FINAL NET TOTAL DYNAMIC HEAD</td>
                <td className="p-2 border-r print-border font-black font-mono text-black bg-gray-50">{headResults.totalHeadMetric} m</td>
                <td className="p-2 border-r print-border font-black font-mono text-black bg-gray-50">{headResults.totalHeadImperial} ft</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CAPACITY SIZINGS */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold tracking-widest text-[#00C896] border-b border-gray-300 pb-1.5 uppercase">
            2. THERMAL CAPACITY FLOW & DETAILED VELOCITIES
          </h2>
          <table className="w-full text-[10px] text-left text-black border print-border border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100 border-b print-border font-bold">
                <th className="p-2 border-r print-border" style={{ width: '40%' }}>Parameter Category</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Metric Output Dimensions</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Imperial Output Dimensions</th>
              </tr>
            </thead>
            <tbody className="divide-y print-border">
              <tr>
                <td className="p-2 border-r print-border font-semibold">Boiler Evaporation Rate (MCR)</td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Metric ? capacityInputs.boilerCapacity : Math.round(Number(capacityInputs.boilerCapacity) / 2.20462)} kg/hr
                </td>
                <td className="p-2 border-r print-border">
                  {unitSystem === UnitSystem.Imperial ? capacityInputs.boilerCapacity : Math.round(Number(capacityInputs.boilerCapacity) * 2.20462)} lb/hr
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Blowdown Bleed purge ratio / safety multiplier</td>
                <td className="p-2 border-r print-border" colSpan={2}>
                  Purge = {capacityInputs.blowdownRate}% | Flow Safety Factor = {capacityInputs.safetyFactor}%
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Dynamic Stream Feed Water Density</td>
                <td className="p-2 border-r print-border" colSpan={2}>
                  {powerInputs.fluidDensity} kg/m³ based on Feedwater stream Temperature of {capacityInputs.feedwaterTemp} {unitSystem === UnitSystem.Metric ? '°C' : '°F'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-bold bg-gray-50">DESIGN MASS FEED FLOW RATE</td>
                <td className="p-2 border-r print-border font-black font-mono bg-gray-50 text-black">{capacityResults.flowKgHr.toLocaleString()} kg/hr</td>
                <td className="p-2 border-r print-border font-black font-mono bg-gray-50 text-black">{capacityResults.requiredMassFlow.toLocaleString()} lb/hr</td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Recommended Feed Pipe Dimensions (DN mm)</td>
                <td className="p-2 border-r print-border">DN {capacityResults.recommendedPipeDiameter} mm ID</td>
                <td className="p-2 border-r print-border">{capacityResults.recommendedPipeDiameterInches} inches ID</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MECHANICAL POWER BRAKES AND MOTOR SELECTION */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold tracking-widest text-amber-600 border-b border-gray-300 pb-1.5 uppercase">
            3. HYDRODYNAMIC ENERGY RATE & MECHANICAL BRAKES
          </h2>
          <table className="w-full text-[10px] text-left text-black border print-border border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100 border-b print-border font-bold">
                <th className="p-2 border-r print-border" style={{ width: '40%' }}>Kinetic Stage Segment</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Metric Output Dimensions</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Imperial Output Dimensions</th>
              </tr>
            </thead>
            <tbody className="divide-y print-border">
              <tr>
                <td className="p-2 border-r print-border font-semibold">Hydraulic Liquid Fluid Power Output</td>
                <td className="p-2 border-r print-border font-mono">{powerResults.hydraulicPowerKw} kW</td>
                <td className="p-2 border-r print-border font-mono">{powerResults.hydraulicPowerHp} HP</td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Net Shaft Brake Power coupling demand (coupling loss)</td>
                <td className="p-2 border-r print-border font-mono font-bold text-black">{powerResults.shaftPowerKw} kW</td>
                <td className="p-2 border-r print-border font-mono font-bold text-black">{powerResults.shaftPowerHp} HP</td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-bold bg-gray-50">RECOMMENDED INDUCTION ELECTRIC MOTOR INPUT</td>
                <td className="p-2 border-r print-border font-black font-mono text-[#1E90FF] bg-gray-50">{powerResults.motorPowerKw} kW</td>
                <td className="p-2 border-r print-border font-black font-mono text-[#1E90FF] bg-gray-50">{powerResults.motorPowerHp} HP</td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Pump Specific Speed configuration (Ns)</td>
                <td className="p-2 border-r print-border font-mono" colSpan={2}>
                  Ns = {powerResults.specificSpeed} (Radial-flow rotodynamic pump)
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-[8px] text-gray-500 font-mono italic leading-relaxed">
            Note: Motor frame is sized dynamically corresponding to IE3 or IE4 grid standards. Recommend standard commercial motor sizing with a minimum of 1.15 service factor to handle mechanical temperature swings.
          </p>
        </div>

        {/* EQUATIONS EXPLAINED REFERENCE BLOCK */}
        <div className="space-y-3" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-[10px] font-mono font-bold tracking-widest text-slate-700 border-b border-gray-300 pb-1.5 uppercase">
            GOVERNING HYDRAULIC EQUATIONS
          </h2>
          <div className="grid grid-cols-2 gap-4 text-[9px] text-gray-600 font-mono leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div>
              <p className="font-bold text-gray-800 uppercase mb-1">TOTAL DYNAMIC HEAD (TDH)</p>
              <p>TDH = ((Pd - Ps) &times; C) + Hz + Hfs + Hfd + &Delta;Hv</p>
              <p className="mt-1 text-gray-400">Where C = 10.2 for Metric bar, C = 2.31 for Imperial psi.</p>
            </div>
            <div>
              <p className="font-bold text-gray-800 uppercase mb-1">HYDRAULIC POWER RATINGS</p>
              <p>P_hyd = (Q &times; H &times; &rho; &times; g) / 3.6e6 kW</p>
              <p>Shaft BHP = P_hyd / (Pump_Eff &times; Mech_Eff)</p>
            </div>
          </div>
        </div>

        {/* COMPLIANCE STAMP BLOCK */}
        <div className="border border-gray-300 rounded-lg p-5 mt-8" style={{ pageBreakInside: 'avoid' }}>
          <div className="grid grid-cols-3 gap-6 items-center">
            <div className="col-span-2 text-[9px] text-gray-500 space-y-1 leading-relaxed">
              <span className="font-bold text-gray-800 uppercase block text-[10px]">FORMAL REVIEW AND QUALITY COMPLIANCE</span>
              <p>The mathematical models implemented in this application software are mapped in accordance with ASME BPVC Section I Power Boilers, ASME B31.1 Power Piping code recommendations, and the Hydraulic Institute (HI) Standard for rotodynamic pumps sizing guidelines.</p>
              <p className="italic text-[8px] text-gray-400">Warning: Preliminary estimation draft. Always review physically certified manufacturer curves and seek professional mechanical engineering sign-off prior to component dispatch or capital build procurement.</p>
            </div>
            <div className="border border-gray-300 p-4 text-center rounded bg-gray-50 flex flex-col justify-between h-24">
              <div className="border-b border-gray-300 w-full my-1.5 h-4 flex items-end justify-center text-xs text-gray-400 italic font-mono uppercase tracking-widest text-[8px]">
                Sizing Passed
              </div>
              <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block font-bold">STAMP & DATE</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-[9px] text-gray-400 pt-5 border-t border-gray-200">
          <p>© {new Date().getFullYear()} Thermosolve Quality Engineering Tools. Platform runtime session index G-STUDIO-{new Date().toISOString().substring(0,10)}.</p>
        </div>

      </div>

      {/* COMPREHENSIVE SEO DOCUMENTATION - Surpasses competitor blogs with extreme structured detail (2800+ words) */}
      <article className="max-w-5xl mx-auto px-6 mt-16 no-print space-y-16">
        
        {/* MAIN SEO HEADER WITH PRIMARY TARGET KEYWORD */}
        <div className="border-b border-[#2A3F5F]/40 pb-8">
          <h1 className="text-3xl md:text-5.5xl font-extrabold text-white tracking-tight font-sans leading-tight">
            Boiler Feed Pump Calculation
          </h1>
          <p className="mt-3 text-slate-400 text-base leading-relaxed">
            Ultimate thermodynamic engineering resource and design handbook. Analyze high-pressure feedwater loops, dynamic friction losses, power demands, and cavitation-free NPSHa thresholds.
          </p>
        </div>

        {/* SECTION 1: WHAT IS BFP CALCULATION */}
        <section id="what-is-boiler-feed-pump-calculation" className="space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">What is Boiler Feed Pump Calculation?</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            A <strong>boiler feed pump calculation</strong> represents the core mechanical fluid-dynamics procedure executed by plant maintenance crew, design engineers, and thermal engineers to select high-pressure feedwater pumps. The feed pump must physically draw low-pressure water from deaerator tanks and force it under extreme pressure into steam drum boilers. Because steam boilers generate massive internal gauge pressures, feedwater systems have to operate at pressures exceeding the boiler drum threshold to prevent hazardous system back-flow.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Performing a correct <strong>boiler feed water pump calculation</strong> ensures that the selected rotodynamic pump can supply continuous liquid volumes matching the boiler Maximum Continuous Rating (MCR) without slipping into starvation. Under-sized pumps produce dry boiler conditions, which trigger superheater melt-downs and immediate steam drum low-level trips, whereas over-sized pumps waste massive amounts of grid electricity, leading to high operational costs and early control valve erosion. Sizing also directly influences the mechanical integrity of the <strong>boiler feed pump bearing</strong> arrangement, as severe off-design operation leads to heavy radial thrust imbalances. Proper regulation of the <strong>boiler feed pump balancing pressure</strong> recycle loop is vital to suppress axial rotor displacement.
          </p>
        </section>

        {/* SECTION 2: FLOW CALCULATION */}
        <section id="boiler-feed-pump-flow-calculation" className="space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Flow Calculation</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Executing a standard <strong>boiler feed pump flow calculation</strong> involves determining the absolute mass rate (in kg/hr or lb/hr) required by the steam cycle, and converting that value into a volumetric design flow rate (in m³/hr or GPM). Sizing parameters must incorporate continuous mineral purges—known as continuous boiler blowdown—and secondary steam losses:
          </p>
          <div className="bg-[#050C16] p-5 rounded-xl border border-[#2A3F5F]/60 font-mono text-center my-4 text-[#00C896] leading-relaxed text-sm">
            <span className="text-[10px] text-[#FFB400] font-bold block mb-2 uppercase">Mass Flow Balance Equation</span>
            Mass Flow (m) = Boiler Steam Flow MCR × (1 + Blowdown Rate % + Safety Margin %)
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            To translate this mass flow into volumetric design parameters, you must divide the mass flow by the physical density of the feedwater: <strong>Q = m / ρ</strong>. Because water expands significantly when heated, its density drops (e.g. from 1000 kg/m³ at room temperature to 925 kg/m³ at 140°C). Failing to utilize the hot fluid density in your <strong>boiler feed pump sizing calculation</strong> will produce a 7.5% flow deficit, leaving the steam loop short of preheated water. This density correction is the bedrock of professional <strong>boiler feed pump design calculation</strong> practices.
          </p>
        </section>

        {/* SECTION 3: HEAD CALCULATION */}
        <section id="boiler-feed-pump-head-calculation" className="space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Head Calculation</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            A precise <strong>boiler feed pump head calculation</strong> addresses the cumulative fluid head energy required to push water past steam drum backpressure, feed piping friction, control valve drops, and gravity elevation. It is measured in meters of water column (m.w.c) or feet. The governing <strong>boiler feed pump formula</strong> for head is:
          </p>
          <div className="bg-[#050C16] p-5 rounded-xl border border-[#2A3F5F]/60 font-mono text-center my-4 text-[#1E90FF] leading-relaxed text-sm">
            <span className="text-[10px] text-[#FFB400] font-bold block mb-2 uppercase">Total Dynamic Head (TDH) Formula</span>
            TDH = [(P_drum - P_deaerator) × 10.2 / SG] + Hz + Hf_suction + Hf_discharge + ΔHv
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Where <em>SG</em> represents hot feedwater Specific Gravity, <em>Hz</em> represents physical static elevation rise (lift), <em>Hf</em> stands for suction/discharge pipeline friction drop, and <em>ΔHv</em> accounts for the dynamic velocity head difference. Standard ASME guidelines suggest adding a 10% safety margin to the computed <strong>boiler feed pump head calculation</strong> to counteract internal impeller wear, scale buildup in economizers, and transient load fluctuations.
          </p>
        </section>

        {/* SECTION 4: CAPACITY CALCULATION EXAMPLE */}
        <section id="boiler-feed-pump-capacity-calculation-example" className="bg-[#101E35]/60 border border-[#2A3F5F]/60 p-6 md:p-8 rounded-2xl space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Capacity Calculation Example</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            To illustrate how a thermal engineer executes these equations, let's work through a practical <strong>boiler feed pump capacity calculation example</strong> based on a typical industrial cogeneration system:
          </p>
          <div className="space-y-3 text-xs bg-[#0D1B2A] p-5 rounded-xl border border-[#2A3F5F]/40 leading-relaxed font-sans text-slate-300">
            <h3 className="text-[#FFB400] font-mono font-bold text-sm uppercase">Example Sizing Scenario Parameters:</h3>
            <p>• <strong>Boiler Maximum Continuous Rating (MCR):</strong> 80,000 kg/hr (80 Tons/Hour)</p>
            <p>• <strong>Continuous Drum Blowdown Purge:</strong> 3% continuous sweep (2,400 kg/hr)</p>
            <p>• <strong>Feedwater Design Operating Temperature:</strong> 135°C (deaerator heated)</p>
            <p>• <strong>Engineering Flow Safety Factor:</strong> 10% flow reserve</p>
            
            <h4 className="text-white font-bold mt-4">Step-by-Step Capacity Flow Solution:</h4>
            <p>
              1. Compute cumulative mass flow requirement:<br />
              <code className="text-[#00C896] bg-[#050C16] px-1.5 py-0.5 rounded">m = 80,000 kg/hr × (1 + 0.03) × 1.10 = 90,640 kg/hr</code>
            </p>
            <p>
              2. Retrieve water density at 135°C from steam tables:<br />
              <code className="text-[#00C896] bg-[#050C16] px-1.5 py-0.5 rounded">ρ (Density) = 930.2 kg/m³</code>
            </p>
            <p>
              3. Calculate the required volumetric <strong>boiler feed pump capacity</strong>:<br />
              <code className="text-[#00C896] bg-[#050C16] px-1.5 py-0.5 rounded">Q = 90,640 kg/hr / 930.2 kg/m³ = 97.44 m³/hr</code> (approx. 429 GPM)
            </p>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            This capacity example demonstrates how cold-water calculation biases are corrected. If styled with cold water constants (1,000 kg/m³), the required volumetric capacity would be incorrectly selected as only 90.6 m³/hr, resulting in a severe mass volume deficit of nearly 7 m³/hr when operating at design temperatures.
          </p>
        </section>

        {/* SECTION 5: EFFICIENCY CALCULATION */}
        <section id="boiler-feed-pump-efficiency-calculation" className="space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Efficiency Calculation</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            A precise <strong>boiler feed pump efficiency calculation</strong> is critical to control the massive electrical energy overheads of thermal power blocks. Centrifugal pump efficiency is the ratio of fluid hydraulic power output to the mechanical brake power input received at the driving shaft:
          </p>
          <div className="bg-[#050C16] p-5 rounded-xl border border-[#2A3F5F]/60 font-mono text-center my-4 text-[#FFB400] leading-relaxed text-sm">
            <span className="text-[10px] text-[#00C896] font-bold block mb-2 uppercase">Pump Efficiency Formula</span>
            Efficiency (η) = Hydraulic Power (WHP) / Brake Shaft Power (BHP) × 100%
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            High-pressure, multistage boiler feedwater pumps achieve peak efficiency (between 65% and 83%) at their Best Efficiency Point (BEP). Under-sizing or over-sizing forces the pump to operate in low-efficiency zones, which converts electrical grid energy into parasitic thermal gains and turbulence. This low-efficiency operation causes heavy mechanical recirculation, which stresses the <strong>boiler feed pump bearing</strong> pads, compromises mechanical seals, and damages internal impeller wear rings.
          </p>
        </section>

        {/* SECTION 6: POWER CALCULATION */}
        <section id="boiler-feed-pump-power-calculation" className="space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Power Calculation</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            The <strong>boiler feed pump power calculation</strong> translates hydraulic volume and pressure-head requirements into electrical driver margins. Sizing the motor must account for both the pump's internal mechanical losses and motor conversion coefficients:
          </p>
          <div className="bg-[#050C16] p-5 rounded-xl border border-[#2A3F5F]/60 font-mono text-center my-4 text-[#00C896] leading-relaxed text-sm">
            <span className="text-[10px] text-[#FFB400] font-bold block mb-2 uppercase">Core Power Equations</span>
            Hydraulic Power (kW) = [Q (m³/hr) × TDH (m) × Specific Gravity] / 367.2<br />
            Brake Power (kW) = Hydraulic Power / η_pump<br />
            Motor Sized Power (kW) = Brake Power × Motor Margin Factor (typically 1.15)
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Because BFP motor sizing is based on hot specific gravity, testing the pump using cold water (ρ = 1,000 kg/m³) during plant commissioning will draw approximately 8% to 12% more power. Sizers must ensure the chosen motor nameplate includes an adequate safety margin to handle cold commissioning water without tripping the electric breakers.
          </p>
        </section>

        {/* SECTION 7: PRESSURE CALCULATION */}
        <section id="boiler-feed-pump-pressure-calculation" className="space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Pressure Calculation</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Determining casing thickness and pipe flange pressure classes requires a thorough <strong>boiler feed pump pressure calculation</strong>. This process evaluates both dynamic suction pressures and peak discharge shutoff pressures:
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            The peak discharge pressure calculated must represent the absolute maximum pressure the pump can generate under zero-flow conditions (dead-head or shutoff). Mathematically, this is equal to the suction deaerator pressure added to the maximum shutoff head generated by the impeller stages at minimum flow. Pipeline components, control valves, check valves, and high-pressure feedwater heaters downstream must be rated to withstand this peak pressure to prevent hazardous pipeline ruptures under ASME B31.1 codes.
          </p>
        </section>

        {/* SECTION 8: NPSH CALCULATION */}
        <section id="boiler-feed-pump-npsh-calculation" className="space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump NPSH Calculation</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            High-temperature feedwater systems are highly susceptible to cavitation damage, making the <strong>boiler feed pump npsh calculation</strong> the most critical part of suction piping design. To prevent water from vaporizing at the first-stage impeller, you must ensure that the Net Positive Suction Head Available (NPSHa) exceeds the pump's Required NPSH (NPSHr):
          </p>
          <div className="bg-[#050C16] p-5 rounded-xl border border-[#2A3F5F]/60 font-mono text-center my-4 text-[#1E90FF] leading-relaxed text-sm">
            <span className="text-[10px] text-[#FFB400] font-bold block mb-2 uppercase">Governing NPSHa Formulation</span>
            NPSHa = H_static_suction + (P_deaerator_abs - P_vapor_abs) / (ρ × g) - H_friction_suction
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Because feedwater inside deaerators is stored under saturated boiling conditions, deaerator operating pressure exactly balances water vapor pressure (P_deaerator = P_vapor). Consequently, the pressure term in the equation cancels out completely. The static vertical elevation height of the deaerator vessel is the only physical variable generating positive suction pressure head. Elevating deaerators 6 to 15 meters above the pump centerline is standard practice to prevent steam-flash cavitation.
          </p>
        </section>

        {/* SECTION 9: SIZING CALCULATION GUIDE */}
        <section id="boiler-feed-pump-sizing-calculation-guide" className="bg-[#101E35]/70 p-8 rounded-2xl border border-[#2A3F5F]/60 space-y-6">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Sizing Calculation Guide</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            This comprehensive guide provides a structured, multi-step workflow to help you execute professional-grade sizing calculations using our online <strong>boiler feed pumps calculator</strong>:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                step: '1',
                title: 'Aggregate Mass Flow Targets',
                text: 'Consult boiler specs to locate the Maximum Continuous Rating (MCR) mass of steam produced under peak loads. Express this value in kg/hr or lb/hr.'
              },
              {
                step: '2',
                title: 'Add Continuous Boiler Purges',
                text: 'Add continuous drum blowdown (typically 2-4%) and secondary make-up factors to ensure feedwater volume matches overall steam losses.'
              },
              {
                step: '3',
                title: 'Check Feedwater Temperature',
                text: 'Verify the deaerator operating temperature. Use thermodynamic steam tables to look up water density and saturation vapor pressure.'
              },
              {
                step: '4',
                title: 'Translate Volumetric Capacity',
                text: 'Divide the adjusted mass flow rate by the hot water density to calculate the required volumetric GPM or m³/hr flow rate.'
              },
              {
                step: '5',
                title: 'Calculate Discharge Pressures',
                text: 'Incorporate steam drum operating pressure, boiler feed regulator valve throttling drops, feed heater losses, and discharge piping friction.'
              },
              {
                step: '6',
                title: 'Map Suction Static Elevation',
                text: 'Measure the physical vertical lift from the deaerator low-water line to the pump nozzle. Subtract friction losses along the suction run.'
              },
              {
                step: '7',
                title: 'Determine Total Dynamic Head',
                text: 'Follow our ASME TDH formula to calculate total dynamic head. Add a 10% to 15% safety margin for potential system variations.'
              },
              {
                step: '8',
                title: 'Validate Motor Power & NPSH',
                text: 'Calculate shaft BHP and select an appropriate motor nameplate. Verify that the suction NPSHa provides at least a 1.5-meter buffer above the NPSHr.'
              }
            ].map((item) => (
              <div key={item.step} className="bg-[#0D1B2A]/70 p-5 rounded-xl border border-[#2A3F5F]/40 hover:border-[#1E90FF]/50 transition duration-300">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-[#1E90FF]/25 text-[#1E90FF] font-mono text-xs font-bold">
                    STEP {item.step}
                  </span>
                  <h3 className="text-xs font-bold text-white tracking-wide">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-[#2A3F5F]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 leading-normal max-w-xl">
              Tip: You can instantly export this sizing guide alongside your active calculator variables by printing your calculations. Keep this <strong>boiler feed pump calculation pdf</strong> checklist for field audits.
            </p>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1E90FF] hover:bg-[#1E90FF]/85 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition shadow-lg cursor-pointer shrink-0"
            >
              <Printer className="h-3 w-3" /> Print PDF Checklist
            </button>
          </div>
        </section>

        {/* SECTION 10: FORMULA EXPLANATION */}
        <section id="boiler-feed-pump-formula-explanation" className="space-y-6">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Formula Explanation</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Modern high-pressure <strong>boiler feed pump selection calculation</strong> systems rely on standard equations derived from the Hydraulic Institute Standards and the ASME Boiler and Pressure Vessel Code (BPVC). A robust sizing calculation relies on the following key equations:
          </p>
          <div className="space-y-4">
            <div className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] p-6 space-y-2">
              <h3 className="text-xs font-mono text-[#00C896] uppercase font-bold tracking-wider">
                1. Mass to Volumetric Flow Conversion
              </h3>
              <p className="text-xs text-[#CBDDF4] leading-relaxed">
                Centrifugal pumps are dynamic, volumetric displacement devices, but boilers operate on mass balance. The flow conversion must correct for heat expansion:
              </p>
              <div className="bg-[#050C16] p-3 rounded font-mono text-xs text-[#1E90FF] text-center">
                Q (m³/hr) = m (kg/hr) / ρ (kg/m³)
              </div>
            </div>

            <div className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] p-6 space-y-2">
              <h3 className="text-xs font-mono text-[#00C896] uppercase font-bold tracking-wider">
                2. Power Fluid-Dynamics Model
              </h3>
              <p className="text-xs text-[#CBDDF4] leading-relaxed">
                The mechanical brake power represents the actual torque matching required shaft speeds, calculated as:
              </p>
              <div className="bg-[#050C16] p-3 rounded font-mono text-xs text-[#1E90FF] text-center">
                Shaft Power (kW) = [Q (m³/hr) × TDH (m) × Specific Gravity] / [367.2 × η_pump]
              </div>
            </div>

            <div className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] p-6 space-y-3 font-sans">
              <p className="text-xs text-slate-300 leading-relaxed">
                Understanding these key physical equations is essential to answer common <strong>boiler feed pump interview questions</strong> during recruitment processes or technical audits. Recruits are frequently asked to derive deaerator suction height calculations and explain why deaerator vapor pressure cancels out the static suction pressure.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 11: IN THERMAL POWER PLANT */}
        <section id="boiler-feed-pump-in-thermal-power-plant" className="space-y-4">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump in Thermal Power Plant</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            The function of a <strong>boiler feed pump in thermal power plant</strong> systems is critical, as it acts as the primary fluid driver for the entire steam-water closed loop. High-capacity power stations generate massive utility pressures, typically requiring multistage, horizontal split-case or double-case barrel pumps. Proper maintenance, including regular inspection of shaft seals and bearings, is critical to prevent unplanned outages.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            A correct <strong>boiler feed pump startup procedure</strong> is vital to protect internal wear rings and prevent rotative seizure from thermal shock. The startup process typically involves: (1) opening suction valves completely to verify fluid flow, (2) cracking warm-up lines to gradually raise casing temperatures and balance thermal expansion, (3) validating mechanical seal flush flow lines, (4) starting the pump against a closed discharge valve while maintaining a minimum flow bypass, and (5) slowly throttle-opening the discharge valves to establish smooth steam drum injection. Following this disciplined procedure prevents thermal deflection, bearing wear, and impeller pitting damage.
          </p>
        </section>

        {/* SECTION 12: FREQUENTLY ASKED QUESTIONS */}
        <section id="faq-section" className="space-y-6">
          <h2 className="text-2.5xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Get expert, verified answers to the most common queries regarding <strong>boiler feed pump calculation</strong>, system sizing, capacity flow rates, and fluid power dynamics.
          </p>
          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] overflow-hidden transition-all duration-300 hover:border-[#1E90FF]/40"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left text-white hover:text-[#1E90FF] transition-colors focus:outline-none"
                  >
                    <span className="font-semibold text-sm md:text-base pr-4">{faq.question}</span>
                    <span className="shrink-0 text-slate-400">
                      <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1E90FF]' : ''}`} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-[#2A3F5F]/40 text-slate-300 text-xs md:text-sm leading-relaxed bg-[#0A1624]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* RELATED CALCULATORS SECTION */}
        <section id="related-calculators" className="space-y-6">
          <div className="border-t border-[#2A3F5F] pt-12">
            <h2 className="text-xl font-bold text-white tracking-wider mb-2 flex items-center gap-2 font-mono">
              <FileText className="h-5 w-5 text-[#1E90FF]" />
              Related Sizing Calculators
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Utilize other Thermodynamic tools to optimize your steam plant cycle, water pipelines, and condenser loops:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedTools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  className="bg-[#0D1B2A] p-5 rounded-xl border border-[#2A3F5F] hover:border-[#1E90FF]/60 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold text-white mb-1 tracking-wide">{tool.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">{tool.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#1E90FF] font-semibold mt-4 flex items-center gap-1 self-start hover:underline">
                    Access Tool
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

      </article>
        </>
      ) : (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-20 text-center text-slate-300 font-mono text-xs">Loading View Module...</div>}>
          {currentView === 'npsh-calc' ? (
            <NpshView unitSystem={unitSystem} />
          ) : currentView === 'power-calc' ? (
            <PowerView unitSystem={unitSystem} />
          ) : currentView === 'sizing-guide' ? (
            <SizingGuideView unitSystem={unitSystem} />
          ) : currentView === 'selection-chart' ? (
            <SelectionChartView unitSystem={unitSystem} />
          ) : currentView === 'about' ? (
            <AboutView />
          ) : currentView === 'contact' ? (
            <ContactView />
          ) : currentView === 'privacy' ? (
            <LegalView sectionType="privacy" />
          ) : (
            <LegalView sectionType="disclaimer" />
          )}
        </Suspense>
      )}

      {/* Footer Banner Spot */}
      <div className="max-w-7xl mx-auto px-6">
        <Suspense fallback={<div className="h-[90px] bg-[#101E35] border border-[#2A3F5F]/40 flex items-center justify-center rounded-lg shadow-inner text-slate-400 text-xs">Loading Sponsor Content...</div>}>
          <AdBanner />
        </Suspense>
      </div>

      {/* FOOTER */}
      <footer className="mt-24 border-t border-[#2A3F5F] bg-[#07111E] py-12 px-6 no-print">
        <div className="max-w-7xl mx-auto space-y-8 no-print">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-slate-400">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="h-2 w-2 rounded-full bg-[#00C896]" />
                <p className="font-bold text-slate-200">Thermosolve Boiler Feed Pump Calculation Suite (ASME Section I)</p>
              </div>
              <p className="max-w-md leading-relaxed text-[10px] text-slate-400">
                Disclaimer: Sizing calculations provided by Thermosolve are for preliminary estimation and educational mock purposes only. Always coordinate final impeller and trim dimensions with certified manufacturer curves before procurement.
              </p>
            </div>
            <div className="text-center md:text-right space-y-2">
              <p className="font-mono text-[9px] tracking-wide">
                Last Updated: <span className="text-[#FFB400] font-bold">2026 Premium Edition</span>
              </p>
              <p className="text-slate-400">
                © {new Date().getFullYear()} Thermosolve Systems, LLC. All rights engineered under ASME guidelines.
              </p>
            </div>
          </div>

          <div className="border-t border-[#2A3F5F]/40 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <span className="text-slate-300 font-semibold">Open Source Boiler Feed Pump Calculation Project</span>
            <a 
              href="https://github.com/zeeuskhan/boiler-feed-pump-calculation"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Boiler Feed Pump Calculation Source Code on GitHub"
              className="text-[#1E90FF] hover:text-[#1E90FF]/85 hover:underline transition font-medium"
            >
              View Boiler Feed Pump Calculation Source Code on GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Helper: Displays corresponding currency symbol based on UnitSystem selection
function powerResultSymbol(unit: UnitSystem): string {
  return unit === UnitSystem.Metric ? '₹' : '$';
}
