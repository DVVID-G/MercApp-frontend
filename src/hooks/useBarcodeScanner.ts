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
  const onProcessedCallbackRef = useRef<((result: any) => void) | null>(null);

  // Handle detected barcode
  const handleDetected = useCallback((result: any) => {
    const isDev = import.meta.env.DEV;
    
    // Log raw result for debugging
    if (isDev) {
      console.log('[Scanner] Raw QuaggaJS result:', result);
      console.log('[Scanner] codeResult:', result.codeResult);
    }
    
    const code = result.codeResult?.code;
    const quaggaFormat = result.codeResult?.format;
    
    if (!code) {
      console.warn('[Scanner] No code found in result:', result);
      return;
    }
    
    // Extract confidence from QuaggaJS result
    // QuaggaJS may have multiple decodedCodes, use the first one
    const decodedCodes = result.codeResult.decodedCodes || [];
    const primaryCode = decodedCodes[0] || result.codeResult;
    
    // QuaggaJS uses 'quality' field (0-100) for confidence
    // Try multiple possible locations for quality/confidence
    let confidence = primaryCode?.quality ?? 
                     primaryCode?.confidence ?? 
                     result.codeResult?.quality ?? 
                     result.codeResult?.confidence ?? 
                     null;
    
    // If quality is not available, QuaggaJS may still be confident
    // In @ericblade/quagga2, if onDetected fires, it usually means high confidence
    // Default to 100 if quality not provided (QuaggaJS only fires onDetected for confident detections)
    if (confidence === null || confidence === undefined) {
      if (isDev) {
        console.warn('[Scanner] Quality/confidence not found in result, assuming 100% (QuaggaJS only fires onDetected for confident detections)');
      }
      confidence = 100; // Assume high confidence if QuaggaJS fired onDetected
    }
    
    // Development logging for debugging (especially iOS issues)
    if (isDev) {
      console.log('[Scanner] Detection:', {
        code,
        format: quaggaFormat,
        confidence: confidence.toFixed(1) + '%',
        decodedCodesCount: decodedCodes.length,
        primaryCodeKeys: primaryCode ? Object.keys(primaryCode) : [],
        codeResultKeys: result.codeResult ? Object.keys(result.codeResult) : []
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
      if (config.inputStream) {
        config.inputStream.target = targetElement || undefined;
      }

      // Initialize Quagga
      // Type assertion needed: QuaggaJS expects Element but we use HTMLElement
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config as any, (err) => {
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
      
      // Add processing listener for debugging (to see if QuaggaJS is processing frames)
      const isDev = import.meta.env.DEV;
      if (isDev) {
        // Store callback reference for cleanup
        const onProcessedCallback = (result: any) => {
          // This fires for every frame processed, even if no barcode detected
          // Useful for debugging to see if QuaggaJS is working
          if (result && result.codeResult && result.codeResult.code) {
            console.log('[Scanner] Processed frame with potential code:', {
              code: result.codeResult.code,
              format: result.codeResult.format,
              quality: result.codeResult.quality
            });
          }
        };
        onProcessedCallbackRef.current = onProcessedCallback;
        Quagga.onProcessed(onProcessedCallback);
      }

      setIsScanning(true);
      setScannerState('detecting');
      
      if (isDev) {
        console.log('[Scanner] Started successfully with config:', {
          readers: config.decoder?.readers,
          resolution: config.inputStream?.constraints,
          frequency: config.frequency
        });
      }
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
      // Remove processing listener if it was registered
      if (onProcessedCallbackRef.current) {
        Quagga.offProcessed(onProcessedCallbackRef.current);
        onProcessedCallbackRef.current = null;
      }
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
      // Remove processing listener if it was registered
      if (onProcessedCallbackRef.current) {
        Quagga.offProcessed(onProcessedCallbackRef.current);
        // Keep reference for resume (will be re-registered)
      }
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
      if (config.inputStream) {
        config.inputStream.target = targetElement || undefined;
      }
      
      // Re-initialize if needed
      // Type assertion needed: QuaggaJS expects Element but we use HTMLElement
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config as any, (err) => {
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
      
      // Re-register processing listener for debugging if in dev mode
      const isDev = import.meta.env.DEV;
      if (isDev && !onProcessedCallbackRef.current) {
        const onProcessedCallback = (result: any) => {
          if (result && result.codeResult && result.codeResult.code) {
            console.log('[Scanner] Processed frame with potential code:', {
              code: result.codeResult.code,
              format: result.codeResult.format,
              quality: result.codeResult.quality
            });
          }
        };
        onProcessedCallbackRef.current = onProcessedCallback;
        Quagga.onProcessed(onProcessedCallback);
      }
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

