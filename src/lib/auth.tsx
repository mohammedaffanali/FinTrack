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
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        const u = data.session.user;
        if (u.email && !isGmail(u.email)) {
          supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(toSessionUser(u));
        }
      }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (session.user.email && !isGmail(session.user.email)) {
          supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(toSessionUser(session.user));
        }
      } else {
        setUser(null);
      }
    });
    return () => {
      mounted = false;
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
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
    (u.user_metadata?.name as string | undefined) ??
    (u.email ? u.email.split('@')[0] : 'User');
  return { id: u.id, name, email: u.email ?? '' };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

