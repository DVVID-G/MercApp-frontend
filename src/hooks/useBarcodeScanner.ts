/**
 * useBarcodeScanner Hook
 * 
 * Main hook for barcode scanning with QuaggaJS integration
 * Handles lifecycle, state management, and duplicate detection
 * Feature: 001-barcode-scanner-mobile
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Quagga from '@ericblade/quagga2';
import type {
  ScannerState,
  BarcodeResult,
  UseScannerOptions
} from '../types/scanner.types';
import { useDeviceCapabilities } from './useDeviceCapabilities';
import { validateBarcode } from '../utils/barcode-validation';
import { isDuplicateInWindow } from '../utils/duplicate-detection';

export function useBarcodeScanner(options: UseScannerOptions) {
  const {
    onScanSuccess,
    onScanError,
    autoPauseOnBlur = true,
    duplicateCooldown = 500
  } = options;

  const { getQuaggaConfig } = useDeviceCapabilities();

  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<string | null>(null);
  const wasAutoPaused = useRef(false);
  const recentScansRef = useRef<Array<{ code: string; timestamp: number }>>([]);

  // Handle detected barcode
  const handleDetected = useCallback((result: any) => {
    const code = result.codeResult.code;
    const format = result.codeResult.format;

    // Validate barcode
    if (!validateBarcode(code)) {
      console.warn('Invalid barcode detected:', code);
      return;
    }

    // Check for duplicates
    if (isDuplicateInWindow(code, duplicateCooldown, recentScansRef.current)) {
      console.log('Duplicate barcode ignored:', code);
      return;
    }

    // Add to recent scans
    recentScansRef.current.push({ code, timestamp: Date.now() });

    // Clean old scans (keep last 10)
    if (recentScansRef.current.length > 10) {
      recentScansRef.current = recentScansRef.current.slice(-10);
    }

    // Update state
    setScannerState('success');
    const barcodeResult: BarcodeResult = {
      code,
      format,
      timestamp: Date.now()
    };
    setLastScannedCode(barcodeResult);

    // Call success callback
    onScanSuccess(code);

    // Reset to idle after brief success animation
    setTimeout(() => {
      if (isScanning) {
        setScannerState('idle');
      }
    }, 1500);
  }, [onScanSuccess, duplicateCooldown, isScanning]);

  // Start scanning
  const startScanning = useCallback(async (containerId: string) => {
    try {
      setError(null);
      setScannerState('idle');
      containerRef.current = containerId;

      const config = getQuaggaConfig();
      config.inputStream.target = `#${containerId}`;

      // Initialize Quagga
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });

      // Start camera
      await Quagga.start();

      // Register detection handler
      Quagga.onDetected(handleDetected);

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setError(err.message || 'Failed to start scanner');
      setScannerState('idle');
      setIsScanning(false);
      onScanError?.(err);
    }
  }, [getQuaggaConfig, handleDetected, onScanError]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    try {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
      setIsScanning(false);
      setScannerState('idle');
      containerRef.current = null;
    } catch (err) {
      console.error('Failed to stop scanner:', err);
    }
  }, [handleDetected]);

  // Pause scanning (stop but keep state)
  const pauseScanning = useCallback(() => {
    try {
      Quagga.stop();
      setIsScanning(false);
      setScannerState('idle');
    } catch (err) {
      console.error('Failed to pause scanner:', err);
    }
  }, []);

  // Resume scanning
  const resumeScanning = useCallback(async () => {
    if (!containerRef.current) {
      console.warn('Cannot resume: no container reference');
      return;
    }

    try {
      await Quagga.start();
      setIsScanning(true);
      setScannerState('idle');
    } catch (err) {
      console.error('Failed to resume scanner:', err);
      setError('Failed to resume scanner');
    }
  }, []);

  // Auto-pause on blur
  useEffect(() => {
    if (!autoPauseOnBlur) return;

    const handleBlur = () => {
      if (isScanning) {
        pauseScanning();
        wasAutoPaused.current = true;
      }
    };

    const handleFocus = () => {
      if (wasAutoPaused.current) {
        resumeScanning();
        wasAutoPaused.current = false;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isScanning, autoPauseOnBlur, pauseScanning, resumeScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isScanning, stopScanning]);

  return {
    scannerState,
    isScanning,
    lastScannedCode,
    error,
    startScanning,
    stopScanning,
    pauseScanning,
    resumeScanning
  };
}

