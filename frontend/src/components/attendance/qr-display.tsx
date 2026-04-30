'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
  value: string;
  sessionCode: string;
  size?: number;
}

export function QRDisplay({ value, sessionCode, size = 240 }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="p-5 bg-white rounded-lg shadow-lg">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          bgColor="#FFFFFF"
          fgColor="#0B1120"
        />
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Session Code
        </p>
        <p className="text-4xl font-mono font-bold text-primary/80 tracking-[0.3em]">
          {sessionCode}
        </p>
      </div>
    </div>
  );
}
