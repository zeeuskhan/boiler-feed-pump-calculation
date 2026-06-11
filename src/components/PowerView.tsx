import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { UnitSystem } from '../types';
import { CommonSizingMistakes } from '../data/seoContent';
import { Zap, RotateCcw, AlertTriangle, BookOpen, Clock, Activity, CheckCircle, Flame } from 'lucide-react';

interface PowerViewProps {
  unitSystem: UnitSystem;
}

export default function PowerView({ unitSystem }: PowerViewProps) {
  const isMetric = unitSystem === UnitSystem.Metric;

  // Parameters for deep-dive shaft and driver sizing
  const [flowRate, setFlowRate] = useState<number>(15); // m³/hr or GPM
  const [totalHead, setTotalHead] = useState<number>(450); // meters or feet
  const [fluidDensity, setFluidDensity] = useState<number>(954); // kg/m³ or lb/ft³
  const [pumpEff, setPumpEff] = useState<number>(75); // %
  const [motorEff, setMotorEff] = useState<number>(92); // %
  const [mechEff, setMechEff] = useState<number>(98); // %
  const [electricityCost, setElectricityCost] = useState<number>(8.0); // currency units per kWh
  const [motorRpm, setMotorRpm] = useState<number>(2950); // rpm
  const [annualHours, setAnnualHours] = useState<number>(8000); // hours

  // Reset inputs to default values
  const handleReset = () => {
    if (isMetric) {
      setFlowRate(15);
      setTotalHead(450);
      setFluidDensity(954);
      setPumpEff(75);
      setMotorEff(92);
      setMechEff(98);
      setElectricityCost(8.0);
      setMotorRpm(2950);
      setAnnualHours(8000);
    } else {
      setFlowRate(66);
      setTotalHead(1476);
      setFluidDensity(59.55);
      setPumpEff(75);
      setMotorEff(92);
      setMechEff(98);
      setElectricityCost(8.0);
      setMotorRpm(2950);
      setAnnualHours(8000);
    }
  };

  // Perform calculations for driver, specific speeds, and overload warnings
  const calc = useMemo(() => {
    // Standardize variables to Metric SI
    const qM3Hr = isMetric ? flowRate : flowRate / 4.402868;
    const hM = isMetric ? totalHead : totalHead / 3.28084;
    const rho = isMetric ? fluidDensity : fluidDensity / 0.062428;

    const pEffRatio = Math.max(10, Math.min(pumpEff, 99)) / 100;
    const mEffRatio = Math.max(10, Math.min(motorEff, 99)) / 100;
    const mechEffRatio = Math.max(10, Math.min(mechEff, 99)) / 100;

    const gravity = 9.80665;
    const qM3S = qM3Hr / 3600;

    // 1. Hydraulic Fluid Power: kW = (rho * Q * g * H) / 1000
    const hydraulicKw = (rho * qM3S * gravity * hM) / 1000;
    const hydraulicHp = hydraulicKw * 1.341022;

    // 2. Shaft Brake Power (BHP): kW = HydraulicKw / (pEff * mechEff)
    const shaftKw = hydraulicKw / pEffRatio / mechEffRatio;
    const shaftHp = shaftKw * 1.341022;

    // 3. Motor Grid consumption Power: kW = ShaftKw / mEff
    const gridKw = shaftKw / mEffRatio;
    const gridHp = gridKw * 1.341022;

    // Specific Speed Ns = N * sqrt(Q_gpm) / H_ft^0.75
    const flowGpm = qM3Hr * 4.402868;
    const headFt = hM * 3.28084;
    const specificSpeed = motorRpm * Math.sqrt(flowGpm) / Math.pow(Math.max(1, headFt), 0.75);

    // Specific speed shape description
    let shapeDesc = "Radial Flow Impeller (Narrow profile, high-pressure multistage)";
    if (specificSpeed > 2000 && specificSpeed <= 5000) {
      shapeDesc = "Mixed Flow Impeller (Medium flow, medium head)";
    } else if (specificSpeed > 5000) {
      shapeDesc = "Axial Flow Propeller (High flow volumes, very low head)";
    }

    // Economical impact & Carbon prints
    const totalHours = Math.max(0, Math.min(annualHours, 8760));
    const annualOpCost = gridKw * totalHours * electricityCost;
    const carbonKg = gridKw * totalHours * 0.52; // 0.52 kg CO2 per kWh grid average

    // COLD COMMISSIONING CHECK (CRITICAL FOR E-E-A-T!)
    // If we test with ambient cold water (SG = 1.0, rho = 1000 kg/m^3) at identical volumetric capacity
    const coldDensity = 1001; // kg/m^3
    const coldHydraulics = (coldDensity * qM3S * gravity * hM) / 1000;
    const coldShaftKw = coldHydraulics / pEffRatio / mechEffRatio;
    const coldOverloadPercent = ((coldShaftKw - shaftKw) / shaftKw) * 100;

    // Suggest recommended motor rating (standard values rounded up with ASME 15-20% motor padding margins)
    const baseRecommendedMotorKw = shaftKw * 1.15;
    // Standard IEC frame sizing lookup helper
    const standardFrames = [5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 355, 400, 450, 500, 630, 800, 1000, 1250];
    let selectedFrameKw = standardFrames[standardFrames.length - 1];
    for (let f of standardFrames) {
      if (f >= baseRecommendedMotorKw) {
        selectedFrameKw = f;
        break;
      }
    }

    return {
      hydraulicKw: parseFloat(hydraulicKw.toFixed(2)),
      hydraulicHp: parseFloat(hydraulicHp.toFixed(1)),
      shaftKw: parseFloat(shaftKw.toFixed(2)),
      shaftHp: parseFloat(shaftHp.toFixed(1)),
      gridKw: parseFloat(gridKw.toFixed(2)),
      gridHp: parseFloat(gridHp.toFixed(1)),
      specificSpeed: Math.round(specificSpeed),
      shapeDesc,
      annualOpCost: Math.round(annualOpCost),
      carbonEmittedTons: parseFloat((carbonKg / 1000).toFixed(1)),
      coldShaftKw: parseFloat(coldShaftKw.toFixed(2)),
      coldOverloadPercent: parseFloat(coldOverloadPercent.toFixed(1)),
      recommendedMotorKw: parseFloat(baseRecommendedMotorKw.toFixed(1)),
      selectedFrameKw,
    };
  }, [flowRate, totalHead, fluidDensity, pumpEff, motorEff, mechEff, electricityCost, motorRpm, annualHours, isMetric]);

  const fUnit = isMetric ? 'm³/hr' : 'GPM';
  const hUnit = isMetric ? 'm' : 'ft';
  const dUnit = isMetric ? 'kg/m³' : 'lb/ft³';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" id="power-view-root">
      {/* Page Hero */}
      <div className="mb-10 text-center md:text-left border-b border-[#2A3F5F]/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00C896]/10 text-[#00C896] rounded-full text-xs font-mono font-bold mb-4">
          <Zap className="h-3.5 w-3.5 animate-pulse" /> ENERGY AUDITING & DRIVER SELECTION
        </div>
        <h1 className="text-3xl md:text-5xl font-sans tracking-tight font-bold text-white mb-4">
          Boiler Feed Pump Power & Efficiency Calculator
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          Perform high-fidelity mechanical and electrical power balances as part of your overall boiler feed pump calculation. Calibrate driver sizes based on fluid mass, mechanical coupling margins, and cold commissioning safety grids.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Form Panel */}
        <div className="lg:col-span-7 bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2A3F5F]/30">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00C896]"></span>
                Driver Selection & Energy Modeler
              </h2>
              <p className="text-xs text-slate-400 mt-1">Estimates grid draw and carbon profile dynamically</p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-[#1F2E47] hover:bg-[#2B3F5D] text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
                Operating Flow Rate (Q) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={flowRate}
                  onChange={(e) => setFlowRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  {fUnit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
                Total Dynamic Head (TDH) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={totalHead}
                  onChange={(e) => setTotalHead(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  {hUnit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
                Feedwater Design Density (ρ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={fluidDensity}
                  onChange={(e) => setFluidDensity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  {dUnit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
                Motor Rotational Speed (N) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={motorRpm}
                  onChange={(e) => setMotorRpm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  RPM
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
                Pump Best Efficiency Point (η_p) % <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  max="99"
                  min="5"
                  value={pumpEff}
                  onChange={(e) => setPumpEff(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#00C896] select-none">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
                Electric Motor Efficiency Class % <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  max="99"
                  min="10"
                  value={motorEff}
                  onChange={(e) => setMotorEff(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
                Local Electricity Grid Unit Rate <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={electricityCost}
                  onChange={(e) => setElectricityCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#FFB400] select-none">
                  currency/kWh
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2">
                Continuous Operational Hours/Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  max="8760"
                  min="0"
                  value={annualHours}
                  onChange={(e) => setAnnualHours(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  hrs/year
                </span>
              </div>
            </div>
          </div>

          {/* Sizing Outputs Panel */}
          <div className="bg-[#09111D] border border-[#1E2E47] rounded-xl p-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#1E90FF] mb-4">Electric & Mechanical Sizing Outputs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 bg-[#14263D]/40 border border-[#2A3F5F]/20 rounded-lg text-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Fluid Hydraulic Power</span>
                <span className="text-lg font-bold font-mono text-white mt-1 block">
                  {calc.hydraulicKw} kW <span className="text-xs text-slate-400 font-normal">({calc.hydraulicHp} HP)</span>
                </span>
              </div>

              <div className="p-3.5 bg-[#14263D]/40 border border-[#2A3F5F]/20 rounded-lg text-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Shaft Brake Power</span>
                <span className="text-lg font-bold font-mono text-[#00C896] mt-1 block">
                  {calc.shaftKw} kW <span className="text-xs text-slate-400 font-normal">({calc.shaftHp} HP)</span>
                </span>
              </div>

              <div className="p-3.5 bg-[#14263D]/40 border border-[#2A3F5F]/20 rounded-lg text-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Motor Grid Power Draw</span>
                <span className="text-lg font-bold font-mono text-[#FFB400] mt-1 block">
                  {calc.gridKw} kW <span className="text-xs text-slate-400 font-normal font-normal">({calc.gridHp} HP)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#2A3F5F]/20 pt-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Specific Speed (Ns)</span>
                <span className="text-sm font-semibold text-white font-mono mt-1 block">{calc.specificSpeed} (US gpm, ft standard)</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-1">{calc.shapeDesc}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">ASME Guarded Motor Selection</span>
                <span className="text-sm font-semibold text-[#FFB400] font-mono mt-1 block">{calc.selectedFrameKw} kW IEC Frame</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-1">Sized at 15% safety margin ({calc.recommendedMotorKw} kW required).</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#2A3F5F]/20 pt-4">
              <div className="p-3 bg-[#112435]/50 border border-[#1E90FF]/25 rounded-lg">
                <span className="text-[10px] font-mono text-[#1E90FF] block uppercase font-bold">Annual Operating Cost</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {calc.annualOpCost.toLocaleString()} Cost Units
                </span>
              </div>
              <div className="p-3 bg-[#112435]/50 border border-[#1E90FF]/25 rounded-lg">
                <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">Annual Carbon Impact</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {calc.carbonEmittedTons} Tons CO2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* E-E-A-T Critical Engineering Highlight */}
        <div className="lg:col-span-5 space-y-6">
          {/* COLD COMMISSIONING DANGER ALERT */}
          <div className="bg-gradient-to-br from-[#2D1616] to-[#140808] border border-red-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-red-900/10 text-red-500">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            
            <h3 className="font-bold text-red-400 text-base mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
              BFP Cold Commissioning Overload Alert!
            </h3>
            
            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>
                A core danger mechanical engineers encounter is testing BFP networks with <strong className="text-red-400">cold ambient water</strong> (SG = 1.0) during initial site commissioning, whereas the pump and drive motor are sized for hot feedwater (e.g., 140°C, SG = 0.925).
              </p>
              <p>
                Centrifugal pumps move identical volumes regardless of temperature, but shaft torque demands scale directly with Specific Gravity:
              </p>
              <div className="bg-black/50 p-3 rounded border border-red-900/30 font-mono text-xs text-red-400 text-center leading-normal">
                Cold overload increase: +{calc.coldOverloadPercent}% torque!
              </div>
              <p>
                In your current design, testing with cold water will spike shaft power to <strong className="text-white">{calc.coldShaftKw} kW</strong>, compared to the design hot load of {calc.shaftKw} kW.
              </p>
              <p className="font-semibold text-red-400 bg-red-900/10 p-2.5 rounded border border-red-500/15">
                ⚠ Risk: Running this pump at full volumetric capacity with cold flush fluid will instantly draw excess current and trip or burn out the electric motor. Throttling is mandatory!
              </p>
            </div>
          </div>

          {/* POWER FORMULA DERIVATIONS */}
          <div className="bg-[#0B1524] border border-[#2A3F5F]/40 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#1E90FF]" /> Mechanical Power Equation
            </h3>
            <div className="bg-[#080E1C] p-3 rounded-lg border border-[#2A3F5F]/20 font-mono text-xs text-[#00C896] text-center overflow-x-auto mb-4">
              P_shaft (kW) = [ ρ * Q * g * H ] / [ 3600 * &eta;_pump * &eta;_mech ]
            </div>
            <div className="text-xs text-slate-400 leading-relaxed space-y-2">
              <p className="font-bold text-white mb-1">Standard Conversion Units:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-white">ρ:</strong> Operating density of water in kg/m³</li>
                <li><strong className="text-white">Q:</strong> Volume displacement rate in m³/hr</li>
                <li><strong className="text-white">g:</strong> Gravity acceleration constant (9.80665 m/s²)</li>
                <li><strong className="text-white">H:</strong> Sized Total Dynamic Head in meters</li>
                <li><strong className="text-white">&eta;_pump:</strong> Impeller efficiency coefficient</li>
                <li><strong className="text-white">&eta;_mech:</strong> Mechanical transmission rating</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Educational depth guide on VFDs and specific speeds */}
      <section className="bg-[#0B1524] border border-[#2A3F5F]/30 rounded-2xl p-6 md:p-8 mt-10">
        <h2 className="text-xl md:text-2xl font-bold font-sans text-white mb-6 border-b border-[#2A3F5F]/20 pb-4">
          BFP Speed Selection & Variable Frequency Drives Efficiency Sizing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300 text-sm leading-relaxed">
          <div>
            <h3 className="font-bold text-[#FFB400] mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFB400]"></span>
              The Role of Specific Speed (Ns) in Casing Configuration
            </h3>
            <p className="mb-4">
              Specific speed acts as an index of dynamic matching. Radial flow configurations (Ns = 500-1500) operate with tight channels and highly structured shroud walls. This configuration has a steep flow-head characteristic, which is highly advantageous for steam drum regulation because slight changes in boiler steam pressure do not trigger dramatic delivery surges.
            </p>
            <p>
              For higher specific speeds, the impeller develops mixed axial characteristics that are less suited to boilers due to flatter curves. Understanding the Ns value allows engineers to verify that the manufactured impeller remains well within stable hydraulic boundary patterns.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#1E90FF] mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E90FF]"></span>
              Power Mitigation via Variable Speed Adjustments
            </h3>
            <p className="mb-4">
              Traditional boiler feed arrangements utilize fixed-speed 2-pole motors and throttle the output flow through high-pressure feedwater control valves. This method creates continuous artificial losses. Variable Frequency Drives (VFDs) change the electrical frequency to directly throttle the pump's rotational speed, which scales down power requirements according to the Affinity Laws:
            </p>
            <div className="bg-black/40 p-3.5 rounded border border-[#2A3F5F]/20 font-mono text-xs text-center text-[#1E90FF] mb-3">
              P2 / P1 = (N2 / N1)³
            </div>
            <p>
              By modulating shaft speed instead of introducing friction, active plant power demands can drop by up to 50% during part-load operating runs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
