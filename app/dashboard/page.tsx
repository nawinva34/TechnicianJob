'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { JobStatus, UserRole } from '@/lib/types';
import { JobTable } from '@/components/dashboard/JobTable';
import { CreateJobModal } from '@/components/dashboard/CreateJobModal';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LIFFProvider } from '@/components/liff/LIFFProvider';
import {
  BriefcaseBusiness,
  CircleCheck,
  Clock4,
  Loader,
  Plus,
  Wrench,
  Bell,
  LayoutDashboard,
} from 'lucide-react';

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState<UserRole>('admin');
  const [stats, setStats] = useState<Partial<Record<JobStatus, number>>>({});

  const handleStatsChange = useCallback((newStats: Record<JobStatus, number>) => {
    setStats(newStats);
  }, []);

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <LIFFProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <Wrench className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-base tracking-tight">ระบบจัดหางานช่าง</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-semibold">
                  {role === 'superadmin' ? 'ซุปเปอร์แอดมิน' : role === 'admin' ? 'ผู้ดูแล' : 'ช่างเทคนิค'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="text-[10px] sm:text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="technician">Technician</option>
              </select>
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-full px-3 py-1.5 border border-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                อัปเดตเรียลไทม์
              </div>
              {(role === 'superadmin' || role === 'admin') && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-200"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">สร้างงาน</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="flex items-center gap-2 text-gray-500">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm">แดชบอร์ด</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">จัดการงานช่างเทคนิค</h1>
            <p className="text-gray-500 mt-1 text-sm">
              มอบหมายงานให้ช่างและติดตามสถานะแบบเรียลไทม์
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatsCard
              title="เปิดรับงาน"
              value={stats.OPEN ?? 0}
              icon={Bell}
              color="emerald"
              description="รอช่างรับงาน"
            />
            <StatsCard
              title="มอบหมายแล้ว"
              value={stats.ASSIGNED ?? 0}
              icon={BriefcaseBusiness}
              color="blue"
              description="มีช่างรับงานแล้ว"
            />
            <StatsCard
              title="กำลังดำเนินการ"
              value={stats.IN_PROGRESS ?? 0}
              icon={Loader}
              color="amber"
              description="ช่างกำลังทำงาน"
            />
            <StatsCard
              title="เสร็จสิ้น"
              value={stats.COMPLETED ?? 0}
              icon={CircleCheck}
              color="gray"
              description="งานที่ปิดแล้ว"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              มีงานในระบบทั้งหมด <span className="font-bold text-gray-800 text-lg">{total}</span> งาน
            </p>
            {(role === 'superadmin' || role === 'admin') && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                สร้างงานและแจ้งเตือนช่าง
              </button>
            )}
          </div>

          <JobTable onStatsChange={handleStatsChange} userRole={role} />

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-4">
            <Clock4 className="w-3.5 h-3.5" />
            ตารางนี้จะอัปเดตงานอัตโนมัติเมื่อมีคนรับงาน
          </div>
        </main>

        <CreateJobModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            // Table will refresh via real-time subscription
          }}
        />
      </div>
    </LIFFProvider>
  );
}
