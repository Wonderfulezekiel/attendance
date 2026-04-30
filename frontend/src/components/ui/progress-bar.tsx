import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'teal' | 'amber' | 'red' | 'green' | 'auto';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  color = 'auto',
  className,
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  const getColor = () => {
    if (color !== 'auto') return color;
    if (percent >= 75) return 'green';
    if (percent >= 60) return 'amber';
    return 'red';
  };

  const barColor = getColor();
  const colorClasses: Record<string, string> = {
    teal: 'bg-primary',
    amber: 'bg-accent',
    red: 'bg-destructive',
    green: 'bg-primary/80',
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-muted-foreground">{percent}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-muted hover:bg-muted/80 rounded-full overflow-hidden',
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[barColor]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
