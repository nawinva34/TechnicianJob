export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ClaimJobRequest, ClaimJobResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: ClaimJobRequest = await request.json();
    const { job_id, tech_id } = body;

    if (!job_id || !tech_id) {
      return NextResponse.json<ClaimJobResponse>(
        { success: false, message: 'job_id and tech_id are required' },
        { status: 400 }
      );
    }

    const { data: claimed, error: rpcError } = await supabaseAdmin.rpc('claim_job', {
      p_job_id: job_id,
      p_tech_id: tech_id,
    });

    if (rpcError) {
      console.error('[claim] RPC error:', rpcError.message);
      return NextResponse.json<ClaimJobResponse>(
        { success: false, message: rpcError.message },
        { status: 500 }
      );
    }

    if (!claimed) {
      return NextResponse.json<ClaimJobResponse>(
        {
          success: false,
          message: 'Job no longer available. It may have been claimed by another technician.',
        },
        { status: 409 }
      );
    }

    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        assigned_technician:profiles!jobs_assigned_technician_id_fkey(id, name, phone)
      `)
      .eq('id', job_id)
      .single();

    return NextResponse.json<ClaimJobResponse>({
      success: true,
      message: 'Job claimed successfully! You will receive job details shortly.',
      job: job ?? undefined,
    });
  } catch (err) {
    console.error('[claim] Error:', err);
    return NextResponse.json<ClaimJobResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
