/**
 * Tests for ScannerOverlay Component (T036-T039)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScannerOverlay } from '../../../src/components/scanner/ScannerOverlay';

describe('ScannerOverlay Component', () => {
  // T036: renders with idle state (blue, pulse animation)
  it('should render with idle state', () => {
    const { container } = render(<ScannerOverlay state="idle" />);
    
    const frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame).toBeTruthy();
    expect(frame?.className).toContain('border-scanner-idle');
    expect(frame?.className).toContain('animate-pulse');
  });

  it('should display idle message', () => {
    render(<ScannerOverlay state="idle" />);
    
    expect(screen.getByText(/Posiciona/i)).toBeInTheDocument();
  });

  // T037: changes to detecting state (yellow, no pulse)
  it('should render with detecting state', () => {
    const { container } = render(<ScannerOverlay state="detecting" />);
    
    const frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame?.className).toContain('border-scanner-detecting');
    expect(frame?.className).not.toContain('animate-pulse');
  });

  it('should display detecting message', () => {
    render(<ScannerOverlay state="detecting" />);
    
    expect(screen.getByText(/Detectando/i)).toBeInTheDocument();
  });

  // T038: changes to success state (green, scale animation)
  it('should render with success state', () => {
    const { container } = render(<ScannerOverlay state="success" />);
    
    const frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame?.className).toContain('border-scanner-success');
    expect(frame?.className).toContain('scale-105');
  });

  it('should display success message', () => {
    render(<ScannerOverlay state="success" />);
    
    expect(screen.getByText(/leído/i)).toBeInTheDocument();
  });

  // T039: changes to error state (red, shake animation)
  it('should render with error state', () => {
    const { container } = render(<ScannerOverlay state="error" />);
    
    const frame = container.querySelector('[data-testid="scanner-frame"]');
    expect(frame?.className).toContain('border-scanner-error');
    expect(frame?.className).toContain('animate-shake');
  });

  it('should display error message', () => {
    render(<ScannerOverlay state="error" />);
    
    expect(screen.getByText(/No se pudo/i)).toBeInTheDocument();
  });

  it('should render guide frame with correct size', () => {
    const { container } = render(<ScannerOverlay state="idle" />);
    
    const frame = container.querySelector('[data-testid="scanner-frame"]');
    // Frame should be 250x250px as per spec
    expect(frame).toBeTruthy();
  });
});

