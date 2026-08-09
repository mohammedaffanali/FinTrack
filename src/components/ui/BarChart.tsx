import { useId } from 'react';

interface BarChartProps {
  data: { label: string; amount: number }[];
  formatValue?: (n: number) => string;
  color?: string;
}

export function BarChart({ data, formatValue, color = '#2D6442' }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  const gid = useId();

  // If green hex passed, use warm forest green; if orange/red passed, use apricot
  const barColor = color === '#10b981' || color === '#059669' ? '#2D6442' : color;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 sm:gap-3 h-44 pt-4">
        {data.map((d, i) => {
          const h = (d.amount / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover:scale-100">
                <div className="bg-charcoal-900 text-ivory-50 text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap -translate-y-full shadow-md">
                  {formatValue ? formatValue(d.amount) : `$${d.amount}`}
                </div>
              </div>
              <div className="w-full flex items-end justify-center h-full">
                <div
                  className="w-full max-w-[38px] rounded-t-xl transition-all duration-500 ease-out group-hover:brightness-110 shadow-sm"
                  style={{
                    height: `${Math.max(h, 3)}%`,
                    background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}d0 100%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-2 sm:gap-3 mt-3 pt-2 border-t border-charcoal-100/60">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-xs text-charcoal-500 font-medium truncate">
            {d.label}
          </div>
        ))}
      </div>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} />
            <stop offset="100%" stopColor={`${barColor}cc`} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

