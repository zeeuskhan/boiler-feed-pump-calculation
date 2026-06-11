import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UnitSystem } from '../types';
import PumpCurveChart from './PumpCurveChart';
import { RajeshKumarBio } from '../data/seoContent';
import { Award, RotateCcw, Sliders, TrendingUp, Info, BookOpen } from 'lucide-react';

interface SelectionChartViewProps {
  unitSystem: UnitSystem;
}

export default function SelectionChartView({ unitSystem }: SelectionChartViewProps) {
  const isMetric = unitSystem === UnitSystem.Metric;

  // Visualizer operating points
  const [visFlow, setVisFlow] = useState<number>(35); // m3/h or GPM
  const [visHead, setVisHead] = useState<number>(180); // meters or feet

  const handleReset = () => {
    if (isMetric) {
      setVisFlow(35);
      setVisHead(180);
    } else {
      setVisFlow(154);
      setVisHead(590);
    }
  };

  const fUnit = isMetric ? 'm³/hr' : 'GPM';
  const hUnit = isMetric ? 'm' : 'ft';

  // Volumetric ranges and MCSF (Minimum continuous stable flows) boundaries
  const mcsf = parseFloat((visFlow * 0.3).toFixed(1));
  const runoutLimit = parseFloat((visFlow * 1.3).toFixed(1));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" id="selection-chart-view-root">
      {/* Page Hero */}
      <div className="mb-10 text-center md:text-left border-b border-[#2A3F5F]/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E90FF]/10 text-[#1E90FF] rounded-full text-xs font-mono font-bold mb-4">
          <TrendingUp className="h-3.5 w-3.5" /> HYDRAULIC PERFORMANCE MAPPING
        </div>
        <h1 className="text-3xl md:text-5xl font-sans tracking-tight font-bold text-white mb-4">
          Pump Selection Curves & Performance Charting
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          Plot performance curve intersections based on your boiler feed pump calculation. Graph your system's resistance parabola against centrifugal curves, and calibrate minimum safe thresholds, operating intersections, and run-out bounds under ISO 9906.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Performance Controls (Left Sidebar) */}
        <div className="lg:col-span-4 bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#2A3F5F]/20">
            <div>
              <h3 className="font-bold text-white text-sm">Pump Curve Modeler</h3>
              <p className="text-[10px] text-slate-400">Tweak operating specs to shift curves</p>
            </div>
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-white transition"
              title="Reset sliders"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400 uppercase tracking-wider">Dynamic Capacity:</span>
                <span className="text-[#00C896] font-bold">{visFlow} {fUnit}</span>
              </div>
              <input
                type="range"
                min={isMetric ? "5" : "22"}
                max={isMetric ? "200" : "880"}
                value={visFlow}
                onChange={(e) => setVisFlow(parseFloat(e.target.value) || 0)}
                className="w-full accent-[#00C896] bg-[#0F2035] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400 uppercase tracking-wider">Dynamic TDH Target:</span>
                <span className="text-[#1E90FF] font-bold">{visHead} {hUnit}</span>
              </div>
              <input
                type="range"
                min={isMetric ? "20" : "65"}
                max={isMetric ? "1100" : "3600"}
                value={visHead}
                onChange={(e) => setVisHead(parseFloat(e.target.value) || 0)}
                className="w-full accent-[#1E90FF] bg-[#0F2035] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Boundaries summary table */}
          <div className="bg-[#09111D] border border-[#1E2E47]/60 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest border-b border-[#2A3F5F]/15 pb-1.5">
              ISO Hydraulic Boundaries
            </h4>
            
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Min Stable Flow (MCSF):</span>
              <span className="text-[#FFB400] font-bold">{mcsf} {fUnit}</span>
            </div>
            
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Design Operating BEP:</span>
              <span className="text-white font-bold">{visFlow} {fUnit}</span>
            </div>
            
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Run-out Flow Limit:</span>
              <span className="text-red-400 font-bold">{runoutLimit} {fUnit}</span>
            </div>

            <p className="text-[9px] text-slate-400 leading-normal pt-1.5 border-t border-[#2A3F5F]/15">
              *Operating below MCSF causes extreme vibration, shaft deflection, and temperature build-up inside the casing.
            </p>
          </div>
        </div>

        {/* Live Active SVG Chart (Right Panel) */}
        <div className="lg:col-span-8 bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-5 shadow-xl">
          <PumpCurveChart
            unitSystem={unitSystem}
            operatingFlow={visFlow}
            operatingHead={visHead}
          />
          
          <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 bg-[#FFB400] rounded-sm block"></span>
              Pump Performance Curve (H-Q)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 bg-[#1E90FF] rounded-sm block"></span>
              Calculated Piping System Resistance
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#00C896] block"></span>
              Operating Design Point (Intersection)
            </span>
          </div>
        </div>
      </div>

      {/* Educational depth on Pump Curves Interpretation */}
      <section className="bg-[#0B1524] border border-[#2A3F5F]/30 rounded-2xl p-6 md:p-8 mt-10">
        <h2 className="text-xl md:text-2xl font-bold font-sans text-white mb-6 border-b border-[#2A3F5F]/20 pb-4">
          How to Read and Interpret Centrifugal Pump Performance Sheets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300 text-sm leading-relaxed">
          <div>
            <h3 className="font-bold text-[#00C896] mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C896]"></span>
              Centrifugal Curvature Profile (The Head Curve)
            </h3>
            <p className="mb-4">
              The pump head curve (H-Q) charts the mechanical head in meters or feet generated by the spinning impellers as a function of the volume flow rate. The head is highest at zero flow (known as the <strong className="text-white">shut-off head</strong>, typically 125% of the operating target). As the discharge throttle valve opens and volume flow rate increases, generated head drops down quadratically.
            </p>
            <p className="mb-4">
              For boiler feed pump installations, the H-Q curve must exhibit a stable "rise-to-shutoff" gradient. A drooping curve, where the shut-off head is lower than a mid-flow point, can cause control system hunting and steam drum water level oscillations.
            </p>
            <h3 className="font-bold text-[#00C896] mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C896]"></span>
              System Curve Resistance (The Parabola)
            </h3>
            <p>
              The system resistance curve is defined entirely by the physical layout of the piping grid. It represents the head required to overcome static height lifts (the elevation to the deaerator or steam drum, which remains fixed) and dynamic frictional losses (which increase as the square of the flow rate). The intersection of the Pump Curve and the System Curve is the sole point where the pump operates stably in the field.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#1E90FF] mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E90FF]"></span>
              The Best Efficiency Point (BEP) Sweet Spot
            </h3>
            <p className="mb-4">
              Every centrifugal impeller has a specific flow capacity where fluid enters and exits the impeller blades with minimal physical hydraulic turbulence. This point of maximum mechanical-to-fluid energy conversion is the Best Efficiency Point (BEP).
            </p>
            <p className="mb-4">
              Pumps should always be selected so that their primary design duty point sits between <strong className="text-white">80% and 110% of their BEP</strong>. Operating too far to the left (throttled flow) causes fluid recirculation, high shaft deflection, and heat build-up. Conversely, running too far to the right (run-out flow) causes low outlet head and severe cavitation.
            </p>
            
            <div className="bg-[#101E35] border border-[#2A3F5F]/40 p-4 rounded-xl">
              <h4 className="font-mono text-xs font-bold text-[#FFB400] uppercase tracking-wider mb-2">💡 MCSF Protection & Minimum Bypass Valves</h4>
              <p className="text-xs text-slate-300 leading-normal">
                Because boiler feed pumps handle very high heads and pressures, operating them at low flows can cause water to boil inside the casing in minutes. To prevent this, standard power plant designs mandate an automatic <strong className="text-white">Minimum Flow Bypass Valve (ARC Valve)</strong> that opens to recirculate water back to the deaerator if flow drops below the MCSF limit (typically 25-35% of BEP).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
