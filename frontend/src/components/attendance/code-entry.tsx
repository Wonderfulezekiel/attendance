'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface CodeEntryProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  success?: boolean;
  error?: string;
}

export function CodeEntry({ onSubmit, loading, success, error }: CodeEntryProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.toUpperCase();
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const code = digits.join('');
      if (code.length === 6) onSubmit(code);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\s/g, '').toUpperCase().slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    const nextEmpty = newDigits.findIndex(d => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const code = digits.join('');
  const isComplete = code.length === 6;

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">Attendance Marked!</h3>
          <p className="text-sm text-muted-foreground mt-1">Your attendance has been recorded successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-1.5 sm:gap-2.5 md:gap-3" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              'w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-xl sm:text-2xl font-mono font-bold bg-input border rounded-md text-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              error ? 'border-destructive/50' : 'border-border/50',
              digit && 'border-primary/40 bg-primary/5'
            )}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive animate-fade-in">
          <XCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Button
        onClick={() => onSubmit(code)}
        disabled={!isComplete}
        loading={loading}
        icon={<ArrowRight className="w-4 h-4" />}
        size="lg"
        className="min-w-[200px]"
      >
        Submit Code
      </Button>
    </div>
  );
}
