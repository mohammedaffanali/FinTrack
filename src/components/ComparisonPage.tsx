import { useMemo, useState } from 'react';
import { Card } from './ui/Card';
import { useData } from '@/lib/data';
import { monthSummary, categoryBreakdown, lastNMonths, pctChange } from '@/lib/analytics';
import { formatINR, monthLabel, shortMonthLabel } from '@/lib/format';
import { categoryColor } from '@/lib/categories';
import { BarChart } from './ui/BarChart';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function ComparisonPage() {
  const { transactions } = useData();
  const months = useMemo(() => lastNMonths(6), []);
  const [current, setCurrent] = useState(months[months.length - 1]);
  const [previous, setPrevious] = useState(months[months.length - 2]);

  const cur = useMemo(() => monthSummary(transactions, current), [transactions, current]);
  const prev = useMemo(() => monthSummary(transactions, previous), [transactions, previous]);

  const curBreakdown = useMemo(() => categoryBreakdown(transactions, current), [transactions, current]);
  const prevBreakdown = useMemo(() => categoryBreakdown(transactions, previous), [transactions, previous]);

  const monthlyData = useMemo(
    () => months.map((m) => {
      const s = monthSummary(transactions, m);
      return { label: shortMonthLabel(m), amount: s.expenses };
    }),
    [transactions, months],
  );

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    curBreakdown.forEach((c) => set.add(c.category));
    prevBreakdown.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [curBreakdown, prevBreakdown]);

  const expChange = pctChange(cur.expenses, prev.expenses);

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Variance Analysis</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal-900 mt-0.5">Monthly Comparison</h1>
          <p className="text-sm text-charcoal-600 mt-1">Compare spending trends and flow changes month-over-month.</p>
        </div>

        <Card className="p-10 sm:p-16 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <h3 className="font-display font-bold text-charcoal-900 text-xl">No financial data</h3>
            <p className="text-sm text-charcoal-600 max-w-sm">
              Add some transactions to unlock your spending insights.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Variance Analysis</span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal-900 mt-0.5">Monthly Comparison</h1>
        <p className="text-sm text-charcoal-600 mt-1">Compare spending trends and flow changes month-over-month.</p>
      </div>
          {/* Month selectors */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
          <div className="flex-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Primary Month</span>
            <select
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-charcoal-200 bg-cream-50 text-sm font-semibold text-charcoal-800 appearance-none focus:outline-none focus:ring-2 focus:ring-forest-600/40 cursor-pointer shadow-sm"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%232B2820' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Comparison Month</span>
            <select
              value={previous}
              onChange={(e) => setPrevious(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-charcoal-200 bg-cream-50 text-sm font-semibold text-charcoal-800 appearance-none focus:outline-none focus:ring-2 focus:ring-forest-600/40 cursor-pointer shadow-sm"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%232B2820' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Summary comparison */}
      {current === previous ? (
        <Card className="p-8 text-center text-sm font-semibold text-charcoal-500">
          Please select two different months to evaluate comparative variance.
        </Card>
      ) : (
        <>
          {/* Headline banner */}
          {expChange !== null && (
            <Card className={`p-5 ${expChange < 0 ? 'bg-forest-50 border-forest-200' : 'bg-apricot-50 border-apricot-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expChange < 0 ? 'bg-forest-100 text-forest-700' : 'bg-apricot-100 text-apricot-700'}`}>
                  {expChange < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>
                <p className="text-sm text-charcoal-800">
                  You spent <span className="font-bold">{expChange < 0 ? 'less' : 'more'}</span> in {monthLabel(current)} —{' '}
                  <span className="font-bold">{formatINR(Math.abs(cur.expenses - prev.expenses))}</span>{' '}
                  {expChange < 0 ? 'lower' : 'higher'} than {monthLabel(previous)}.
                </p>
              </div>
            </Card>
          )}

          {/* Three metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CompareCard label="Total Spending" current={cur.expenses} previous={prev.expenses} invert />
            <CompareCard label="Total Income" current={cur.income} previous={prev.income} />
            <CompareCard label="Retained Savings" current={cur.remaining} previous={prev.remaining} />
          </div>

          {/* 6-month trend */}
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-charcoal-900 mb-1">6-Month Spending Velocity</h2>
            <p className="text-xs text-charcoal-500 mb-4">Historical trend</p>
            <BarChart data={monthlyData} formatValue={(n) => formatINR(n)} color="#2D6442" />
          </Card>

          {/* Category changes */}
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-charcoal-900 mb-4">Category Variance Breakdown</h2>
            {allCategories.length === 0 ? (
              <p className="text-sm text-charcoal-500 text-center py-6">No transaction data available for these months.</p>
            ) : (
              <div className="space-y-3">
                {allCategories.map((cat) => {
                  const c = curBreakdown.find((b) => b.category === cat);
                  const p = prevBreakdown.find((b) => b.category === cat);
                  const curAmt = c?.amount ?? 0;
                  const prevAmt = p?.amount ?? 0;
                  const diff = curAmt - prevAmt;
                  const color = categoryColor(cat);
                  return (
                    <div key={cat} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream-200/50 transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-bold text-charcoal-800 flex-1 truncate">{cat}</span>
                      <span className="text-sm text-charcoal-500 w-24 text-right font-medium">{formatINR(prevAmt)}</span>
                      <span className="text-charcoal-300">→</span>
                      <span className="text-sm font-bold text-charcoal-900 w-24 text-right">{formatINR(curAmt)}</span>
                      <span className="w-20 text-right">
                        {diff === 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-charcoal-400 font-semibold"><Minus className="w-3 h-3" />0%</span>
                        ) : diff > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-apricot-600 font-bold"><TrendingUp className="w-3 h-3" />+{Math.abs((diff / (prevAmt || 1)) * 100).toFixed(0)}%</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs text-forest-700 font-bold"><TrendingDown className="w-3 h-3" />-{Math.abs((diff / (prevAmt || 1)) * 100).toFixed(0)}%</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function CompareCard({ label, current, previous, invert }: { label: string; current: number; previous: number; invert?: boolean }) {
  const change = pctChange(current, previous);
  const diff = current - previous;
  const good = invert ? diff < 0 : diff > 0;
  return (
    <Card className="p-5 space-y-2">
      <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">{label}</span>
      <p className="font-display text-2xl font-bold text-charcoal-900">{formatINR(current)}</p>
      <div className="flex items-center gap-2 pt-1 border-t border-charcoal-100/60">
        {change === null ? (
          <span className="text-xs text-charcoal-400">No prior period</span>
        ) : (
          <>
            <span className={`inline-flex items-center gap-1 text-xs font-bold ${good ? 'text-forest-700' : 'text-apricot-600'}`}>
              {diff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-charcoal-400 font-medium">vs {formatINR(previous)}</span>
          </>
        )}
      </div>
    </Card>
  );
}

