import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
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

const isGmail = (email: string) => {
  const e = email.trim().toLowerCase();
  return e.endsWith('@gmail.com') || e.endsWith('@googlemail.com');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    const handleSession = (session: Session | null) => {
      if (!isSubscribed) return;

      if (session?.user) {
        setUser(toSessionUser(session.user));
        setLoading(false);

        if (
          window.location.hash.includes('access_token=') ||
          window.location.search.includes('code=')
        ) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        setUser(null);
        const hasOAuthParams =
          window.location.hash.includes('access_token=') ||
          window.location.search.includes('code=');
        if (!hasOAuthParams) {
          setLoading(false);
        }
      }
    };

    // 1. Initial Session Check
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          handleSession(session);
        } else {
          const hasOAuthParams =
            window.location.hash.includes('access_token=') ||
            window.location.search.includes('code=');
          if (!hasOAuthParams && isSubscribed) {
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error('Error getting session:', err);
        if (isSubscribed) setLoading(false);
      });

    // 2. Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    // 3. Fallback Safety Timeout for OAuth Callbacks
    const hasOAuthParams =
      window.location.hash.includes('access_token=') ||
      window.location.search.includes('code=');
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    if (hasOAuthParams) {
      fallbackTimer = setTimeout(() => {
        if (isSubscribed) {
          setLoading(false);
        }
      }, 4000);
    }

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
      if (fallbackTimer) clearTimeout(fallbackTimer);
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
  const email =
    u.email ??
    (u.user_metadata?.email as string | undefined) ??
    (u.identities?.[0]?.identity_data?.email as string | undefined) ??
    '';
  return { id: u.id, name, email };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}




