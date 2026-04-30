import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border/50 rounded-lg p-5 transition-all duration-200 hover:border-border group',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-primary/80 transition-colors duration-200 group-hover:text-primary mt-1">
          {icon}
        </div>
        {change && (
          <span
            className={cn(
              'text-xs font-medium',
              changeType === 'positive' && 'text-primary',
              changeType === 'negative' && 'text-destructive',
              changeType === 'neutral' && 'text-muted-foreground'
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
