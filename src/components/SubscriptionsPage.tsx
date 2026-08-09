import { useMemo, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Field, TextInput, Select } from './ui/Field';
import { MoneyPath } from './ui/MoneyPath';
import { useData } from '@/lib/data';
import { monthlySubscriptionCost, annualSubscriptionCost } from '@/lib/analytics';
import { formatINR, formatDate, todayISO } from '@/lib/format';
import type { Subscription, SubscriptionFrequency } from '@/lib/types';
import {
  Plus,
  Repeat,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

export function SubscriptionsPage() {
  const { subscriptions, upsertSubscription, deleteSubscription } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as SubscriptionFrequency,
    next_payment_date: todayISO(),
    active: true,
    payment_method: 'UPI',
    category: 'Subscriptions',
    notes: '',
    type: 'expense' as const,
    merchant: '',
    date: todayISO(),
  });

  const activeSubs = useMemo(() => subscriptions.filter((s) => s.active), [subscriptions]);
  const monthlyTotal = monthlySubscriptionCost(subscriptions);
  const annualTotal = annualSubscriptionCost(subscriptions);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '',
      amount: '',
      frequency: 'monthly',
      next_payment_date: todayISO(),
      active: true,
      payment_method: 'UPI',
      category: 'Subscriptions',
      notes: '',
      type: 'expense',
      merchant: '',
      date: todayISO(),
    });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (s: Subscription) => {
    setEditing(s);
    setForm({
      name: s.name,
      amount: String(s.amount),
      frequency: s.frequency,
      next_payment_date: s.next_payment_date,
      active: s.active,
      payment_method: 'UPI',
      category: 'Subscriptions',
      notes: '',
      type: 'expense',
      merchant: '',
      date: todayISO(),
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const amount = Number(form.amount);
    if (!form.name.trim()) {
      setError('Subscription name is required');
      return;
    }
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!form.next_payment_date) {
      setError('Next payment date is required');
      return;
    }
    setSaving(true);
    setError(null);

    const { error } = await upsertSubscription({
      id: editing?.id,
      name: form.name.trim(),
      amount,
      frequency: form.frequency,
      next_payment_date: form.next_payment_date,
      active: form.active,
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
    await deleteSubscription(confirmDelete.id);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const sorted = useMemo(
    () => [...subscriptions].sort((a, b) => a.next_payment_date.localeCompare(b.next_payment_date)),
    [subscriptions],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Recurring Commitments</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal-900 mt-0.5">Subscriptions</h1>
          <p className="text-sm text-charcoal-600 mt-1">Audit active recurring bills and project your annual costs.</p>
        </div>
        <Button onClick={openAdd} leftIcon={<Plus className="w-4 h-4" />}>
          <span>Add Subscription</span>
        </Button>
      </div>

      {/* Highlight banner */}
      {activeSubs.length > 0 && (
        <Card className="p-6 bg-forest-900 text-ivory-50 border-0 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-forest-800 border border-forest-700 flex items-center justify-center text-apricot-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sage-300">
              Recurring Outflow Summary
            </span>
          </div>

          <div className="mt-3">
            <p className="font-display text-4xl font-bold tracking-tight">
              {formatINR(monthlyTotal)}
              <span className="text-base font-medium text-sage-300 ml-1.5">/ month</span>
            </p>
            <p className="text-sm text-sage-200 mt-2 font-medium">
              Across <span className="font-bold text-ivory-50">{activeSubs.length} active subscription{activeSubs.length === 1 ? '' : 's'}</span> · Approximately <span className="font-bold text-apricot-400">{formatINR(annualTotal)}</span> projected per year
            </p>
          </div>
        </Card>
      )}

      {/* Subscription list */}
      {sorted.length === 0 ? (
        <Card className="p-10 sm:p-16 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <MoneyPath variant="minimal" width={220} animate={false} />
            <h3 className="font-display font-bold text-charcoal-900 text-xl">No subscriptions tracked yet</h3>
            <p className="text-sm text-charcoal-600 max-w-sm">
              Add recurring services like Netflix, Spotify, or cloud storage to prevent quiet money drains.
            </p>
            <Button className="mt-2" onClick={openAdd} leftIcon={<Plus className="w-4 h-4" />}>Add Subscription</Button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {sorted.map((s) => (
            <Card key={s.id} className="p-6 group space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.active ? 'bg-forest-50 border-forest-200 text-forest-700' : 'bg-cream-200/80 border-charcoal-100 text-charcoal-400'}`}>
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-charcoal-900 text-base">{s.name}</p>
                    <p className="text-xs text-charcoal-500 capitalize font-medium">{s.frequency} billing</p>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-200 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(s)}
                    className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-charcoal-100/70 pt-3">
                <div>
                  <p className="font-display text-2xl font-bold text-charcoal-900">{formatINR(s.amount)}</p>
                  <p className="text-xs text-charcoal-500 font-medium mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-forest-700" />
                    Next renewal: {formatDate(s.next_payment_date)}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.active ? 'bg-forest-50 text-forest-800 border-forest-200' : 'bg-cream-200 text-charcoal-600 border-charcoal-200'}`}>
                  {s.active ? <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" /> : <XCircle className="w-3.5 h-3.5 text-charcoal-400" />}
                  {s.active ? 'Active' : 'Paused'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Subscription' : 'Add Subscription'}
        subtitle="Track recurring payments"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Add Subscription'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="text-sm font-medium text-apricot-800 bg-apricot-50 border border-apricot-200 rounded-xl px-4 py-3">{error}</div>
          )}
          <Field label="Subscription name" required>
            <TextInput
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Netflix, Spotify, iCloud"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount" required>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 font-semibold text-sm">$</span>
                <TextInput
                  type="number"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="14.99"
                  className="pl-8"
                />
              </div>
            </Field>
            <Field label="Billing frequency" required>
              <Select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value as SubscriptionFrequency }))}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </Select>
            </Field>
          </div>
          <Field label="Next payment date" required>
            <TextInput
              type="date"
              value={form.next_payment_date}
              onChange={(e) => setForm((p) => ({ ...p, next_payment_date: e.target.value }))}
            />
          </Field>
          <Field label="Status">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, active: true }))}
                className={`flex-1 h-11 rounded-xl border text-sm font-bold transition-all ${form.active ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-charcoal-200 text-charcoal-600'}`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, active: false }))}
                className={`flex-1 h-11 rounded-xl border text-sm font-bold transition-all ${!form.active ? 'border-charcoal-400 bg-cream-200 text-charcoal-900' : 'border-charcoal-200 text-charcoal-600'}`}
              >
                Inactive / Paused
              </button>
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
              <h3 className="font-display font-bold text-charcoal-900 text-lg">Remove subscription?</h3>
              <p className="text-sm text-charcoal-600 mt-1">
                Are you sure you want to remove "{confirmDelete.name}" from your active subscriptions?
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

