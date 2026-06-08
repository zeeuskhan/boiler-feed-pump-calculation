import { UnitSystem } from '../types';

interface SystemDiagramProps {
  unitSystem: UnitSystem;
  dischargePressure: number;
  suctionPressure: number;
  staticHead: number;
  frictionSuction: number;
  frictionDischarge: number;
  velocityHead: number;
}

export default function SystemDiagram({
  unitSystem,
  dischargePressure,
  suctionPressure,
  staticHead,
  frictionSuction,
  frictionDischarge,
  velocityHead,
}: SystemDiagramProps) {
  const pUnit = unitSystem === UnitSystem.Metric ? 'bar' : 'psi';
  const hUnit = unitSystem === UnitSystem.Metric ? 'm' : 'ft';

  return (
    <div className="w-full bg-[#0D1B2A] border border-[#2A3F5F] rounded-xl p-5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFB400] flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#1E90FF] animate-pulse"></span>
          ASME Piping & Hydraulic Schematic
        </h4>
        <span className="text-[10px] font-mono text-slate-400">Physical Sizing Boundary</span>
      </div>

      <div className="w-full aspect-[16/9] relative min-h-[220px]">
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full text-slate-300 font-mono"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS for Gradients and Arrows */}
          <defs>
            <linearGradient id="blueWaterGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00C896" stopOpacity="0.4" />
            </linearGradient>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1E90FF" />
            </marker>
            <marker
              id="arrowAmber"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FFB400" />
            </marker>
          </defs>

          {/* BACKGROUND GRID */}
          <g opacity="0.05">
            <path d="M 0 50 L 800 50 M 0 100 L 800 100 M 0 150 L 800 150 M 0 200 L 800 200 M 0 250 L 800 250 M 0 300 L 800 300 M 0 350 L 800 350 M 0 400 L 800 400" stroke="#FFF" strokeWidth="1" />
            <path d="M 100 0 L 100 450 M 200 0 L 200 450 M 300 0 L 300 450 M 400 0 L 400 450 M 500 0 L 500 450 M 600 0 L 600 450 M 700 0 L 700 450" stroke="#FFF" strokeWidth="1" />
          </g>

          {/* 1. DEAERATOR TANK (Source) */}
          <g transform="translate(40, 180)">
            <rect x="0" y="0" width="140" height="120" rx="10" fill="#0F2035" stroke="#2A3F5F" strokeWidth="2" />
            <line x1="0" y1="50" x2="140" y2="50" stroke="#1E90FF" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M 0 50 Q 35 48 70 50 T 140 50 L 140 120 L 0 120 Z" fill="url(#blueWaterGrad)" opacity="0.5" />
            <text x="12" y="30" fontSize="11" fill="#A8B8D0" fontWeight="bold">Deaerator Tank</text>
            <text x="12" y="80" fontSize="10" fill="#FFB400">Ps: {suctionPressure} {pUnit}</text>
            <text x="12" y="100" fontSize="9" fill="#00C896">Feedwater Source</text>
          </g>

          {/* 2. PUMP ELEMENT (Multistage symbol in active state) */}
          <g transform="translate(300, 240)">
            {/* Pump base casing */}
            <circle cx="50" cy="50" r="35" fill="#0F2035" stroke="#1E90FF" strokeWidth="3" />
            {/* Impeller blades */}
            <path d="M 50 15 L 50 85 M 15 50 L 85 50 M 25 25 L 75 75 M 25 75 L 75 25" stroke="#2A3F5F" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="10" fill="#FFB400" />
            {/* Multistage label */}
            <rect x="5" y="90" width="90" height="20" rx="4" fill="#1A2942" stroke="#2A3F5F" strokeWidth="1" />
            <text x="14" y="103" fontSize="9" fill="#FFF" fontWeight="bold" letterSpacing="1">FEED PUMP</text>
          </g>

          {/* 3. BOILER DRUM (Destination) */}
          <g transform="translate(580, 40)">
            <rect x="0" y="0" width="160" height="150" rx="15" fill="#0F2035" stroke="#FFB400" strokeWidth="2" />
            {/* Water level inside drum */}
            <path d="M 0 110 Q 40 108 80 110 T 160 110 L 160 150 L 0 150 Z" fill="url(#blueWaterGrad)" opacity="0.3" />
            <text x="15" y="35" fontSize="11" fill="#FFF" fontWeight="bold">Steam Drum</text>
            <text x="15" y="60" fontSize="10" fill="#FF6B35" fontWeight="bold">Pd: {dischargePressure} {pUnit}</text>
            <text x="15" y="80" fontSize="9" fill="#A8B8D0">Elevation Target</text>
            <text x="15" y="130" fontSize="9" fill="#1E90FF">Saturated Liquid</text>
          </g>

          {/* PIPING LINES WITH ANIMATED DOTS */}
          {/* Suction Line: Deaerator into Pump */}
          <path d="M 180 270 L 300 270" stroke="#1E90FF" strokeWidth="4" markerEnd="url(#arrow)" />
          {/* Flow indicators */}
          <circle cx="210" cy="270" r="3" fill="#00C896" />
          <circle cx="260" cy="270" r="3" fill="#00C896" />

          {/* Discharge Line: Pump out (350,270) up to (350,115) to Boiler (580,115) */}
          <path d="M 335 240 L 335 115 L 580 115" stroke="#1E90FF" strokeWidth="4" fill="none" markerEnd="url(#arrow)" />
          {/* Flow dots */}
          <circle cx="335" cy="180" r="3" fill="#00C896" />
          <circle cx="430" cy="115" r="3" fill="#00C896" />
          <circle cx="510" cy="115" r="3" fill="#00C896" />

          {/* PIPING PARAMETERS CALLOUT / BRACKETS */}
          {/* Static Vertical Rise Elevation Line */}
          <line x1="560" y1="270" x2="560" y2="115" stroke="#FFB400" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="550" y1="270" x2="570" y2="270" stroke="#FFB400" strokeWidth="2" />
          <line x1="550" y1="115" x2="570" y2="115" stroke="#FFB400" strokeWidth="2" />
          <text x="440" y="200" fontSize="10" fill="#FFB400" fontWeight="bold">Static Head (Hz): {staticHead} {hUnit}</text>

          {/* Suction Friction Callout */}
          <rect x="185" y="285" width="105" height="40" rx="4" fill="#101E35" stroke="#2A3F5F" strokeWidth="1" />
          <text x="193" y="300" fontSize="9" fill="#A8B8D0">Suction Friction</text>
          <text x="193" y="315" fontSize="10" fill="#00C896" fontWeight="bold">Hfs: {frictionSuction} {hUnit}</text>

          {/* Discharge Friction Callout */}
          <rect x="360" y="125" width="140" height="42" rx="4" fill="#101E35" stroke="#2A3F5F" strokeWidth="1" />
          <text x="368" y="140" fontSize="9" fill="#A8B8D0">Piping & Eco Friction</text>
          <text x="368" y="156" fontSize="10" fill="#1E90FF" fontWeight="bold">Hfd: {frictionDischarge} {hUnit}</text>

          {/* Velocity Head Callout */}
          <rect x="590" y="205" width="130" height="40" rx="4" fill="#101E35" stroke="#FFB400" strokeWidth="1" opacity="0.9" />
          <text x="598" y="220" fontSize="9" fill="#A8B8D0">Velocity Head (ΔHv)</text>
          <text x="598" y="235" fontSize="9" fill="#FFB400" fontWeight="bold">{velocityHead} {hUnit} (v²/2g)</text>

          {/* Flow Direction arrow tags */}
          <text x="210" y="255" fontSize="9" fill="#1E90FF" opacity="0.8">SUCTION</text>
          <text x="430" y="100" fontSize="9" fill="#1E90FF" opacity="0.8">DISCHARGE FEEDLINE</text>
        </svg>
      </div>
      <div className="mt-2 text-[10px] font-mono text-slate-400 text-center leading-normal">
        ASME boundary: Feed line integrates suction column losses (<span className="text-[#00C896]">Hfs</span>), static elevator lift (<span className="text-[#FFB400]">Hz</span>), piping/economizer resistance drops (<span className="text-[#1E90FF]">Hfd</span>), and friction buffers.
      </div>
    </div>
  );
}
