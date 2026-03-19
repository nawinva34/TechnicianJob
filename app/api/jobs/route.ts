export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateJobRequest } from '@/lib/types';
import { buildJobFlexMessage } from '@/lib/line/flex-message';
import { pushJobToAllTechnicians } from '@/lib/line/push';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('jobs')
      .select(`
        *,
        assigned_technician:profiles!jobs_assigned_technician_id_fkey(id, name, phone, line_user_id),
        creator:profiles!jobs_created_by_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: data });
  } catch (err: any) {
    console.error('[GET /api/jobs] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateJobRequest & { created_by?: string } = await request.json();

    const { title, description, category, customer_phone, location_name, google_maps_url, budget, created_by } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'title and category are required' }, { status: 400 });
    }

    const { data: job, error: insertError } = await supabaseAdmin
      .from('jobs')
      .insert({
        title,
        description: description || null,
        category,
        customer_phone: customer_phone || null,
        location_name: location_name || null,
        google_maps_url: google_maps_url || null,
        budget: budget || null,
        status: 'OPEN',
        created_by: created_by || null,
      })
      .select(`
        *,
        assigned_technician:profiles!jobs_assigned_technician_id_fkey(id, name, phone),
        creator:profiles!jobs_created_by_fkey(id, name)
      `)
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabaseAdmin.from('job_logs').insert({
      job_id: job.id,
      changed_by: created_by || null,
      status_changed_to: 'OPEN',
      notes: 'Job created',
    });

    const flexMessage = buildJobFlexMessage(job);
    pushJobToAllTechnicians([flexMessage]).catch((err) =>
      console.error('[jobs POST] LINE push failed:', err)
    );

    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    console.error('[jobs POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
