import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  url &&
  anonKey &&
  url.startsWith('http') &&
  !url.includes('placeholder')
);

export const supabase = createClient(
  url && url.startsWith('http') ? url : 'https://placeholder.supabase.co',
  anonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // detectSessionInUrl is intentionally false — we handle the URL ourselves
      // in auth.tsx's bootstrap() to avoid race conditions
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  },
);
