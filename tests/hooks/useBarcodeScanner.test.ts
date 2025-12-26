/**
 * Tests for useBarcodeScanner Hook (T055-T063)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBarcodeScanner } from '../../src/hooks/useBarcodeScanner';
import Quagga from '@ericblade/quagga2';

// Mock Quagga
vi.mock('@ericblade/quagga2', () => ({
  default: {
    init: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onDetected: vi.fn(),
    offDetected: vi.fn(),
    CameraAccess: {
      release: vi.fn()
    }
  }
}));

describe('useBarcodeScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // T055: Initial state is 'idle'
  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn()
    }));

    expect(result.current.scannerState).toBe('idle');
    expect(result.current.isScanning).toBe(false);
    expect(result.current.lastScannedCode).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // T056: startScanning initializes Quagga and changes state
  it('should start scanning and initialize Quagga', async () => {
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    vi.mocked(Quagga.start).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn()
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    expect(Quagga.init).toHaveBeenCalled();
    expect(Quagga.start).toHaveBeenCalled();
    expect(result.current.isScanning).toBe(true);
  });

  // T057: stopScanning stops Quagga and changes state
  it('should stop scanning and cleanup Quagga', async () => {
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    vi.mocked(Quagga.start).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn()
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    act(() => {
      result.current.stopScanning();
    });

    expect(Quagga.stop).toHaveBeenCalled();
    expect(result.current.isScanning).toBe(false);
  });

  // T058: onDetected handler validates barcode
  it('should validate and process detected barcode', async () => {
    const mockOnSuccess = vi.fn();
    
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    
    let detectedCallback: (result: any) => void;
    vi.mocked(Quagga.onDetected).mockImplementation((callback) => {
      detectedCallback = callback;
    });

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: mockOnSuccess,
      onScanError: vi.fn()
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    // Simulate barcode detection
    act(() => {
      detectedCallback!({
        codeResult: {
          code: '1234567890123',
          format: 'ean_13'
        }
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('1234567890123');
    });
  });

  // T059: pauseScanning pauses Quagga
  it('should pause scanning', async () => {
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    vi.mocked(Quagga.start).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn()
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    act(() => {
      result.current.pauseScanning();
    });

    expect(Quagga.stop).toHaveBeenCalled();
    expect(result.current.scannerState).toBe('idle');
  });

  // T060: resumeScanning resumes Quagga
  it('should resume scanning', async () => {
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    vi.mocked(Quagga.start).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn()
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    act(() => {
      result.current.pauseScanning();
    });

    await act(async () => {
      await result.current.resumeScanning();
    });

    expect(Quagga.start).toHaveBeenCalledTimes(2);
  });

  // T061: Auto-pauses on blur event
  it('should auto-pause on window blur', async () => {
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    vi.mocked(Quagga.start).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn(),
      autoPauseOnBlur: true
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    // Simulate blur event
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    await waitFor(() => {
      expect(Quagga.stop).toHaveBeenCalled();
    });
  });

  // T062: Auto-resumes on focus event
  it('should auto-resume on window focus', async () => {
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    vi.mocked(Quagga.start).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn(),
      autoPauseOnBlur: true
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    // Simulate blur
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    // Simulate focus
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(Quagga.start).toHaveBeenCalledTimes(2);
    });
  });

  // T063: Cleanup on unmount
  it('should cleanup resources on unmount', async () => {
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    vi.mocked(Quagga.start).mockResolvedValue(undefined);

    const { result, unmount } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn()
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    unmount();

    expect(Quagga.stop).toHaveBeenCalled();
    expect(Quagga.offDetected).toHaveBeenCalled();
  });

  it('should handle init errors', async () => {
    const mockOnError = vi.fn();
    
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(new Error('Init failed'));
    });

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: mockOnError
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should prevent duplicate scans within cooldown period', async () => {
    const mockOnSuccess = vi.fn();
    
    vi.mocked(Quagga.init).mockImplementation((config, callback) => {
      if (callback) callback(null);
    });
    
    let detectedCallback: (result: any) => void;
    vi.mocked(Quagga.onDetected).mockImplementation((callback) => {
      detectedCallback = callback;
    });

    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: mockOnSuccess,
      onScanError: vi.fn(),
      duplicateCooldown: 500
    }));

    await act(async () => {
      await result.current.startScanning('test-container');
    });

    // First scan
    act(() => {
      detectedCallback!({
        codeResult: {
          code: '1234567890123',
          format: 'ean_13'
        }
      });
    });

    // Immediate duplicate
    act(() => {
      detectedCallback!({
        codeResult: {
          code: '1234567890123',
          format: 'ean_13'
        }
      });
    });

    // Should only call once
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });
});

