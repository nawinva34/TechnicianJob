import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('Supabase env vars are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel settings.');
      return null;
    }
    
    _client = createClient(url, key);
  }
  return _client;
}

export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      return () => {
        console.warn(`Supabase client method "${String(prop)}" called but client is not initialized.`);
        return { on: () => ({ subscribe: () => ({}) }), channel: () => ({ on: () => ({ subscribe: () => ({}) }) }) };
      };
    }
    return (client as any)[prop];
  },
});
