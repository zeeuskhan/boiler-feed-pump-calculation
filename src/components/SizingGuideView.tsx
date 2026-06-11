import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { UnitSystem } from '../types';
import { RajeshKumarBio, IndustryStandardsList, CommonSizingMistakes } from '../data/seoContent';
import { FileText, ArrowRight, BookOpen, RotateCcw, Compass, ListTodo, HelpCircle, Activity } from 'lucide-react';

interface SizingGuideViewProps {
  unitSystem: UnitSystem;
}

export default function SizingGuideView({ unitSystem }: SizingGuideViewProps) {
  const isMetric = unitSystem === UnitSystem.Metric;

  // Sizer states
  const [pipelineFlow, setPipelineFlow] = useState<number>(15); // m3/hr or GPM
  const [targetVelocity, setTargetVelocity] = useState<number>(2.0); // m/s or ft/s
  const [pipeStandard, setPipeStandard] = useState<string>("suction"); // suction or discharge

  const handleReset = () => {
    if (isMetric) {
      setPipelineFlow(15);
      setTargetVelocity(2.0);
      setPipeStandard("suction");
    } else {
      setPipelineFlow(66);
      setTargetVelocity(6.5);
      setPipeStandard("suction");
    }
  };

  // Pipe Sizing Math
  const pipeSizing = useMemo(() => {
    const isMetricSystem = unitSystem === UnitSystem.Metric;
    const flowVal = isMetricSystem ? pipelineFlow : pipelineFlow / 4.402868; // convert gpm to m3/hr
    const velVal = isMetricSystem ? targetVelocity : targetVelocity / 3.28084; // convert ft/s to m/s

    const flowM3S = flowVal / 3600;
    const velocityClamp = Math.max(0.1, velVal);
    const area = flowM3S / velocityClamp;
    const diameterM = Math.sqrt((4 * area) / Math.PI);
    const diameterMM = diameterM * 1000;
    const diameterInches = diameterMM / 25.4;

    // Suggest velocity bounds based on standard engineering practices
    let boundDesc = "Suction Pipe Boundary. Recommended maximum liquid velocity is 1.5 - 2.0 m/s (4.9 - 6.5 ft/s) to optimize NPSHa.";
    if (pipeStandard === "discharge") {
      boundDesc = "Discharge Pipe Boundary. Recommended maximum velocity is 2.5 - 3.5 m/s (8.2 - 11.5 ft/s) to avoid excessive pipe friction head losses.";
    }

    return {
      diameterMM: Math.ceil(diameterMM),
      diameterInches: parseFloat(diameterInches.toFixed(2)),
      crossSectionAreaCm2: parseFloat((area * 10000).toFixed(2)),
      boundDesc,
    };
  }, [pipelineFlow, targetVelocity, pipeStandard, unitSystem]);

  const fUnit = isMetric ? 'm³/hr' : 'GPM';
  const vUnit = isMetric ? 'm/s' : 'ft/s';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" id="sizing-guide-view-root">
      {/* Page Hero */}
      <div className="mb-10 text-center md:text-left border-b border-[#2A3F5F]/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E90FF]/10 text-[#1E90FF] rounded-full text-xs font-mono font-bold mb-4">
          <Compass className="h-3.5 w-3.5" /> SIZING CHECKLIST & PIPING CRITERIA
        </div>
        <h1 className="text-3xl md:text-5xl font-sans tracking-tight font-bold text-white mb-4">
          Boiler Feed Pump Professional Sizing Worksheets
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          Master the complete boiler feed pump calculation workflow. From deaerator mass balances to pipeline diameter velocity checks, construct an ASME B31.1 compliant piping grid.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Step-by-Step Checklist (Left Panel) */}
        <div className="lg:col-span-7 bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-[#2A3F5F]/20">
            <ListTodo className="h-5 w-5 text-[#1E90FF]" />
            5-Step Hydraulic Sizing Flow-Worksheet
          </h2>

          {/* Step 1 */}
          <div className="p-4 bg-[#112035]/50 border border-[#2A3F5F]/30 rounded-xl relative">
            <span className="absolute top-4 right-4 bg-[#1E90FF]/10 text-[#1E90FF] border border-[#1E90FF]/30 font-mono text-xs font-bold px-2 py-0.5 rounded-full">STEP 1</span>
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              1. Mass Capacity Sizing Balance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Calculate total Mass Flow Rate (kg/hr or lb/hr) by adding Boiler Continuous Evaporation Rating (MCR) to deaerator blowdown purges (typically 2-4% to exhaust TDS scaling salts):
            </p>
            <div className="bg-black/35 p-3 rounded-lg font-mono text-xs text-emerald-400 text-center leading-normal">
              Q_mass_sizing = MCR * (1 + blowdown % / 100) * SF_capacity
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              *Typical engineering safety pad (SF_capacity) ranges from 10% to 15% to buffer sudden boiler steam swing load shifts.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-[#112035]/50 border border-[#2A3F5F]/30 rounded-xl relative">
            <span className="absolute top-4 right-4 bg-[#1E90FF]/10 text-[#1E90FF] border border-[#1E90FF]/30 font-mono text-xs font-bold px-2 py-0.5 rounded-full">STEP 2</span>
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              2. Volumetric Density Translation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Boilers generate steam, which is a mass-based value. However, pumps are physical, volumetric displacement impellers. Sizing requires dividing mass by fluid density at preheated feedwater temperature (rather than cold tap water coefficients):
            </p>
            <div className="bg-black/35 p-3 rounded-lg font-mono text-xs text-[#FFB400] text-center leading-normal">
              Q_volume (m³/hr) = Q_mass_sizing (kg/hr) / &rho;_preheated
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              *Water expands heavily under heat load: at 140°C, density &rho; = 925 kg/m³ (as opposed to 1000 kg/m³ at 4°C), resulting in a +7.5% volume increase that must be accounted for.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-[#112035]/50 border border-[#2A3F5F]/30 rounded-xl relative">
            <span className="absolute top-4 right-4 bg-[#1E90FF]/10 text-[#1E90FF] border border-[#1E90FF]/30 font-mono text-xs font-bold px-2 py-0.5 rounded-full">STEP 3</span>
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              3. Total Dynamic Head (TDH) Accumulation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Total dynamic head registers the total hydraulic pressure difference (in meters of liquid) that the pump impellers must supply. Calculate discharge backpressure, suction vessel operating pressure, static elevation lift, and pipe friction losses:
            </p>
            <div className="bg-black/35 p-3 rounded-lg font-mono text-xs text-[#1E90FF] text-center leading-normal">
              TDH = [(P_drum_g + P_valve_drop - P_suction_g) * 10.2 / SG ] + H_static + H_friction
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-[#112035]/50 border border-[#2A3F5F]/30 rounded-xl relative">
            <span className="absolute top-4 right-4 bg-[#1E90FF]/10 text-[#1E90FF] border border-[#1E90FF]/30 font-mono text-xs font-bold px-2 py-0.5 rounded-full">STEP 4</span>
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              4. NPSHa Cavitation Verification
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Always audit Net Positive Suction Head Available (NPSHa) utilizing true steam pocket vapor pressure at boiling temperature. Deaerators are placed elevated (static column lift H_z) to generate safe hydraulic suction energy:
            </p>
            <div className="bg-black/35 p-3 rounded-lg font-mono text-xs text-red-400 text-center leading-normal">
              NPSHa = H_static_suction - h_friction_suction &ge; NPSHr + 1.5m Safety
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 bg-[#112035]/50 border border-[#2A3F5F]/30 rounded-xl relative">
            <span className="absolute top-4 right-4 bg-[#1E90FF]/10 text-[#1E90FF] border border-[#1E90FF]/30 font-mono text-xs font-bold px-2 py-0.5 rounded-full">STEP 5</span>
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              5. Brake Horsepower & Grid Driver Selection
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Sizing the electric motor requires dividing the liquid output power by pump mechanical efficiencies, coupled with an electrical grid motor performance coefficient (IE3 standard):
            </p>
            <div className="bg-black/35 p-3 rounded-lg font-mono text-xs text-cyan-400 text-center leading-normal">
              Motor Input kW = [ Hydraulic kW / &eta;_pump ] * [ 1.15 Safety Buffer / &eta;_motor ]
            </div>
          </div>
        </div>

        {/* Interactive Pipe Sizer Card (Right Panel) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B1524] border border-[#2D3F5C] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#2A3F5F]/20">
              <div>
                <h3 className="font-bold text-white text-sm">Velocity-Based Pipe Diameter Sizer</h3>
                <p className="text-[10px] text-slate-400">Calculates pipe physical bores based on velocity limits</p>
              </div>
              <button onClick={handleReset} className="text-slate-400 hover:text-white transition">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Selector fields */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Pipeline Volumetric Flow (Q)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={pipelineFlow}
                    onChange={(e) => setPipelineFlow(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-2.5 px-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#1E90FF]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 select-none">
                    {fUnit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Design Target Velocity (v)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={targetVelocity}
                    onChange={(e) => setTargetVelocity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-2.5 px-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#1E90FF]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 select-none">
                    {vUnit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Pipeline Operating Sector
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPipeStandard("suction");
                      setTargetVelocity(isMetric ? 1.8 : 5.9);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium border transition ${
                      pipeStandard === "suction"
                        ? "bg-[#1E90FF]/10 text-[#1E90FF] border-[#1E90FF]/50"
                        : "bg-[#0F2035] text-slate-400 border-[#2A3F5F]/60 hover:text-white"
                    }`}
                  >
                    Suction (Low Vel)
                  </button>
                  <button
                    onClick={() => {
                      setPipeStandard("discharge");
                      setTargetVelocity(isMetric ? 3.0 : 9.8);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium border transition ${
                      pipeStandard === "discharge"
                        ? "bg-[#1E90FF]/10 text-[#1E90FF] border-[#1E90FF]/50"
                        : "bg-[#0F2035] text-slate-400 border-[#2A3F5F]/60 hover:text-white"
                    }`}
                  >
                    Discharge (High Vel)
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations outputs */}
            <div className="bg-[#09111D] border border-[#1E2E47] p-4 rounded-lg">
              <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">RECOMMENDED PIPE INNER BORE (ID)</span>
              <span className="text-xl md:text-2xl font-mono font-black text-white block">
                {pipeSizing.diameterMM} mm <span className="text-sm font-normal text-slate-400">({pipeSizing.diameterInches} inches Nominal)</span>
              </span>
              <p className="text-[10px] text-[#00C896] font-mono mt-1 block">Cross-Sectional Area: {pipeSizing.crossSectionAreaCm2} cm²</p>
              
              <div className="mt-3.5 pt-3.5 border-t border-[#2A3F5F]/20 text-[10px] text-slate-300 leading-normal">
                {pipeSizing.boundDesc}
              </div>
            </div>
          </div>

          {/* RELEVENT ASME STANDARDS CODE CARD */}
          <div className="bg-[#101E35] border border-[#2A3F5F]/40 rounded-2xl p-5 shadow-sm text-xs leading-relaxed space-y-3">
            <h4 className="font-bold text-[#FFB400] flex items-center gap-1">
              <Compass className="h-4 w-4 text-[#FFB400]" /> ASME B31.1 Power Piping velocities
            </h4>
            <p className="text-slate-300">
              According to standard steam-grid standards, boiler piping systems should adhere to strict physical velocity limits to prevent acoustic noise, vibration lines, high erosion, and pressure spikes:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-305 text-slate-400">
              <li><strong className="text-white">Suction water line:</strong> 1.2 to 2.1 m/s (4 - 7 ft/s)</li>
              <li><strong className="text-white">Discharge water line:</strong> 2.4 to 4.5 m/s (8 - 15 ft/s)</li>
              <li><strong className="text-white">Venting lines:</strong> up to 15 m/s (50 ft/s)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
