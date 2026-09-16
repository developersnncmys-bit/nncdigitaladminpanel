'use client';

import { useState } from 'react';

interface BarChartProps {
  // `tip` is the full label shown in the hover tooltip (e.g. "Feb 2025");
  // `label` is the short axis label (e.g. "Feb"). Falls back to label.
  data: { label: string; value: number; tip?: string }[];
}

// CSS-flex bar chart — each month gets equal width via flex-1 so labels stay
// aligned to their bars at any container size. (The previous SVG version used
// preserveAspectRatio="none" which non-uniformly stretched the text and made
// month labels look cramped/distorted on wider layouts.)
export default function BarChart({ data }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">

      {/* Bars + grid lines */}
      <div className="relative h-40">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-full border-t ${i === 4 ? 'border-gray-200' : 'border-dashed border-gray-100'}`}
            />
          ))}
        </div>

        <div className="relative flex items-end gap-1 sm:gap-1.5 h-full">
          {data.map(({ label, value, tip }, i) => {
            const barH = (value / max) * 100;
            const isHovered = hovered === i;
            return (
              <div
                key={i}
                className="relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <div className="bg-gray-900 rounded-xl px-3 py-2 shadow-xl text-center whitespace-nowrap">
                      <p className="text-[10px] text-white/50 font-medium">{tip || label}</p>
                      <p className="text-sm font-bold text-white leading-tight">{value} leads</p>
                    </div>
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid #111827',
                      }}
                    />
                  </div>
                )}

                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-colors ${
                    isHovered ? 'bg-emerald-700' : 'bg-emerald-600'
                  }`}
                  style={{ height: `${barH}%`, minHeight: value > 0 ? '3px' : '0' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels row — same flex as bars so each label sits under its bar */}
      <div className="flex gap-1 sm:gap-1.5 mt-2">
        {data.map(({ label }, i) => (
          <div key={label} className="flex-1 text-center">
            <span
              className={`text-[10px] sm:text-xs font-medium tabular-nums ${
                hovered === i ? 'text-emerald-600 font-bold' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
