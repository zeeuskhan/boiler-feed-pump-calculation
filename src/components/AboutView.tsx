import React from 'react';
import { motion } from 'motion/react';
import { RajeshKumarBio } from '../data/seoContent';
import { Award, ShieldCheck, Mail, BookOpen, Compass, HeartHandshake, CheckCircle } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8" id="about-portfolio-root">
      {/* Editorial Header */}
      <div className="mb-10 text-center md:text-left border-b border-[#2A3F5F]/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E90FF]/10 text-[#1E90FF] rounded-full text-xs font-mono font-bold mb-4">
          <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED HYDRAULIC AUTHORITY
        </div>
        <h1 className="text-3xl md:text-5xl font-sans tracking-tight font-bold text-white mb-4">
          About Our Engineering Team & Lead Author
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          The mathematical algorithms and physical coefficients powering this calculator are curated by Professional Engineer Rajesh Kumar. We are committed to rendering accurate fluid metrics verified against physical high-pressure hydrostatic tests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Biography Column (Left Panel) */}
        <div className="lg:col-span-8 bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-[#2A3F5F]/20">
            <div className="h-24 w-24 rounded-full border-2 border-[#1E90FF] bg-[#0A1221] shadow-lg shrink-0 flex items-center justify-center font-black text-3xl font-mono text-[#1E90FF] select-none mx-auto md:mx-0">
              RK
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight">{RajeshKumarBio.name}</h2>
              <p className="text-sm font-semibold text-[#FFB400] font-mono">{RajeshKumarBio.credentials}</p>
              <p className="text-xs text-slate-400 font-mono">Former Lead Pump Designer at Kirloskar Brothers Ltd. | Active BEE India Energy Auditor</p>
            </div>
          </div>

          <div className="text-slate-300 text-sm leading-relaxed space-y-4">
            <h3 className="text-base font-bold text-white">Professional Journey & Core Competencies</h3>
            <p>
              With over 12 years of hands-on experience in thermal plant power cycles, Rajesh Kumar specializes in boiler feedwater mechanics, transient system resistance analysis, and cavitation suppression. During his tenure at KBL, Rajesh designed segmental-ring high-pressure feed pumps and horizontal multistage casing splitters for prominent utility scale operations across Asia.
            </p>
            <p>
              This computational laboratory was designed to address a critical deficit Rajesh identified in standard online calculators: they frequently assume tap water densities, leading to volumetric capacity deficits under warm feed deaerator loads. All algorithms here utilize ASME Steam Property polynomial interpolation rules.
            </p>
          </div>

          <div className="border-t border-[#2A3F5F]/20 pt-6">
            <h3 className="text-sm font-mono font-bold text-[#00C896] uppercase tracking-wider mb-4">Professional Certifications & Memberships</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RajeshKumarBio.certifications.map((cert, idx) => (
                <div key={idx} className="p-3 bg-[#112035]/50 border border-[#2A3F5F]/20 rounded-xl flex items-start gap-2.5">
                  <Award className="h-4 w-4 text-[#1E90FF] mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium leading-normal">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Major Grid Site Audits Column (Right Panel) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest border-b border-[#2A3F5F]/20 pb-2 mb-4 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-[#FFB400]" /> Major Station Commissioning Audits
            </h3>
            
            <div className="space-y-5">
              {RajeshKumarBio.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <h4 className="font-bold text-[#FFB400] leading-snug">{proj.plant}</h4>
                  <p className="text-slate-400 font-mono leading-tight">Duty: {proj.boiler}</p>
                  <p className="text-slate-300 leading-normal">{proj.outcome}</p>
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
              <CheckCircle className="h-3.5 w-3.5" /> ISO 9906 CLASS C COMPLIANT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
