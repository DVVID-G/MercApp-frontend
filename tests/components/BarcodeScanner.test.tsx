/**
 * Tests for BarcodeScanner Component (T064-T075)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BarcodeScanner } from '../../src/components/BarcodeScanner';

// Mock hooks
vi.mock('../../src/hooks/useBarcodeScannerPermissions', () => ({
  useBarcodeScannerPermissions: () => ({
    permissionState: {
      status: 'granted',
      lastRequested: null,
      denyCount: 0,
      blockedAt: null,
      instructions: null
    },
    requestPermission: vi.fn().mockResolvedValue(true),
    checkPermission: vi.fn().mockResolvedValue('granted'),
    getInstructions: vi.fn(),
    resetPermissionState: vi.fn()
  })
}));

vi.mock('../../src/hooks/useBarcodeScanner', () => ({
  useBarcodeScanner: () => ({
    scannerState: 'idle',
    isScanning: true,
    lastScannedCode: null,
    error: null,
    startScanning: vi.fn(),
    stopScanning: vi.fn(),
    pauseScanning: vi.fn(),
    resumeScanning: vi.fn()
  })
}));

describe('BarcodeScanner Component', () => {
  const mockOnScan = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T064: Renders camera permission prompt when not granted
  it('should render permission prompt when permission not granted', () => {
    const { useBarcodeScannerPermissions } = require('../../src/hooks/useBarcodeScannerPermissions');
    vi.mocked(useBarcodeScannerPermissions).mockReturnValue({
      permissionState: {
        status: 'not_requested',
        lastRequested: null,
        denyCount: 0,
        blockedAt: null,
        instructions: null
      },
      requestPermission: vi.fn(),
      checkPermission: vi.fn(),
      getInstructions: vi.fn(),
      resetPermissionState: vi.fn()
    });

    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    expect(screen.getByText(/cámara/i)).toBeInTheDocument();
  });

  // T065: Initializes Quagga once permission granted
  it('should start scanning when permission is granted', async () => {
    const mockStartScanning = vi.fn();
    const { useBarcodeScanner } = require('../../src/hooks/useBarcodeScanner');
    vi.mocked(useBarcodeScanner).mockReturnValue({
      scannerState: 'idle',
      isScanning: false,
      lastScannedCode: null,
      error: null,
      startScanning: mockStartScanning,
      stopScanning: vi.fn(),
      pauseScanning: vi.fn(),
      resumeScanning: vi.fn()
    });

    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(mockStartScanning).toHaveBeenCalled();
    });
  });

  // T066: Renders ScannerOverlay with idle state
  it('should render scanner overlay with idle state', () => {
    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    expect(screen.getByTestId('scanner-frame')).toBeInTheDocument();
  });

  // T067: Updates overlay state to detecting/success/error
  it('should update overlay state on scanner state change', () => {
    const { useBarcodeScanner } = require('../../src/hooks/useBarcodeScanner');
    const { rerender } = render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    // Change to success state
    vi.mocked(useBarcodeScanner).mockReturnValue({
      scannerState: 'success',
      isScanning: true,
      lastScannedCode: { code: '1234567890123', format: 'ean_13', timestamp: Date.now() },
      error: null,
      startScanning: vi.fn(),
      stopScanning: vi.fn(),
      pauseScanning: vi.fn(),
      resumeScanning: vi.fn()
    });

    rerender(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    expect(screen.getByText(/leído/i)).toBeInTheDocument();
  });

  // T068: Calls onScan callback with barcode code
  it('should call onScan callback when barcode detected', async () => {
    const mockOnSuccess = vi.fn();
    const { useBarcodeScanner } = require('../../src/hooks/useBarcodeScanner');
    
    vi.mocked(useBarcodeScanner).mockImplementation((options: any) => {
      // Immediately call success callback
      setTimeout(() => options.onScanSuccess('1234567890123'), 0);
      
      return {
        scannerState: 'success',
        isScanning: true,
        lastScannedCode: null,
        error: null,
        startScanning: vi.fn(),
        stopScanning: vi.fn(),
        pauseScanning: vi.fn(),
        resumeScanning: vi.fn()
      };
    });

    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(mockOnScan).toHaveBeenCalledWith('1234567890123');
    });
  });

  // T069: Closes scanner when onClose called
  it('should stop scanning on close', async () => {
    const mockStopScanning = vi.fn();
    const { useBarcodeScanner } = require('../../src/hooks/useBarcodeScanner');
    vi.mocked(useBarcodeScanner).mockReturnValue({
      scannerState: 'idle',
      isScanning: true,
      lastScannedCode: null,
      error: null,
      startScanning: vi.fn(),
      stopScanning: mockStopScanning,
      pauseScanning: vi.fn(),
      resumeScanning: vi.fn()
    });

    const { unmount } = render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    unmount();

    expect(mockStopScanning).toHaveBeenCalled();
  });

  // T070: Renders ScannerInstructions component
  it('should render scanner instructions', () => {
    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    expect(screen.getByText(/Instrucciones/i)).toBeInTheDocument();
  });

  // T071: Handles camera errors gracefully
  it('should display error message on camera error', () => {
    const { useBarcodeScanner } = require('../../src/hooks/useBarcodeScanner');
    vi.mocked(useBarcodeScanner).mockReturnValue({
      scannerState: 'idle',
      isScanning: false,
      lastScannedCode: null,
      error: 'Failed to access camera',
      startScanning: vi.fn(),
      stopScanning: vi.fn(),
      pauseScanning: vi.fn(),
      resumeScanning: vi.fn()
    });

    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    expect(screen.getByText(/Failed to access camera/i)).toBeInTheDocument();
  });

  // T072: Mobile-first responsive layout
  it('should have mobile-first responsive layout', () => {
    const { container } = render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    // Should have mobile-optimized container
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('flex');
    expect(mainContainer).toHaveClass('flex-col');
  });

  // T073: Touch targets >= 44px
  it('should have touch targets of at least 44px', () => {
    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button');
    const styles = window.getComputedStyle(closeButton);
    
    // Note: In JSDOM min-height might not be computed, so we check className
    expect(closeButton.className).toMatch(/min-h-\[44px\]/);
  });

  // T074: Renders close button
  it('should render close button', () => {
    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    expect(closeButton).toBeInTheDocument();
  });

  // T075: Close button calls onClose
  it('should call onClose when close button clicked', async () => {
    const user = userEvent.setup();
    render(<BarcodeScanner onScan={mockOnScan} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});

