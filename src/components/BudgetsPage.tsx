import { useMemo, useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Field, TextInput, Select } from './ui/Field';
import { ProgressBar } from './ui/ProgressBar';
import { MoneyPath } from './ui/MoneyPath';
import { Icon } from './ui/Icon';
import { useData } from '@/lib/data';
import { EXPENSE_CATEGORIES, categoryColor } from '@/lib/categories';
import { budgetStatus } from '@/lib/analytics';
import { formatINR, monthKey, monthLabel } from '@/lib/format';
import type { Budget } from '@/lib/types';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetsPageProps {
  initialMonth?: string;
}

export function BudgetsPage({ initialMonth }: BudgetsPageProps) {
  const { budgets, transactions, upsertBudget, deleteBudget } = useData();
  const [month, setMonth] = useState(initialMonth ?? monthKey(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Budget | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ category: 'Food & Dining', monthly_limit: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMonth) setMonth(initialMonth);
  }, [initialMonth]);

  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === month), [budgets, month]);
  const statuses = useMemo(
    () => monthBudgets.map((b) => budgetStatus(b, transactions)).sort((a, b) => b.progress - a.progress),
    [monthBudgets, transactions],
  );

  const totalBudget = monthBudgets.reduce((s, b) => s + b.monthly_limit, 0);
  const totalSpent = statuses.reduce((s, st) => s + st.spent, 0);
  const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const openAdd = () => {
    setEditing(null);
    const usedCats = new Set(monthBudgets.map((b) => b.category));
    const firstFree = EXPENSE_CATEGORIES.find((c) => !usedCats.has(c)) ?? EXPENSE_CATEGORIES[0];
    setForm({ category: firstFree, monthly_limit: '' });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditing(b);
    setForm({ category: b.category, monthly_limit: String(b.monthly_limit) });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const limit = Number(form.monthly_limit);
    if (!form.monthly_limit || Number.isNaN(limit) || limit <= 0) {
      setError('Enter a valid monthly limit');
      return;
    }
    setSaving(true);
    setError(null);
    const existing = monthBudgets.find((b) => b.category === form.category && b.id !== editing?.id);
    if (existing && !editing) {
      setSaving(false);
      setError(`A budget for ${form.category} already exists for ${monthLabel(month)}.`);
      return;
    }
    const { error } = await upsertBudget({
      id: editing?.id,
      category: form.category,
      monthly_limit: limit,
      month,
    });
    setSaving(false);
    if (error) {
      setError(error);
    } else {
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    await deleteBudget(confirmDelete.id);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const availableCats = EXPENSE_CATEGORIES.filter((c) => !monthBudgets.some((b) => b.category === c)) || EXPENSE_CATEGORIES;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Category Caps</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal-900 mt-0.5">Budgets</h1>
          <p className="text-sm text-charcoal-600 mt-1">Set monthly limits to keep your Money Path balanced.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-10 px-3 pr-9 rounded-xl border border-charcoal-200 bg-cream-50 text-sm font-semibold text-charcoal-800 appearance-none focus:outline-none focus:ring-2 focus:ring-forest-600/40 cursor-pointer shadow-sm"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%232B2820' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
              backgroundPosition: 'right 0.6rem center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {[monthKey(new Date()), monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))].map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>

          <Button onClick={openAdd} leftIcon={<Plus className="w-4 h-4" />}>
            <span>Add Budget</span>
          </Button>
        </div>
      </div>

      {/* Overall progress card */}
      {monthBudgets.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                Total Budget for {monthLabel(month)}
              </span>
              <p className="font-display text-2xl font-bold text-charcoal-900 mt-0.5">
                {formatINR(totalSpent)} <span className="text-sm text-charcoal-500 font-normal">of {formatINR(totalBudget)}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-charcoal-500">Remaining</span>
              <p className={`font-display text-xl font-bold ${totalBudget - totalSpent < 0 ? 'text-apricot-600' : 'text-forest-700'}`}>
                {formatINR(totalBudget - totalSpent)}
              </p>
            </div>
          </div>
          <ProgressBar
            value={totalProgress}
            color={totalProgress > 100 ? '#E97A33' : totalProgress > 80 ? '#F4B27E' : '#2D6442'}
            height="h-3"
          />
        </Card>
      )}

      {/* Budget cards */}
      {statuses.length === 0 ? (
        <Card className="p-10 sm:p-16 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <MoneyPath variant="minimal" width={220} animate={false} />
            <h3 className="font-display font-bold text-charcoal-900 text-xl">No budgets created for {monthLabel(month)}</h3>
            <p className="text-sm text-charcoal-600 max-w-sm">
              Set spending limits for categories like Food & Dining or Shopping to maintain complete clarity.
            </p>
            <Button className="mt-2" onClick={openAdd} leftIcon={<Plus className="w-4 h-4" />}>Add First Budget</Button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {statuses.map((st) => {
            const color = categoryColor(st.budget.category);
            const over = st.over;
            const near = !over && st.progress >= 80;
            return (
              <Card key={st.budget.id} className="p-6 group space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-forest-50 border border-forest-100 text-forest-700">
                      <Icon name={categoryIconName(st.budget.category)} className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-display font-bold text-charcoal-900 text-base">{st.budget.category}</p>
                      <p className="text-xs text-charcoal-500 font-medium">Limit: {formatINR(st.budget.monthly_limit)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(st.budget)}
                      className="p-1.5 text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-200 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(st.budget)}
                      className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-2xl font-bold text-charcoal-900">{formatINR(st.spent)}</p>
                    <p className={`text-xs font-bold ${over ? 'text-apricot-600' : near ? 'text-apricot-500' : 'text-forest-700'}`}>
                      {over
                        ? `Over limit by ${formatINR(st.spent - st.budget.monthly_limit)}`
                        : `${formatINR(st.remaining)} remaining`}
                    </p>
                  </div>
                  <span className={`font-display text-base font-bold ${over ? 'text-apricot-600' : 'text-charcoal-800'}`}>
                    {st.progress.toFixed(0)}%
                  </span>
                </div>

                <ProgressBar
                  value={st.progress}
                  color={over ? '#E97A33' : near ? '#F4B27E' : color}
                  height="h-2.5"
                />

                {over && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-apricot-800 bg-apricot-50 border border-apricot-200 rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 text-apricot-600 shrink-0" />
                    <span>Limit exceeded. Consider adjusting spending for this category.</span>
                  </div>
                )}
                {near && !over && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-apricot-700 bg-apricot-50/60 border border-apricot-100 rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 text-apricot-500 shrink-0" />
                    <span>Nearing limit. {formatINR(st.remaining)} remaining.</span>
                  </div>
                )}
                {!over && !near && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-forest-800 bg-forest-50/80 border border-forest-100 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                    <span>Balanced. {formatINR(st.remaining)} remaining.</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Budget' : 'Create Budget'}
        subtitle={`For ${monthLabel(month)}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Create Budget'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="text-sm font-medium text-apricot-800 bg-apricot-50 border border-apricot-200 rounded-xl px-4 py-3">{error}</div>
          )}
          <Field label="Category" required>
            <Select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              disabled={Boolean(editing)}
            >
              {(editing ? EXPENSE_CATEGORIES : availableCats).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Monthly limit" required>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 font-semibold text-sm">$</span>
              <TextInput
                type="number"
                inputMode="decimal"
                value={form.monthly_limit}
                onChange={(e) => setForm((p) => ({ ...p, monthly_limit: e.target.value }))}
                placeholder="500.00"
                className="pl-8"
              />
            </div>
          </Field>
        </div>
      </Modal>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <Card className="relative w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-apricot-50 border border-apricot-200 flex items-center justify-center text-apricot-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-charcoal-900 text-lg">Remove budget?</h3>
              <p className="text-sm text-charcoal-600 mt-1">
                Are you sure you want to delete the {confirmDelete.category} budget for {monthLabel(confirmDelete.month)}?
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>Remove</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function categoryIconName(name: string): string {
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
    Other: 'CircleDashed',
  };
  return map[name] ?? 'CircleDashed';
}

