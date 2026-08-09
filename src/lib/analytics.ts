import type { Transaction, Budget, Subscription } from './types';
import { monthKey } from './format';

export interface MonthSummary {
  income: number;
  expenses: number;
  remaining: number;
  total: number; // balance-ish = income - expenses
}

export function monthSummary(txns: Transaction[], key: string): MonthSummary {
  let income = 0;
  let expenses = 0;
  for (const t of txns) {
    if (monthKey(t.date) !== key) continue;
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, remaining: income - expenses, total: income - expenses };
}

export function totalBalance(txns: Transaction[]): number {
  let bal = 0;
  for (const t of txns) {
    if (t.type === 'income') bal += t.amount;
    else bal -= t.amount;
  }
  return bal;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export function categoryBreakdown(txns: Transaction[], key: string): CategoryBreakdownItem[] {
  const map = new Map<string, number>();
  let total = 0;
  for (const t of txns) {
    if (monthKey(t.date) !== key) continue;
    if (t.type !== 'expense') continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    total += t.amount;
  }
  const items: CategoryBreakdownItem[] = [];
  for (const [category, amount] of map.entries()) {
    items.push({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    });
  }
  items.sort((a, b) => b.amount - a.amount);
  return items;
}

export interface WeeklyPoint {
  label: string;
  amount: number;
}

export function weeklySpending(txns: Transaction[], key: string): WeeklyPoint[] {
  const [y, m] = key.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const weeks: WeeklyPoint[] = [];
  let start = new Date(first);
  let weekNum = 1;
  while (start <= last) {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    if (end > last) end.setTime(last.getTime());
    let amount = 0;
    for (const t of txns) {
      const d = new Date(t.date + 'T00:00:00');
      if (t.type !== 'expense') continue;
      if (d >= start && d <= end) amount += t.amount;
    }
    weeks.push({ label: `W${weekNum}`, amount });
    start = new Date(end);
    start.setDate(start.getDate() + 1);
    weekNum++;
  }
  return weeks;
}

export function monthlySpending(txns: Transaction[], months: string[]): WeeklyPoint[] {
  return months.map((key) => {
    let amount = 0;
    for (const t of txns) {
      if (monthKey(t.date) !== key) continue;
      if (t.type !== 'expense') continue;
      amount += t.amount;
    }
    return { label: key, amount };
  });
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  progress: number; // 0-100
  over: boolean;
}

export function budgetStatus(budget: Budget, txns: Transaction[]): BudgetStatus {
  let spent = 0;
  for (const t of txns) {
    if (t.type !== 'expense') continue;
    if (t.category !== budget.category) continue;
    if (monthKey(t.date) !== budget.month) continue;
    spent += t.amount;
  }
  const remaining = budget.monthly_limit - spent;
  const progress = budget.monthly_limit > 0 ? (spent / budget.monthly_limit) * 100 : 0;
  return { budget, spent, remaining, progress, over: spent > budget.monthly_limit };
}

export function monthlySubscriptionCost(subs: Subscription[]): number {
  let total = 0;
  for (const s of subs) {
    if (!s.active) continue;
    if (s.frequency === 'monthly') total += s.amount;
    else if (s.frequency === 'yearly') total += s.amount / 12;
    else if (s.frequency === 'weekly') total += (s.amount * 52) / 12;
  }
  return total;
}

export function annualSubscriptionCost(subs: Subscription[]): number {
  let total = 0;
  for (const s of subs) {
    if (!s.active) continue;
    if (s.frequency === 'monthly') total += s.amount * 12;
    else if (s.frequency === 'yearly') total += s.amount;
    else if (s.frequency === 'weekly') total += s.amount * 52;
  }
  return total;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  tone: 'positive' | 'neutral' | 'warning' | 'negative';
  icon: string;
}

export function generateInsights(
  txns: Transaction[],
  subs: Subscription[],
  currentMonth: string,
  prevMonth: string,
): Insight[] {
  const insights: Insight[] = [];
  const cur = monthSummary(txns, currentMonth);
  const prev = monthSummary(txns, prevMonth);
  const breakdown = categoryBreakdown(txns, currentMonth);
  const prevBreakdown = categoryBreakdown(txns, prevMonth);

  // Largest category
  if (breakdown.length > 0) {
    const top = breakdown[0];
    insights.push({
      id: 'largest',
      title: 'Largest spending category',
      body: `${top.category} is your largest spending category this month at ${top.percentage.toFixed(1)}% of expenses.`,
      tone: 'neutral',
      icon: 'PieChart',
    });
  }

  // Category increases
  for (const cur of breakdown) {
    const prevItem = prevBreakdown.find((p) => p.category === cur.category);
    if (prevItem) {
      const diff = cur.amount - prevItem.amount;
      if (diff > 500) {
        insights.push({
          id: `inc-${cur.category}`,
          title: `${cur.category} spending increased`,
          body: `You spent ₹${Math.round(diff).toLocaleString('en-IN')} more on ${cur.category} than last month.`,
          tone: 'warning',
          icon: 'TrendingUp',
        });
      }
    }
  }

  // Category decreases
  for (const prevItem of prevBreakdown) {
    const curItem = breakdown.find((p) => p.category === prevItem.category);
    if (curItem) {
      const diff = prevItem.amount - curItem.amount;
      if (diff > 500) {
        insights.push({
          id: `dec-${prevItem.category}`,
          title: `${prevItem.category} spending decreased`,
          body: `You spent ₹${Math.round(diff).toLocaleString('en-IN')} less on ${prevItem.category} than last month. Keep it up!`,
          tone: 'positive',
          icon: 'TrendingDown',
        });
      }
    }
  }

  // Subscription cost
  const subMonthly = monthlySubscriptionCost(subs);
  if (subMonthly > 0) {
    insights.push({
      id: 'subs',
      title: 'Subscription cost',
      body: `Your recurring subscriptions cost approximately ₹${Math.round(subMonthly).toLocaleString('en-IN')} every month.`,
      tone: 'neutral',
      icon: 'Repeat',
    });
  }

  // Weekend spending
  let weekend = 0;
  let totalExp = 0;
  for (const t of txns) {
    if (monthKey(t.date) !== currentMonth) continue;
    if (t.type !== 'expense') continue;
    totalExp += t.amount;
    const day = new Date(t.date + 'T00:00:00').getDay();
    if (day === 0 || day === 6) weekend += t.amount;
  }
  if (totalExp > 0) {
    const pct = (weekend / totalExp) * 100;
    insights.push({
      id: 'weekend',
      title: 'Weekend spending',
      body: `You spent ${pct.toFixed(0)}% of your expenses this month on weekends.`,
      tone: pct > 40 ? 'warning' : 'neutral',
      icon: 'CalendarDays',
    });
  }

  // Potential saving
  if (breakdown.length > 0) {
    const top = breakdown[0];
    const saving = top.amount * 0.15;
    if (saving > 100) {
      insights.push({
        id: 'saving',
        title: 'Potential saving',
        body: `Reducing ${top.category} spending by 15% could save approximately ₹${Math.round(saving).toLocaleString('en-IN')} this month.`,
        tone: 'positive',
        icon: 'PiggyBank',
      });
    }
  }

  // Month-over-month total
  if (prev.expenses > 0) {
    const diff = cur.expenses - prev.expenses;
    if (diff < -200) {
      insights.push({
        id: 'mom-down',
        title: 'Spending down this month',
        body: `You spent ₹${Math.round(-diff).toLocaleString('en-IN')} less this month than last month.`,
        tone: 'positive',
        icon: 'TrendingDown',
      });
    } else if (diff > 200) {
      insights.push({
        id: 'mom-up',
        title: 'Spending up this month',
        body: `You spent ₹${Math.round(diff).toLocaleString('en-IN')} more this month than last month.`,
        tone: 'warning',
        icon: 'TrendingUp',
      });
    }
  }

  // Savings rate
  if (cur.income > 0) {
    const rate = (cur.remaining / cur.income) * 100;
    if (rate >= 20) {
      insights.push({
        id: 'savings-rate',
        title: 'Healthy savings rate',
        body: `You're saving ${rate.toFixed(1)}% of your income this month. Great work!`,
        tone: 'positive',
        icon: 'PiggyBank',
      });
    } else if (rate < 0) {
      insights.push({
        id: 'savings-rate',
        title: 'Spending exceeds income',
        body: `You spent more than you earned this month. Consider reviewing your budget.`,
        tone: 'negative',
        icon: 'AlertTriangle',
      });
    }
  }

  return insights;
}

export function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    months.push(monthKey(d));
    d.setMonth(d.getMonth() - 1);
  }
  return months.reverse();
}
