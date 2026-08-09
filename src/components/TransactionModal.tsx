import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Field, TextInput, Select, Textarea } from './ui/Field';
import { Button } from './ui/Button';
import type { Transaction, TxnType, PaymentMethod } from '@/lib/types';
import { PAYMENT_METHODS } from '@/lib/types';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import { categorizeByMerchant } from '@/lib/merchantRules';
import { todayISO } from '@/lib/format';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id'>) => Promise<{ error: string | null }>;
  editing?: Transaction | null;
}

const EMPTY = {
  type: 'expense' as TxnType,
  amount: '',
  merchant: '',
  category: 'Food & Dining',
  date: todayISO(),
  payment_method: 'UPI' as PaymentMethod,
  notes: '',
};

export function TransactionModal({ open, onClose, onSave, editing }: TransactionModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        type: editing.type,
        amount: String(editing.amount),
        merchant: editing.merchant,
        category: editing.category,
        date: editing.date,
        payment_method: editing.payment_method,
        notes: editing.notes ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setSubmitError(null);
  }, [editing, open]);

  const set = (k: keyof typeof form, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const onMerchantBlur = () => {
    if (form.type === 'expense' && form.merchant.trim() && form.category === 'Food & Dining') {
      const guess = categorizeByMerchant(form.merchant);
      if (guess !== 'Other') set('category', guess);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const amt = Number(form.amount);
    if (!form.amount || Number.isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount';
    if (!form.merchant.trim()) e.merchant = 'Merchant is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSubmitError(null);
    const payload: Omit<Transaction, 'id'> = {
      type: form.type,
      amount: Number(form.amount),
      merchant: form.merchant.trim(),
      category: form.type === 'income' ? 'Income' : form.category,
      date: form.date,
      payment_method: form.payment_method,
      notes: form.notes.trim(),
    };
    const { error } = await onSave(payload);
    setSaving(false);
    if (error) {
      setSubmitError(error);
    } else {
      onClose();
    }
  };

  const categories = form.type === 'income' ? ['Income'] : EXPENSE_CATEGORIES;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Transaction' : 'Add Transaction'}
      subtitle={editing ? 'Update transaction details' : 'Record a new entry along your Money Path'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Transaction
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {submitError && (
          <div className="text-sm font-medium text-apricot-800 bg-apricot-50 border border-apricot-200 rounded-xl px-4 py-3">
            {submitError}
          </div>
        )}

        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">Flow Type</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => set('type', 'expense')}
              className={`h-11 rounded-xl border text-sm font-bold transition-all ${
                form.type === 'expense'
                  ? 'border-apricot-500 bg-apricot-50 text-apricot-800 ring-2 ring-apricot-400/20'
                  : 'border-charcoal-200 bg-cream-50 text-charcoal-600 hover:bg-cream-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                set('type', 'income');
                set('category', 'Income');
              }}
              className={`h-11 rounded-xl border text-sm font-bold transition-all ${
                form.type === 'income'
                  ? 'border-forest-600 bg-forest-50 text-forest-800 ring-2 ring-forest-600/20'
                  : 'border-charcoal-200 bg-cream-50 text-charcoal-600 hover:bg-cream-200'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount" error={errors.amount} required>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 font-semibold text-sm">$</span>
              <TextInput
                type="number"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
          </Field>
          <Field label="Date" error={errors.date} required>
            <TextInput type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </Field>
        </div>

        <Field label="Merchant / Source" error={errors.merchant} required>
          <TextInput
            value={form.merchant}
            onChange={(e) => set('merchant', e.target.value)}
            onBlur={onMerchantBlur}
            placeholder="e.g. Swiggy, Amazon, Client Payment"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" error={errors.category} required>
            <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Payment Method">
            <Select value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)}>
              {PAYMENT_METHODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Notes">
          <Textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Optional context or tag for this entry..."
          />
        </Field>
      </div>
    </Modal>
  );
}

