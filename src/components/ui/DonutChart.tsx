interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

/**
 * Elegant spending visualization representing category breakdown as a smooth flow stream
 * rather than a generic pie/donut chart.
 */
export function DonutChart({ data, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  // Curated warm colors if default generic hexes are provided
  const warmPalette = ['#1E3A2B', '#E97A33', '#8A9F85', '#2D6442', '#F4B27E', '#7C766B'];

  return (
    <div className="w-full space-y-4">
      {centerValue && (
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              {centerLabel || 'Total Flow'}
            </span>
            <p className="font-display text-2xl font-bold text-charcoal-900 mt-0.5">
              {centerValue}
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-forest-50 text-forest-700 border border-forest-100">
            {data.length} Categories
          </span>
        </div>
      )}

      {/* Flow Stream Bar */}
      <div className="h-4 w-full bg-charcoal-100/70 rounded-full overflow-hidden flex gap-0.5 p-0.5 shadow-inner">
        {total > 0 &&
          data.map((d, i) => {
            const pct = Math.max((d.value / total) * 100, 2);
            const color = warmPalette[i % warmPalette.length];
            return (
              <div
                key={i}
                style={{ width: `${pct}%`, backgroundColor: color }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:brightness-110 relative group"
                title={`${d.label}: $${d.value.toFixed(2)} (${Math.round(pct)}%)`}
              />
            );
          })}
      </div>

      {/* Category breakdown pills */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          const color = warmPalette[i % warmPalette.length];
          return (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-xl bg-cream-50/70 border border-charcoal-100/60 transition-colors hover:bg-cream-200/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-charcoal-700 truncate">
                  {d.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-charcoal-800 shrink-0 ml-1">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

