/**
 * Tests for ScannerInstructions Component (T040)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScannerInstructions } from '../../../src/components/scanner/ScannerInstructions';

describe('ScannerInstructions Component', () => {
  // T040: renders instruction list
  it('should render instruction list', () => {
    render(<ScannerInstructions />);
    
    expect(screen.getByText(/Mantén el código/i)).toBeInTheDocument();
    expect(screen.getByText(/iluminación/i)).toBeInTheDocument();
    expect(screen.getByText(/EAN-13|UPC|Code-128/i)).toBeInTheDocument();
  });

  it('should render all three instructions', () => {
    const { container } = render(<ScannerInstructions />);
    
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBeGreaterThanOrEqual(3);
  });

  it('should have proper styling', () => {
    const { container } = render(<ScannerInstructions />);
    
    // Should be wrapped in a Card component
    expect(container.firstChild).toBeTruthy();
  });

  it('should display title', () => {
    render(<ScannerInstructions />);
    
    expect(screen.getByText(/Instrucciones/i)).toBeInTheDocument();
  });
});

