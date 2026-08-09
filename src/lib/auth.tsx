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

const isGmail = (email: string) => email.trim().toLowerCase().endsWith('@gmail.com');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isSubscribed) return;

        if (data.session?.user) {
          const u = data.session.user;
          if (u.email && !isGmail(u.email)) {
            await supabase.auth.signOut();
            if (isSubscribed) setUser(null);
          } else {
            if (isSubscribed) setUser(toSessionUser(u));
          }
        }
      } catch (err) {
        console.error('Error getting auth session:', err);
      } finally {
        const hasOAuthParams =
          window.location.hash.includes('access_token=') ||
          window.location.search.includes('code=');

        if (isSubscribed && !hasOAuthParams) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isSubscribed) return;

      if (session?.user) {
        const u = session.user;
        if (u.email && !isGmail(u.email)) {
          await supabase.auth.signOut();
          if (isSubscribed) setUser(null);
        } else {
          if (isSubscribed) setUser(toSessionUser(u));

          if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      } else {
        if (isSubscribed) setUser(null);
      }

      if (isSubscribed) {
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    if (!isGmail(email)) {
      return { error: 'Only Gmail accounts (@gmail.com) are allowed.' };
    }
    if (!isSupabaseConfigured) return { error: 'Backend is not configured properly.' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      setUser(toSessionUser(data.user, name));
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isGmail(email)) {
      return { error: 'Only Gmail accounts (@gmail.com) are allowed.' };
    }
    if (!isSupabaseConfigured) return { error: 'Backend is not configured properly.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      setUser(toSessionUser(data.user));
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: 'Backend is not configured properly.' };
    }
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
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
  return { id: u.id, name, email: u.email ?? '' };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


