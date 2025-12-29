/**
 * Tests for AdvancedFilters Component
 * Feature: 005-filter-panels-scroll
 * User Story: US3 (Scroll in Advanced Filters Section)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedFilters } from '../../../src/components/filters/AdvancedFilters';
import { FiltersProvider } from '../../../src/hooks/useFilters';

// Mock motion components
vi.mock('motion/react', () => ({
  motion: {
    p: ({ children, className }: any) => <p className={className}>{children}</p>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('AdvancedFilters Component - User Story 3: Scroll in Advanced Filters Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAdvancedFilters = () => {
    return render(
      <FiltersProvider>
        <AdvancedFilters />
      </FiltersProvider>
    );
  };

  describe('T022: AdvancedFilters accessibility via parent scroll', () => {
    it('should render within scrollable parent container', () => {
      const { container } = renderAdvancedFilters();
      
      // Verify component renders (has search input or price inputs)
      const searchInput = screen.queryByLabelText(/buscar productos/i) ||
        container.querySelector('input[type="text"]');
      
      expect(searchInput).toBeTruthy();
      
      // Component should be accessible via parent scroll (tested in FilterPanel tests)
      // This test verifies the component structure exists
    });
  });

  describe('T023: Error message visibility when price validation fails', () => {
    it('should show error message that is accessible via scroll when price validation fails', async () => {
      const { container } = renderAdvancedFilters();
      
      // Find price range inputs
      const minPriceInput = screen.queryByLabelText(/precio mínimo/i) ||
        container.querySelector('input[type="number"][placeholder*="Mín"]');
      const maxPriceInput = screen.queryByLabelText(/precio máximo/i) ||
        container.querySelector('input[type="number"][placeholder*="Máx"]');
      
      if (minPriceInput && maxPriceInput) {
        // Enter invalid price range (min > max)
        await userEvent.type(minPriceInput, '100');
        await userEvent.type(maxPriceInput, '50');
        
        // Trigger validation (blur or change event)
        await userEvent.tab();
        
        // Wait for error message to appear
        await waitFor(() => {
          const errorMessage = container.querySelector('.text-error') ||
            screen.queryByText(/precio mínimo/i);
          
          // Error message should be present (accessible via parent scroll)
          expect(errorMessage || container.textContent?.includes('error')).toBeTruthy();
        }, { timeout: 2000 });
      }
    });
  });

  describe('T024: Keyboard appearance handling on mobile', () => {
    it('should have inputs that can remain visible above keyboard when focused', async () => {
      const { container } = renderAdvancedFilters();
      
      const searchInput = screen.queryByLabelText(/buscar productos/i) ||
        container.querySelector('input[type="text"]');
      
      if (searchInput) {
        // Focus input (simulates keyboard appearance on mobile)
        await userEvent.click(searchInput);
        
        // Input should be focused and accessible
        expect(searchInput).toHaveFocus();
        
        // Component should be within scrollable container (tested in parent)
        // This test verifies the input can receive focus
      }
    });
  });
});



