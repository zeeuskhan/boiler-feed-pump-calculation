import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle, RotateCcw, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function ContactView() {
  // Contact Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [boilerSpec, setBoilerSpec] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate real database ticket filing
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCompany('');
    setBoilerSpec('');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" id="contact-us-root">
      {/* Page Hero */}
      <div className="mb-10 text-center md:text-left border-b border-[#2A3F5F]/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E90FF]/10 text-[#1E90FF] rounded-full text-xs font-mono font-bold mb-4">
          <HeartHandshake className="h-3.5 w-3.5" /> INDUSTRIAL TECHNICAL HELPDESK
        </div>
        <h1 className="text-3xl md:text-5xl font-sans tracking-tight font-bold text-white mb-4">
          Technical Assistance & Engineering Consulting
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
          Need a third-party peer review or secondary sizing audit? Connect with our hydraulic specialists and obtain detailed system recommendations within 48 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Consultation Form (Left Panel) */}
        <div className="lg:col-span-7 bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 shadow-xl relative">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="pb-3 border-b border-[#2A3F5F]/20 mb-4">
                  <h2 className="sr-only">Mechanical Sizing Consultation Form</h2>
                  <h3 className="font-bold text-white text-base">File a Mechanical Sizing Ticket</h3>
                  <p className="text-[10px] text-slate-400">Directly routed to our Sizing Helpdesk</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="engineer-name" className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Design Engineer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="engineer-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Stephen Davies"
                      className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-2.5 px-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#1E90FF]"
                    />
                  </div>

                  <div>
                    <label htmlFor="engineer-email" className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Business Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="engineer-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. stephen@powerpiping.global"
                      className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-2.5 px-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#1E90FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company-name" className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Company / Organization
                    </label>
                    <input
                      id="company-name"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Davies Boiler Co."
                      className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-2.5 px-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#1E90FF]"
                    />
                  </div>

                  <div>
                    <label htmlFor="boiler-spec" className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Target Boiler Capacity & MCR Pressures
                    </label>
                    <input
                      id="boiler-spec"
                      type="text"
                      value={boilerSpec}
                      onChange={(e) => setBoilerSpec(e.target.value)}
                      placeholder="e.g. 80 TPH, 62 bar(g) drum, 120°C feed"
                      className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-2.5 px-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#1E90FF]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cavitation-msg" className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Piping Layout Details & Cavitation History <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="cavitation-msg"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide a brief explanation of your layout, deaerator lift elevation, and any persistent cavitation noise encountered..."
                    className="w-full bg-[#0F2035] border border-[#2A3F5F] rounded-lg py-2.5 px-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#1E90FF] leading-normal"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#1E90FF] to-[#00C896] text-white hover:from-[#359eff] hover:to-[#0ce3ab] rounded-xl text-xs font-mono font-bold hover:shadow-lg transition cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> File Ticket Setup
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 space-y-4"
              >
                <div className="h-16 w-16 bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="h-8 w-8 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white font-sans">Engineering Sizing Ticket Received!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Our technical team has successfully filed ticket <strong className="text-white">#BFP-{Math.floor(1000 + Math.random() * 9000)}-UP</strong>. A sizing specialist has been notified, and will email you with recommendations within 48 hours.
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#1B293F] hover:bg-[#273B59] text-xs font-mono font-bold text-slate-300 rounded-lg transition"
                >
                  <RotateCcw className="h-3 w-3 inline mr-1.5" /> Submit Another Ticket
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Physical Address details (Right Panel) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B1524] border border-[#2A3F5F]/50 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest border-b border-[#2A3F5F]/20 pb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#FFB400]" /> Institutional Liaison Office
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#1E90FF] mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Physical Office Headquarters</span>
                  <p className="text-white font-sans leading-relaxed mt-1">
                    Fluid Dynamics Laboratory Block 4B,<br />
                    Noida Cyber Park, Sector 62,<br />
                    Noida, Uttar Pradesh, PIN 201301, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#00C896] mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Liaison Inquiry Email</span>
                  <span className="text-white font-sans leading-tight mt-1 ml-0 block">
                    support@boilerfeedpumpcalculator.in
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#FFB400] mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Support Direct Telephone</span>
                  <span className="text-white font-sans leading-tight mt-1 ml-0 block">
                    +91 120 4452100 ext 450
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#101E35] border border-[#2A3F5F]/40 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#FFB400] uppercase flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-[#FFB400]" /> Important Sizing Warning Notice
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This digital tool handles theoretical mathematical balances and steady-state hydrodynamic equations. It is intended for pre-sizing estimates. Fluid networks are dangerous; always consult a certified professional engineer prior to ordering physical equipment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
