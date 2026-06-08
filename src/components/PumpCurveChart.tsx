import { UnitSystem } from '../types';

interface PumpCurveChartProps {
  unitSystem: UnitSystem;
  operatingFlow: number; // m3/h or GPM
  operatingHead: number; // m or ft
}

export default function PumpCurveChart({
  unitSystem,
  operatingFlow,
  operatingHead,
}: PumpCurveChartProps) {
  const fUnit = unitSystem === UnitSystem.Metric ? 'm³/hr' : 'GPM';
  const hUnit = unitSystem === UnitSystem.Metric ? 'm' : 'ft';

  // Protect against zero or negative values causing math errors
  const qOp = Math.max(0.1, operatingFlow);
  const hOp = Math.max(0.1, operatingHead);

  // Setup dynamic mathematical curves mapped to full physical scale space
  // Max scale bounds on chart:
  const qMaxChart = qOp * 1.6;
  const hMaxChart = hOp * 1.4;

  // Pump Curve: H(Q) = H_shutoff - alpha * Q^2
  // We want: H(0) = 1.25 * hOp (Shutoff head)
  // We want: H(qOp) = hOp (Operating point)
  const hShutoff = 1.25 * hOp;
  const alpha = (hShutoff - hOp) / (qOp * qOp);

  // System Curve: H_sys(Q) = H_static + beta * Q^2
  // Let's assume a realistic static head component of 40% of operating head
  const hStaticSys = 0.45 * hOp;
  const beta = (hOp - hStaticSys) / (qOp * qOp);

  // Generate path coordinates to draw the parabolas inside SVG viewBox="0 0 500 300"
  const width = 500;
  const height = 300;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Convert logical coordinates (Q, H) into SVG pixel coordinates (x, y)
  const getX = (q: number) => {
    return paddingLeft + (q / qMaxChart) * chartWidth;
  };

  const getY = (h: number) => {
    return paddingTop + chartHeight - (h / hMaxChart) * chartHeight;
  };

  // Generate Pump Curve Path
  let pumpCurvePoints = '';
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const q = (qMaxChart * i) / steps;
    const h = Math.max(0, hShutoff - alpha * q * q);
    const x = getX(q);
    const y = getY(h);
    if (x >= paddingLeft && x <= width - paddingRight && y >= paddingTop && y <= height - paddingBottom) {
      pumpCurvePoints += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  }

  // Generate System Curve Path
  let systemCurvePoints = '';
  for (let i = 0; i <= steps; i++) {
    const q = (qMaxChart * i) / steps;
    const h = hStaticSys + beta * q * q;
    const x = getX(q);
    const y = getY(h);
    if (x >= paddingLeft && x <= width - paddingRight && y >= paddingTop && y <= height - paddingBottom) {
      systemCurvePoints += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  }

  // Operating point coordinates
  const opX = getX(qOp);
  const opY = getY(hOp);

  // Best Efficiency Point (BEP) is usually at ~90% - 105% of rated operating design point
  const qBep = qOp * 1.05;
  const hBep = hShutoff - alpha * qBep * qBep;
  const bepX = getX(qBep);
  const bepY = getY(hBep);

  return (
    <div className="w-full bg-[#0D1B2A] border border-[#2A3F5F] rounded-xl p-5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#00C896] flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#00C896] animate-pulse"></span>
          System Curve vs. Centrifugal Pump Curve
        </h4>
        <span className="text-[10px] font-mono text-slate-400">Hydraulic Intersection</span>
      </div>

      <div className="w-full aspect-[16/10] relative min-h-[220px]">
        <svg
          viewBox="0 0 500 300"
          className="w-full h-full text-slate-300 font-mono"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* CHART GRID LINES */}
          <g stroke="#2A3F5F" strokeWidth="0.5" strokeDasharray="3,3">
            {/* Horizontal lines */}
            <line x1={paddingLeft} y1={getY(hMaxChart * 0.25)} x2={width - paddingRight} y2={getY(hMaxChart * 0.25)} />
            <line x1={paddingLeft} y1={getY(hMaxChart * 0.5)} x2={width - paddingRight} y2={getY(hMaxChart * 0.5)} />
            <line x1={paddingLeft} y1={getY(hMaxChart * 0.75)} x2={width - paddingRight} y2={getY(hMaxChart * 0.75)} />
            {/* Vertical lines */}
            <line x1={getX(qMaxChart * 0.25)} y1={paddingTop} x2={getX(qMaxChart * 0.25)} y2={height - paddingBottom} />
            <line x1={getX(qMaxChart * 0.5)} y1={paddingTop} x2={getX(qMaxChart * 0.5)} y2={height - paddingBottom} />
            <line x1={getX(qMaxChart * 0.75)} y1={paddingTop} x2={getX(qMaxChart * 0.75)} y2={height - paddingBottom} />
          </g>

          {/* AXIS LABELS & TICKS */}
          {/* Y-axis Ticks (Head) */}
          <text x={paddingLeft - 8} y={getY(hMaxChart * 0.95)} fontSize="8" fill="#A8B8D0" textAnchor="end">{(hMaxChart * 0.95).toFixed(0)}</text>
          <text x={paddingLeft - 8} y={getY(hMaxChart * 0.66)} fontSize="8" fill="#A8B8D0" textAnchor="end">{(hMaxChart * 0.66).toFixed(0)}</text>
          <text x={paddingLeft - 8} y={getY(hMaxChart * 0.33)} fontSize="8" fill="#A8B8D0" textAnchor="end">{(hMaxChart * 0.33).toFixed(0)}</text>
          <text x={paddingLeft - 8} y={height - paddingBottom + 3} fontSize="8" fill="#A8B8D0" textAnchor="end">0</text>

          {/* X-axis Ticks (Flow) */}
          <text x={getX(qMaxChart * 0.25)} y={height - paddingBottom + 12} fontSize="8" fill="#A8B8D0" textAnchor="middle">{(qMaxChart * 0.25).toFixed(0)}</text>
          <text x={getX(qMaxChart * 0.5)} y={height - paddingBottom + 12} fontSize="8" fill="#A8B8D0" textAnchor="middle">{(qMaxChart * 0.5).toFixed(0)}</text>
          <text x={getX(qMaxChart * 0.75)} y={height - paddingBottom + 12} fontSize="8" fill="#A8B8D0" textAnchor="middle">{(qMaxChart * 0.75).toFixed(0)}</text>
          <text x={width - paddingRight} y={height - paddingBottom + 12} fontSize="8" fill="#A8B8D0" textAnchor="middle">{(qMaxChart).toFixed(0)}</text>

          {/* AXES LINES */}
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#2A3F5F" strokeWidth="1.5" />
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#2A3F5F" strokeWidth="1.5" />

          {/* AXIS TITLES */}
          <text x={paddingLeft - 40} y={height / 2} fontSize="9" fill="#1E90FF" fontWeight="bold" textAnchor="middle" transform={`rotate(-90, ${paddingLeft - 40}, ${height / 2})`}>
            Total Dynamic Head ({hUnit})
          </text>
          <text x={paddingLeft + chartWidth / 2} y={height - 12} fontSize="9" fill="#00C896" fontWeight="bold" textAnchor="middle">
            Flow Rate ({fUnit})
          </text>

          {/* CURVES */}
          {/* System Resistance Curve (Beta) */}
          <path d={systemCurvePoints} fill="none" stroke="#FFB400" strokeWidth="2.5" />
          {/* Pump H-Q Curve (Alpha) */}
          <path d={pumpCurvePoints} fill="none" stroke="#1E90FF" strokeWidth="2.5" />

          {/* HIGHLIGHT GUIDELINES TO OPERATING POINT */}
          <line x1={paddingLeft} y1={opY} x2={opX} y2={opY} stroke="#FFB400" strokeWidth="1" strokeDasharray="2,2" />
          <line x1={opX} y1={height - paddingBottom} x2={opX} y2={opY} stroke="#00C896" strokeWidth="1" strokeDasharray="2,2" />

          {/* BEST EFFICIENCY POINT (BEP) MARKER */}
          {bepX >= paddingLeft && bepX <= width - paddingRight && bepY >= paddingTop && bepY <= height - paddingBottom && (
            <g>
              <circle cx={bepX} cy={bepY} r="4.5" fill="#00C896" />
              <text x={bepX + 8} y={bepY - 4} fontSize="7" fill="#00C896" fontWeight="bold">BEP</text>
            </g>
          )}

          {/* CURRENT OPERATING POINT INDICATOR */}
          <circle cx={opX} cy={opY} r="6.5" fill="#FFB400" stroke="#0D1B2A" strokeWidth="1.5" className="animate-pulse" />
          
          {/* DATA READOUT CARD OVERLAY IN TOP CORNER */}
          <g transform={`translate(${width - 170}, ${paddingTop + 5})`}>
            <rect x="0" y="0" width="135" height="48" rx="6" fill="#101E35" stroke="#2A3F5F" strokeWidth="1" opacity="0.95" />
            <text x="8" y="15" fontSize="8" fill="#A8B8D0">OPERATING POINT</text>
            <text x="8" y="28" fontSize="9" fill="#FFF" fontWeight="bold">Q: {qOp.toFixed(1)} {fUnit}</text>
            <text x="8" y="40" fontSize="9" fill="#1E90FF" fontWeight="bold">H: {hOp.toFixed(1)} {hUnit}</text>
          </g>

          {/* LEGEND BOX */}
          <g transform={`translate(${paddingLeft + 15}, ${paddingTop + 5})`}>
            <rect x="0" y="0" width="135" height="42" rx="4" fill="#0D1B2A" stroke="#2A3F5F" strokeWidth="0.5" />
            
            <line x1="8" y1="12" x2="22" y2="12" stroke="#1E90FF" strokeWidth="2" />
            <text x="27" y="15" fontSize="8" fill="#FFF" fontWeight="bold">Pump H-Q Curve</text>

            <line x1="8" y1="28" x2="22" y2="28" stroke="#FFB400" strokeWidth="2" />
            <text x="27" y="31" fontSize="8" fill="#FFF" fontWeight="bold">System Curve</text>
          </g>

        </svg>
      </div>
      <div className="mt-2 text-[10px] font-mono text-slate-400 text-center leading-normal">
        The gold <span className="text-[#FFB400]">System Curve</span> models hydraulic friction growth. The blue <span className="text-[#1E90FF]">HQ Curve</span> maps impeller pressure output. Sizing target is positioned at their intersection.
      </div>
    </div>
  );
}
