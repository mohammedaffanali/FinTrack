import { useMemo, useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TextInput, Select } from './ui/Field';
import { MoneyPath } from './ui/MoneyPath';
import { useData } from '@/lib/data';
import { formatINR, formatDate } from '@/lib/format';
import { CATEGORY_NAMES, categoryColor } from '@/lib/categories';
import { PAYMENT_METHODS } from '@/lib/types';
import type { Transaction } from '@/lib/types';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface TransactionsPageProps {
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onImportCSV: () => void;
  filterCategory?: string | null;
  clearCategoryFilter?: () => void;
}

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'merchant-asc';

export function TransactionsPage({ onAdd, onEdit, onImportCSV, filterCategory, clearCategoryFilter }: TransactionsPageProps) {
  const { transactions, deleteTransaction } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [method, setMethod] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (filterCategory) setCategory(filterCategory);
  }, [filterCategory]);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.merchant.toLowerCase().includes(q) || (t.notes ?? '').toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
      );
    }
    if (category !== 'all') list = list.filter((t) => t.category === category);
    if (method !== 'all') list = list.filter((t) => t.payment_method === method);
    if (type !== 'all') list = list.filter((t) => t.type === type);
    list.sort((a, b) => {
      switch (sort) {
        case 'date-desc':
          return a.date < b.date ? 1 : -1;
        case 'date-asc':
          return a.date > b.date ? 1 : -1;
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'merchant-asc':
          return a.merchant.localeCompare(b.merchant);
      }
    });
    return list;
  }, [transactions, search, category, method, type, sort]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const hasActiveFilters = category !== 'all' || method !== 'all' || type !== 'all';

  const clearFilters = () => {
    setCategory('all');
    setMethod('all');
    setType('all');
    clearCategoryFilter?.();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    await deleteTransaction(confirmDelete.id);
    setDeleting(false);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Financial Ledger</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal-900 mt-0.5">Transactions</h1>
          <p className="text-sm text-charcoal-600 mt-1">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} · <span className="text-apricot-600 font-semibold">{formatINR(totalExpense)} spent</span> · <span className="text-forest-700 font-semibold">{formatINR(totalIncome)} earned</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onImportCSV} leftIcon={<Upload className="w-4 h-4" />}>
            Import CSV
          </Button>
          <Button onClick={onAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Search + sort */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchant, notes, or category..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="min-w-[160px]">
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
              <option value="merchant-asc">Merchant A-Z</option>
            </Select>
            <Button
              variant={showFilters || hasActiveFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters((v) => !v)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-charcoal-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="block text-xs font-semibold text-charcoal-500 mb-1">Category</span>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {CATEGORY_NAMES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <span className="block text-xs font-semibold text-charcoal-500 mb-1">Payment Method</span>
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="all">All methods</option>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <span className="block text-xs font-semibold text-charcoal-500 mb-1">Type</span>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="all">All types</option>
                <option value="expense">Outflow (Expense)</option>
                <option value="income">Inflow (Income)</option>
              </Select>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-charcoal-100/60">
            <span className="text-xs text-charcoal-500 font-semibold">Active filters:</span>
            {category !== 'all' && <FilterChip label={category} onRemove={() => { setCategory('all'); clearCategoryFilter?.(); }} />}
            {method !== 'all' && <FilterChip label={method} onRemove={() => setMethod('all')} />}
            {type !== 'all' && <FilterChip label={type} onRemove={() => setType('all')} />}
            <button onClick={clearFilters} className="text-xs text-forest-700 font-bold hover:underline ml-1">Clear all</button>
          </div>
        )}
      </Card>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <Card className="p-10 sm:p-14 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <MoneyPath variant="minimal" width={220} animate={false} />
            <h3 className="font-display font-bold text-charcoal-900 text-lg">
              {transactions.length === 0 ? 'No transactions yet.' : 'No matching transactions'}
            </h3>
            <p className="text-sm text-charcoal-600 max-w-sm">
              {transactions.length === 0
                ? 'Add your first expense or income to start tracking.'
                : 'Try adjusting your search criteria or clearing active filters.'}
            </p>
            {transactions.length === 0 ? (
              <div className="flex gap-3 pt-2">
                <Button onClick={onAdd} leftIcon={<Plus className="w-4 h-4" />}>Add Transaction</Button>
                <Button variant="outline" onClick={onImportCSV} leftIcon={<Upload className="w-4 h-4" />}>Import CSV</Button>
              </div>
            ) : (
              <Button variant="outline" className="mt-3" onClick={clearFilters}>Clear filters</Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-cream-200/50 border-b border-charcoal-100 text-xs font-bold text-charcoal-500 uppercase tracking-wider">
            <div className="col-span-4">Merchant & Notes</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Payment Method</div>
            <div className="col-span-1 text-right">Amount</div>
          </div>

          <div className="divide-y divide-charcoal-100/70">
            {filtered.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <div
                  key={t.id}
                  className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-cream-200/40 transition-colors"
                >
                  <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isIncome ? 'bg-forest-50 border-forest-200 text-forest-700' : 'bg-cream-200/80 border-charcoal-100 text-charcoal-700'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-4 h-4 text-forest-700" /> : <ArrowUpRight className="w-4 h-4 text-apricot-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-charcoal-900 truncate">{t.merchant}</p>
                      {t.notes && <p className="text-xs text-charcoal-500 truncate">{t.notes}</p>}
                    </div>
                  </div>

                  <div className="hidden md:flex col-span-3 items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: categoryColor(t.category) }} />
                    <span className="text-sm font-medium text-charcoal-700">{t.category}</span>
                  </div>

                  <div className="hidden md:block col-span-2 text-sm text-charcoal-600 font-medium">
                    {formatDate(t.date)}
                  </div>

                  <div className="hidden md:block col-span-2 text-sm text-charcoal-600 font-medium">
                    {t.payment_method}
                  </div>

                  <div className="col-span-10 md:col-span-1 flex items-center justify-end gap-1">
                    <span className={`text-sm font-bold ${isIncome ? 'text-forest-700' : 'text-charcoal-900'}`}>
                      {isIncome ? '+' : '−'}{formatINR(t.amount)}
                    </span>
                  </div>

                  <div className="col-span-2 md:col-span-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-1.5 text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-200 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(t)}
                      className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile row breakdown */}
                  <div className="col-span-12 md:hidden -mt-1 flex items-center justify-between text-xs text-charcoal-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor(t.category) }} />
                      {t.category} · {formatDate(t.date)} · {t.payment_method}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(t)} className="text-charcoal-600 font-medium hover:underline">Edit</button>
                      <button onClick={() => setConfirmDelete(t)} className="text-red-600 font-medium hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <Card className="relative w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-apricot-50 border border-apricot-200 flex items-center justify-center text-apricot-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-charcoal-900 text-lg">Remove transaction?</h3>
              <p className="text-sm text-charcoal-600 mt-1">
                Are you sure you want to delete "{confirmDelete.merchant}" ({formatINR(confirmDelete.amount)})?
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

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
      {label}
      <button onClick={onRemove} className="hover:text-forest-900"><X className="w-3 h-3" /></button>
    </span>
  );
}

