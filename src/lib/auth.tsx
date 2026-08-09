import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function bootstrap() {
      try {
        // --- Step 1: Handle PKCE code exchange if ?code= is present ---
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
          // Strip the code from URL immediately so it's not double-processed
          window.history.replaceState({}, '', window.location.pathname);

          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!mounted) return;

          if (error) {
            console.error('[Auth] PKCE code exchange failed:', error.message);
            // Fall through to getSession to check for existing session
          } else if (data.session?.user) {
            setUser(toSessionUser(data.session.user));
            setLoading(false);
            return; // Done — session established via PKCE
          }
        }

        // --- Step 2: Handle implicit flow (#access_token=) ---
        const hash = window.location.hash;
        if (hash.includes('access_token=')) {
          // detectSessionInUrl handles this automatically; getSession will have it
          // Just wait a tick for the client to parse the hash
          await new Promise((r) => setTimeout(r, 100));
          window.history.replaceState({}, '', window.location.pathname);
        }

        // --- Step 3: Check for an existing persisted session ---
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(toSessionUser(session.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('[Auth] Bootstrap error:', err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    // --- Step 4: Listen for auth changes (token refresh, sign-out, etc.) ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(toSessionUser(session.user));
      } else {
        setUser(null);
      }
      // Never set loading here — bootstrap() owns the initial loading state
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: 'Backend is not configured properly.' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    if (data.user) setUser(toSessionUser(data.user, name));
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: 'Backend is not configured properly.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) setUser(toSessionUser(data.user));
    return { error: null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) return { error: 'Backend is not configured properly.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    if (isSupabaseConfigured) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function toSessionUser(u: User, nameOverride?: string): SessionUser {
  const name =
    nameOverride ??
    (u.user_metadata?.full_name as string | undefined) ??
    (u.user_metadata?.name as string | undefined) ??
    (u.email ? u.email.split('@')[0] : 'User');
  const email =
    u.email ??
    (u.user_metadata?.email as string | undefined) ??
    '';
  return { id: u.id, name, email };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
