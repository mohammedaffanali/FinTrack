import { useMemo } from 'react';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';
import { MoneyPath } from './ui/MoneyPath';
import { useData } from '@/lib/data';
import { generateInsights, lastNMonths } from '@/lib/analytics';
import { monthLabel } from '@/lib/format';

const TONE_STYLES: Record<string, { bg: string; icon: string; border: string }> = {
  positive: { bg: 'bg-forest-50', icon: 'text-forest-700', border: 'border-forest-200' },
  neutral: { bg: 'bg-cream-200/80', icon: 'text-charcoal-800', border: 'border-charcoal-200' },
  warning: { bg: 'bg-apricot-50', icon: 'text-apricot-600', border: 'border-apricot-200' },
  negative: { bg: 'bg-apricot-50', icon: 'text-apricot-700', border: 'border-apricot-300' },
};

export function InsightsPage() {
  const { transactions, subscriptions } = useData();
  const months = useMemo(() => lastNMonths(2), []);
  const currentMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];

  const insights = useMemo(
    () => generateInsights(transactions, subscriptions, currentMonth, prevMonth),
    [transactions, subscriptions, currentMonth, prevMonth],
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Financial Observation</span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal-900 mt-0.5">Insights</h1>
        <p className="text-sm text-charcoal-600 mt-1">
          Human-friendly, conversational observations about your money for <span className="font-semibold text-charcoal-800">{monthLabel(currentMonth)}</span>.
        </p>
      </div>

      {insights.length === 0 ? (
        <Card className="p-10 sm:p-16 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <MoneyPath variant="minimal" width={220} animate={false} />
            <h3 className="font-display font-bold text-charcoal-900 text-xl">No insights generated yet</h3>
            <p className="text-sm text-charcoal-600 max-w-sm">
              Log a few transactions across this month to see automated pattern analysis and savings callouts.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {insights.map((ins) => {
            const style = TONE_STYLES[ins.tone] ?? TONE_STYLES.neutral;
            return (
              <Card key={ins.id} className="p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${style.bg} ${style.border}`}>
                  <Icon name={ins.icon} className={`w-5 h-5 ${style.icon}`} />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-display font-bold text-charcoal-900 text-lg">{ins.title}</p>
                  <p className="text-sm text-charcoal-600 leading-relaxed">{ins.body}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

