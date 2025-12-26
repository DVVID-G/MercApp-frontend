/**
 * Integration Tests for Visual Feedback (T041-T050)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { ScannerOverlay } from '../../../src/components/scanner/ScannerOverlay';
import * as feedbackUtils from '../../../src/utils/scanner-feedback';

describe('Visual Feedback Integration', () => {
  let mockVibrate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true
    });
  });

  // T041: Success state triggers double-pulse vibration
  it('should trigger double-pulse vibration on success', async () => {
    const { rerender } = render(<ScannerOverlay state="idle" vibrationEnabled={true} />);
    
    act(() => {
      rerender(<ScannerOverlay state="success" vibrationEnabled={true} />);
    });

    await waitFor(() => {
      expect(mockVibrate).toHaveBeenCalledWith([50, 30, 50]);
    });
  });

  // T042: Error state triggers single long vibration
  it('should trigger single long vibration on error', async () => {
    const { rerender } = render(<ScannerOverlay state="idle" vibrationEnabled={true} />);
    
    act(() => {
      rerender(<ScannerOverlay state="error" vibrationEnabled={true} />);
    });

    await waitFor(() => {
      expect(mockVibrate).toHaveBeenCalledWith([100]);
    });
  });

  // T043: Detecting state triggers short pulse vibration
  it('should trigger short pulse on detecting', async () => {
    const { rerender } = render(<ScannerOverlay state="idle" vibrationEnabled={true} />);
    
    act(() => {
      rerender(<ScannerOverlay state="detecting" vibrationEnabled={true} />);
    });

    await waitFor(() => {
      expect(mockVibrate).toHaveBeenCalledWith([20]);
    });
  });

  // T044: Frame color transitions smoothly
  it('should transition frame colors smoothly', () => {
    const { container, rerender } = render(<ScannerOverlay state="idle" />);
    
    let frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame?.className).toContain('transition-all');
    expect(frame?.className).toContain('duration-200');

    rerender(<ScannerOverlay state="detecting" />);
    
    frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame?.className).toContain('transition-all');
  });

  // T045: Success animation plays (scale up)
  it('should apply scale animation on success', () => {
    const { container } = render(<ScannerOverlay state="success" />);
    
    const frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame?.className).toContain('scale-105');
  });

  // T046: Error animation plays (shake)
  it('should apply shake animation on error', () => {
    const { container } = render(<ScannerOverlay state="error" />);
    
    const frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame?.className).toContain('animate-shake');
  });

  // T047: Idle animation plays (pulse)
  it('should apply pulse animation on idle', () => {
    const { container } = render(<ScannerOverlay state="idle" />);
    
    const frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame?.className).toContain('animate-pulse');
  });

  // T048: Vibration can be disabled
  it('should not vibrate when vibration is disabled', async () => {
    const { rerender } = render(<ScannerOverlay state="idle" vibrationEnabled={false} />);
    
    act(() => {
      rerender(<ScannerOverlay state="success" vibrationEnabled={false} />);
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockVibrate).not.toHaveBeenCalled();
  });

  // T049: Message updates with state
  it('should update feedback message with state changes', () => {
    const { getByText, rerender } = render(<ScannerOverlay state="idle" />);
    
    expect(getByText(/Posiciona/i)).toBeInTheDocument();

    rerender(<ScannerOverlay state="detecting" />);
    expect(getByText(/Detectando/i)).toBeInTheDocument();

    rerender(<ScannerOverlay state="success" />);
    expect(getByText(/leído/i)).toBeInTheDocument();

    rerender(<ScannerOverlay state="error" />);
    expect(getByText(/No se pudo/i)).toBeInTheDocument();
  });

  // T050: Icon updates with state
  it('should update icon with state changes', () => {
    const { container, rerender } = render(<ScannerOverlay state="idle" />);
    
    // Idle should show search icon
    expect(container.querySelector('svg[viewBox="0 0 24 24"]')).toBeTruthy();

    rerender(<ScannerOverlay state="detecting" />);
    // Detecting should show spinner
    expect(container.querySelector('.animate-spin')).toBeTruthy();

    rerender(<ScannerOverlay state="success" />);
    // Success should show check icon
    expect(container.querySelector('svg[viewBox="0 0 24 24"]')).toBeTruthy();

    rerender(<ScannerOverlay state="error" />);
    // Error should show X icon
    expect(container.querySelector('svg[viewBox="0 0 24 24"]')).toBeTruthy();
  });
});

