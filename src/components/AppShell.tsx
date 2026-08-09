import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Icon } from './ui/Icon';
import { Logo } from './ui/Logo';
import { FinancialBackground } from './ui/FinancialBackground';
import {
  LogOut,
  Plus,
  Menu,
  ChevronDown,
} from 'lucide-react';

export type Page = 'dashboard' | 'transactions' | 'budgets' | 'subscriptions' | 'insights' | 'comparison';

interface AppShellProps {
  page: Page;
  onNavigate: (p: Page) => void;
  onAddTransaction: () => void;
  children: ReactNode;
}

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'transactions', label: 'Transactions', icon: 'Receipt' },
  { id: 'budgets', label: 'Budgets', icon: 'Target' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'Repeat' },
  { id: 'insights', label: 'Insights', icon: 'Sparkles' },
  { id: 'comparison', label: 'Comparison', icon: 'GitCompareArrows' },
];

const MOBILE_NAV = NAV.slice(0, 5);

export function AppShell({ page, onNavigate, onAddTransaction, children }: AppShellProps) {
  const { user, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-ivory-50 text-charcoal-900 flex relative overflow-hidden">
      <FinancialBackground variant="dashboard" />
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-cream-100/90 border-r border-charcoal-100 fixed h-screen z-30">
        <div className="h-20 flex items-center px-6 border-b border-charcoal-100/70">
          <Logo size={34} showTagline={false} />
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 h-11 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-forest-700 text-ivory-50 shadow-sm shadow-forest-900/20 font-semibold'
                    : 'text-charcoal-700 hover:bg-cream-200/80 hover:text-charcoal-900'
                }`}
              >
                <Icon name={item.icon} className={`w-4.5 h-4.5 ${active ? 'text-ivory-50' : 'text-forest-600'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-charcoal-100/70 bg-cream-50/50">
          <Button
            className="w-full shadow-sm"
            onClick={onAddTransaction}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Transaction
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-cream-100/95 backdrop-blur-md border-b border-charcoal-100">
        <div className="h-16 flex items-center justify-between px-4">
          <Logo size={30} showTagline={false} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 text-charcoal-700 hover:bg-cream-200 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <Modal open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="Navigation" size="sm">
        <nav className="space-y-1.5">
          {NAV.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 h-12 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-forest-700 text-ivory-50 font-semibold'
                    : 'text-charcoal-700 hover:bg-cream-200'
                }`}
              >
                <Icon name={item.icon} className={`w-5 h-5 ${active ? 'text-ivory-50' : 'text-forest-600'}`} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-4 mt-4 border-t border-charcoal-100">
            <Button
              className="w-full"
              onClick={() => {
                onAddTransaction();
                setMobileNavOpen(false);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Transaction
            </Button>
          </div>
        </nav>
      </Modal>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Desktop top bar */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 bg-ivory-50/80 backdrop-blur-md border-b border-charcoal-100/70 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg font-bold text-charcoal-900 capitalize tracking-tight">
              {NAV.find((n) => n.id === page)?.label}
            </h1>
          </div>


          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2.5 h-10 pl-2 pr-3 rounded-xl hover:bg-cream-200/70 transition-colors border border-transparent hover:border-charcoal-100"
            >
              <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-forest-800 text-xs font-bold border border-forest-200">
                {initials}
              </div>
              <span className="text-sm font-semibold text-charcoal-800">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-charcoal-400" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-12 z-20 w-60 bg-cream-50 rounded-2xl shadow-xl border border-charcoal-100 py-1.5">
                  <div className="px-4 py-3 border-b border-charcoal-100/70">
                    <p className="text-sm font-bold text-charcoal-900 truncate">{user?.name}</p>
                    <p className="text-xs text-charcoal-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-cream-200/80 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-apricot-600" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 pt-16 lg:pt-0 pb-20 lg:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-6 sm:py-8 space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-cream-100/95 backdrop-blur-md border-t border-charcoal-100 flex items-center justify-around h-16 px-1">
        {MOBILE_NAV.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'text-forest-700 font-bold' : 'text-charcoal-400'
              }`}
            >
              <Icon name={item.icon} className={`w-5 h-5 ${active ? 'text-forest-700' : 'text-charcoal-400'}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile FAB */}
      <button
        onClick={onAddTransaction}
        className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-forest-700 text-ivory-50 shadow-lg shadow-forest-900/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

