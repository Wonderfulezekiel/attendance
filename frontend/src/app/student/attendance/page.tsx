'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeEntry } from '@/components/attendance/code-entry';
import { QRScanner } from '@/components/attendance/qr-scanner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { QrCode, Keyboard, Camera, CheckCircle } from 'lucide-react';

type Mode = 'code' | 'qr';

export default function MarkAttendancePage() {
  const [mode, setMode] = useState<Mode>('code');
  const [submitState, setSubmitState] = useState<{
    loading: boolean;
    success: boolean;
    error: string;
  }>({ loading: false, success: false, error: '' });

  const handleSubmit = async (code: string) => {
    setSubmitState({ loading: true, success: false, error: '' });
    try {
      await api.post('/attendance/check-in', {
        code,
        type: mode
      });
      setSubmitState({ loading: false, success: true, error: '' });
    } catch (error: any) {
      setSubmitState({ loading: false, success: false, error: error.message || 'Failed to check in' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Mark Attendance"
        description="Scan a QR code or enter a session code to mark your attendance."
      />

      {/* Mode toggle */}
      <div className="flex bg-card border border-border/50 rounded-lg p-1.5 mb-8 max-w-xs mx-auto">
        <button
          onClick={() => setMode('code')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer',
            mode === 'code'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-muted-foreground'
          )}
        >
          <Keyboard className="w-4 h-4" />
          Enter Code
        </button>
        <button
          onClick={() => setMode('qr')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer',
            mode === 'qr'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-muted-foreground'
          )}
        >
          <QrCode className="w-4 h-4" />
          Scan QR
        </button>
      </div>

      {/* Content */}
      <Card padding="lg" className="text-center">
        {mode === 'code' ? (
          <div className="py-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Enter Session Code
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              Enter the 6-character code displayed by your lecturer
            </p>
            <CodeEntry
              onSubmit={handleSubmit}
              loading={submitState.loading}
              success={submitState.success}
              error={submitState.error}
            />
          </div>
        ) : (
          <div className="py-2">
            {!submitState.success ? (
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  Point your camera at the QR code displayed in class
                </p>
                <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                  <QRScanner 
                    onScan={(data) => {
                      handleSubmit(data);
                    }} 
                  />
                </div>
                {submitState.error && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-destructive animate-fade-in">
                    <span className="text-sm">{submitState.error}</span>
                  </div>
                )}
                {submitState.loading && (
                  <div className="mt-4 text-sm text-primary animate-pulse">Processing attendance...</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8 animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground">Attendance Marked!</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your attendance has been recorded successfully.</p>
                </div>
                <Button onClick={() => setSubmitState({ loading: false, success: false, error: '' })} variant="secondary" className="mt-4">
                  Scan Another
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
