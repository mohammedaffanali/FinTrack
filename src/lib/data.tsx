import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Transaction, Budget, Subscription } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { useAuth } from './auth';

interface DataContextValue {
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<{ error: string | null }>;
  updateTransaction: (id: string, t: Omit<Transaction, 'id'>) => Promise<{ error: string | null }>;
  deleteTransaction: (id: string) => Promise<{ error: string | null }>;
  importTransactions: (ts: Omit<Transaction, 'id'>[]) => Promise<{ error: string | null; count: number }>;
  upsertBudget: (b: Omit<Budget, 'id'> & { id?: string }) => Promise<{ error: string | null }>;
  deleteBudget: (id: string) => Promise<{ error: string | null }>;
  upsertSubscription: (s: Omit<Subscription, 'id'> & { id?: string }) => Promise<{ error: string | null }>;
  deleteSubscription: (id: string) => Promise<{ error: string | null }>;
  resetAllData: () => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setTransactions([]);
      setBudgets([]);
      setSubscriptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [t, b, s] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('budgets').select('*'),
        supabase.from('subscriptions').select('*'),
      ]);
      if (t.data) setTransactions(t.data as Transaction[]);
      if (b.data) setBudgets(b.data as Budget[]);
      if (s.data) setSubscriptions(s.data as Subscription[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addTransaction = useCallback(
    async (t: Omit<Transaction, 'id'>) => {
      if (!isSupabaseConfigured) {
        setTransactions((prev) => [{ ...t, id: `txn-${Date.now()}` }, ...prev]);
        return { error: null };
      }
      const { error } = await supabase.from('transactions').insert(t);
      if (error) return { error: error.message };
      await load();
      return { error: null };
    },
    [load],
  );

  const updateTransaction = useCallback(
    async (id: string, t: Omit<Transaction, 'id'>) => {
      if (!isSupabaseConfigured) {
        setTransactions((prev) => prev.map((x) => (x.id === id ? { ...t, id } : x)));
        return { error: null };
      }
      const { error } = await supabase.from('transactions').update(t).eq('id', id);
      if (error) return { error: error.message };
      await load();
      return { error: null };
    },
    [load],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured) {
        setTransactions((prev) => prev.filter((x) => x.id !== id));
        return { error: null };
      }
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) return { error: error.message };
      await load();
      return { error: null };
    },
    [load],
  );

  const importTransactions = useCallback(
    async (ts: Omit<Transaction, 'id'>[]) => {
      if (ts.length === 0) return { error: null, count: 0 };
      if (!isSupabaseConfigured) {
        const withIds = ts.map((t) => ({ ...t, id: `txn-${Date.now()}-${Math.random()}` }));
        setTransactions((prev) => [...withIds, ...prev]);
        return { error: null, count: ts.length };
      }
      const { error } = await supabase.from('transactions').insert(ts);
      if (error) return { error: error.message, count: 0 };
      await load();
      return { error: null, count: ts.length };
    },
    [load],
  );

  const upsertBudget = useCallback(
    async (b: Omit<Budget, 'id'> & { id?: string }) => {
      if (!isSupabaseConfigured) {
        if (b.id) {
          setBudgets((prev) => prev.map((x) => (x.id === b.id ? { ...b, id: b.id! } : x)));
        } else {
          setBudgets((prev) => [...prev, { ...b, id: `b-${Date.now()}` }]);
        }
        return { error: null };
      }
      const payload = { category: b.category, monthly_limit: b.monthly_limit, month: b.month };
      if (b.id) {
        const { error } = await supabase.from('budgets').update(payload).eq('id', b.id);
        if (error) return { error: error.message };
      } else {
        const { error } = await supabase.from('budgets').insert(payload);
        if (error) return { error: error.message };
      }
      await load();
      return { error: null };
    },
    [load],
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured) {
        setBudgets((prev) => prev.filter((x) => x.id !== id));
        return { error: null };
      }
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) return { error: error.message };
      await load();
      return { error: null };
    },
    [load],
  );

  const upsertSubscription = useCallback(
    async (s: Omit<Subscription, 'id'> & { id?: string }) => {
      if (!isSupabaseConfigured) {
        if (s.id) {
          setSubscriptions((prev) => prev.map((x) => (x.id === s.id ? { ...s, id: s.id! } : x)));
        } else {
          setSubscriptions((prev) => [...prev, { ...s, id: `sub-${Date.now()}` }]);
        }
        return { error: null };
      }
      const payload = {
        name: s.name,
        amount: s.amount,
        frequency: s.frequency,
        next_payment_date: s.next_payment_date,
        active: s.active,
      };
      if (s.id) {
        const { error } = await supabase.from('subscriptions').update(payload).eq('id', s.id);
        if (error) return { error: error.message };
      } else {
        const { error } = await supabase.from('subscriptions').insert(payload);
        if (error) return { error: error.message };
      }
      await load();
      return { error: null };
    },
    [load],
  );

  const deleteSubscription = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured) {
        setSubscriptions((prev) => prev.filter((x) => x.id !== id));
        return { error: null };
      }
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) return { error: error.message };
      await load();
      return { error: null };
    },
    [load],
  );

  const resetAllData = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setTransactions([]);
      setBudgets([]);
      setSubscriptions([]);
      return { error: null };
    }
    try {
      setLoading(true);
      const [tErr, bErr, sErr] = await Promise.all([
        supabase.from('transactions').delete().eq('user_id', user.id),
        supabase.from('budgets').delete().eq('user_id', user.id),
        supabase.from('subscriptions').delete().eq('user_id', user.id),
      ]);
      if (tErr.error) return { error: tErr.error.message };
      if (bErr.error) return { error: bErr.error.message };
      if (sErr.error) return { error: sErr.error.message };
      await load();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to reset data' };
    } finally {
      setLoading(false);
    }
  }, [user, load]);

  return (
    <DataContext.Provider
      value={{
        transactions,
        budgets,
        subscriptions,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        upsertBudget,
        deleteBudget,
        upsertSubscription,
        deleteSubscription,
        resetAllData,
        refresh: load,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

