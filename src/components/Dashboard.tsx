import { useMemo, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';
import { BarChart } from './ui/BarChart';
import { DonutChart } from './ui/DonutChart';
import { MoneyPath } from './ui/MoneyPath';
import { Icon } from './ui/Icon';
import { useData } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import {
  monthSummary,
  totalBalance,
  categoryBreakdown,
  weeklySpending,
  monthlySpending,
  pctChange,
  lastNMonths,
} from '@/lib/analytics';
import { formatINR, monthKey, monthLabel, shortMonthLabel, greeting } from '@/lib/format';
import { categoryColor } from '@/lib/categories';
import type { Transaction } from '@/lib/types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  onAddTransaction: () => void;
  onCategoryClick: (category: string) => void;
  onSeeAllTransactions: () => void;
}

export function Dashboard({ onAddTransaction, onCategoryClick, onSeeAllTransactions }: DashboardProps) {
  const { transactions } = useData();
  const { user } = useAuth();
  const [monthKey_, setMonthKey] = useState(monthKey(new Date()));
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');

  const months = useMemo(() => lastNMonths(6), []);
  const prevMonth = useMemo(() => {
    const [y, m] = monthKey_.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return monthKey(d);
  }, [monthKey_]);

  const summary = useMemo(() => monthSummary(transactions, monthKey_), [transactions, monthKey_]);
  const prevSummary = useMemo(() => monthSummary(transactions, prevMonth), [transactions, prevMonth]);
  const balance = useMemo(() => totalBalance(transactions), [transactions]);
  const breakdown = useMemo(() => categoryBreakdown(transactions, monthKey_), [transactions, monthKey_]);
  const weekly = useMemo(() => weeklySpending(transactions, monthKey_), [transactions, monthKey_]);
  const monthly = useMemo(() => monthlySpending(transactions, months), [transactions, months]);

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 6),
    [transactions],
  );

  const expChange = pctChange(summary.expenses, prevSummary.expenses);
  const incChange = pctChange(summary.income, prevSummary.income);
  const remChange = pctChange(summary.remaining, prevSummary.remaining);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            Monthly Flow View
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal-900 mt-0.5">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-sm text-charcoal-600 mt-1">
            Here is how your money flows for <span className="font-semibold text-charcoal-800">{monthLabel(monthKey_)}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <select
              value={monthKey_}
              onChange={(e) => setMonthKey(e.target.value)}
              className="h-10 pl-9 pr-9 rounded-xl border border-charcoal-200 bg-cream-50 text-sm font-semibold text-charcoal-800 appearance-none focus:outline-none focus:ring-2 focus:ring-forest-600/40 cursor-pointer shadow-sm"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%232B2820' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                backgroundPosition: 'right 0.6rem center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {months.map((m: string) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-charcoal-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          <Button onClick={onAddTransaction} leftIcon={<Plus className="w-4 h-4" />}>
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Signature Money Path Cashflow Widget */}
      <MoneyPath
        variant="hero"
        incomeValue={formatINR(summary.income || balance)}
        spendingValue={formatINR(summary.expenses)}
        savingsValue={formatINR(summary.remaining)}
      />

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Balance"
          value={formatINR(balance)}
          icon="Coins"
          tone="charcoal"
        />
        <SummaryCard
          label="Inflow (Income)"
          value={formatINR(summary.income)}
          icon="ArrowDownLeft"
          tone="forest"
          change={incChange}
        />
        <SummaryCard
          label="Outflow (Expenses)"
          value={formatINR(summary.expenses)}
          icon="ArrowUpRight"
          tone="apricot"
          change={expChange}
          changeInvert
        />
        <SummaryCard
          label="Retained Savings"
          value={formatINR(summary.remaining)}
          icon="Sparkles"
          tone="sage"
          change={remChange}
        />
      </div>

      {/* Visualizations row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display text-lg font-bold text-charcoal-900">Spending Velocity</h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                {chartView === 'weekly' ? 'Weekly spending breakdown' : 'Monthly historical comparison'}
              </p>
            </div>

            <div className="flex bg-cream-200/70 p-1 rounded-xl border border-charcoal-100 self-start sm:self-auto">
              {(['weekly', 'monthly'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    chartView === v
                      ? 'bg-forest-700 text-ivory-50 shadow-sm'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {chartView === 'weekly' ? (
            <BarChart
              data={weekly.map((w) => ({ label: w.label, amount: w.amount }))}
              formatValue={(n) => formatINR(n)}
              color="#2D6442"
            />
          ) : (
            <BarChart
              data={monthly.map((m) => ({ label: shortMonthLabel(m.label), amount: m.amount }))}
              formatValue={(n) => formatINR(n)}
              color="#E97A33"
            />
          )}
        </Card>

        {/* Category Flow Breakdown */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-charcoal-900 mb-1">Category Flow</h2>
          <p className="text-xs text-charcoal-500 mb-4">{monthLabel(monthKey_)}</p>

          {breakdown.length === 0 ? (
            <EmptyMini text="No spending recorded this month" />
          ) : (
            <DonutChart
              data={breakdown.map((b) => ({
                label: b.category,
                value: b.amount,
                color: categoryColor(b.category),
              }))}
              centerValue={formatINR(summary.expenses)}
              centerLabel="total spent"
            />
          )}
        </Card>
      </div>

      {/* Category Progress Bars & Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
            <h2 className="font-display text-lg font-bold text-charcoal-900">Category Allocations</h2>
            <span className="text-xs text-charcoal-400 font-medium">Click category to filter</span>
          </div>

          {breakdown.length === 0 ? (
            <EmptyMini text="No spending recorded this month" />
          ) : (
            <div className="space-y-4">
              {breakdown.map((b) => (
                <button
                  key={b.category}
                  onClick={() => onCategoryClick(b.category)}
                  className="block w-full text-left group transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-forest-50 border border-forest-100 text-forest-700">
                        <Icon name={categoryIcon(b.category)} className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-bold text-charcoal-800 group-hover:text-forest-700 transition-colors">
                        {b.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-charcoal-900">{formatINR(b.amount)}</span>
                      <span className="text-xs text-charcoal-400 font-medium ml-2">{b.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <ProgressBar value={b.percentage} color="#2D6442" height="h-2" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
            <h2 className="font-display text-lg font-bold text-charcoal-900">Recent Activity</h2>
            <button
              onClick={onSeeAllTransactions}
              className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recent.length === 0 ? (
            <EmptyMini text="No transactions logged yet" />
          ) : (
            <div className="space-y-2">
              {recent.map((t) => (
                <TransactionRow key={t.id} t={t} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
  change,
  changeInvert,
}: {
  label: string;
  value: string;
  icon: string;
  tone: 'charcoal' | 'forest' | 'apricot' | 'sage';
  change?: number | null;
  changeInvert?: boolean;
}) {
  const tones: Record<string, { bg: string; text: string; border: string }> = {
    charcoal: { bg: 'bg-charcoal-100', text: 'text-charcoal-800', border: 'border-charcoal-200' },
    forest: { bg: 'bg-forest-50', text: 'text-forest-700', border: 'border-forest-200' },
    apricot: { bg: 'bg-apricot-50', text: 'text-apricot-600', border: 'border-apricot-200' },
    sage: { bg: 'bg-sage-50', text: 'text-sage-700', border: 'border-sage-200' },
  };

  const style = tones[tone];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">{label}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center border ${style.bg} ${style.text} ${style.border}`}>
          <Icon name={icon} className="w-4 h-4" />
        </span>
      </div>
      <p className="font-display text-2xl font-bold text-charcoal-900 tracking-tight">{value}</p>
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1 mt-2">
          {changeInvert ? (
            change < 0 ? (
              <TrendingDown className="w-3.5 h-3.5 text-forest-600" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-apricot-600" />
            )
          ) : change >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-forest-600" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-apricot-600" />
          )}
          <span
            className={`text-xs font-bold ${
              changeInvert
                ? change < 0
                  ? 'text-forest-700'
                  : 'text-apricot-600'
                : change >= 0
                ? 'text-forest-700'
                : 'text-apricot-600'
            }`}
          >
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs prev month
          </span>
        </div>
      )}
    </Card>
  );
}

function TransactionRow({ t }: { t: Transaction }) {
  const isIncome = t.type === 'income';
  return (
    <div className="flex items-center justify-between p-2.5 hover:bg-cream-200/60 rounded-xl transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isIncome
              ? 'bg-forest-50 border-forest-200 text-forest-700'
              : 'bg-cream-200/80 border-charcoal-100 text-charcoal-700'
          }`}
        >
          {isIncome ? <ArrowDownLeft className="w-4 h-4 text-forest-700" /> : <ArrowUpRight className="w-4 h-4 text-apricot-600" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-charcoal-900 truncate">{t.merchant}</p>
          <p className="text-xs text-charcoal-500 truncate">
            {t.category} · {new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {t.payment_method}
          </p>
        </div>
      </div>
      <span
        className={`text-sm font-bold shrink-0 ml-3 ${
          isIncome ? 'text-forest-700' : 'text-charcoal-900'
        }`}
      >
        {isIncome ? '+' : '−'}{formatINR(t.amount)}
      </span>
    </div>
  );
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
      <MoneyPath variant="minimal" width={180} animate={false} />
      <p className="text-xs font-semibold text-charcoal-500">{text}</p>
    </div>
  );
}

function categoryIcon(name: string): string {
  const map: Record<string, string> = {
    'Food & Dining': 'UtensilsCrossed',
    Shopping: 'ShoppingBag',
    Transport: 'Car',
    'Bills & Utilities': 'ReceiptText',
    Entertainment: 'Clapperboard',
    Health: 'HeartPulse',
    Travel: 'Plane',
    Education: 'GraduationCap',
    Subscriptions: 'Repeat',
    Income: 'ArrowDownLeft',
    Other: 'CircleDashed',
  };
  return map[name] ?? 'CircleDashed';
}

