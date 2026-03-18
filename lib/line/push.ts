import { supabaseAdmin } from '@/lib/supabase/server';
import { Job } from '@/lib/types';

const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/multicast';
const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function multicastMessage(to: string[], messages: object[]): Promise<void> {
  if (!LINE_ACCESS_TOKEN) {
    console.warn('[LINE push] LINE_CHANNEL_ACCESS_TOKEN not set, skipping push');
    return;
  }
  if (to.length === 0) {
    console.log('[LINE push] No recipients, skipping');
    return;
  }

  const chunkSize = 500;
  for (let i = 0; i < to.length; i += chunkSize) {
    const chunk = to.slice(i, i + chunkSize);
    const res = await fetch(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ to: chunk, messages }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[LINE push] Error for chunk ${i}: ${err}`);
    } else {
      console.log(`[LINE push] Sent to ${chunk.length} recipients (chunk ${i})`);
    }
  }
}

export async function pushJobToAllTechnicians(messages: object[]): Promise<void> {
  const { data: technicians, error } = await supabaseAdmin
    .from('profiles')
    .select('line_user_id')
    .eq('role', 'technician')
    .not('line_user_id', 'is', null);

  if (error) {
    console.error('[LINE push] Failed to fetch technicians:', error.message);
    return;
  }

  const lineUserIds = (technicians ?? [])
    .map((t: { line_user_id: string | null }) => t.line_user_id)
    .filter((id): id is string => id !== null && id.length > 0);

  console.log(`[LINE push] Pushing to ${lineUserIds.length} technicians`);
  await multicastMessage(lineUserIds, messages);
}
