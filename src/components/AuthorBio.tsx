import React from 'react';
import { RajeshKumarBio } from '../data/seoContent';
import { Award, ShieldCheck, Mail, BookOpen, Linkedin } from 'lucide-react';

export default function AuthorBio() {
  return (
    <div 
      className="bg-gradient-to-r from-[#0C1524] via-[#0F1D33] to-[#0C1524] border border-[#2A3F5F]/60 rounded-2xl p-6 md:p-8 mt-12 shadow-2xl relative overflow-hidden" 
      id="eeat-author-bio-card"
    >
      {/* Decorative gradient glowing spots */}
      <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-[#1E90FF]/5 blur-xl"></div>
      <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-[#00C896]/5 blur-xl"></div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Author Avatar with initials */}
        <div className="flex flex-col items-center text-center shrink-0 w-full md:w-32">
          <div className="h-20 w-20 rounded-full border-2 border-[#1E90FF] bg-[#0A1221] shadow-lg flex items-center justify-center font-black text-2xl text-[#1E90FF] font-mono select-none">
            RK
          </div>
          <span className="text-[10px] font-mono text-[#00C896] font-bold uppercase tracking-widest mt-2 bg-[#00C896]/10 px-2 py-0.5 rounded-full border border-[#00C896]/20">
            PE Verified
          </span>
        </div>

        {/* Core Profile Data */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3F5F]/20 pb-3">
            <div>
              <h3 className="text-xl font-bold font-sans text-white tracking-tight">{RajeshKumarBio.name}</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{RajeshKumarBio.credentials} | {RajeshKumarBio.experience}</p>
            </div>
            <a 
              href={RajeshKumarBio.linkedIn}
              target="_blank" 
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#1E90FF] transition font-mono border border-[#2A3F5F]/40 hover:border-[#1E90FF]/40 rounded-lg px-2.5 py-1.5 bg-[#080E1C]"
            >
              <Linkedin className="h-3 w-3" /> Linkedin Profile
            </a>
          </div>

          <div className="text-xs md:text-sm text-slate-300 leading-relaxed">
            <p>{RajeshKumarBio.bio}</p>
          </div>

          {/* Peer Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            <div>
              <h4 className="text-[10px] font-mono font-bold text-[#FFB400] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Professional Accreditations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {RajeshKumarBio.certifications.map((cert, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-normal">
                    <span className="text-[#1E90FF] mt-0.5 font-bold">•</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-mono font-bold text-[#00C896] uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Major Station Audits Built
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {RajeshKumarBio.projects.map((proj, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-normal">
                    <span className="text-[#00C896] mt-0.5 font-bold">•</span>
                    <span>
                      <strong className="text-slate-300">{proj.plant}:</strong> {proj.outcome}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
