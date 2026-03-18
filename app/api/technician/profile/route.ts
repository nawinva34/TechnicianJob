import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const line_user_id = searchParams.get('line_user_id');

  if (!line_user_id) {
    return NextResponse.json({ error: 'line_user_id is required' }, { status: 400 });
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('line_user_id', line_user_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  try {
    const { line_user_id, name, phone, skills, avatar_url } = await req.json();

    if (!line_user_id || !name) {
      return NextResponse.json({ error: 'line_user_id and name are required' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        line_user_id,
        name,
        phone,
        skills,
        avatar_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'line_user_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
