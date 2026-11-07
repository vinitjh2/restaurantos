/**
 * RestaurantOS Barcode and Scale Scanner Listener Hook
 * Handles USB HID keyboard emulation scanners for rapid barcode entry
 * and weight scale transmission. Distinguishes scanner input from human typing.
 */

import { useEffect, useRef } from 'react';

interface BarcodeScannerOptions {
  onScan: (scannedValue: string) => void;
  minChars?: number;
  maxIntervalMs?: number; // Maximum time between keystrokes (scanners emit < 40ms)
  targetKey?: string; // Terminator key, default "Enter"
}

export function useBarcodeScanner({
  onScan,
  minChars = 3,
  maxIntervalMs = 50,
  targetKey = 'Enter',
}: BarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is currently focused in a rich text editor or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'TEXTAREA' ||
        (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text' && target.id !== 'scanner-capture')
      ) {
        // Allow manual input when focusing normal text fields
        return;
      }

      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === targetKey) {
        if (bufferRef.current.length >= minChars) {
          e.preventDefault();
          const scanned = bufferRef.current.trim();
          bufferRef.current = '';
          onScan(scanned);
        } else {
          bufferRef.current = '';
        }
        return;
      }

      // If delay was too long, reset buffer (likely human typing or idle gap)
      if (bufferRef.current.length > 0 && interval > maxIntervalMs) {
        bufferRef.current = '';
      }

      // Only collect printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, minChars, maxIntervalMs, targetKey]);
}
