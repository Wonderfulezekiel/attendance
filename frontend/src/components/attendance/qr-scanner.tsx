'use client';

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (err: any) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Create instance
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    // Render scanner
    scannerRef.current.render(
      (decodedText) => {
        // Debounce or just fire onScan. The scanner often fires rapidly.
        // We'll pause it so we don't fire 100 times
        if (scannerRef.current) {
          scannerRef.current.pause(true);
        }
        onScan(decodedText);
      },
      (error) => {
        if (onError) onError(error);
      }
    );

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScan, onError]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-background">
      <div id="qr-reader" className="w-full border-none!" />
      <style>{`
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: transparent !important; }
        #qr-reader__dashboard_section_csr button {
          background-color: var(--primary) !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          margin-top: 10px !important;
          cursor: pointer !important;
        }
        #qr-reader__dashboard_section_swaplink {
          color: var(--primary) !important;
          text-decoration: none !important;
          margin-top: 10px !important;
          display: inline-block !important;
        }
      `}</style>
    </div>
  );
}
