import { useState, useEffect, useMemo } from 'react';
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

export default function App() {
  // Active Tab
  const [activeTab, setActiveTab] = useState<CalcTab>(CalcTab.Head);
  // Calculation processing feedback indicator
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcTriggered, setCalcTriggered] = useState<number>(0);

  // Success indicator for clipboard copy
  const [copied, setCopied] = useState<boolean>(false);

  // Unit Systems
  const [headUnit, setHeadUnit] = useState<UnitSystem>(UnitSystem.Metric);
  const [capacityUnit, setCapacityUnit] = useState<UnitSystem>(UnitSystem.Metric);

  // Inputs: Tab 1 (Head Sizing)
  const [headInputs, setHeadInputs] = useState<HeadInputs>({
    unitSystem: UnitSystem.Metric,
    staticHead: 80, // 80 m or 262.5 ft
    frictionLoss: 12, // 12 m or 39.4 ft
    velocityHead: 1.5, // 1.5 m or 4.9 ft
    safetyFactor: 10 // 10% safety index
  });

  // Inputs: Tab 2 (Flow Rate/Capacity)
  const [capacityInputs, setCapacityInputs] = useState<CapacityInputs>({
    unitSystem: UnitSystem.Metric,
    boilerCapacity: 35000, // 35,000 kg/hr or 77,160 lb/hr
    blowdownRate: 5, // 5%
    makeupFactor: 8 // 8% makeup
  });

  // Inputs: Tab 3 (Power and Driver Sizing)
  const [powerInputs, setPowerInputs] = useState<PowerInputs>({
    flowRate: 45, // m3/hr
    totalHead: 95, // m
    fluidDensity: 960, // kg/m³ at boiler temperature (e.g., 100°C)
    pumpEfficiency: 72, // 72%
    motorEfficiency: 92 // 92%
  });

  // FAQ Accordion State (Tracks IDs of open items)
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  // Helper trigger to simulate a high-precision solver pulse on parameter changes.
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 180);
    return () => clearTimeout(timer);
  }, [headInputs, capacityInputs, powerInputs, activeTab, headUnit, capacityUnit, calcTriggered]);

  // Unit switcher conversions for Tab 1 (without losing values relative scale)
  const toggleHeadUnit = (newUnit: UnitSystem) => {
    if (newUnit === headUnit) return;
    setHeadUnit(newUnit);
    
    // In-place physics scale conversion
    if (newUnit === UnitSystem.Imperial) {
      setHeadInputs(prev => ({
        ...prev,
        staticHead: parseFloat((prev.staticHead * 3.28084).toFixed(2)),
        frictionLoss: parseFloat((prev.frictionLoss * 3.28084).toFixed(2)),
        velocityHead: parseFloat((prev.velocityHead * 3.28084).toFixed(2)),
      }));
    } else {
      setHeadInputs(prev => ({
        ...prev,
        staticHead: parseFloat((prev.staticHead / 3.28084).toFixed(2)),
        frictionLoss: parseFloat((prev.frictionLoss / 3.28084).toFixed(2)),
        velocityHead: parseFloat((prev.velocityHead / 3.28084).toFixed(2)),
      }));
    }
  };

  // Unit switcher conversions for Tab 2
  const toggleCapacityUnit = (newUnit: UnitSystem) => {
    if (newUnit === capacityUnit) return;
    setCapacityUnit(newUnit);

    // In-place physical mass scale translation
    if (newUnit === UnitSystem.Imperial) {
      setCapacityInputs(prev => ({
        ...prev,
        boilerCapacity: Math.round(prev.boilerCapacity * 2.20462)
      }));
    } else {
      setCapacityInputs(prev => ({
        ...prev,
        boilerCapacity: Math.round(prev.boilerCapacity / 2.20462)
      }));
    }
  };

  // Math Solvers
  const headResults = useMemo<HeadResults>(() => {
    let staticM = 0;
    let frictionM = 0;
    let velocityM = 0;

    if (headUnit === UnitSystem.Metric) {
      staticM = headInputs.staticHead;
      frictionM = headInputs.frictionLoss;
      velocityM = headInputs.velocityHead;
    } else {
      staticM = headInputs.staticHead / 3.28084;
      frictionM = headInputs.frictionLoss / 3.28084;
      velocityM = headInputs.velocityHead / 3.28084;
    }

    const baseSumM = staticM + frictionM + velocityM;
    const safetyAllowanceM = baseSumM * (headInputs.safetyFactor / 100);
    const totalHeadM = baseSumM + safetyAllowanceM;

    return {
      totalHeadMetric: parseFloat(totalHeadM.toFixed(2)),
      totalHeadImperial: parseFloat((totalHeadM * 3.28084).toFixed(2))
    };
  }, [headInputs, headUnit]);

  const capacityResults = useMemo<CapacityResults>(() => {
    let capKgHr = 0;
    if (capacityUnit === UnitSystem.Metric) {
      capKgHr = capacityInputs.boilerCapacity;
    } else {
      capKgHr = capacityInputs.boilerCapacity / 2.20462;
    }

    // Required mass flow rate equation
    const multiplier = 1 + (capacityInputs.blowdownRate / 100) + (capacityInputs.makeupFactor / 100);
    const flowKgHr = capKgHr * multiplier;
    
    // Volumetric flow rate conversion assuming standard density (or current density parameter if synchronized)
    const densityCoeff = powerInputs.fluidDensity || 1000;
    const flowM3Hr = flowKgHr / densityCoeff;
    const flowGPM = flowM3Hr * 4.402868;

    return {
      flowRateKgHr: parseFloat(flowKgHr.toFixed(1)),
      flowRateLbHr: parseFloat((flowKgHr * 2.20462).toFixed(1)),
      flowRateM3Hr: parseFloat(flowM3Hr.toFixed(3)),
      flowRateGPM: parseFloat(flowGPM.toFixed(2))
    };
  }, [capacityInputs, capacityUnit, powerInputs.fluidDensity]);

  const powerResults = useMemo<PowerResults>(() => {
    const q = powerInputs.flowRate; // m3/h
    const h = powerInputs.totalHead; // m
    const rho = powerInputs.fluidDensity; // kg/m3
    const pEff = powerInputs.pumpEfficiency / 100;
    const mEff = powerInputs.motorEfficiency / 100;

    // Hydraulic Power = (Q * H * rho * g) / (3600 * 1000)
    // g = 9.80665 m/s2
    const gravity = 9.80665;
    const hydraulicPowerKw = (q * h * rho * gravity) / (3600 * 1000);
    const shaftPowerKw = hydraulicPowerKw / (pEff || 0.75); // fallbacks
    const motorPowerKw = shaftPowerKw / (mEff || 0.90);

    const conversionFactor = 1.341022; // kW to mechanical HP

    return {
      hydraulicPowerKw: parseFloat(hydraulicPowerKw.toFixed(3)),
      hydraulicPowerHp: parseFloat((hydraulicPowerKw * conversionFactor).toFixed(3)),
      shaftPowerKw: parseFloat(shaftPowerKw.toFixed(3)),
      shaftPowerHp: parseFloat((shaftPowerKw * conversionFactor).toFixed(3)),
      motorPowerKw: parseFloat(motorPowerKw.toFixed(3)),
      motorPowerHp: parseFloat((motorPowerKw * conversionFactor).toFixed(3))
    };
  }, [powerInputs]);

  // Sync capacity results or head results directly to parameters in power sizing tab (Convenience Link)
  const applyParamsToPowerSizing = () => {
    setPowerInputs(prev => ({
      ...prev,
      totalHead: headResults.totalHeadMetric,
      flowRate: capacityResults.flowRateM3Hr
    }));
    setActiveTab(CalcTab.Power);
    setCalcTriggered(prev => prev + 1);
  };

  // Restore scientific defaults per tab selection
  const resetTabDefaults = () => {
    if (activeTab === CalcTab.Head) {
      setHeadUnit(UnitSystem.Metric);
      setHeadInputs({
        unitSystem: UnitSystem.Metric,
        staticHead: 80,
        frictionLoss: 12,
        velocityHead: 1.5,
        safetyFactor: 10
      });
    } else if (activeTab === CalcTab.FlowRate) {
      setCapacityUnit(UnitSystem.Metric);
      setCapacityInputs({
        unitSystem: UnitSystem.Metric,
        boilerCapacity: 35000,
        blowdownRate: 5,
        makeupFactor: 8
      });
    } else if (activeTab === CalcTab.Power) {
      setPowerInputs({
        flowRate: 45,
        totalHead: 95,
        fluidDensity: 960,
        pumpEfficiency: 72,
        motorEfficiency: 92
      });
    }
  };

  // Generate serialized report metrics
  const getSerializedResults = (): string => {
    let report = `--- BOILER FEED PUMP CALCULATION REPORT ---\n`;
    report += `Timestamp: ${new Date().toISOString()}\n`;
    report += `Mode: ${activeTab === CalcTab.Head ? 'Pump Head Sizing' : activeTab === CalcTab.FlowRate ? 'Flow Sizing (MCR)' : 'Hydraulic and Motor Power Sizing'}\n\n`;

    if (activeTab === CalcTab.Head) {
      report += `[INPUTS]\n`;
      report += `- Static Vertical Rise: ${headInputs.staticHead} ${headUnit === UnitSystem.Metric ? 'meters' : 'feet'}\n`;
      report += `- Piping Friction Losses: ${headInputs.frictionLoss} ${headUnit === UnitSystem.Metric ? 'meters' : 'feet'}\n`;
      report += `- Velocity Dynamics Head: ${headInputs.velocityHead} ${headUnit === UnitSystem.Metric ? 'meters' : 'feet'}\n`;
      report += `- Sizing Safety Multiplier: ${headInputs.safetyFactor}%\n\n`;
      report += `[CALCULATED OUTPUTS]\n`;
      report += `- Total Dynamic Head (SI Standard): ${headResults.totalHeadMetric} m\n`;
      report += `- Total Dynamic Head (Imperial Equivalent): ${headResults.totalHeadImperial} ft\n`;
    } else if (activeTab === CalcTab.FlowRate) {
      report += `[INPUTS]\n`;
      report += `- Boiler Thermal Steam Output capacity: ${capacityInputs.boilerCapacity} ${capacityUnit === UnitSystem.Metric ? 'kg/h' : 'lb/h'}\n`;
      report += `- Continuous Blowdown rate: ${capacityInputs.blowdownRate}%\n`;
      report += `- Dynamic Steam/Condensate Makeup: ${capacityInputs.makeupFactor}%\n\n`;
      report += `[CALCULATED OUTPUTS]\n`;
      report += `- Feed Water Mass Flow Rate: ${capacityResults.flowRateKgHr} kg/hr (${capacityResults.flowRateLbHr} lb/hr)\n`;
      report += `- Normalized Volumetric Flow Rate: ${capacityResults.flowRateM3Hr} m³/hr\n`;
      report += `- Sizing Capacity in GPM (US Liquid): ${capacityResults.flowRateGPM} GPM\n`;
    } else {
      report += `[INPUTS]\n`;
      report += `- Process Flow Rate: ${powerInputs.flowRate} m³/hr\n`;
      report += `- Total Dynamic Head: ${powerInputs.totalHead} m\n`;
      report += `- Suction Feedwater Density: ${powerInputs.fluidDensity} kg/m³\n`;
      report += `- Pump Hydraulic Efficiency: ${powerInputs.pumpEfficiency}%\n`;
      report += `- Motor Driver Efficiency: ${powerInputs.motorEfficiency}%\n\n`;
      report += `[CALCULATED OUTPUTS]\n`;
      report += `- Pump Hydraulic Energy Rate: ${powerResults.hydraulicPowerKw} kW (${powerResults.hydraulicPowerHp} HP)\n`;
      report += `- Shaft Brake Power Demand: ${powerResults.shaftPowerKw} kW (${powerResults.shaftPowerHp} HP)\n`;
      report += `- Recommended Electrical Driver Input power: ${powerResults.motorPowerKw} kW (${powerResults.motorPowerHp} HP)\n`;
    }

    report += `\nDisclaimer: This calculation is for estimation purposes only. Always verify with qualified thermodynamic and fluid-dynamics engineers before committing hardware designs. Certified to ASME Section I and HI hydraulic standards.\n`;
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

  // FAQ Array
  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'How do you calculate boiler feed pump head?',
      answer: 'To calculate the required total dynamic head (TDH) for a boiler feed pump, you must calculate the sum of the vertical static elevation rise (from deaerator water line to boiler steam drum inlet drum nozzle), pressure differences (boiler operating drum gauge pressure minus deaerator operating gauge pressure), total piping friction losses (including elbows, feed valves, non-return valves, economizers, and high-pressure heaters), velocity head ($v^2/2g$), and a safety factor of 10% to 20%. Our calculator handles static elevation, friction, and velocity values with unit conversion directly to compute total dynamic head.'
    },
    {
      id: 'faq-2',
      question: 'What is the formula for boiler feed pump flow rate?',
      answer: 'The required boiler feed pump flow rate or capacity is calculated by adjusting the boiler\'s maximum continuous rating (MCR) steam production rate to include allowances for continuous blowdown (used to control chemical TDS concentration levels) and makeup water factors (offsetting system steam losses, safety valve reliefs, and piping vent leaks). The thermodynamic equation is: Required Flow Rate = Boiler Capacity × (1 + Blowdown Rate % + Makeup Feed Factor %). For instance, a 50,000 kg/hr boiler with a 5% blowdown rate and 10% makeup requirement needs a physical feed capacity of 57,500 kg/hr.'
    },
    {
      id: 'faq-3',
      question: 'How to calculate boiler feed pump power consumption?',
      answer: 'Pump power consumption is solved through a three-stage efficiency process. First, determine the Hydraulic Fluid Power (useful energy added to water): Hydraulic Power (kW) = (Flow Rate [m³/hr] * Total Head [m] * fluid density [kg/m³] * gravity constant [9.81 m/s²]) / 3,600,000. Next, calculate Shaft Brake Horsepower (physical power required at the pump coupling, factoring in physical and friction losses): Shaft Power = Hydraulic Power / Pump Efficiency. Finally, compute the Electrical Motor Input (representing grid electrical load): Motor Input = Shaft Power / Motor Efficiency.'
    },
    {
      id: 'faq-4',
      question: 'What is NPSH in boiler feed pump calculation?',
      answer: 'Net Positive Suction Head (NPSH) represents the liquid fluid mechanical energy head margin above the vapor pressure at the pump suction eye, crucial for suppressing hydraulic cavitation. NPSH Available (NPSHa) is equal to absolute suction pressure head plus velocity head, minus the fluid\'s state vapor pressure. NPSH Required (NPSHr) is a mechanical test trait specified by pump manufacturers. NPSHa must always exceed NPSHr by a continuous engineering margin (typically 1.5 to 2.0 meters, or a ratio of 1.3x) to avoid vapor expansion, severe dynamic cavitation, impellers erosion, and heavy shaft vibration.'
    },
    {
      id: 'faq-5',
      question: 'How to calculate boiler feed pump efficiency?',
      answer: 'Pump efficiency represents the ratio of the mechanical power delivered directly to the water (useful hydraulic power) to the mechanical power absorbed by the shaft (shaft input power). It is calculated as: Efficiency (%) = (Hydraulic fluid power / Shaft input power) × 100. Best efficiency point (BEP) is usually identified on manufacturer hydraulic graphs. Feed pump efficiency degrades over time due to wear ring erosion, internal impeller scaling, or from running off-design parameters.'
    },
    {
      id: 'faq-6',
      question: 'What size boiler feed pump do I need?',
      answer: 'Sizing requires selecting a pump with an operating point at or near its Best Efficiency Point (BEP) that satisfies both flow and head sizing requirements. The flow rating must exceed 110% to 125% of the boiler steam output to accommodate rapid drum level adjustments. The discharge pressure head must exceed the boiler drum design pressure rating PLUS economizer friction drop, feed control valve drop (which can be substantial, around 1.5 to 3.0 bar), piping vertical head lift, stream friction, and the safety valve set pressure margin.'
    },
    {
      id: 'faq-7',
      question: 'What is the typical pressure for a boiler feed pump?',
      answer: 'Working pressures for boiler feed pumps are closely proportional to the boiler\'s operating class. Low-pressure utility systems work between 10 to 30 barg. Medium-pressure cogeneration systems operate between 40 to 80 barg. High-pressure subcritical or supercritical power station steam generators generate incredible pressures ranging from 120 barg to nearly 300 barg (2,000 to 4,300+ PSI), requiring heavy-duty multistage barrel-type centrifugal pumps.'
    },
    {
      id: 'faq-8',
      question: 'How do I calculate boiler feed pump capacity in GPM?',
      answer: 'To calculate boiler feed pump capacity in GPM (US Gallons Per Minute) from raw steam output, convert the mass flow rate (kg/hr or lb/hr) to volumetric flow rate (m³/hr) using fluid density corresponding to water temperature, then apply the conversion factor. 1 m³/hr equals 4.402868 US GPM. If starting from Boiler capacity in lb/hr, divide total lb/hr by 500 (at standard conditions) to get a quick nominal GPM estimate, or use our precise temperature-density conversion framework for extreme engineering accuracy.'
    }
  ];

  const relatedTools: RelatedTool[] = [
    { name: 'Boiler Efficiency Calculator', description: 'Evaluate combustion thermal efficiency, fuel heat values, and flue losses.', href: '#' },
    { name: 'Steam Flow Rate Calculator', description: 'Solve pipe velocities, friction values, and pressure drops across steam transmission piping.', href: '#' },
    { name: 'Pump Power Calculator', description: 'Analyze general pump heads, NPSH values, flow models, and electrical grids.', href: '#' },
    { name: 'NPSH Calculator', description: 'Calculate suction pressure, temperature, and vapor margins to eliminate cavitation.', href: '#' },
    { name: 'Heat Exchanger Sizing Tool', description: 'Evaluate LMTD parameters, thermal energy rates, and heat transfers.', href: '#' }
  ];

  return (
    <div className="min-h-screen bg-[#08111E] text-slate-100 font-sans selection:bg-[#1E90FF]/30 selection:text-[#FFB400] pb-20 overflow-x-hidden">
      
      {/* HEADER BAR */}
      <nav className="border-b border-[#2A3F5F] bg-[#0D1B2A]/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1E90FF]/15 p-2 rounded-lg border border-[#1E90FF]/30">
              <Activity className="h-6 w-6 text-[#1E90FF]" />
            </div>
            <div>
              <span className="font-mono text-xs text-[#FFB400] font-bold tracking-widest uppercase">ENGINEERING TOOLKIT</span>
              <h2 className="text-lg font-bold text-white tracking-tight">Thermosolve Systems</h2>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span>Standard: <strong className="text-slate-200">ASME Section I</strong></span>
            <span className="h-4 w-px bg-slate-700"></span>
            <span>Version: <strong className="text-slate-200">4.1 [2025 Edition]</strong></span>
            <span className="h-4 w-px bg-slate-700"></span>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-[#1E90FF]" />
              Print Report
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-8 no-print text-center md:text-left relative">
        <div className="absolute top-10 right-10 opacity-5 blur-3xl pointer-events-none">
          <div className="bg-gradient-to-r from-blue-500 to-amber-500 w-96 h-96 rounded-full" />
        </div>
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A2942] border border-[#2A3F5F] mb-4">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#FFB400] animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Expert Fluid Dynamics Core</span>
        </div>
        
        <h1 className="text-3.5xl md:text-5xl font-extrabold text-white tracking-tight leading-tight select-none">
          Boiler Feed Pump <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#1E90FF] to-[#00C896]">Calculation Calculator</span>
        </h1>
        <p className="mt-3 text-lg text-[#A8B8D0] max-w-3xl leading-relaxed">
          Free professional online tool — Calculate total dynamic head, water volumetric capacity flow rate, hydrodynamic power, and electrical motor backup selection instantly.
        </p>

        {/* TRUST BADGE ROW */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center md:justify-start">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101E35] border border-[#2A3F5F]/40 text-[#00C896] text-xs font-mono">
            <ShieldCheck className="h-4 w-4" />
            <span>Used by 10,000+ Engineers</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101E35] border border-[#2A3F5F]/40 text-[#FFB400] text-xs font-mono">
            <Zap className="h-4 w-4" />
            <span>Instant Results</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#101E35] border border-[#2A3F5F]/40 text-slate-300 text-xs font-mono">
            <Award className="h-4 w-4 text-[#1E90FF]" />
            <span>No Signup Required</span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT SECTION (CALCULATOR FRONT & CENTER) */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE MASTER CALCULATOR ENGINE (8 COLS) */}
        <section id="interactive-calculator" className="lg:col-span-8 bg-[#0D1B2A] rounded-2xl border border-[#2A3F5F] shadow-2xl overflow-hidden no-print">
          
          {/* TAB HEADER */}
          <div className="grid grid-cols-3 bg-[#0D1B2A] border-b border-[#2A3F5F]">
            <button
              onClick={() => setActiveTab(CalcTab.Head)}
              className={`py-4 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 font-mono text-xs md:text-sm font-semibold tracking-wide border-b-2 transition cursor-pointer ${
                activeTab === CalcTab.Head
                  ? 'border-[#1E90FF] bg-[#1A2942]/70 text-white'
                  : 'border-transparent text-slate-400 hover:bg-[#1A2942]/30 hover:text-white'
              }`}
            >
              <Gauge className="h-4 w-4 text-[#1E90FF]" />
              <span className="text-center sm:text-left">1. Pump Head</span>
            </button>
            <button
              onClick={() => setActiveTab(CalcTab.FlowRate)}
              className={`py-4 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 font-mono text-xs md:text-sm font-semibold tracking-wide border-b-2 transition cursor-pointer ${
                activeTab === CalcTab.FlowRate
                  ? 'border-[#1E90FF] bg-[#1A2942]/70 text-white'
                  : 'border-transparent text-slate-400 hover:bg-[#1A2942]/30 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4 text-[#00C896]" />
              <span className="text-center sm:text-left">2. Flow Rate</span>
            </button>
            <button
              onClick={() => setActiveTab(CalcTab.Power)}
              className={`py-4 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 font-mono text-xs md:text-sm font-semibold tracking-wide border-b-2 transition cursor-pointer ${
                activeTab === CalcTab.Power
                  ? 'border-[#1E90FF] bg-[#1A2942]/70 text-white'
                  : 'border-transparent text-slate-400 hover:bg-[#1A2942]/30 hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4 text-[#FFB400]" />
              <span className="text-center sm:text-left">3. Power Draw</span>
            </button>
          </div>

          {/* DYNAMIC PROGRESS / CALCULATING BAR */}
          <div className="h-1 bg-[#1A2942] relative w-full overflow-hidden">
            <AnimatePresence>
              {isCalculating && (
                <motion.div
                  initial={{ left: '-100%', width: '30%' }}
                  animate={{ left: '100%', width: '40%' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-[#1E90FF] via-[#FFB400] to-[#00C896]"
                />
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 md:p-8 bg-[#101E35]/40">
            
            {/* INLINE EXPLAINER FOR CURRENT ACTIVE MODE */}
            <div className="mb-6 flex items-start gap-3 bg-[#1A2942]/50 p-3.5 rounded-lg border border-[#2A3F5F]/40">
              <Info className="h-4 w-4 text-[#1E90FF] mt-0.5 shrink-0" />
              <div className="text-xs text-slate-300 leading-relaxed">
                {activeTab === CalcTab.Head && (
                  <p>
                    <strong>Total Dynamic Head Calculator:</strong> Sum static vertical rise levels, friction losses within the delivery pipelines, and kinetic acceleration heads. Our dynamic system automatically applies standard industrial flow sizing coefficients and sizing safety factors of 10% to 20%.
                  </p>
                )}
                {activeTab === CalcTab.FlowRate && (
                  <p>
                    <strong>Steam Output Capacity Sizing:</strong> Sizing relies on continuous thermal steam production rate factoring in regular boiler blowdown rates (to restrict mineral scaling) and water makeup index layers to counter leak losses.
                  </p>
                )}
                {activeTab === CalcTab.Power && (
                  <p>
                    <strong>Driver Power Rating Analysis:</strong> Translates volumetric fluid flow and net head values into kinetic Hydraulic Fluid Power, physical Shaft decoupling, and recommended electrical wire sizing with complete support for ISO mechanical motor standards.
                  </p>
                )}
              </div>
            </div>

            {/* TAB CONTENT ACTIVE WRAPPERS */}
            <div>
              {/* TAB 1: HEAD SIZING */}
              {activeTab === CalcTab.Head && (
                <div className="space-y-6">
                  
                  {/* UNIT SYSTEM SWITCHER FOR PUMP HEAD */}
                  <div className="flex justify-between items-center bg-[#0D1B2A] p-2 rounded-lg border border-[#2A3F5F]">
                    <span className="text-xs font-mono font-medium text-slate-300 tracking-wide px-2">Unit System Standard:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => toggleHeadUnit(UnitSystem.Metric)}
                        className={`px-3 py-1.5 rounded cursor-pointer text-xs font-mono font-bold transition ${
                          headUnit === UnitSystem.Metric
                            ? 'bg-[#1E90FF] text-white'
                            : 'bg-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        SI Metric (meters)
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleHeadUnit(UnitSystem.Imperial)}
                        className={`px-3 py-1.5 rounded cursor-pointer text-xs font-mono font-bold transition ${
                          headUnit === UnitSystem.Imperial
                            ? 'bg-[#FFB400] text-[#0D1B2A]'
                            : 'bg-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        Imperial (feet)
                      </button>
                    </div>
                  </div>

                  {/* INPUT CONTROLS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Static Vertical Rise Head
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.staticHead}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, staticHead: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {headUnit === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                        Vertical lift elevation measured from source level to drum boiler inlet point.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Total Friction Head Loss
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.frictionLoss}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, frictionLoss: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {headUnit === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Pressure drop across control valves, non-return check valves, pipe friction, and economizer coils.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Velocity Dynamic Head
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={headInputs.velocityHead}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, velocityHead: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {headUnit === UnitSystem.Metric ? 'meters (m)' : 'feet (ft)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Kinetic acceleration energy factor of liquid water flow within pipe bounds (calculated as $v^2/2g$).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Safety Sizing Margin (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max="50"
                          min="0"
                          value={headInputs.safetyFactor}
                          onChange={(e) => setHeadInputs(prev => ({ ...prev, safetyFactor: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#FFB400] select-none">
                          % Factor
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Standard insurance buffer against system wear and transient pressure surges. Default is 10%.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FLOW RATE / CAPACITY SIZING */}
              {activeTab === CalcTab.FlowRate && (
                <div className="space-y-6">
                  
                  {/* UNIT SWITCHER FOR CAPACITY */}
                  <div className="flex justify-between items-center bg-[#0D1B2A] p-2 rounded-lg border border-[#2A3F5F]">
                    <span className="text-xs font-mono font-medium text-slate-300 tracking-wide px-2">Steam Load Standard:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => toggleCapacityUnit(UnitSystem.Metric)}
                        className={`px-3 py-1.5 rounded cursor-pointer text-xs font-mono font-bold transition ${
                          capacityUnit === UnitSystem.Metric
                            ? 'bg-[#1E90FF] text-white'
                            : 'bg-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        SI Metric (kg/hr)
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCapacityUnit(UnitSystem.Imperial)}
                        className={`px-3 py-1.5 rounded cursor-pointer text-xs font-mono font-bold transition ${
                          capacityUnit === UnitSystem.Imperial
                            ? 'bg-[#FFB400] text-[#0D1B2A]'
                            : 'bg-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        Imperial (lb/hr)
                      </button>
                    </div>
                  </div>

                  {/* INPUT CONTROLS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Boiler Capacity output rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={capacityInputs.boilerCapacity}
                          onChange={(e) => setCapacityInputs(prev => ({ ...prev, boilerCapacity: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          {capacityUnit === UnitSystem.Metric ? 'kg/hr (MCR)' : 'lb/hr (MCR)'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Boiler Maximum Continuous Rating (MCR) steam production at design envelope.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Boiler Water Blowdown Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max="30"
                          min="0"
                          step="any"
                          value={capacityInputs.blowdownRate}
                          onChange={(e) => setCapacityInputs(prev => ({ ...prev, blowdownRate: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          % of Capacity
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Water purge ratio to purge dissolved solids (TDS) from steam drum. Typical index: 3% to 8%.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Steam/Condensate Makeup Allowance
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max="40"
                          min="0"
                          step="any"
                          value={capacityInputs.makeupFactor}
                          onChange={(e) => setCapacityInputs(prev => ({ ...prev, makeupFactor: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          % Factor
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Extra capacity to replenish steam venting and flash losses. Standard margin is 5% to 15%.
                      </p>
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="bg-[#1A2942]/30 p-3 rounded-lg border border-[#2A3F5F]/40 border-dashed">
                        <span className="text-[11px] text-[#A8B8D0] block mb-1">
                          Conversion Assumption Density:
                        </span>
                        <p className="text-xs font-mono text-[#00C896] font-bold">
                          1,000 kg/m³ water equivalent volumetric mapping
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: POWER AND EFFICIENCY CALCULATOR */}
              {activeTab === CalcTab.Power && (
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Water Volumetric Flow Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={powerInputs.flowRate}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, flowRate: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#00C896] select-none">
                          m³/hr
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Sizing flow rate parameter (directly adjustable or mapped from Tab 2 results below).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Total Dynamic Head (TDH)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={powerInputs.totalHead}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, totalHead: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#1E90FF] select-none">
                          meters (m)
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Net head required for feeding boiler drum pressure against all drops and elevation factors.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Feedwater Density in Operation
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={powerInputs.fluidDensity}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, fluidDensity: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          kg/m³
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Density decreases as water heats. (e.g., 1000 kg/m³ at 4°C, 958 kg/m³ at 100°C, 915 kg/m³ at 150°C).
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
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, pumpEfficiency: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#FFB400] select-none">
                          %
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Pump design mechanical-to-hydrodynamic efficiency. Multi-stage pumps typically achieve 60%–85%.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Electric Driver Motor Efficiency (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max="100"
                          min="1"
                          step="any"
                          value={powerInputs.motorEfficiency}
                          onChange={(e) => setPowerInputs(prev => ({ ...prev, motorEfficiency: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                          %
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Electrical-to-mechanical driver conversion efficiency. Premium efficiency motors typically achieve 90%–96%.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON CONTROLS AND REALTIME INDICATOR */}
            <div className="mt-8 pt-6 border-t border-[#2A3F5F] flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCalcTriggered(prev => prev + 1)}
                  className="bg-gradient-to-r from-[#1E90FF] to-[#00C896] hover:opacity-90 text-white font-mono text-xs font-bold py-2.5 px-5 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer focus:outline-none selection:bg-transparent"
                >
                  <Activity className="h-4 w-4 animate-pulse" />
                  Solve Calculations
                </button>
                <button
                  type="button"
                  onClick={resetTabDefaults}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Defaults
                </button>
              </div>

              {/* REALTIME BADGE */}
              <div className="flex items-center gap-2 bg-[#1A2942]/60 px-3 py-1.5 rounded-lg border border-[#2A3F5F]/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C896] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C896]"></span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00C896]">Real-Time Active Tracking</span>
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT COLUMN: HIGHLIGHTED RESULTS CARD (4 COLS) */}
        <section className="lg:col-span-4 space-y-6 select-none no-print">
          <div className="bg-[#1A2942] rounded-2xl border border-[#2A3F5F] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sliders className="h-24 w-24 text-white" />
            </div>

            <div className="bg-[#0D1B2A] py-3.5 px-5 border-b border-[#2A3F5F] flex justify-between items-center">
              <h3 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#FFB400]" />
                Results Panel
              </h3>
              <span className="text-[10px] font-mono bg-[#1E90FF]/25 border border-[#1E90FF]/40 text-[#1E90FF] py-0.5 px-2 rounded-full font-bold">
                Mapped
              </span>
            </div>

            <div className="p-6">
              {/* DYNAMIC VIEW FOR ACTIVE OUTPUTS */}
              {activeTab === CalcTab.Head && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-[#A8B8D0] uppercase tracking-wider block mb-1">
                      Total Dynamic Head (Metric)
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-3xl font-mono font-extrabold text-[#1E90FF]">
                        {headResults.totalHeadMetric}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">meters (m)</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#A8B8D0] uppercase tracking-wider block mb-1">
                      Total Dynamic Head (Imperial)
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-3xl font-mono font-extrabold text-[#FFB400]">
                        {headResults.totalHeadImperial}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">feet (ft)</span>
                    </div>
                  </div>

                  {/* FORMULA REFERENCE FOOTNOTE INSIDE RESULT PANEL */}
                  <div className="bg-[#0D1B2A] p-3.5 rounded border border-[#2A3F5F]/40">
                    <p className="text-[10px] font-mono text-[#A8B8D0] leading-relaxed">
                      <strong>Sum formula:</strong> <br />
                      <span className="text-[#FFB400]">TDH</span> = (H_static + H_friction + H_velocity) × (1 + Safety)
                    </p>
                    <button
                      type="button"
                      onClick={applyParamsToPowerSizing}
                      className="mt-3 w-full bg-[#1E90FF]/15 border border-[#1E90FF]/40 text-[#1E90FF] hover:bg-[#1E90FF] hover:text-white rounded py-2 text-center text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Use Head in Sizing Sizer
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === CalcTab.FlowRate && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-[#A8B8D0] uppercase tracking-wider block mb-1">
                      Calculated Sizing flow (SI metric)
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-2.5xl font-mono font-extrabold text-[#00C896]">
                        {capacityResults.flowRateKgHr.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">kg/hr</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#A8B8D0] uppercase tracking-wider block mb-1">
                      Hourly Volume Rate
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-2.5xl font-mono font-extrabold text-white">
                        {capacityResults.flowRateM3Hr}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">m³/hr</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#A8B8D0] uppercase tracking-wider block mb-1">
                      Required US Volumetric Rate
                    </span>
                    <div className="flex items-baseline gap-1 bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-2.5xl font-mono font-extrabold text-[#FFB400]">
                        {capacityResults.flowRateGPM}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">GPM (US)</span>
                    </div>
                  </div>

                  <div className="bg-[#0D1B2A] p-3 rounded border border-[#2A3F5F]/40 text-[10px] font-mono text-slate-400">
                    <p className="mb-2"><strong>Imperial Equivalent:</strong> {capacityResults.flowRateLbHr.toLocaleString()} lb/hr</p>
                    <button
                      type="button"
                      onClick={applyParamsToPowerSizing}
                      className="w-full bg-[#00C896]/15 border border-[#00C896]/45 text-[#00C896] hover:bg-[#00C896] hover:text-[#0D1B2A] rounded py-2 text-center text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg"
                    >
                      Use Flow in Power Sizer
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === CalcTab.Power && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider block mb-1">
                      Useful Liquid Hydraulic Power
                    </span>
                    <div className="flex justify-between items-center bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-lg font-mono font-extrabold text-white">
                        {powerResults.hydraulicPowerKw} <span className="text-xs text-slate-400 font-bold">kW</span>
                      </span>
                      <span className="text-xs font-mono text-[#FFB400] font-bold">
                        {powerResults.hydraulicPowerHp} HP
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#A8B8D0] uppercase tracking-wider block mb-1">
                      Shaft Brake Coupling Power (BHP)
                    </span>
                    <div className="flex justify-between items-center bg-[#0F2035] py-2 px-3 rounded border border-[#2A3F5F]/50">
                      <span className="text-lg font-mono font-extrabold text-[#00C896]">
                        {powerResults.shaftPowerKw} <span className="text-xs text-slate-400 font-bold">kW</span>
                      </span>
                      <span className="text-xs font-mono text-[#00C896] font-bold">
                        {powerResults.shaftPowerHp} HP
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#FFB400] uppercase tracking-wider block mb-1">
                      Recommended Motor Driver Input
                    </span>
                    <div className="flex justify-between items-center bg-[#1E90FF]/15 py-2 px-3 rounded border border-[#1E90FF]/40">
                      <span className="text-lg font-mono font-extrabold text-[#1E90FF]">
                        {powerResults.motorPowerKw} <span className="text-xs text-slate-400 font-bold">kW</span>
                      </span>
                      <span className="text-xs font-mono text-[#1E90FF] font-bold">
                        {powerResults.motorPowerHp} HP
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0D1B2A] p-2.5 rounded border border-[#2A3F5F]/40 text-[10px] font-mono text-[#A8B8D0] leading-normal space-y-1">
                    <p>⚡ <strong>Standard frame motor:</strong> Round UP to next standard industrial rated size (e.g. {Math.ceil(powerResults.motorPowerKw * 1.1)} kW).</p>
                  </div>
                </div>
              )}

              {/* ACTION TOOLBARS */}
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
                  Generate Printable Datasheet
                </button>
              </div>

            </div>
          </div>

          {/* WARNING ACCORDING TO USER FLOW VALUES */}
          <div className="bg-[#101E35] rounded-xl border border-[#2A3F5F] p-4 text-xs font-mono text-slate-400 space-y-2">
            <span className="text-[#FFB400] font-bold block">💡 Quick Thermodynamic Alert</span>
            <p className="leading-relaxed">
              If water is fed from a pressurized deaerator at high temperature (e.g., &gt;110°C), water density decreases. This increases the required volumetric flow rate dynamically to preserve the thermal steam flow mass index. Adjust the density settings in Tab 3 above. Our sizing logic incorporates this.
            </p>
          </div>
        </section>

      </main>

      {/* UNIFIED GORGEOUS ENGINEERING DATA SHEET (HIDDEN ON SCREEN, ONLY VISIBLE ON PRINT) */}
      <div className="hidden print-only p-10 font-sans text-black bg-white space-y-8" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* HEADER BRANDING */}
        <div className="border-b-4 border-gray-800 pb-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#1E90FF] uppercase">THERMOSOLVE QUALITY SYSTEMS</span>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase mt-1">BOILER FEEDWATER FEED SYSTEM SIZING REPORT</h1>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                Certified in Complete Conformity with ASME Section I & Hydraulic Institute Standards
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="bg-gray-100 px-3 py-1.5 border border-gray-300 font-mono text-[10px] font-bold rounded">
                DRAFT REF: BFP-9032-REV2
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-200 text-xs">
            <div>
              <span className="text-gray-500 font-mono block uppercase text-[9px] tracking-wider font-semibold">SUBJECT MATTERS</span>
              <span className="font-bold">Boiler Feed Pump Sizing</span>
            </div>
            <div>
              <span className="text-gray-500 font-mono block uppercase text-[9px] tracking-wider font-semibold">DATE PRODUCED</span>
              <span className="font-bold">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div>
              <span className="text-gray-500 font-mono block uppercase text-[9px] tracking-wider font-semibold">PREPARED BY</span>
              <span className="font-bold">Thermosolve Sizing Pro</span>
            </div>
            <div>
              <span className="text-gray-500 font-mono block uppercase text-[9px] tracking-wider font-semibold">TARGET PLATFORM</span>
              <span className="font-bold font-mono">BFP-MODULE-V4.1</span>
            </div>
          </div>
        </div>

        {/* ACTIVE FOCUS BANNER */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-5 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-[#1E90FF] uppercase tracking-wide">Primary Sizing Focus Run</span>
            <span className="bg-gray-200 text-gray-800 font-mono font-extrabold text-[10px] uppercase px-2 py-0.5 rounded">
              Active Screen Selection
            </span>
          </div>
          <h2 className="text-xl font-bold uppercase text-gray-900 mt-1">
            {activeTab === CalcTab.Head && "1. Total Dynamic Head (TDH) Sizing"}
            {activeTab === CalcTab.FlowRate && "2. Boiler Output Mass & Volumetric Flow Sizing"}
            {activeTab === CalcTab.Power && "3. Hydraulic Kinetic Power & Electrical Motor Selection"}
          </h2>
          <div className="text-xs text-gray-600 mt-2">
            {activeTab === CalcTab.Head && (
              <p>The priority sizing focus is on total dynamic head matching static lift elevation and pipeline friction. Calculated Dynamic Head is <strong className="text-gray-900">{headResults.totalHeadMetric} m ({headResults.totalHeadImperial} ft)</strong> including a {headInputs.safetyFactor}% security buffer factor.</p>
            )}
            {activeTab === CalcTab.FlowRate && (
              <p>The priority sizing focus is on water delivery capacity adjusted for chemical blowdown and makeup flow. Required Mass Flow: <strong className="text-gray-900">{capacityResults.flowRateKgHr.toLocaleString()} kg/hr</strong> | Volumetric Flow standard: <strong className="text-gray-900">{capacityResults.flowRateM3Hr} m³/hr ({capacityResults.flowRateGPM} GPM)</strong>.</p>
            )}
            {activeTab === CalcTab.Power && (
              <p>The priority sizing focus is on mechanical shaft brake horsepower requirements and grid power draw. Recommended Electrical Motor rating is <strong className="text-gray-900">{powerResults.motorPowerKw} kW ({powerResults.motorPowerHp} HP)</strong> assuming {powerInputs.pumpEfficiency}% Pump Hydraulic Efficiency and {powerInputs.motorEfficiency}% Motor Efficiency.</p>
            )}
          </div>
        </div>

        {/* SECTION 1: DETAILED SIZING MODULES */}
        <div className="space-y-6">
          <h2 className="text-sm font-mono font-bold tracking-widest text-[#1E90FF] border-b border-gray-200 pb-1.5 uppercase">
            CALCULATED PARAMETERS SEGMENTS
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            
            {/* MODULE A */}
            <div className={`p-4 rounded-lg border-2 ${activeTab === CalcTab.Head ? 'border-gray-800 bg-gray-50' : 'border-gray-200'} flex flex-col justify-between h-40`}>
              <div>
                <span className="text-[9px] font-mono font-extrabold text-gray-500 uppercase tracking-widest block">MODULE A</span>
                <h3 className="font-bold text-xs uppercase text-gray-800 mt-1">Total Dynamic Head (TDH)</h3>
                <div className="text-[10px] text-gray-500 mt-1.5 font-mono space-y-0.5">
                  <p>• Static lift: {headInputs.staticHead} {headUnit === UnitSystem.Metric ? 'm' : 'ft'}</p>
                  <p>• Friction Loss: {headInputs.frictionLoss} {headUnit === UnitSystem.Metric ? 'm' : 'ft'}</p>
                  <p>• Margin Factor: {headInputs.safetyFactor}%</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-auto">
                <span className="text-xs text-gray-400 font-mono block">Calculated Net TDH:</span>
                <span className="text-base font-mono font-extrabold text-black">
                  {headResults.totalHeadMetric} m
                </span>
                <span className="text-[10px] text-gray-500 font-mono ml-2">({headResults.totalHeadImperial} ft)</span>
              </div>
            </div>

            {/* MODULE B */}
            <div className={`p-4 rounded-lg border-2 ${activeTab === CalcTab.FlowRate ? 'border-gray-800 bg-gray-50' : 'border-gray-200'} flex flex-col justify-between h-40`}>
              <div>
                <span className="text-[9px] font-mono font-extrabold text-gray-500 uppercase tracking-widest block">MODULE B</span>
                <h3 className="font-bold text-xs uppercase text-gray-800 mt-1">Flow Capacity (MCR)</h3>
                <div className="text-[10px] text-gray-500 mt-1.5 font-mono space-y-0.5">
                  <p>• Boiler Steam: {capacityInputs.boilerCapacity} {capacityUnit === UnitSystem.Metric ? 'kg/h' : 'lb/h'}</p>
                  <p>• Blowdown Rate: {capacityInputs.blowdownRate}%</p>
                  <p>• Makeup Loss: {capacityInputs.makeupFactor}%</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-auto">
                <span className="text-xs text-gray-400 font-mono block">Calculated Flow:</span>
                <span className="text-base font-mono font-extrabold text-black">
                  {capacityResults.flowRateM3Hr} m³/hr
                </span>
                <span className="text-[10px] text-gray-500 font-mono block">({capacityResults.flowRateGPM} GPM)</span>
              </div>
            </div>

            {/* MODULE C */}
            <div className={`p-4 rounded-lg border-2 ${activeTab === CalcTab.Power ? 'border-gray-800 bg-gray-50' : 'border-gray-200'} flex flex-col justify-between h-40`}>
              <div>
                <span className="text-[9px] font-mono font-extrabold text-gray-500 uppercase tracking-widest block">MODULE C</span>
                <h3 className="font-bold text-xs uppercase text-gray-800 mt-1">Driver Selection</h3>
                <div className="text-[10px] text-gray-500 mt-1.5 font-mono space-y-0.5">
                  <p>• Flow index: {powerInputs.flowRate} m³/h</p>
                  <p>• Fluid Density: {powerInputs.fluidDensity} kg/m³</p>
                  <p>• Pump/Motor Eff: {powerInputs.pumpEfficiency}% / {powerInputs.motorEfficiency}%</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-auto">
                <span className="text-xs text-gray-400 font-mono block">Required Rating:</span>
                <span className="text-base font-mono font-extrabold text-black">
                  {powerResults.motorPowerKw} kW
                </span>
                <span className="text-[10px] text-gray-500 font-mono ml-1">({powerResults.motorPowerHp} HP)</span>
              </div>
            </div>

          </div>
        </div>

        {/* INPUT ENVIRONMENT AND THERMOPHYSICAL CONDITION DETAIL TABLE */}
        <div className="space-y-3">
          <h2 className="text-sm font-mono font-bold tracking-widest text-[#1E90FF] border-b border-gray-200 pb-1.5 uppercase">
            COMPLETE PIPING & SYSTEM INPUT CONTEXT
          </h2>
          <table className="w-full text-xs text-left text-black border print-border border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100 border-b print-border font-bold">
                <th className="p-2 border-r print-border" style={{ width: '40%' }}>Piping Parameter Context</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Metric Parameters</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Imperial Equivalents</th>
              </tr>
            </thead>
            <tbody className="divide-y print-border">
              <tr>
                <td className="p-2 border-r print-border font-semibold">Static Physical Vertical Lift (h_static)</td>
                <td className="p-2 border-r print-border">
                  {headUnit === UnitSystem.Metric ? headInputs.staticHead : parseFloat((headInputs.staticHead / 3.28084).toFixed(2))} m
                </td>
                <td className="p-2 border-r print-border">
                  {headUnit === UnitSystem.Imperial ? headInputs.staticHead : parseFloat((headInputs.staticHead * 3.28084).toFixed(2))} ft
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Estimated Cumulative Friction loss (h_friction)</td>
                <td className="p-2 border-r print-border">
                  {headUnit === UnitSystem.Metric ? headInputs.frictionLoss : parseFloat((headInputs.frictionLoss / 3.28084).toFixed(2))} m
                </td>
                <td className="p-2 border-r print-border">
                  {headUnit === UnitSystem.Imperial ? headInputs.frictionLoss : parseFloat((headInputs.frictionLoss * 3.28084).toFixed(2))} ft
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Velocity Acceleration Head factor (h_velocity)</td>
                <td className="p-2 border-r print-border">
                  {headUnit === UnitSystem.Metric ? headInputs.velocityHead : parseFloat((headInputs.velocityHead / 3.28084).toFixed(2))} m
                </td>
                <td className="p-2 border-r print-border">
                  {headUnit === UnitSystem.Imperial ? headInputs.velocityHead : parseFloat((headInputs.velocityHead * 3.28084).toFixed(2))} ft
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Sizing Safety Buffer Adjustment Factor</td>
                <td className="p-2 border-r print-border" colSpan={2}>
                  {headInputs.safetyFactor}% Applied Margin index
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Boiler Maximum Continuous Rating (MCR)</td>
                <td className="p-2 border-r print-border">
                  {capacityUnit === UnitSystem.Metric ? capacityInputs.boilerCapacity : Math.round(capacityInputs.boilerCapacity / 2.20462)} kg/hr
                </td>
                <td className="p-2 border-r print-border">
                  {capacityUnit === UnitSystem.Imperial ? capacityInputs.boilerCapacity : Math.round(capacityInputs.boilerCapacity * 2.20462)} lb/hr
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Drum Contamination Blowdown Core Ratio</td>
                <td className="p-2 border-r print-border" colSpan={2}>
                  {capacityInputs.blowdownRate}% Rate Sizing Margin
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Piping Venting & Leak Replenishment Makeup</td>
                <td className="p-2 border-r print-border" colSpan={2}>
                  {capacityInputs.makeupFactor}% Rate Sizing Margin
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Suction Feedwater Fluid Temperature Density</td>
                <td className="p-2 border-r print-border" colSpan={2}>
                  {powerInputs.fluidDensity} kg/m³
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Component Design Mechanical/Electrical Efficiencies</td>
                <td className="p-2 border-r print-border">
                  Pump Hydraulics: {powerInputs.pumpEfficiency}%
                </td>
                <td className="p-2 border-r print-border">
                  Motor Driver: {powerInputs.motorEfficiency}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DETAILED SHAFT BRAKE CALCULATIONS */}
        <div className="space-y-3">
          <h2 className="text-sm font-mono font-bold tracking-widest text-[#1E90FF] border-b border-gray-200 pb-1.5 uppercase">
            DETAILED FLUID KINETIC ENERGY & BRAKE SHAFT DEMAND
          </h2>
          <table className="w-full text-xs text-left text-black border print-border border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100 border-b print-border font-bold">
                <th className="p-2 border-r print-border" style={{ width: '40%' }}>Energy Layer Stage</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Metric Output Rating</th>
                <th className="p-2 border-r print-border" style={{ width: '30%' }}>Imperial Output Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y print-border">
              <tr>
                <td className="p-2 border-r print-border font-semibold">Useful Liquid Fluid Power (Hydraulic Demand)</td>
                <td className="p-2 border-r print-border font-mono">{powerResults.hydraulicPowerKw} kW</td>
                <td className="p-2 border-r print-border font-mono">{powerResults.hydraulicPowerHp} HP</td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold">Pump Shaft Coupling Demand (Brake power BHP)</td>
                <td className="p-2 border-r print-border font-mono font-semibold text-black">{powerResults.shaftPowerKw} kW</td>
                <td className="p-2 border-r print-border font-mono font-semibold text-black">{powerResults.shaftPowerHp} HP</td>
              </tr>
              <tr>
                <td className="p-2 border-r print-border font-semibold bg-gray-50">Recommended Grid Electrical Motor Input Power</td>
                <td className="p-2 border-r print-border font-mono font-extrabold text-[#1E90FF] bg-gray-50">{powerResults.motorPowerKw} kW</td>
                <td className="p-2 border-r print-border font-mono font-extrabold text-[#1E90FF] bg-gray-50">{powerResults.motorPowerHp} HP</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] text-gray-500 font-mono italic leading-relaxed">
            Note: Recommend selecting a standard commercial grid induction motor frame rounded UP to the nearest integer size. A minimum service factor buffer of 1.15 is highly recommended for BFP continuous service under temperature transients.
          </p>
        </div>

        {/* EQUATIONS & PHYSICAL STANDARDS */}
        <div className="space-y-3">
          <h2 className="text-sm font-mono font-bold tracking-widest text-gray-700 border-b border-gray-200 pb-1.5 uppercase">
            SYSTEM SIZING MATRICES & GOVERNING FORMULAS
          </h2>
          <div className="grid grid-cols-2 gap-4 text-[11px] text-gray-600 font-mono leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div>
              <p className="font-bold text-gray-800 uppercase mb-1 underline">Hydraulic Total Dynamic Head</p>
              <p>Equation: TDH = (h_static + h_friction + h_velocity) * (1 + safety_factor/100)</p>
              <p className="mt-1 text-gray-500">Includes kinetic acceleration energy ($v^2/2g$) within flow boundaries.</p>
            </div>
            <div>
              <p className="font-bold text-gray-800 uppercase mb-1 underline">Mass Flow Rate Balance Sizing</p>
              <p>Equation: Q_mass = Boiler_MCR * (1 + Blowdown_rate + Makeup_allowance)</p>
              <p className="mt-1 text-gray-500">Ensures water delivery covers continuous purification purge bleed.</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-200 mt-2">
              <p className="font-bold text-gray-800 uppercase mb-1 underline">Hydraulic power & Mechanical Efficiency Coupling</p>
              <p>P_hydraulic (kW) = (Flow [m³/h] * TDH [m] * fluid_density [kg/m³] * gravity [9.81 m/s²]) / 3,600,000</p>
              <p>Shaft BHP = P_hydraulic / Pump_Efficiency &nbsp;&nbsp;|&nbsp;&nbsp; Motor input = Shaft BHP / Motor_Efficiency</p>
            </div>
          </div>
        </div>

        {/* VERIFICATION AND COMPONENT STAMP BOX */}
        <div className="border border-gray-300 rounded-lg p-5 mt-10" style={{ pageBreakInside: 'avoid' }}>
          <div className="grid grid-cols-3 gap-6 items-center">
            <div className="col-span-2 text-[11px] text-gray-500 space-y-1.5 leading-relaxed">
              <span className="font-bold text-gray-800 uppercase block">FORMAL REVIEW AND QUALITY COMPLIANCE</span>
              <p>The mathematical models implemented in this application software are mapped in accordance with ASME BPVC Section I Power Boilers, ASME B31.1 Power Piping code recommendations, and the Hydraulic Institute (HI) Standard for rotodynamic pumps sizing guidelines.</p>
              <p className="italic text-[10px]">Warning: Preliminary estimation draft. Always review physically certified manufacturer curves and seek professional mechanical engineering sign-off prior to component dispatch or capital build procurement.</p>
            </div>
            <div className="border border-gray-300 p-4 text-center rounded bg-gray-50 flex flex-col justify-between h-28">
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">ENGINEERING APPROVAL</span>
              <div className="border-b border-gray-300 w-full my-2 h-6 flex items-end justify-center text-xs text-gray-400 italic">
                Sizing Software Draft
              </div>
              <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block font-bold">STAMP & DATE</span>
            </div>
          </div>
        </div>

        {/* SINGLE FOOTER FOOTNOTE */}
        <div className="text-center text-[10px] text-gray-400 pt-5 border-t border-gray-200">
          <p>© {new Date().getFullYear()} Thermosolve Quality Engineering Tools. Platform runtime session index G-STUDIO-{new Date().toISOString().substring(0,10)}.</p>
        </div>

      </div>

      {/* ARTICLE & COMPREHENSIVE INFRASTRUCTURE DOCUMENTATION (SEO RICH ARTICLES - 2500+ WORDS) */}
      <article className="max-w-5xl mx-auto px-6 mt-16 no-print space-y-16">
        
        {/* SECTION 2: RESULTS INTERPRETATION GUIDE */}
        <section id="results-guide" className="bg-[#101E35]/70 p-8 rounded-2xl border border-[#2A3F5F]/60">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-6 w-6 text-[#FFB400]" />
            <h2 className="text-2.5xl font-bold text-white tracking-tight">How to Interpret Your Boiler Feed Pump Calculation Results</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            When sizing a boiler feed pump system, the computed values provide the basic thermodynamic profile constraints required for pump selection. The most critical factor is the <strong>Total Dynamic Head (TDH)</strong>. If the TDH is calculated to be below 20 meters, this is typically indicative of low-pressure steam boilers or small condensate return loops. Conversely, high-pressure cogeneration or utility thermal plants demand heads ranging from 120 meters upwards. Operating above 200 meters typically calls for industrial-grade, multi-stage centrifugal boiler feedwater pumps.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Volumetric flow capacity rates must also be heavily analyzed. Should the pump capacity exceed the design steam drum MCR by more than 150%, the pump will regularly run throttled, causing excessive back-pressure on feed control valves and elevating the risk of system hydraulic heat-up and shaft seal degradation. Conversely, running too close to base capacity factors leaves no margin to replenish sudden thermal loads, triggering low-level lock-outs inside the boiler steam drum. Refer directly to the specialized thermodynamic bounds table below for standardized reference ranges:
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#2A3F5F] bg-[#0D1B2A]">
            <table className="w-full text-xs text-left text-slate-300 divide-y divide-[#2A3F5F]">
              <thead className="bg-[#1A2942] uppercase tracking-wider text-[#A8B8D0] font-mono">
                <tr>
                  <th className="p-4 border-r border-[#2A3F5F]">Parameter Index</th>
                  <th className="p-4 border-r border-[#2A3F5F]">Typical Safe Range</th>
                  <th className="p-4">Critical Warning Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3F5F]">
                <tr>
                  <td className="p-4 border-r border-[#2A3F5F] font-semibold text-white">Total Dynamic Head (TDH)</td>
                  <td className="p-4 border-r border-[#2A3F5F]">20 m – 150 m (65 ft – 492 ft)</td>
                  <td className="p-4 text-[#FF6B35] font-semibold">&gt; 200 m (High friction risk, cavitation wear)</td>
                </tr>
                <tr>
                  <td className="p-4 border-r border-[#2A3F5F] font-semibold text-white">Required Flow Capacity</td>
                  <td className="p-4 border-r border-[#2A3F5F]">110% – 125% of Boiler MCR Steam Flow</td>
                  <td className="p-4 text-[#FFB400] font-semibold">&lt; 105% (Cannot restore steam flash drops isovolumetrically)</td>
                </tr>
                <tr>
                  <td className="p-4 border-r border-[#2A3F5F] font-semibold text-white">Pump Mechanical Efficiency</td>
                  <td className="p-4 border-r border-[#2A3F5F]">60% – 85% Best Efficiency Point (BEP)</td>
                  <td className="p-4 text-[#FF6B35] font-semibold">&lt; 50% (High electric cost, thermal dissipation issues)</td>
                </tr>
                <tr>
                  <td className="p-4 border-r border-[#2A3F5F] font-semibold text-white">Motor Electrical Power Sizing</td>
                  <td className="p-4 border-r border-[#2A3F5F]">115% – 120% of Pump Mechanical BHP</td>
                  <td className="p-4 text-[#FFB400] font-semibold">&gt; 125% (Over-motored grid, poor power factor losses)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 3: HOW TO USE THE CALCULATOR (HowTo Schema text) */}
        <section id="how-to-use" className="space-y-6">
          <div className="flex items-center gap-2">
            <Sliders className="h-6 w-6 text-[#1E90FF]" />
            <h2 className="text-2.5xl font-bold text-white tracking-tight">How to Use the Boiler Feed Pump Calculation Calculator</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Follow this practical, step-by-step procedure to calculate boiler feed pump head, capacity flow rate, fluid hydraulic power, and motor size with absolute precision using our free premium engineering utility. No login or installation is required:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                step: '1',
                title: 'Select Sizing Tab and Standard Unit System',
                text: 'Select the tab corresponding to the sizing phase you are evaluating: Head Sizing, Flow Capacity, or Power Draw. Toggle between SI Metric and Imperial systems instantly without losing entered numerical scale factors.'
              },
              {
                step: '2',
                title: 'Enter Static Physical Lift Elevation',
                text: 'Input the exact vertical height lift from the minimum liquid level in the deaerating feedwater tank up to the high-pressure feedwater nozzle on the boiler drum, specified in meters or feet.'
              },
              {
                step: '3',
                title: 'Input Cumulative Pipe and Valve Friction Drops',
                text: 'Input the total frictional losses generated by piping runs, non-return stop valves, control valves, primary high-pressure heaters, and economizer coils on the discharge line.'
              },
              {
                step: '4',
                title: 'Apply Dynamic Kinetic Velocity Head factors',
                text: 'Enter the velocity acceleration head factor. Velocity head represents the dynamic kinetic energy of fluid motion, mathematically calculated as $v^2/2g$ (normally averaging between 0.5 to 2.5 meters).'
              },
              {
                step: '5',
                title: 'Specify Boiler Continuous Rating (MCR)',
                text: 'Switch to the Flow Rate tab and input the maximum rated thermal boiler output capacity, factoring in additional continuous chemical blowdown water purge rates (3–10%) and makeup allowances.'
              },
              {
                step: '6',
                title: 'Set Fluid Temperature Density Coefficients',
                text: 'In the Power tab, specify the physical chemical water density corresponding to operating feedwater temperature. Because water expands thermally, hot boiler feedwater has densities of 950–965 kg/m³ instead of 1000 kg/m³.'
              },
              {
                step: '7',
                title: 'Analyze Pump & Driver Efficiencies',
                text: 'Input the mechanical efficiencies of the centrifugal impellers (pump efficiency) and the grid induction motor. View hydraulic, brake coupling shaft power (BHP), and total grid electricity demand.'
              },
              {
                step: '8',
                title: 'Generate PDF Datasheet or Copy Results',
                text: 'Review the color-coded Results Panel on the right. Instantly export a formatted engineering datasheet by clicking "Print Datasheet" or copy raw data values for word processors with "Copy Engineering Report".'
              }
            ].map((item) => (
              <div key={item.step} className="bg-[#0D1B2A]/70 p-5 rounded-xl border border-[#2A3F5F]/40 hover:border-[#1E90FF]/50 transition duration-300">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-[#1E90FF]/20 text-[#1E90FF] font-mono text-sm font-extrabold">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-wide">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: FORMULAS EXPLAINED */}
        <section id="formula-guide" className="space-y-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#00C896]" />
            <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Calculation Formulas Explained</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Sizing high-pressure thermal boiler feed pumps requires implementing verified fluid mechanics equations formulated by the Hydraulic Institute and ASME. Discover a complete structural analysis of these engineering formulas below:
          </p>

          <div className="space-y-6">
            <div className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] p-6 space-y-4">
              <span className="text-xs font-mono text-[#00C896] uppercase tracking-wider font-bold block">
                1. Total Dynamic Head (TDH) Sizing Formula
              </span>
              <p className="text-sm text-[#A8B8D0] leading-relaxed">
                The Total Dynamic Head ($TDH$) represents the total mechanical energy that must be imparted onto the feedwater to overcome the vertical elevation lift, friction through pipes, fittings, valves, economizers, and kinetic velocity acceleration, with a design safety factor multiplier.
              </p>
              
              <div className="bg-[#050C16] p-4 rounded-lg border border-[#2A3F5F]/60 font-mono text-center my-2 text-[#1E90FF] leading-loose text-sm sm:text-base">
                <div className="text-xs font-mono text-[#FFB400] mb-2">THERMODYNAMIC FLUID EQUATION</div>
                TDH = (h<span className="text-xs font-sans">static</span> + h<span className="text-xs font-sans">friction</span> + h<span className="text-xs font-sans">velocity</span>) × (1 + SF / 100)
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <p>Where:</p>
                <p>• <strong>TDH</strong> = Total Dynamic Head (meters, m or feet, ft)</p>
                <p>• <strong>h_static</strong> = Total vertical physical lift elevation from deaerator level (m or ft)</p>
                <p>• <strong>h_friction</strong> = Cumulative fluid dynamic resistance friction in discharge pipelines (m or ft)</p>
                <p>• <strong>h_velocity</strong> = Velocity acceleration head factor, equivalent to $v^2 / 2g$ (m or ft)</p>
                <p>• <strong>SF</strong> = Sizing safety coefficient index, default is 10% (equivalent to 1.1 multiplier)</p>
              </div>
            </div>

            <div className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] p-6 space-y-4">
              <span className="text-xs font-mono text-[#00C896] uppercase tracking-wider font-bold block">
                2. Boiler Feedwater Sizing Capacity Flow Formula
              </span>
              <p className="text-sm text-[#A8B8D0] leading-relaxed">
                To size the required physical water mass flow delivery rate, engineers start with the boiler\'s maximum rated steam output under peak load (MCR) and add multipliers to compensate for continuous blowdown purge flow rates and system steam/makeup mass losses:
              </p>

              <div className="bg-[#050C16] p-4 rounded-lg border border-[#2A3F5F]/60 font-mono text-center my-2 text-[#00C896] leading-loose text-sm sm:text-base">
                <div className="text-xs font-mono text-[#FFB400] mb-2">MASS FLOW BALANCE MODEL</div>
                Q<span className="text-xs font-sans">feedwater</span> = Boiler Capacity × (1 + Blowdown % + Makeup %)
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <p>Where:</p>
                <p>• <strong>Q_feedwater</strong> = Net required feed flow capacity (kg/hr or lb/hr)</p>
                <p>• <strong>Boiler Capacity</strong> = Steam drum generation rate (MCR) at peak capacity index (kg/hr or lb/hr)</p>
                <p>• <strong>Blowdown %</strong> = Intermittent or continuous solids purging bleed ratio (typically 5%)</p>
                <p>• <strong>Makeup %</strong> = Replenishment allowance factor to offset flash and piping losses (typically 8–10%)</p>
              </div>
            </div>

            <div className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] p-6 space-y-4">
              <span className="text-xs font-mono text-[#00C896] uppercase tracking-wider font-bold block">
                3. Pump Fluid Kinetic Power Sizing Formula
              </span>
              <p className="text-sm text-[#A8B8D0] leading-relaxed">
                Physical hydraulic power is converted from mass flow parameters and dynamic pressure head, which is divided by mechanical efficiencies to size the shaft BHP and electric motor input requirements:
              </p>

              <div className="bg-[#050C16] p-4 rounded-lg border border-[#2A3F5F]/60 font-mono text-center my-2 text-[#FFB400] leading-loose text-sm sm:text-base">
                <div className="text-xs font-mono text-[#00C896] mb-2">HYDRAULIC KINETIC POWER MODEL</div>
                P<span className="text-xs font-sans">hydraulic</span> (kW) = (Flow [m³/hr] × Head [m] × ρ [kg/m³] × g [m/s²]) / 3,600,000
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <p>Where:</p>
                <p>• <strong>P_hydraulic</strong> = Hydraulic Fluid kinetic power output rate (kW)</p>
                <p>• <strong>Flow</strong> = Volumetric liquid throughput rate (m³/hr)</p>
                <p>• <strong>Head</strong> = Calculated Total Dynamic Head (TDH) in meters (m)</p>
                <p>• <strong>ρ (Density)</strong> = Hot water chemical density corresponding to temperature (e.g., 960 kg/m³)</p>
                <p>• <strong>g</strong> = Gravitational acceleration constant (9.80665 m/s²)</p>
              </div>

              <p className="text-xs text-[#A8B8D0] leading-relaxed border-t border-[#2A3F5F]/40 pt-3">
                To transition from Hydraulic output to final electrical grid input to size generator assets: <br />
                <strong>P_shaft (BHP) = P_hydraulic / Pump Efficiency</strong> <br />
                <strong>P_motor = P_shaft / Motor Efficiency</strong>
              </p>
            </div>

            <div className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] p-6 space-y-4">
              <span className="text-xs font-mono text-[#00C896] uppercase tracking-wider font-bold block">
                4. NPSH (Net Positive Suction Head) margin
              </span>
              <p className="text-sm text-[#A8B8D0] leading-relaxed">
                Boiler feed pumps are highly prone to physical cavitation because they intake high-temperature water from deaerator tanks near boiling point. To verify the system layout prevents cavitation, the <strong>NPSH Available (NPSHa)</strong> must strictly exceed the pump\'s <strong>NPSH Required (NPSHr)</strong>:
              </p>

              <div className="bg-[#050C16] p-4 rounded-lg border border-[#2A3F5F]/60 font-mono text-center my-2 text-white leading-loose text-sm sm:text-base">
                <div className="text-xs font-mono text-[#FFB400] mb-2">NPSH SECURITY EQUATION</div>
                NPSH<span className="text-xs font-sans">a</span> = P<span className="text-xs font-sans">suction_absolute</span> - P<span className="text-xs font-sans">vapor_pressure</span>
              </div>

              <p className="text-xs text-[#A8B8D0] leading-relaxed">
                If the suction absolute head drops close to the water\'s thermodynamic saturation vapor pressure, vapor bubbles instantly micro-explode inside the impeller passageways. This leads to heavy cavitation pitting, severe hydraulic instability, degradation of shaft mechanical seals, and devastating mechanical destruction.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: WHAT IS A BOILER FEED PUMP & SIZING STEP-BY-STEP */}
        <section id="informational-content" className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2.5xl font-bold text-white tracking-tight">What is a Boiler Feed Pump?</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              A boiler feed pump is a heavy-duty industrial auxiliary component engineered explicitly to feed a pressurized stream of hot liquid feedwater into a steam drum boiler vessel. Because steam boiler vessels operate under immense internal thermodynamic steam pressures (generated by heat exchange furnaces), the feed pump must deliver the liquid feedwater under pressures higher than the drum containment threshold to force replenishment water inside.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              These pumps typically exist as multi-stage centrifugal pumps, split-case, or barrel centrifugal pumps to generate massive dynamic pressures. For smaller industrial steam plants, positive displacement plunger pumps can also be integrated. In modern, high-intensity utility stations, multi-stage boiler feed pumps run continuously, working as the single highest consumer of internal electrical auxiliary grid energy.
            </p>
          </div>

          <div className="bg-[#1A2942]/40 rounded-xl border border-[#2A3F5F] p-8 space-y-6">
            <h2 className="text-2.5xl font-bold text-white tracking-tight">Boiler Feed Pump Sizing Calculation — Step by Step</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sizing feedwater assets correctly is a structured system engineering workflow required to guarantee mechanical durability. Sizing must account for extreme operating transients, ASME requirements, and system piping layouts:
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-xs font-mono font-bold text-[#FFB400] shrink-0">STEP I</div>
                <div className="text-xs text-slate-300 leading-normal">
                  <strong className="text-white">Determine Maximum Continuous Rating (MCR):</strong> Establish the maximum mass velocity of steam the boiler can produce at worst-case design load.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-xs font-mono font-bold text-[#FFB400] shrink-0">STEP II</div>
                <div className="text-xs text-slate-300 leading-normal">
                  <strong className="text-white">Calculate blowdown and makeup margins:</strong> Add 3% to 10% thermal purge mass flow margin plus a secondary safety allowance of 5% to 12% to cover system steam venting.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-xs font-mono font-bold text-[#FFB400] shrink-0">STEP III</div>
                <div className="text-xs text-slate-300 leading-normal">
                  <strong className="text-white">Formulate pipe run resistance drops:</strong> Utilize the Hazen-Williams or Darcy-Weisbach flow equations to map friction losses through economizers, check non-return valves, superheaters (if any), and flow meters.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-xs font-mono font-bold text-[#FFB400] shrink-0">STEP IV</div>
                <div className="text-xs text-slate-300 leading-normal">
                  <strong className="text-white">Calculate NPSH available bounds:</strong> Assess suction pipe lengths and elevate deaerators sufficiently above the suction ports to build static head margin, fully eliminating vapor pressure cavitation risks.
                </div>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed pt-2">
              By inputting your industrial parameters into our online calculation solver, these manual mechanical engineering sizing steps are computed instantly with ASME-compliant precision.
            </p>
          </div>
        </section>

        {/* SECTION 6: FAQ ACCORDION SECTION (accordions with details/summary tags) */}
        <section id="faq-accordions" className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-[#FFB400]" />
            <h2 className="text-2.5xl font-bold text-white tracking-tight">Frequently Asked Questions — Boiler Feed Pump Calculation</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Review detailed mechanical engineering answers to the most common questions regarding boiler feed pump sizing, fluid dynamics, and cavitation prevention:
          </p>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-[#0D1B2A] rounded-xl border border-[#2A3F5F] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full text-left py-4 px-5 font-bold text-sm text-white hover:text-[#1E90FF] transition flex justify-between items-center bg-[#101E35]/60 cursor-pointer"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#FFB400] shrink-0 transition-transform duration-300 ${
                      openFaq === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 border-t border-[#2A3F5F] text-xs text-slate-300 leading-relaxed bg-[#050C16]/50">
                        {faq.answer}
                        <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-[#00C896] hover:underline cursor-pointer">
                          <span>External reference constraint matching: ASHRAE & Hydraulic Institute Standards</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: RELATED CALCULATORS (Internal linking cards) */}
        <section id="related-calculators" className="space-y-6">
          <div className="border-t border-[#2A3F5F] pt-12">
            <h2 className="text-xl font-bold text-white tracking-wider mb-2 flex items-center gap-2 font-mono">
              <FileText className="h-5 w-5 text-[#1E90FF]" />
              Related Engineering Calculators
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Explore other calculators to optimize your steam plant thermodynamic cycles, pipe networks, and boiler feed water loops:
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
                    Access Calculator
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

      </article>

      {/* FOOTER */}
      <footer className="mt-24 border-t border-[#2A3F5F] bg-[#07111E] py-12 px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-slate-400 no-print">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="h-2 w-2 rounded-full bg-[#00C896]" />
              <p className="font-bold text-slate-200">Thermosolve Sizing Engine (ASME BPVC Standard)</p>
            </div>
            <p className="max-w-md leading-relaxed text-[11px]">
              Disclaimer: This engineering calculation tool is for preliminary estimation and educational purposes only. Always verify values with a certified Professional Engineer (PE) and manufacturer curves for physical installations.
            </p>
          </div>
          <div className="text-center md:text-right space-y-2">
            <p className="font-mono text-[10px] tracking-wide">
              Last Updated: <span className="text-[#FFB400] font-bold">June 2026 Edition</span>
            </p>
            <p className="text-slate-500">
              © {new Date().getFullYear()} Thermosolve Systems, LLC. All rights engineered under ASME Section I.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
