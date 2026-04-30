import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'teal' | 'amber' | 'red' | 'green' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  teal: 'bg-primary/15 text-primary/80 border-primary/25',
  amber: 'bg-accent/15 text-accent-foreground border-accent/25',
  red: 'bg-destructive/15 text-destructive border-destructive/25',
  green: 'bg-primary/20 text-primary border-primary/30',
  gray: 'bg-muted hover:bg-muted/80 text-muted-foreground border-border/50',
};

const dotColors: Record<BadgeVariant, string> = {
  teal: 'bg-primary/80',
  amber: 'bg-accent',
  red: 'bg-destructive',
  green: 'bg-primary',
  gray: 'bg-muted-foreground',
};

export function Badge({
  children,
  variant = 'teal',
  size = 'sm',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
