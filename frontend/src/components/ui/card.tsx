import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
};

export function Card({
  children,
  className,
  hover = false,
  glow = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-lg border border-border/50',
        paddingStyles[padding],
        hover && 'transition-all duration-200 hover:border-border hover:bg-popover cursor-pointer',
        glow && 'teal-glow',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-base font-semibold text-foreground', className)}>
      {children}
    </h3>
  );
}
