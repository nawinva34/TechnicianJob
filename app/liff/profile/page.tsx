'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { LIFFProvider, useLIFF } from '@/components/liff/LIFFProvider';
import { Profile, Job } from '@/lib/types';
import { JobStatusBadge } from '@/components/dashboard/JobStatusBadge';
import {
  User,
  Phone,
  Wrench,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  return (
    <LIFFProvider>
      <Suspense fallback={<LoadingState />}>
        <ProfileContent />
      </Suspense>
    </LIFFProvider>
  );
}

function ProfileContent() {
  const { profile: liffProfile, loading: liffLoading } = useLIFF();
  const [dbProfile, setDbProfile] = useState<Profile | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (lineId: string) => {
    try {
      const pRes = await fetch(`/api/technician/profile?line_user_id=${lineId}`);
      const pData = await pRes.json();
      
      if (pData.profile) {
        setDbProfile(pData.profile);
        const jRes = await fetch(`/api/jobs`);
        const jData = await jRes.json();
        const filtered = (jData.jobs ?? []).filter((j: Job) => j.assigned_technician_id === pData.profile.id);
        setMyJobs(filtered);
      } else {
        window.location.href = '/liff/register?returnUrl=/liff/profile';
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [liffProfile]);

  useEffect(() => {
    if (liffProfile?.userId) {
      fetchData(liffProfile.userId);
    } else if (!liffLoading) {
      setLoading(false);
    }
  }, [liffProfile, liffLoading, fetchData]);

  // Removed handleRegister since it's now explicitly in /liff/register

  if (liffLoading || loading) return <LoadingState />;

  if (!liffProfile) {
    return (
      <PageWrapper>
        <ErrorCard message="กรุณาเปิดหน้านี้ผ่านแอปพลิเคชัน LINE" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {!dbProfile ? (
        <div className="space-y-6 text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-500 text-sm">กำลังพาดำเนินการลงทะเบียน...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
              <img src={dbProfile.avatar_url || '/api/placeholder/64/64'} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold text-gray-900 truncate">{dbProfile.name}</h2>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{dbProfile.phone}</span>
              </div>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Technician
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {dbProfile.skills.map((skill, i) => (
              <span key={i} className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
                {skill}
              </span>
            ))}
          </div>

          {/* My Jobs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                งานที่ได้รับมอบหมาย
              </h3>
              <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-xs font-bold">
                {myJobs.length}
              </span>
            </div>

            <div className="space-y-3">
              {myJobs.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl py-12 text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">ยังไม่มีงานที่ได้รับมอบหมาย</p>
                </div>
              ) : (
                myJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-gray-900">{job.title}</h4>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{job.location_name}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-emerald-600">
                        ฿{job.budget?.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`/liff/claim?job_id=${job.id}`}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold text-center transition-colors"
                      >
                        ดูรายละเอียด
                      </a>
                      {job.google_maps_url && (
                        <a
                          href={job.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-12 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 py-4 mb-2">
           <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
             <Wrench className="w-4.5 h-4.5 text-white" />
           </div>
           <span className="font-bold text-gray-900">Technician Profile</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900 mb-2">เข้าถึงไม่ได้</h3>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
