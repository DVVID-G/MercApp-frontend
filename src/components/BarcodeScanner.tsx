/**
 * BarcodeScanner Component (New Implementation with QuaggaJS)
 * 
 * Complete barcode scanner with permissions, feedback, and mobile optimization
 * Feature: 001-barcode-scanner-mobile
 * 
 * @version 2.0.0
 * @accessibility WCAG 2.1 AA compliant
 */

import { useEffect, useRef, useCallback, useState, memo } from 'react';
import { useBarcodeScannerPermissions } from '../hooks/useBarcodeScannerPermissions';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { PermissionPrompt } from './scanner/PermissionPrompt';
import { ScannerOverlay } from './scanner/ScannerOverlay';
import { ScannerInstructions } from './scanner/ScannerInstructions';
import { Card } from './Card';
import { Button } from './Button';
import { getProductByBarcode, type Product } from '../services/product.service';
import type { ScannerVisualState } from '../types/scanner.types';

// Development logging
const isDev = import.meta.env.DEV;
const log = (...args: any[]) => {
  if (isDev) {
    console.log('[BarcodeScanner]', ...args);
  }
};

interface BarcodeScannerProps {
  /** @deprecated Use onProductFound/onProductNotFound instead */
  onScan?: (code: string) => void;
  /** Called when product is found in database */
  onProductFound?: (product: Product) => void;
  /** Called when product is not found (404) - barcode is passed for manual creation */
  onProductNotFound?: (barcode: string) => void;
  /** Called when product lookup fails due to network/other errors (not 404) */
  onProductLookupError?: (error: any, barcode: string) => void;
  onClose: () => void;
  onManualEntry?: () => void;
  vibrationEnabled?: boolean;
  autoPauseOnBlur?: boolean;
}

export const BarcodeScanner = memo(function BarcodeScanner({
  onScan,
  onProductFound,
  onProductNotFound,
  onProductLookupError,
  onClose,
  onManualEntry,
  vibrationEnabled = true,
  autoPauseOnBlur = true
}: BarcodeScannerProps) {
  const {
    permissionState,
    requestPermission
  } = useBarcodeScannerPermissions();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isLookingUpProduct, setIsLookingUpProduct] = useState(false);

  // Refs to store pause/resume functions (needed because handleScanSuccess is defined before hook destructuring)
  const pauseScanningRef = useRef<(() => void) | null>(null);
  const resumeScanningRef = useRef<(() => Promise<void>) | null>(null);

  // Memoized callbacks for performance (T086)
  const handleScanSuccess = useCallback(async (code: string) => {
    log('Barcode detected:', code);
    
    // Legacy support: call onScan if provided
    if (onScan) {
      onScan(code);
      return; // Early return - no need to pause/resume for legacy path
    }
    
    // New behavior: search for product (T088, T089)
    if (onProductFound || onProductNotFound) {
      // Pause scanning to prevent concurrent lookups and race conditions
      pauseScanningRef.current?.();
      setIsLookingUpProduct(true);
      
      try {
        log('Looking up product for barcode:', code);
        const product = await getProductByBarcode(code);
        
        if (product) {
          log('Product found:', product);
          onProductFound?.(product);
        } else {
          log('Product not found for barcode:', code);
          // Product not found (404) - allow manual creation
          onProductNotFound?.(code);
        }
      } catch (error: any) {
        console.error('Error looking up product:', error);
        
        // Distinguish between 404 (not found) and other errors (network, timeout, etc.)
        const isNotFound = error?.response?.status === 404 || 
                          (error?.status === 404) ||
                          (typeof error === 'object' && error !== null && 'status' in error && error.status === 404);
        
        if (isNotFound) {
          // HTTP 404: Product not found - allow manual creation
          log('Product not found (404) for barcode:', code);
          onProductNotFound?.(code);
        } else {
          // Network/timeout/other errors: Don't treat as missing product
          // Call error handler if provided, otherwise log
          log('Product lookup error (not 404) for barcode:', code, error);
          if (onProductLookupError) {
            onProductLookupError(error, code);
          } else {
            // Fallback: show error but don't treat as missing product
            console.error('Product lookup failed. Please check your connection and try again.', error);
          }
        }
      } finally {
        setIsLookingUpProduct(false);
        // Always resume scanning after lookup completes (success or error)
        // resumeScanning is async, but we don't await to avoid blocking
        resumeScanningRef.current?.().catch((err) => {
          console.error('Failed to resume scanning after product lookup:', err);
        });
      }
    }
  }, [onScan, onProductFound, onProductNotFound, onProductLookupError]);

  const handleScanError = useCallback((err: any) => {
    log('Scanner error:', err);
  }, []);

  const {
    scannerState,
    isScanning,
    error,
    startScanning,
    stopScanning,
    pauseScanning,
    resumeScanning
  } = useBarcodeScanner({
    onScanSuccess: handleScanSuccess,
    onScanError: handleScanError,
    autoPauseOnBlur,
    duplicateCooldown: 500
  });

  // Update refs with pause/resume functions after hook destructuring
  pauseScanningRef.current = pauseScanning;
  resumeScanningRef.current = resumeScanning;

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Request permission on mount if not yet requested
  useEffect(() => {
    if (permissionState.status === 'not_requested') {
      requestPermission();
    }
  }, [permissionState.status, requestPermission]);

  // Start scanning once permission granted (T083 - with loading state)
  useEffect(() => {
    if (
      permissionState.status === 'granted' &&
      !isScanning &&
      !hasStartedRef.current &&
      !error
    ) {
      hasStartedRef.current = true;
      setIsInitializing(true);
      log('Initializing scanner...');
      
      startScanning('barcode-scanner-container').finally(() => {
        setIsInitializing(false);
        log('Scanner initialized');
      });
    }
  }, [permissionState.status, isScanning, error, startScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isScanning, stopScanning]);

  // Handle close (memoized for T086)
  const handleClose = useCallback(() => {
    log('Closing scanner');
    stopScanning();
    onClose();
  }, [stopScanning, onClose]);

  // Handle manual entry fallback (T085)
  const handleManualEntry = useCallback(() => {
    log('Manual entry requested');
    stopScanning();
    onManualEntry?.();
  }, [stopScanning, onManualEntry]);

  // Map scanner state to visual state (handle error case)
  const getVisualState = useCallback((): ScannerVisualState => {
    if (error) return 'error';
    return scannerState;
  }, [scannerState, error]);

  return (
    <div 
      className="flex flex-col items-center justify-start h-screen bg-gray-950 p-4 gap-4 overflow-y-auto"
      role="main"
      aria-label="Escáner de códigos de barras"
    >
      {/* Header (T084 - Accessibility) */}
      <div className="w-full max-w-sm flex items-center justify-between flex-shrink-0">
        <h2 
          id="scanner-title"
          className="text-white text-lg font-semibold"
        >
          Escanear Código
        </h2>
        <Button
          onClick={handleClose}
          variant="secondary"
          className="min-h-[44px] min-w-[44px]"
          aria-label="Cerrar escáner y volver"
        >
          ✕
        </Button>
      </div>

      {/* Permission Prompt */}
      {(permissionState.status === 'not_requested' ||
        permissionState.status === 'requesting' ||
        permissionState.status === 'denied' ||
        permissionState.status === 'blocked') && (
        <PermissionPrompt
          permissionState={permissionState}
          onRequestPermission={requestPermission}
        />
      )}

      {/* Scanner View */}
      {permissionState.status === 'granted' && (
        <>
          {/* Video Container (T084 - Accessibility) */}
          <Card className="relative bg-gray-900/50 border-gray-800 p-3 w-full max-w-sm flex-shrink-0">
            <div
              id="barcode-scanner-container"
              ref={videoContainerRef}
              className="relative w-full h-[280px] bg-black rounded-lg overflow-hidden"
              style={{ minHeight: '280px', maxHeight: '280px' }}
              role="region"
              aria-label="Vista de cámara para escaneo"
              aria-describedby="scanner-instructions"
            >
              {/* Loading State (T083) */}
              {isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20" role="status" aria-live="polite" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm">Iniciando cámara...</span>
                </div>
              )}
              
              {/* Product Lookup State (FR-010) */}
              {isLookingUpProduct && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20 bg-black/80" role="status" aria-live="polite" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-white text-sm font-medium">Buscando producto...</span>
                </div>
              )}
              
              {!isScanning && !error && !isInitializing && !isLookingUpProduct && (
                <div 
                  className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm z-20" 
                  role="status"
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%' }}
                >
                  Preparando escáner...
                </div>
              )}

              {/* Overlay INSIDE video container for proper positioning */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 scanner-overlay">
                  <ScannerOverlay
                    state={getVisualState()}
                    vibrationEnabled={vibrationEnabled}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Error Recovery UI (T085) */}
          {error && (
            <Card className="bg-red-900/20 border-red-500 p-4 w-full max-w-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-red-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">Error de Inicialización</h4>
                    <p className="text-red-300 text-xs">{error}</p>
                  </div>
                </div>
                
                {onManualEntry && (
                  <Button
                    onClick={handleManualEntry}
                    variant="secondary"
                    fullWidth
                    className="min-h-[44px]"
                    aria-label="Ingresar código manualmente como alternativa"
                  >
                    Ingresar Código Manualmente
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Instructions (T084 - Accessibility) */}
          <div id="scanner-instructions" className="w-full max-w-sm flex-shrink-0">
            <ScannerInstructions />
          </div>
        </>
      )}
    </div>
  );
});