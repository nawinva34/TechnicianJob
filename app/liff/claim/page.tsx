'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Job, ClaimJobResponse } from '@/lib/types';
import { JobStatusBadge } from '@/components/dashboard/JobStatusBadge';
import { LIFFProvider, useLIFF } from '@/components/liff/LIFFProvider';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  DollarSign,
  Phone,
  ExternalLink,
  Wrench,
} from 'lucide-react';

export default function ClaimPage() {
  return (
    <LIFFProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        }
      >
        <ClaimContent />
      </Suspense>
    </LIFFProvider>
  );
}

function ClaimContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job_id');
  const { profile, loading: liffLoading } = useLIFF();
  const techId = profile?.userId;

  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [techHasProfile, setTechHasProfile] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<ClaimJobResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (techId) {
      fetch(`/api/technician/profile?line_user_id=${techId}`)
        .then((r) => r.json())
        .then((data) => {
          setTechHasProfile(!!data.profile);
        })
        .catch(() => setTechHasProfile(false));
    }
  }, [techId]);

  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/jobs?status=OPEN`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.jobs?.find((j: Job) => j.id === jobId);
        setJob(found ?? null);
        setLoadingJob(false);
      })
      .catch(() => {
        setError('Failed to load job details');
        setLoadingJob(false);
      });
  }, [jobId]);

  async function handleClaim() {
    if (!jobId || !techId) {
      setError('ไม่พบรหัสงานหรือรหัสช่างเทคนิค กรุณาเปิดลิงก์นี้จากแอปพลิเคชัน LINE');
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch('/api/jobs/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, tech_id: techId }),
      });
      const data: ClaimJobResponse = await res.json();
      setResult(data);
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setClaiming(false);
    }
  }

  if (!jobId) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800">ลิงก์ไม่ถูกต้อง</h2>
          <p className="text-gray-500 text-sm mt-1">ไม่มีรหัสงานใน URL กรูณาตรวจสอบลิงก์อีกครั้ง</p>
        </div>
      </PageWrapper>
    );
  }

  if (loadingJob || liffLoading || (techId && techHasProfile === null)) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">กำลังโหลดข้อมูล…</p>
        </div>
      </PageWrapper>
    );
  }

  if (!job) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800">ไม่พบงานที่ต้องการ</h2>
          <p className="text-gray-500 text-sm mt-1">
            งานนี้อาจถูกยกเลิกหรือมีช่างได้รับมอบหมายไปแล้ว
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (result) {
    return (
      <PageWrapper>
        <div className="text-center py-8 space-y-4">
          {result.success ? (
            <>
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-extrabold text-gray-900">รับงานสำเร็จ! 🎉</h2>
              <p className="text-gray-500 text-sm">{result.message}</p>
            </>
          ) : (
            <>
              <XCircle className="w-14 h-14 text-red-400 mx-auto" />
              <h2 className="text-xl font-extrabold text-gray-900">รับงานไม่สำเร็จ</h2>
              <p className="text-gray-500 text-sm">{result.message}</p>
            </>
          )}
          <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 mt-4">
            <p className="text-xs text-gray-400 mb-1">งานที่ต้องการรับ:</p>
            <p className="font-bold text-gray-800">{job.title}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">มีงานเข้าใหม่</p>
              <h2 className="text-xl font-extrabold leading-snug">{job.title}</h2>
            </div>
            <JobStatusBadge status={job.status} className="flex-shrink-0 !bg-white/20 !text-white !border-white/30" />
          </div>
          <p className="text-blue-100 text-sm mt-1">{job.category}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          {job.description && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">รายละเอียด</p>
              <p className="text-gray-700 text-sm">{job.description}</p>
            </div>
          )}

          {job.location_name && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{job.location_name}</p>
                {job.google_maps_url && (
                  <a
                    href={job.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-xs flex items-center gap-1 mt-0.5"
                  >
                    เปิดในแผนที่ <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {job.budget && (
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm font-bold text-emerald-700">฿{job.budget.toLocaleString()}</p>
            </div>
          )}

          {job.customer_phone && (
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-600">{job.customer_phone}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!techId ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
            ⚠️ กรุณาเปิดลิงก์นี้จากแอปพลิเคชัน LINE เพื่อยืนยันตัวตนก่อนการกดรับงาน
          </div>
        ) : techHasProfile === false ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-blue-800 mb-2">คุณยังไม่ได้ลงทะเบียนเป็นช่าง</p>
            <a
              href={`/liff/register?returnUrl=/liff/claim?job_id=${jobId}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              ลงทะเบียนช่างเทคนิค
            </a>
          </div>
        ) : null}

        <button
          onClick={handleClaim}
          disabled={claiming || !techId || techHasProfile === false}
          className="w-full py-3.5 rounded-2xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {claiming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังดำเนินการ…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              รับงานนี้
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          เมื่อกดรับงาน หมายความว่าคุณตกลงที่จะดำเนินการงานนี้ให้สำเร็จตามรายละเอียดที่ระบุ
        </p>
      </div>
    </PageWrapper>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-sm mb-4 flex items-center gap-2 py-3">
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-sm">ระบบจัดหางานช่าง</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

