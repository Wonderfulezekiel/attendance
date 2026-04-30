'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SessionTimerProps {
  expiryTime: string;
  onExpired?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function SessionTimer({ expiryTime, onExpired, size = 'md' }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [percent, setPercent] = useState(100);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const expiry = new Date(expiryTime).getTime();
    const totalDuration = expiry - Date.now();

    const tick = () => {
      const now = Date.now();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setTimeLeft('00:00');
        setPercent(0);
        onExpired?.();
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      setPercent(Math.max(0, (remaining / totalDuration) * 100));
      setIsUrgent(remaining < 300000); // less than 5 minutes
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiryTime, onExpired]);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const strokeWidth = size === 'sm' ? 4 : 5;
  const radius = size === 'sm' ? 40 : size === 'md' ? 54 : 68;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
      <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="var(--bg-hover)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke={isUrgent ? 'var(--accent)' : 'var(--primary)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="text-center z-10">
        <p className={cn(
          'font-mono font-bold tracking-wider',
          size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl',
          isUrgent ? 'text-accent-foreground' : 'text-foreground'
        )}>
          {timeLeft}
        </p>
        <p className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'text-[9px]' : 'text-xs'
        )}>
          remaining
        </p>
      </div>
    </div>
  );
}
