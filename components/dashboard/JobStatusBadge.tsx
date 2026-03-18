import { JobStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export const STATUS_CONFIG: Record<JobStatus, { label: string; classes: string; dot: string }> = {
  OPEN: {
    label: 'เปิดรับงาน',
    classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  ASSIGNED: {
    label: 'มอบหมายแล้ว',
    classes: 'bg-blue-100 text-blue-800 border border-blue-200',
    dot: 'bg-blue-500',
  },
  IN_PROGRESS: {
    label: 'กำลังดำเนินการ',
    classes: 'bg-amber-100 text-amber-800 border border-amber-200',
    dot: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'เสร็จสิ้น',
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
    dot: 'bg-gray-500',
  },
  CANCELLED: {
    label: 'ยกเลิก',
    classes: 'bg-red-100 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
};

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        config.classes,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
