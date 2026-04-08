import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subvalue?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'info' | 'warning';
}

export function MetricCard({ label, value, subvalue, icon: Icon, variant = 'default' }: MetricCardProps) {
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
    info: 'bg-royal-glow',
  }[variant];

  return (
    <div className="glass-card p-5 relative overflow-hidden group animate-fade-in">
      <div className={`absolute top-3 right-3 p-2 rounded-lg ${glowClass}`}>
        <Icon className={`h-5 w-5 ${colorClass} opacity-60 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorClass} font-mono`}>
        {value}
      </p>
      {subvalue && (
        <p className="text-xs text-muted-foreground mt-1">{subvalue}</p>
      )}
    </div>
  );
}
