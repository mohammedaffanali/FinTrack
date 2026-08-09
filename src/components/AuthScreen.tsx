import { useState } from 'react';
import { Button } from './ui/Button';
import { Field, TextInput } from './ui/Field';
import { Logo } from './ui/Logo';
import { MoneyPath } from './ui/MoneyPath';
import { useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  mode: 'login' | 'signup';
  onToggle: () => void;
  onSuccess: () => void;
}

export function AuthScreen({ mode, onToggle, onSuccess }: AuthScreenProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result =
      mode === 'signup'
        ? await signUp(name, email, password)
        : await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const res = await signInWithGoogle();
    setGoogleLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-ivory-50 flex font-sans">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest-900 text-ivory-50 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #E97A33 0, transparent 50%), radial-gradient(circle at 80% 70%, #8A9F85 0, transparent 50%)' }} />
        
        <div className="relative z-10">
          <Logo variant="full" inverted />
        </div>

        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-ivory-50">
            Know where your<br />
            <span className="text-apricot-400 italic">money goes.</span>
          </h2>

          <div className="my-6 py-4 border-y border-forest-800">
            <MoneyPath variant="compact" width={400} />
          </div>

          <div className="space-y-4">
            {[
              { icon: TrendingUp, title: 'Understand your Cashflow', desc: 'Flow seamlessly from Income → Spending → Savings.' },
              { icon: ShieldCheck, title: 'Calm & Secure', desc: 'Your financial data is private, encrypted, and safe.' },
              { icon: Sparkles, title: 'Editorial Clarity', desc: 'Human-friendly insights without generic chart clutter.' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-forest-800 border border-forest-700 flex items-center justify-center shrink-0 text-apricot-400">
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-display font-bold text-ivory-50 text-sm">{f.title}</p>
                  <p className="text-xs text-sage-300 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-sage-300">Your money is everywhere. Your understanding shouldn't be.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-ivory-50">
        <div className="w-full max-w-md bg-cream-100/90 border border-charcoal-100 p-8 sm:p-10 rounded-3xl shadow-lg space-y-5">
          <div className="lg:hidden mb-4">
            <Logo variant="full" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Account Access</span>
            <h1 className="font-display text-3xl font-bold text-charcoal-900 mt-1 tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-charcoal-600 mt-1">
              {mode === 'signup' ? 'Start tracking your Money Path in minutes.' : 'Sign in to review your financial dashboard.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <Field label="Full name" required>
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  required
                />
              </Field>
            )}
            <Field label="Gmail address" required hint="Must end with @gmail.com">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                required
              />
            </Field>
            <Field label="Password" required>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </Field>

            {error && (
              <div className="text-xs font-medium text-apricot-800 bg-apricot-50 border border-apricot-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base mt-2" loading={loading} disabled={!isSupabaseConfigured}>
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center gap-3 pt-1">
            <div className="h-px bg-charcoal-200 flex-1" />
            <span className="text-xs text-charcoal-400 font-bold uppercase tracking-wider">OR</span>
            <div className="h-px bg-charcoal-200 flex-1" />
          </div>

          {/* Google Sign In Button - Placed below form */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full h-11 px-4 rounded-xl border border-charcoal-200 bg-white hover:bg-cream-50 text-charcoal-900 font-semibold text-sm flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-600/40"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Signing in with Google...' : 'Sign in with Google'}</span>
          </button>

          <p className="text-xs font-medium text-charcoal-600 text-center pt-1">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={onToggle} className="text-forest-700 font-bold hover:underline">
              {mode === 'signup' ? 'Log in' : 'Get started'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}




