import { LucideIcon } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

interface MetricCardProps {
  label: string;
  value: string;
  subvalue?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'info' | 'warning';
  info?: {
    description: string;
    calculation?: string;
    meaning?: string;
  };
}

export function MetricCard({ label, value, subvalue, icon: Icon, variant = 'default', info }: MetricCardProps) {
  const colorClass = {
    default: 'text-foreground',
    success: 'text-emerald',
    danger: 'text-coral',
    warning: 'text-amber-brand',
    info: 'text-royal',
  }[variant];

  const glowClass = {
    default: '',
    success: 'bg-emerald-glow',
    danger: 'bg-coral-glow',
    warning: 'bg-amber/10',
    info: 'bg-royal-glow',
  }[variant];

  return (
    <div className="glass-card p-5 relative overflow-hidden group animate-fade-in">
      <div className={`absolute top-3 right-3 p-2 rounded-lg ${glowClass}`}>
        <Icon className={`h-5 w-5 ${colorClass} opacity-60 group-hover:opacity-100 transition-opacity`} />
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {info && (
          <InfoTooltip
            title={label}
            description={info.description}
            calculation={info.calculation}
            meaning={info.meaning}
          />
        )}
      </div>
      <p className={`text-2xl font-bold ${colorClass} font-mono`}>
        {value}
      </p>
      {subvalue && (
        <p className="text-xs text-muted-foreground mt-1">{subvalue}</p>
      )}
    </div>
  );
}
