export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { LineWebhookBody, LineEvent } from '@/lib/types';

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

function verifySignature(body: string, signature: string): boolean {
  const hash = createHmac('sha256', CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

async function replyMessage(replyToken: string, messages: object[]): Promise<void> {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

async function getLineProfile(userId: string): Promise<{ displayName: string; pictureUrl?: string } | null> {
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: { Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function handleFollowEvent(event: LineEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('line_user_id', userId)
    .single();

  if (existing) {
    console.log(`[webhook] User ${userId} already has a profile`);
  } else {
    const lineProfile = await getLineProfile(userId);
    const name = lineProfile?.displayName ?? `Technician-${userId.slice(-6)}`;

    const { error } = await supabaseAdmin.from('profiles').insert({
      id: crypto.randomUUID(), // Will need real Supabase auth UUID in production
      line_user_id: userId,
      name,
      role: 'technician',
      skills: [],
    });

    if (error) {
      console.error('[webhook] Failed to create profile:', error.message);
    } else {
      console.log(`[webhook] Created profile for ${name} (${userId})`);
    }
  }

  if (event.replyToken) {
    await replyMessage(event.replyToken, [
      {
        type: 'text',
        text: 'สวัสดีครับ! ยินดีต้อนรับสู่ระบบจัดหางานช่าง เมื่อมีงานใหม่ในระบบ คุณจะได้รับการแจ้งเตือนที่นี่ทันทีครับ 🔧',
      },
    ]);
  }
}

async function handleMessageEvent(event: LineEvent): Promise<void> {
  if (!event.replyToken || !event.message) return;
  const text = event.message.text?.toLowerCase().trim() ?? '';

  let replyText = 'พิมพ์ "งาน" เพื่อดูงานที่รอรับ หรือ "ช่วยเหลือ" สำหรับข้อมูลเพิ่มเติม';
            
  if (text === 'งาน') {
    replyText = 'ขณะนี้คุณสามารถดูงานทั้งหมดได้ผ่านลิงก์แจ้งเตือนงานใหม่ ระบบแสดงงานที่รอดำเนินการอัตโนมัติครับ';
  } else if (text === 'ช่วยเหลือ') {
    replyText = 'หากพบปัญหาในการใช้งาน กรุณาติดต่อแอดมินหรือผู้ดูแลระบบครับ';
  }

  await replyMessage(event.replyToken, [{ type: 'text', text: replyText }]);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-line-signature') ?? '';

  if (!verifySignature(rawBody, signature)) {
    console.warn('[webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: LineWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log(`[webhook] Received ${body.events.length} events from ${body.destination}`);

  const eventPromises = body.events.map(async (event: LineEvent) => {
    try {
      switch (event.type) {
        case 'follow':
          await handleFollowEvent(event);
          break;
        case 'unfollow':
          console.log(`[webhook] User ${event.source.userId} unfollowed`);
          break;
        case 'message':
          await handleMessageEvent(event);
          break;
        default:
          console.log(`[webhook] Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error(`[webhook] Error handling event ${event.type}:`, err);
    }
  });

  Promise.all(eventPromises).catch(console.error);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: 'LINE webhook ready', timestamp: new Date().toISOString() });
}
