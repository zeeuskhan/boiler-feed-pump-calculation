import React from 'react';
import { ShieldCheck, Award, BookOpen, Compass, HeartHandshake, CheckCircle } from 'lucide-react';

export default function AboutView() {
  const coreStandards = [
    "ASME Section I Boiler & Pressure Vessel Code standards alignment",
    "ISO 9906 Grade 1 / Grade 2 Performance Testing Criteria validation",
    "Hydraulic Institute Standard HI 14.3 for Rotodynamic Pumps",
    "ASME B31.1 Power Piping design standard integration"
  ];

  const typicalCalculations = [
    {
      title: "Volumetric Capacity & Temperature Adjustment",
      desc: "Adjusts pump capacity based on temperature-dependent density calculations (incorporating saturated water density lookups, crucial for high-temperature preheated deaerator fluid)."
    },
    {
      title: "Total Dynamic Head & Pipeline Losses",
      desc: "Leverages the Darcy-Weisbach or Hazen-Williams methodology to dynamically compute friction factors along with elevation delta parameters."
    },
    {
      title: "Critical NPSHa & Vapor Thresholds",
      desc: "Guarantees safe NPSH margin parameters, identifying potential boiling-point vaporization issues in the deaerator draw-downs."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" id="about-portfolio-root">
      {/* Editorial Header */}
      <div className="mb-10 text-center md:text-left border-b border-[#2A3F5F]/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E90FF]/10 text-[#1E90FF] rounded-full text-xs font-mono font-bold mb-4">
          <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED HYDRAULIC STANDARDS
        </div>
        <h1 className="text-3xl md:text-5xl font-sans tracking-tight font-bold text-white mb-4">
          About Our Sizing Portal & Calculation Engine
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          This digital suite delivers rigorous fluid mechanics and thermo-physical equations. We are committed to rendering accurate fluid metrics verified against thermodynamic properties and standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Core Calculation Framework (Left Panel) */}
        <div className="lg:col-span-8 bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="pb-6 border-b border-[#2A3F5F]/20">
            <h2 className="text-2xl font-bold text-white tracking-tight">Our Computational Standards Goal</h2>
            <p className="text-xs text-[#FFB400] font-mono mt-1">High-Pressure Hydraulic Sizing Framework</p>
          </div>

          <div className="text-slate-300 text-sm leading-relaxed space-y-4">
            <p>
              Standard online calculators frequently assume ambient tap water densities and temperatures, leading to severe volume capacity deficits under actual high-temperature boiler feedwater conditions (which can reach over 160°C inside steam-drum cycle deaerators).
            </p>
            <p>
              To maintain absolute mathematical precision, this portal implements polynomial thermodynamic curves directly. Our algorithms adjust water density, dynamic vapor pressure, and head losses dynamically depending on your active temperature inputs.
            </p>
          </div>

          <div className="border-t border-[#2A3F5F]/20 pt-6">
            <h3 className="text-sm font-mono font-bold text-[#00C896] uppercase tracking-wider mb-4">Key Industrial Compliance Standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coreStandards.map((cert, idx) => (
                <div key={idx} className="p-3 bg-[#112035]/50 border border-[#2A3F5F]/20 rounded-xl flex items-start gap-2.5">
                  <Award className="h-4 w-4 text-[#1E90FF] mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium leading-normal">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Processes (Right Panel) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest border-b border-[#2A3F5F]/20 pb-2 mb-4 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-[#FFB400]" /> Sizing Computation Areas
            </h3>
            
            <div className="space-y-5">
              {typicalCalculations.map((calc, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <h4 className="font-bold text-[#FFB400] leading-snug">{calc.title}</h4>
                  <p className="text-slate-300 leading-normal">{calc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#101E35] border border-[#2A3F5F]/40 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-[#00C896]" /> Our Core Standards Pledge
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              We pledge to deliver engineering-grade tools with complete transparency. We never disguise approximations, and we explicitly document physical boundaries and ASME code limitations.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-[#00C896] font-mono font-bold">
              <CheckCircle className="h-3.5 w-3.5" /> ISO 9906 HIGH FIDELITY PROXY COMPLIANT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
