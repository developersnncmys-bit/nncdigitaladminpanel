'use client';

import { useState } from 'react';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Segment[];
}

export default function DonutChart({ data }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  const r = 48;
  const rOuter = 54; // expanded radius on hover
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * r;
  const circumferenceOuter = 2 * Math.PI * rOuter;

  // Pre-calculate cumulative offsets
  const segments = data.map((d, i) => {
    const pct = d.value / total;
    return { ...d, pct, index: i };
  });

  let cumulative = 0;
  const rendered = segments.map((seg) => {
    const rotation = (cumulative / total) * 360 - 90;
    cumulative += seg.value;
    return { ...seg, rotation };
  });

  const hoveredSeg = hovered !== null ? rendered[hovered] : null;

  return (
    <div className="flex items-center gap-5">

      {/* Donut */}
      <div className="relative flex-shrink-0 w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full">
          {rendered.map(({ label, value, color, pct, rotation, index }) => {
            const isHovered = hovered === index;
            const activeR = isHovered ? rOuter : r;
            const activeCircumference = isHovered ? circumferenceOuter : circumference;
            const dash = pct * activeCircumference;
            const gap = activeCircumference - dash;

            return (
              <circle
                key={label}
                cx={cx}
                cy={cy}
                r={activeR}
                fill="none"
                stroke={color}
                strokeWidth={isHovered ? 22 : 18}
                strokeDasharray={`${dash} ${gap}`}
                strokeLinecap="butt"
                transform={`rotate(${rotation}, ${cx}, ${cy})`}
                style={{ transition: 'r 0.2s ease, stroke-width 0.2s ease', cursor: 'pointer', filter: isHovered ? `drop-shadow(0 0 6px ${color}66)` : 'none' }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}

          {/* Inner white circle */}
          <circle cx={cx} cy={cy} r={30} fill="white" />

          {/* Center text — shows hovered segment details or total */}
          {hoveredSeg ? (
            <>
              <text x={cx} y={cy - 8} textAnchor="middle" fill="#111827" fontSize="14" fontWeight="bold">
                {hoveredSeg.value}
              </text>
              <text x={cx} y={cy + 6} textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="500">
                {((hoveredSeg.value / total) * 100).toFixed(0)}%
              </text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 4} textAnchor="middle" fill="#111827" fontSize="16" fontWeight="bold">
                {total}
              </text>
              <text x={cx} y={cy + 11} textAnchor="middle" fill="#94a3b8" fontSize="9">
                Total
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {rendered.map(({ label, value, color, pct, index }) => {
          const isHovered = hovered === index;
          return (
            <div
              key={label}
              className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-all ${
                isHovered ? 'bg-gray-50' : 'hover:bg-gray-50/60'
              }`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform"
                style={{
                  backgroundColor: color,
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                }}
              />
              <span className={`text-xs flex-1 truncate transition-colors ${isHovered ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                {label}
              </span>
              <span className="text-xs font-bold text-gray-800">{value}</span>
              {isHovered && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
                  {(pct * 100).toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
