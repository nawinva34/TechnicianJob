'use client';

import { Suspense, useEffect, useState } from 'react';
import { LIFFProvider, useLIFF } from '@/components/liff/LIFFProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wrench,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
  return (
    <LIFFProvider>
      <Suspense fallback={<LoadingState />}>
        <RegisterContent />
      </Suspense>
    </LIFFProvider>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/liff/profile';
  
  const { profile: liffProfile, loading: liffLoading } = useLIFF();
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const AVAILABLE_SKILLS = [
    'ช่างแอร์',
    'ช่างไฟฟ้า',
    'ช่างประปา',
    'ช่างทาสี',
    'ช่างไม้',
    'ช่างปูน',
    'ช่างซ่อมเครื่องใช้ไฟฟ้า',
    'อื่นๆ',
  ];

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  useEffect(() => {
    async function checkProfile() {
      if (!liffProfile?.userId) return;

      try {
        const pRes = await fetch(`/api/technician/profile?line_user_id=${liffProfile.userId}`);
        const pData = await pRes.json();

        if (pData.profile) {
          router.push(returnUrl);
        } else {
          setName(liffProfile.displayName || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (liffProfile) {
      checkProfile();
    } else if (!liffLoading) {
      setLoading(false);
    }
  }, [liffProfile, liffLoading, router, returnUrl]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liffProfile?.userId) return;

    if (phone.length < 10) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');
      return;
    }

    if (selectedSkills.length === 0) {
      setError('กรุณาเลือกทักษะอย่างน้อย 1 รายการ');
      return;
    }

    setRegistering(true);
    setError(null);
    try {
      const res = await fetch('/api/technician/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_user_id: liffProfile.userId,
          name,
          phone,
          skills: selectedSkills,
          avatar_url: liffProfile.pictureUrl,
        }),
      });

      const data = await res.json();
      if (data.profile) {
        router.push(returnUrl);
      } else {
        setError(data.error || 'การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งภายหลัง');
    } finally {
      setRegistering(false);
    }
  };

  if (liffLoading || loading) return <LoadingState />;

  if (!liffProfile) {
    return (
      <PageWrapper>
        <ErrorCard message="กรุณาเปิดหน้านี้ผ่านแอปพลิเคชัน LINE เพื่อยืนยันตัวตน" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 relative group">
            <img src={liffProfile.pictureUrl || '/api/placeholder/96/96'} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay"></div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ลงทะเบียนช่าง</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-[250px] mx-auto">
            กรอกข้อมูลของคุณให้ครบถ้วนเพื่อเริ่มต้นรับงานกับเรา
          </p>
        </div>

        <form onSubmit={handleRegister} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-blue-500/5 border border-white space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">ชื่อ-นามสกุล / ชื่อร้าน</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
              placeholder="ระบุชื่อของคุณ"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">เบอร์โทรศัพท์ติดต่อ (10 หลัก)</label>
            <input
              required
              type="tel"
              pattern="[0-9]{10}"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              maxLength={10}
              className="w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
              placeholder="08X-XXXXXXX"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">เลือกทักษะความชำนาญ (เลือกได้หลายข้อ)</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            {selectedSkills.length === 0 && (
               <p className="text-[10px] text-amber-500 mt-2 ml-1 font-semibold">* กรุณาเลือกอย่างน้อย 1 ทักษะ</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs font-medium px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            disabled={registering}
            className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-70 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 group"
          >
            {registering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังบันทึกข้อมูล...
              </>
            ) : (
              <>
                เริ่มรับงานกันเลย
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-gray-50 to-white p-4 pb-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 left-0 -mt-20 -ml-20 w-80 h-80 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 -ml-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center items-center gap-2 py-4 mb-4">
           <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
             <Wrench className="w-5 h-5 text-white" />
           </div>
           <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600 text-xl tracking-tight">TechnicianJob</span>
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
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse tracking-wide">กำลังเตรียมระบบ...</p>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl border border-gray-100">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">เข้าถึงไม่ได้</h3>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
