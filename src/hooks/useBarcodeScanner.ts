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
  ScannerVisualState,
  BarcodeResult,
  UseScannerOptions
} from '../types/scanner.types';
import { useDeviceCapabilities } from './useDeviceCapabilities';
import { validateBarcode, shouldAcceptDetection } from '../utils/barcode-validation';
import { mapQuaggaFormatToBarcodeFormat } from '../utils/quagga-config';
import type { BarcodeFormat } from '../types/scanner.types';
import { isDuplicateInWindow } from '../utils/duplicate-detection';

export function useBarcodeScanner(options: UseScannerOptions) {
  const {
    onScanSuccess,
    onScanError,
    autoPauseOnBlur = true,
    duplicateCooldown = 500
  } = options;

  const { getQuaggaConfig } = useDeviceCapabilities();

  const [scannerState, setScannerState] = useState<ScannerVisualState>('idle');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<string | null>(null);
  const wasAutoPaused = useRef(false);
  const recentScansRef = useRef<Array<{ code: string; timestamp: number }>>([]);

  // Handle detected barcode
  const handleDetected = useCallback((result: any) => {
    const code = result.codeResult.code;
    const quaggaFormat = result.codeResult.format;
    
    // Extract confidence from QuaggaJS result
    // QuaggaJS may have multiple decodedCodes, use the first one
    const decodedCodes = result.codeResult.decodedCodes || [];
    const primaryCode = decodedCodes[0] || result.codeResult;
    // QuaggaJS uses 'quality' field (0-100) for confidence
    // Fallback: if quality not available, check if codeResult has quality directly
    const confidence = primaryCode.quality ?? result.codeResult.quality ?? 0;
    
    // Development logging for debugging (especially iOS issues)
    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.log('[Scanner] Detection:', {
        code,
        format: quaggaFormat,
        confidence: confidence.toFixed(1) + '%',
        decodedCodesCount: decodedCodes.length,
        quality: primaryCode.quality
      });
    }
    
    // CRITICAL FIX: Validate confidence threshold (FR-017 requirement)
    // Only accept codes with confidence >= 75%
    if (!shouldAcceptDetection(confidence)) {
      if (isDev) {
        console.log(`[Scanner] Barcode rejected: confidence ${confidence.toFixed(1)}% < 75% threshold`);
      }
      return; // Reject low-confidence detections
    }
    
    // Map QuaggaJS format to our BarcodeFormat type
    const format = mapQuaggaFormatToBarcodeFormat(quaggaFormat);
    if (!format) {
      console.warn('Unknown barcode format:', quaggaFormat);
      return;
    }

    // Validate barcode with format
    if (!validateBarcode(code, format)) {
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
      format: format as BarcodeFormat,
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

      // Get DOM element instead of string selector (iOS Safari compatibility)
      const targetElement = document.getElementById(containerId);
      if (!targetElement) {
        throw new Error(`Container element with id "${containerId}" not found`);
      }

      const config = getQuaggaConfig();
      // Use DOM element for better iOS Safari compatibility
      config.inputStream.target = targetElement;

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
      setScannerState('detecting');
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

  // Pause scanning (stop but keep container reference for resume)
  const pauseScanning = useCallback(() => {
    try {
      Quagga.stop();
      setIsScanning(false);
      setScannerState('idle');
      // Note: containerRef.current is preserved for resume
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
      // Get DOM element instead of string selector (iOS Safari compatibility)
      const targetElement = document.getElementById(containerRef.current);
      if (!targetElement) {
        throw new Error(`Container element with id "${containerRef.current}" not found`);
      }

      const config = getQuaggaConfig();
      // Use DOM element for better iOS Safari compatibility
      config.inputStream.target = targetElement;
      
      // Re-initialize if needed
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
      
      await Quagga.start();
      setIsScanning(true);
      setScannerState('idle');
      
      // Re-register detection handler
      Quagga.onDetected(handleDetected);
    } catch (err) {
      console.error('Failed to resume scanner:', err);
      setError('Failed to resume scanner');
    }
  }, [handleDetected, getQuaggaConfig]);

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

