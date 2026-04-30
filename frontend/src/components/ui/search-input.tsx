import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchInput({
  containerClassName,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="search"
        className={cn(
          'w-full bg-input border border-border/50 rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30',
          className
        )}
        {...props}
      />
    </div>
  );
}
