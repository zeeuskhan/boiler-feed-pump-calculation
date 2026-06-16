import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { UnitSystem } from '../types';
import { WorkedExamplesList, FullFaqList, IndustryStandardsList } from '../data/seoContent';
import { ShieldCheck, Info, RotateCcw, AlertTriangle, BookOpen, Scaling, CheckCircle } from 'lucide-react';

interface NpshViewProps {
  unitSystem: UnitSystem;
}

export default function NpshView({ unitSystem }: NpshViewProps) {
  const isMetric = unitSystem === UnitSystem.Metric;

  // NPSHa specific interactive inputs
  const [deaeratorPressure, setDeaeratorPressure] = useState<number>(0.2); // bar-g (Metric), psi-g (Imperial)
  const [waterTemp, setWaterTemp] = useState<number>(105); // °C (Metric), °F (Imperial)
  const [staticElevation, setStaticElevation] = useState<number>(7); // meters (Metric), feet (Imperial)
  const [frictionLoss, setFrictionLoss] = useState<number>(0.8); // meters (Metric), feet (Imperial)
  const [pumpNpshr, setPumpNpshr] = useState<number>(4.0); // meters (Metric), feet (Imperial)

  // Reset inputs
  const handleReset = () => {
    if (isMetric) {
      setDeaeratorPressure(0.2);
      setWaterTemp(105);
      setStaticElevation(7);
      setFrictionLoss(0.8);
      setPumpNpshr(4.0);
    } else {
      setDeaeratorPressure(2.9);
      setWaterTemp(221);
      setStaticElevation(23);
      setFrictionLoss(2.6);
      setPumpNpshr(13);
    }
  };

  // Convert inputs to metric SI for core thermodynamic equations
  const npshCalc = useMemo(() => {
    const tempC = isMetric ? waterTemp : (waterTemp - 32) * 5 / 9;
    const pressBarG = isMetric ? deaeratorPressure : deaeratorPressure / 14.5038;
    const staticM = isMetric ? staticElevation : staticElevation / 3.28084;
    const frictionM = isMetric ? frictionLoss : frictionLoss / 3.28084;
    const npshrM = isMetric ? pumpNpshr : pumpNpshr / 3.28084;

    // Fluid physical property formulas
    const t = Math.max(0.1, Math.min(tempC, 250));
    // Antoine equation for vapor pressure in bar: log10(P_mmHg) = 8.07131 - 1730.63 / (T + 233.426)
    const logP = 8.07131 - 1730.63 / (t + 233.426);
    const pMmhg = Math.pow(10, logP);
    const pVaporBarAbs = pMmhg * 0.001333224;

    // ASME density polynomial approximation:
    const density = 1000 - 0.0178 * Math.pow(t - 4, 1.7);
    const specificGravity = density / 1000;

    // Atmospheric constant
    const atmosphericBarAbs = 1.01325;
    const pDeaeratorBarAbs = pressBarG + atmosphericBarAbs;

    // Convert pressures to water column meters
    // Head = (P_bar_abs * 10^5 Pa) / (density * g)
    const g = 9.80665;
    const suctionPressureHead = (pDeaeratorBarAbs * 100000) / (density * g);
    const vaporPressureHead = (pVaporBarAbs * 100000) / (density * g);

    // NPSHa = Suction Absolute Head + Static Head - Friction Loss - Vapor Pressure Head
    // Note that Ps_abs and Pvapor heads are scaled to density.
    const npshaM = suctionPressureHead + staticM - frictionM - vaporPressureHead;

    const npshaOutput = isMetric ? npshaM : npshaM * 3.28084;
    const npshaDisplay = parseFloat(Math.max(0, npshaOutput).toFixed(2));
    const marginRatio = npshrM > 0 ? npshaM / npshrM : 0;

    // Status evaluation
    let statusText = "Secure Margin";
    let statusColor = "text-[#00C896]";
    let statusBg = "bg-[#00C896]/10 border-[#00C896]/30";
    let statusIcon = <CheckCircle className="h-5 w-5 text-[#00C896]" />;

    if (npshaM < npshrM) {
      statusText = "HIGH CAVITATION DANGER! NPSHa < NPSHr";
      statusColor = "text-[#FF4C4C]";
      statusBg = "bg-[#FF4C4C]/10 border-[#FF4C4C]/30";
      statusIcon = <AlertTriangle className="h-5 w-5 text-[#FF4C4C]" />;
    } else if (npshaM < npshrM + 1.5) {
      statusText = "Marginal Security Buffer (Minimum 1.5m / 5ft separation advised)";
      statusColor = "text-[#FFB400]";
      statusBg = "bg-[#FFB400]/10 border-[#FFB400]/30";
      statusIcon = <AlertTriangle className="h-5 w-5 text-[#FFB400]" />;
    }

    return {
      density: parseFloat(density.toFixed(1)),
      specificGravity: parseFloat(specificGravity.toFixed(4)),
      pVaporAbs: parseFloat(pVaporBarAbs.toFixed(3)),
      pDeaeratorAbs: parseFloat(pDeaeratorBarAbs.toFixed(3)),
      suctionHeadM: parseFloat((isMetric ? suctionPressureHead : suctionPressureHead * 3.28084).toFixed(2)),
      vaporHeadM: parseFloat((isMetric ? vaporPressureHead : vaporPressureHead * 3.28084).toFixed(2)),
      npsha: npshaDisplay,
      marginRatio: parseFloat(marginRatio.toFixed(2)),
      statusText,
      statusColor,
      statusBg,
      statusIcon,
    };
  }, [deaeratorPressure, waterTemp, staticElevation, frictionLoss, pumpNpshr, isMetric]);

  const pUnit = isMetric ? 'bar' : 'psi';
  const hUnit = isMetric ? 'm' : 'ft';
  const tUnit = isMetric ? '°C' : '°F';
  const dUnit = isMetric ? 'kg/m³' : 'lb/ft³';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" id="npsh-view-root">
      {/* Page Hero */}
      <div className="mb-10 text-center md:text-left border-b border-[#2A3F5F]/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E90FF]/10 text-[#1E90FF] rounded-full text-xs font-mono font-bold mb-4">
          <Scaling className="h-3.5 w-3.5" /> INDUSTRIAL FLUID MECHANICS
        </div>
        <h1 className="text-3xl md:text-5xl font-sans tracking-tight font-bold text-white mb-4">
          Boiler Feed Pump NPSH Calculator & Sizing Guide
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          Evaluate Net Positive Suction Head Available (NPSHa) inside your boiler feed pump calculation equations. Guard your mechanical impellers against cavitation collapse using real-time thermodynamic properties and Hydraulic Institute Standards.
        </p>
      </div>

      {/* Grid of Content & Interactive NPSH Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Dynamic Interactive Calculator (Left/Main Panel) */}
        <div className="lg:col-span-7 bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 shadow-xl relative">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2A3F5F]/30">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FFB400]"></span>
                NPSHa Multi-Unit Audit Suite
              </h2>
              <p className="text-xs text-slate-400 mt-1">Computes water vapor flash margins continuously</p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-[#1F2E47] hover:bg-[#2B3F5D] text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label htmlFor="deaerator-pressure" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                Deaerator Gage Pressure (P_g) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="deaerator-pressure"
                  type="number"
                  step="any"
                  value={deaeratorPressure}
                  onChange={(e) => setDeaeratorPressure(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 uppercase select-none">
                  {pUnit}g
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Operating backpressure in deaerator steam space.</p>
            </div>

            <div>
              <label htmlFor="water-temp" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                Feedwater Peak Temperature (T) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="water-temp"
                  type="number"
                  step="any"
                  value={waterTemp}
                  onChange={(e) => setWaterTemp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  {tUnit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Determines boiling vapor pressure and density scaling.</p>
            </div>

            <div>
              <label htmlFor="static-elevation" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                Suction Vertical Static Height (H_z) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="static-elevation"
                  type="number"
                  step="any"
                  value={staticElevation}
                  onChange={(e) => setStaticElevation(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  {hUnit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Elevation lift difference: from vessel bottom to pump impeller.</p>
            </div>

            <div>
              <label htmlFor="friction-loss" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                Suction Pipfriction Drop (h_fs) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="friction-loss"
                  type="number"
                  step="any"
                  value={frictionLoss}
                  onChange={(e) => setFrictionLoss(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#1E90FF] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 select-none">
                  {hUnit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Resistance frictional head consumed in suction pipeline.</p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="pump-npshr" className="block text-xs font-mono font-bold text-[#FFB400] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                Pump Manufacturer Required NPSHr (at BEP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="pump-npshr"
                  type="number"
                  step="any"
                  value={pumpNpshr}
                  onChange={(e) => setPumpNpshr(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F2035] border border-[#2D3F5C] rounded-lg py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-[#FFB400] transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#FFB400] select-none">
                  {hUnit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Retrieve this parameter from the pump mechanical performance curve sheets.</p>
            </div>
          </div>

          {/* Results Block */}
          <div className="bg-[#09111D] border border-[#1E2E47] rounded-xl p-5 mb-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#1E90FF] mb-4">Thermodynamic & Suction Analysis</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 border-b border-[#2A3F5F]/20 pb-4 mb-4">
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase">Fluid Density</span>
                <span className="text-sm font-semibold font-mono text-white mt-1 block">
                  {npshCalc.density} kg/m³
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase">Specific Gravity</span>
                <span className="text-sm font-semibold font-mono text-[#00C896] mt-1 block">
                  {npshCalc.specificGravity}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase">Boiling Vapor Pressure</span>
                <span className="text-sm font-semibold font-mono text-[#FFB400] mt-1 block">
                  {npshCalc.pVaporAbs} bar(a)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col justify-between p-4 bg-[#14263D]/50 border border-[#2A3F5F]/30 rounded-lg">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block">NET NPSH AVAILABLE (NPSHa)</span>
                  <span className="text-2xl md:text-3xl font-mono font-black text-white mt-1 block">
                    {npshCalc.npsha} {hUnit}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                  This is the actual mechanical excess pressure liquid head preventing bubble vaporization inside your suction chambers.
                </div>
              </div>

              <div className="flex flex-col justify-between p-4 bg-[#14263D]/50 border border-[#2A3F5F]/30 rounded-lg">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block">SAFETY MARGIN RATIO (NPSHa/NPSHr)</span>
                  <span className="text-2xl md:text-3xl font-mono font-black text-[#FFB400] mt-1 block">
                    {npshCalc.marginRatio} x
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                  Hydraulic standards require <strong className="text-white">&ge; 1.30x</strong> to prevent continuous cavitation pitting, loud water hammers, and mechanical seal shearing.
                </div>
              </div>
            </div>

            {/* Cavitation warning board */}
            <div className={`mt-5 p-4 rounded-lg border text-sm font-medium ${npshCalc.statusBg} transition-all duration-300 flex items-start gap-3`}>
              <div className="mt-0.5">{npshCalc.statusIcon}</div>
              <div>
                <h4 className="font-bold mb-0.5 uppercase tracking-wide">Status Verdict</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{npshCalc.statusText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* E-E-A-T Side Expert Box / Quick Guidelines (Right Panel) */}
        <div className="lg:col-span-5 space-y-6">
          {/* HYDRODYNAMIC INSIGHT */}
          <div className="bg-gradient-to-br from-[#121E36] to-[#0A1224] border border-[#2A3F5F]/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden border border-[#2A3F5F] shrink-0 bg-[#0d1117]/60 flex items-center justify-center text-lg">
                💡
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Deaerator Saturation Principle</h3>
                <p className="text-xs text-[#00C896] font-medium mt-0.5">Hydrodynamic Design Advice</p>
              </div>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                In high-temperature boiler feed setups, the water in the deaerator tank is literally sitting at its saturation boiling point. This means that the deaerator suction vessel pressure is exactly balanced by the water vapor pressure.
              </p>
              <p className="font-semibold text-[#1E90FF] bg-[#1E90FF]/5 p-2 rounded border border-[#1E90FF]/15">
                💡 Design Guideline: The deaerator vessel pressure and the liquid's saturation vapor pressure terms in your suction equations cancel out completely. The static vertical elevation height of your deaerator is the primary variable generating positive pressure to prevent pump cavitation.
              </p>
            </div>
          </div>

          {/* CRITICAL NPSH EQUATION CHEATSHEET */}
          <div className="bg-[#0B1524] border border-[#2A3F5F]/40 rounded-2xl p-5 shadow-md">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#1E90FF]" /> ANSI/HI NPSHa Standard Equation
            </h3>
            <div className="bg-[#080E1C] p-3 rounded-lg border border-[#2A3F5F]/20 font-mono text-xs text-[#00C896] text-center overflow-x-auto leading-normal">
              NPSHa = H_suction_abs + H_static - h_friction - H_vapor_abs
            </div>
            <div className="text-xs text-slate-400 mt-4 leading-relaxed space-y-2">
              <p>Where:</p>
              <ul className="space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">H_suction_abs:</strong> Pressure on suction water level expressed in liquid meters (convert abs bar to meters).</li>
                <li><strong className="text-white">H_static:</strong> Metric height from the lowest liquid level in deaerator to pump impeller centerline (m lift).</li>
                <li><strong className="text-white">H_friction:</strong> Total pipe friction losses in suction strainers, valves, fittings, and manifolds.</li>
                <li><strong className="text-white">H_vapor_abs:</strong> Boiling pressure point liquid vapor head at working temperature.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Deep Dive & Structural Knowledge Base */}
      <section className="bg-[#0B1524] border border-[#2A3F5F]/30 rounded-2xl p-6 md:p-8 mt-10">
        <h2 className="text-xl md:text-2xl font-bold font-sans text-white mb-6 border-b border-[#2A3F5F]/20 pb-4">
          NPSH Mechanical Sizing Knowledge Base & Derivations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300 text-sm leading-relaxed">
          <div>
            <h3 className="font-bold text-[#FFB400] mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFB400]"></span>
              Why standard static suction lift is insufficient
            </h3>
            <p className="mb-4">
              Many inexperienced plant layout engineers assume that simply elevating a deaerator tank by 3 to 4 meters is universally sufficient to supply any boiler feedwater pump. However, this cold-condition rule of thumb fails catastrophically under high-pressure industrial boiler operating states.
            </p>
            <p className="mb-4">
              When water temperature reaches 130°C to 150°C, the corresponding vapor pressure of water escalates rapidly (reaching up to 4.7 bar absolute). Under these conditions, any minute suction piping friction restriction or sudden valve modulation creates localized pressure drops. If the local suction pressure drops below the saturated vapor pressure, cavitation bubbles immediately flash within the impeller eye.
            </p>
            <h3 className="font-bold text-[#FFB400] mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFB400]"></span>
              Consequences of Cavitation Erosion
            </h3>
            <p>
              When dynamic vapor bubbles travel from the low-pressure blade-inlet zone to the high-pressure discharging zone of an impeller, they collapse with violent force. This collapsing force produces sonic micro-jets that exert localized water pressures up to <strong className="text-white">10,000 bar</strong> on the blade surface. This mechanical battering leads to rapid structural failure, including cavitation micro-cracks, metal pitting, destruction of shaft sleeves, and immediate seal failure.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#1E90FF] mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E90FF]"></span>
              How to increase NPSHa in an existing installation
            </h3>
            <p className="mb-4">
              If an operational audit reveals a deficient or marginal NPSH condition, mechanical engineers can implement several targeted modifications:
            </p>
            <ul className="space-y-2 list-decimal list-inside pl-1 text-slate-300">
              <li>
                <strong className="text-white">Elevate the Deaerator Vessel:</strong> Structurally raise the feed water deaerator grid, increasing the vertical static height (H_z). Every 1 meter of physical lift yields ~0.95 meters of direct NPSHa buffer.
              </li>
              <li>
                <strong className="text-white">Install a Suction Inducer:</strong> Fit a low-NPSHa inducer blade directly on the shaft in front of the primary impeller.
              </li>
              <li>
                <strong className="text-white">Optimize Suction Piping:</strong> Replace small-bore suction pipes with larger diameters to reduce fluid velocity and drop frictional losses (h_fs) to near zero.
              </li>
              <li>
                <strong className="text-white">Lower Feedwater Temperature:</strong> Though thermodynamically disadvantageous to boiler efficiency, slightly sub-cooling the feedwater just prior to the pump entrance lowers the fluid's vapor pressure, instantly improving the cavitation safety margin.
              </li>
            </ul>
          </div>
        </div>

        {/* ASME guidelines for NPSH */}
        <div className="bg-[#101E35] border border-[#2A3F5F]/40 p-5 rounded-xl mt-8">
          <h4 className="font-mono text-xs font-bold text-[#FFB400] uppercase tracking-wider mb-2">ASME Sec I & VII Suction Guidelines</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            According to the American Society of Mechanical Engineers, transient power plant trips can dramatically drop steam pressures in deaerator header columns. If this happens, water in the suction pipe remains hot (due to thermal mass) while deaerator vessel pressure plummets. Therefore, a safety factor exceeding <strong className="text-white">2.0 meters</strong> is advised for all critical horizontal multistage centrifugal installations.
          </p>
        </div>
      </section>
    </div>
  );
}
