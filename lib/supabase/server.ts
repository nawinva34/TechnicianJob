import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not set');
    }
    _admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _admin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
