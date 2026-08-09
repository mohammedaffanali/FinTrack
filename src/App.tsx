import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { DataProvider, useData } from '@/lib/data';
import { LandingPage } from '@/components/LandingPage';
import { AuthScreen } from '@/components/AuthScreen';
import { AppShell, type Page } from '@/components/AppShell';
import { Dashboard } from '@/components/Dashboard';
import { TransactionsPage } from '@/components/TransactionsPage';
import { BudgetsPage } from '@/components/BudgetsPage';
import { SubscriptionsPage } from '@/components/SubscriptionsPage';
import { InsightsPage } from '@/components/InsightsPage';
import { ComparisonPage } from '@/components/ComparisonPage';
import { TransactionModal } from '@/components/TransactionModal';
import { CSVImportModal } from '@/components/CSVImportModal';
import type { Transaction } from '@/lib/types';

type Screen = 'landing' | 'login' | 'signup' | 'app';

function AppContent() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [page, setPage] = useState<Page>('dashboard');
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [budgetMonth, setBudgetMonth] = useState<string | undefined>(undefined);

  const { addTransaction, updateTransaction } = useData();

  const handleSaveTxn = useCallback(
    async (t: Omit<Transaction, 'id'>) => {
      if (editingTxn) return updateTransaction(editingTxn.id, t);
      return addTransaction(t);
    },
    [editingTxn, addTransaction, updateTransaction],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <>
        <AppShell
          page={page}
          onNavigate={(p) => {
            setPage(p);
            setCategoryFilter(null);
          }}
          onAddTransaction={() => {
            setEditingTxn(null);
            setTxnModalOpen(true);
          }}
        >
          {page === 'dashboard' && (
            <Dashboard
              onAddTransaction={() => {
                setEditingTxn(null);
                setTxnModalOpen(true);
              }}
              onCategoryClick={(cat) => {
                setCategoryFilter(cat);
                setPage('transactions');
              }}
              onSeeAllTransactions={() => setPage('transactions')}
            />
          )}
          {page === 'transactions' && (
            <TransactionsPage
              onAdd={() => {
                setEditingTxn(null);
                setTxnModalOpen(true);
              }}
              onEdit={(t) => {
                setEditingTxn(t);
                setTxnModalOpen(true);
              }}
              onImportCSV={() => setCsvOpen(true)}
              filterCategory={categoryFilter}
              clearCategoryFilter={() => setCategoryFilter(null)}
            />
          )}
          {page === 'budgets' && <BudgetsPage initialMonth={budgetMonth} />}
          {page === 'subscriptions' && <SubscriptionsPage />}
          {page === 'insights' && <InsightsPage />}
          {page === 'comparison' && <ComparisonPage />}
        </AppShell>

        <TransactionModal
          open={txnModalOpen}
          onClose={() => setTxnModalOpen(false)}
          onSave={handleSaveTxn}
          editing={editingTxn}
        />
        <CSVImportModal open={csvOpen} onClose={() => setCsvOpen(false)} onImported={() => {}} />
      </>
    );
  }

  if (screen === 'login' || screen === 'signup') {
    return (
      <AuthScreen
        mode={authMode}
        onToggle={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        onSuccess={() => setScreen('app')}
      />
    );
  }

  return (
    <LandingPage
      onGetStarted={() => {
        setAuthMode('signup');
        setScreen('signup');
      }}
      onLogin={() => {
        setAuthMode('login');
        setScreen('login');
      }}
    />
  );
}



function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
