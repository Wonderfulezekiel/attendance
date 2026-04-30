import React from 'react';
import { cn } from '@/lib/utils';

interface DonutChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function DonutChart({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  label,
  className,
}: DonutChartProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  const color =
    percent >= 75
      ? 'var(--primary)'
      : percent >= 60
      ? 'var(--accent)'
      : 'var(--destructive)';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-hover)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-sm font-bold text-foreground">{percent}%</span>
        {label && (
          <p className="text-[8px] text-muted-foreground leading-tight">{label}</p>
        )}
      </div>
    </div>
  );
}
