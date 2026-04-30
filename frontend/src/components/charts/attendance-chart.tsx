import React from 'react';
import { cn } from '@/lib/utils';

interface BarData {
  label: string;
  value: number;
  maxValue?: number;
}

interface AttendanceChartProps {
  data: BarData[];
  title?: string;
  className?: string;
}

export function AttendanceChart({ data, title, className }: AttendanceChartProps) {
  const maxVal = Math.max(...data.map(d => d.maxValue || d.value), 1);

  return (
    <div className={cn('', className)}>
      {title && (
        <h4 className="text-sm font-semibold text-muted-foreground mb-4">{title}</h4>
      )}
      <div className="space-y-3">
        {data.map((item, i) => {
          const percent = Math.round((item.value / maxVal) * 100);
          const barColor =
            percent >= 75
              ? 'bg-primary'
              : percent >= 60
              ? 'bg-accent'
              : 'bg-destructive';

          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground truncate max-w-[60%]">
                  {item.label}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {item.value}%
                </span>
              </div>
              <div className="h-2 bg-muted hover:bg-muted/80 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    barColor
                  )}
                  style={{
                    width: `${percent}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
