'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [env, setEnv] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (starts with ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5) + '...)' : 'Missing',
      NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  }, []);

  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Environment Check</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(env, null, 2)}
      </pre>
      <div className="mt-8 space-y-2">
        <p>If any above are <strong>undefined</strong>, you must add them in Vercel Settings {'>'} Environment Variables.</p>
        <p>Note: <code>SUPABASE_SERVICE_ROLE_KEY</code> is secret and won't show here, but is required for the backend.</p>
      </div>
    </div>
  );
}
