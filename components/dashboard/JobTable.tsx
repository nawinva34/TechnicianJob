'use client';

import { useEffect, useState, useCallback } from 'react';
import { Job, JobStatus } from '@/lib/types';
import { supabaseClient } from '@/lib/supabase/client';
import { JobStatusBadge, STATUS_CONFIG } from './JobStatusBadge';
import { format } from 'date-fns';
import {
  MapPin,
  Phone,
  ExternalLink,
  User,
  RefreshCw,
  DollarSign,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SortField = 'created_at' | 'status' | 'budget' | 'title';
type SortDir = 'asc' | 'desc';

interface JobTableProps {
  onStatsChange?: (stats: Record<JobStatus, number>) => void;
}

export function JobTable({ onStatsChange }: JobTableProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/jobs');
    const data = await res.json();
    const fetched: Job[] = data.jobs ?? [];
    setJobs(fetched);

    const stats = fetched.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    }, {} as Record<JobStatus, number>);
    onStatsChange?.(stats);
    setLoading(false);
  }, [onStatsChange]);

  useEffect(() => {
    fetchJobs();

    const channel = supabaseClient
      .channel('realtime:jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          console.log('[realtime] jobs change:', payload.eventType);
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [fetchJobs]);

  const displayed = jobs
    .filter((j) => filterStatus === 'ALL' || j.status === filterStatus)
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'created_at') cmp = a.created_at.localeCompare(b.created_at);
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'budget') cmp = (a.budget ?? 0) - (b.budget ?? 0);
      else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  }

  const STATUS_FILTERS: Array<JobStatus | 'ALL'> = ['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                filterStatus === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {s === 'ALL' ? 'ทั้งหมด' : STATUS_CONFIG[s as JobStatus]?.label ?? s}
            </button>
          ))}
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          รีเฟรช
        </button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                { key: 'title', label: 'ชื่องาน' },
                { key: 'status', label: 'สถานะ' },
                { key: 'budget', label: 'งบประมาณ' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort(key as SortField)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform',
                        sortField === key && sortDir === 'asc' && 'rotate-180'
                      )}
                    />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-semibold text-gray-600">สถานที่</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">ช่างเทคนิค</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900"
                onClick={() => toggleSort('created_at')}>
                <div className="flex items-center gap-1">
                  สร้างเมื่อ
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', sortField === 'created_at' && sortDir === 'asc' && 'rotate-180')} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  <p className="text-gray-400 mt-2 text-sm">กำลังโหลดข้อมูล…</p>
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="font-medium">ไม่พบงาน</p>
                  <p className="text-xs mt-1">สร้างงานใหม่เพื่อเริ่มต้นใช้งาน</p>
                </td>
              </tr>
            ) : (
              displayed.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-900 truncate max-w-[200px]">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{job.category}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    {job.budget ? (
                      <span className="font-semibold text-emerald-700">
                        ฿{job.budget.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {job.location_name ? (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate max-w-[150px]">{job.location_name}</span>
                        {job.google_maps_url && (
                          <a
                            href={job.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {job.assigned_technician ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 text-xs">{job.assigned_technician.name}</p>
                          {job.assigned_technician.phone && (
                            <p className="text-gray-400 text-xs flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {job.assigned_technician.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">ยังไม่มอบหมาย</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {format(new Date(job.created_at), 'dd MMM yy HH:mm')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-100">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            <p className="text-gray-400 mt-2 text-sm">กำลังโหลดข้อมูล…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="font-medium">ไม่พบงาน</p>
          </div>
        ) : (
          displayed.map((job) => (
            <div
              key={job.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{job.category}</p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {job.budget && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />฿{job.budget.toLocaleString()}
                  </span>
                )}
                {job.location_name && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{job.location_name}
                  </span>
                )}
                {job.assigned_technician && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" />{job.assigned_technician.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {format(new Date(job.created_at), 'dd MMM yyyy HH:mm')}
              </p>
              {expandedId === job.id && job.description && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {job.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
        แสดง {displayed.length} รายการ
        {!loading && (
          <span className="ml-2">• อัปเดตข้อมูลแบบเรียลไทม์เชื่อมต่อแล้ว</span>
        )}
      </div>
    </div>
  );
}
