import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'gray' | 'red';
  description?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500 text-white',
    value: 'text-blue-700',
    border: 'border-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-500 text-white',
    value: 'text-emerald-700',
    border: 'border-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-500 text-white',
    value: 'text-amber-700',
    border: 'border-amber-100',
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'bg-gray-500 text-white',
    value: 'text-gray-700',
    border: 'border-gray-200',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500 text-white',
    value: 'text-red-700',
    border: 'border-red-100',
  },
};

export function StatsCard({ title, value, icon: Icon, color, description }: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={cn(
        'rounded-2xl border p-3 sm:p-5 flex items-center sm:items-start gap-3 sm:gap-4 transition-all hover:shadow-md',
        c.bg,
        c.border
      )}
    >
      <div className={cn('p-2 sm:p-2.5 rounded-xl flex-shrink-0', c.icon)}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-sm text-gray-500 font-medium uppercase tracking-wider sm:normal-case">{title}</p>
        <p className={cn('text-xl sm:text-3xl font-bold mt-0.5', c.value)}>{value}</p>
        {description && (
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate hidden sm:block">{description}</p>
        )}
      </div>
    </div>
  );
}
