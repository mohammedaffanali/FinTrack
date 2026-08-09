import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Logo } from './ui/Logo';
import { MoneyPath } from './ui/MoneyPath';
import { FinancialBackground } from './ui/FinancialBackground';
import {
  TrendingUp,
  Repeat,
  Target,
  Upload,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
  Smartphone,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-ivory-50 text-charcoal-900 selection:bg-forest-100 selection:text-forest-800 relative overflow-hidden">
      <FinancialBackground variant="landing" />
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-ivory-50/90 backdrop-blur-md border-b border-charcoal-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <Logo size={38} showTagline={true} />

            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Philosophy', id: 'philosophy' },
                { label: 'Money Path', id: 'moneypath' },
                { label: 'Features', id: 'features' },
                { label: 'Insights', id: 'insights' },
                { label: 'FAQ', id: 'faq' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-sm font-semibold text-charcoal-600 hover:text-forest-700 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onLogin}>
                Log In
              </Button>
              <Button size="sm" onClick={onGetStarted}>
                Get Started
              </Button>
            </div>

            <button
              className="md:hidden p-2 text-charcoal-700"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-6 space-y-2 border-t border-charcoal-100 pt-4 bg-cream-50 rounded-b-2xl px-2">
              {[
                { label: 'Philosophy', id: 'philosophy' },
                { label: 'Money Path', id: 'moneypath' },
                { label: 'Features', id: 'features' },
                { label: 'Insights', id: 'insights' },
                { label: 'FAQ', id: 'faq' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-charcoal-700 hover:bg-cream-200 rounded-xl"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-3 px-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={onLogin}>
                    Log In
                  </Button>
                  <Button size="sm" className="flex-1" onClick={onGetStarted}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200/80 text-forest-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-apricot-500" />
                <span>A calmer way to understand your finances</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.08] text-balance">
                Know where your <span className="text-forest-700 italic font-normal">money goes.</span>
              </h1>

              <p className="text-lg text-charcoal-600 leading-relaxed max-w-xl">
                FinTrack brings your everyday spending, recurring subscriptions, custom budgets, and cashflows into one peaceful, beautifully organized view.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button size="lg" onClick={onGetStarted} rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Get Started Free
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-medium text-charcoal-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-forest-600" />
                  <span>No bank credentials needed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-forest-600" />
                  <span>Privacy-first design</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-sage-200/40 via-apricot-100/30 to-forest-100/40 rounded-3xl blur-xl" />
                <Card className="relative p-6 sm:p-8 bg-cream-100/95 border-charcoal-100 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                        Signature Money Flow
                      </span>
                      <h3 className="font-display text-xl font-bold text-charcoal-900 mt-0.5">
                        Income → Spending → Savings
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold border border-forest-200">
                      Live Stream
                    </span>
                  </div>

                  <MoneyPath variant="compact" height={90} animate={true} />

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                      <span className="text-[10px] font-semibold text-charcoal-400 uppercase">Inflow</span>
                      <p className="font-display text-base font-bold text-forest-800 mt-0.5">$5,400.00</p>
                    </div>
                    <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                      <span className="text-[10px] font-semibold text-charcoal-400 uppercase">Outflow</span>
                      <p className="font-display text-base font-bold text-apricot-600 mt-0.5">$2,840.50</p>
                    </div>
                    <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                      <span className="text-[10px] font-semibold text-charcoal-400 uppercase">Retained</span>
                      <p className="font-display text-base font-bold text-forest-700 mt-0.5">$2,559.50</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Money Path Section */}
      <section id="moneypath" className="py-16 sm:py-24 bg-cream-100/70 border-y border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
              The Visual Philosophy
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900 mt-2">
              Understanding money through flowing continuity
            </h2>
            <p className="mt-4 text-charcoal-600 leading-relaxed text-balance">
              Unlike harsh pie charts or confusing banking tables, FinTrack introduces the continuous **Money Path** — tracking every dollar from origin to outcome.
            </p>
          </div>

          <MoneyPath variant="hero" />
        </div>
      </section>

      {/* Why FinTrack */}
      <section id="philosophy" className="py-20 bg-ivory-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
              Built for intentional clarity
            </h2>
            <p className="mt-3 text-charcoal-600">
              Say goodbye to fragmented statements, dark-mode crypto noise, and forgotten subscription drains.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: 'Consolidated Accounts',
                desc: 'Bring your multi-bank transfers, cards, and daily expenses into one calm editorial view.',
              },
              {
                icon: Repeat,
                title: 'Subscription Vigilance',
                desc: 'Uncover recurring monthly micro-bills before they quietly compound into thousands.',
              },
              {
                icon: Target,
                title: 'Meaningful Budgets',
                desc: 'Set custom spending caps by category with gentle warnings instead of stressful red alerts.',
              },
              {
                icon: Compass,
                title: 'Human Insights',
                desc: 'Receive natural, conversational observations about your spending velocity and savings potential.',
              },
              {
                icon: Upload,
                title: 'Instant CSV Import',
                desc: 'Import statements seamlessly with smart auto-categorization for instant historical clarity.',
              },
              {
                icon: ShieldCheck,
                title: 'Total Ownership',
                desc: 'Your financial record remains completely private and self-contained. No external aggregators.',
              },
            ].map((p) => (
              <Card key={p.title} hover className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center mb-4 text-forest-700">
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-charcoal-900">{p.title}</h3>
                <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-20 bg-cream-100/60 border-t border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
              Everything in harmony
            </h2>
            <p className="mt-3 text-charcoal-600">Thoughtful tools designed to give you complete financial peace of mind.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Real-time Flow Stream',
                desc: 'Watch your income flow into category streams with percentage proportions and category badges.',
              },
              {
                num: '02',
                title: 'Smart Subscriptions',
                desc: 'Identify recurring payment frequencies and annual projections so nothing catches you off guard.',
              },
              {
                num: '03',
                title: 'Month-over-Month Variance',
                desc: 'Compare monthly spending patterns to measure progress and celebrate growing savings ratios.',
              },
            ].map((f) => (
              <Card key={f.num} className="p-8 relative overflow-hidden bg-ivory-50">
                <span className="absolute top-4 right-6 font-display text-5xl font-bold text-charcoal-200/60 select-none">
                  {f.num}
                </span>
                <div className="relative">
                  <h3 className="font-display text-xl font-bold text-charcoal-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Insights Preview Section */}
      <section id="insights" className="py-20 bg-forest-900 text-ivory-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-sage-300">
                Conversational Intelligence
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-ivory-50">
                Insights that feel like advice from a trusted friend
              </h2>
              <p className="text-sage-200 leading-relaxed">
                FinTrack translates raw line-item data into actionable, human-friendly financial observations. No overwhelming financial jargon or cryptic codes.
              </p>

              <div className="pt-2">
                <Button size="lg" onClick={onGetStarted} className="bg-apricot-500 hover:bg-apricot-600 text-ivory-50 border-none shadow-md">
                  Get Started Free
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'Dining & Outing Observation',
                  body: 'You spent 14% less on Food & Dining this month compared to last month. That saved $180.00!',
                  tone: 'apricot',
                },
                {
                  title: 'Recurring Renewal Alert',
                  body: 'You have 3 active streaming subscriptions renewing next week totaling $38.97.',
                  tone: 'sage',
                },
                {
                  title: 'Savings Pace Highlight',
                  body: 'Your current savings rate is 32% of total income — exceeding your 25% target!',
                  tone: 'forest',
                },
              ].map((c, i) => (
                <div key={i} className="bg-forest-800/80 backdrop-blur-md rounded-2xl border border-forest-700/80 p-5 shadow-lg">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center shrink-0 text-apricot-400 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-base text-ivory-100">{c.title}</p>
                      <p className="text-sm text-sage-200 mt-1 leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-ivory-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'How does FinTrack keep my information safe?',
                a: 'FinTrack operates without direct bank logins. You maintain complete custody of your financial data, with optional manual entry or simple CSV uploads.',
              },
              {
                q: 'What is the signature "Money Path"?',
                a: 'The Money Path is FinTrack’s visual flow line. It connects your total Income to your Category Spending and Retained Savings in a single continuous path.',
              },
              {
                q: 'How fast can I set up my FinTrack account?',
                a: 'You can create your account in seconds or sign in directly with Google to start tracking your money immediately.',
              },
              {
                q: 'Can I import my existing bank CSV statements?',
                a: 'Absolutely. FinTrack includes an interactive CSV importer with automatic merchant recognition and category assignment.',
              },
            ].map((item, i) => (
              <div key={i} className="border border-charcoal-100 rounded-2xl overflow-hidden bg-cream-50/70">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-200/50 transition-colors"
                >
                  <span className="font-display font-bold text-charcoal-900 text-base">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-charcoal-400 transition-transform ${
                      openFaq === i ? 'rotate-180 text-forest-700' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-charcoal-600 leading-relaxed text-sm border-t border-charcoal-100/50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 bg-cream-200/60 border-t border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
            Ready to know where your money goes?
          </h2>
          <p className="text-charcoal-600 text-lg max-w-xl mx-auto">
            Experience financial clarity designed around your peace of mind.
          </p>
          <div className="flex justify-center pt-2">
            <Button size="lg" onClick={onGetStarted} rightIcon={<ArrowRight className="w-5 h-5" />}>
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-900 text-charcoal-300 py-12 border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo size={36} showTagline={true} variant="light" />
            <p className="text-xs text-charcoal-400">
              © {new Date().getFullYear()} FinTrack. All rights reserved. Know where your money goes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

