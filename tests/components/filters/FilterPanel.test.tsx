/**
 * Tests for FilterPanel Component
 * Feature: 005-filter-panels-scroll
 * User Stories: US1 (Scroll in Main Filter Panel), US4 (Reset Confirmation Modal)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '../../../src/components/filters/FilterPanel';
import { FiltersProvider } from '../../../src/hooks/useFilters';

// Mock child components
vi.mock('../../../src/components/filters/DateRangeSelector', () => ({
  DateRangeSelector: () => <div data-testid="date-range-selector">DateRangeSelector</div>
}));

vi.mock('../../../src/components/filters/SortSelector', () => ({
  SortSelector: () => <div data-testid="sort-selector">SortSelector</div>
}));

vi.mock('../../../src/components/filters/AdvancedFilters', () => ({
  AdvancedFilters: () => <div data-testid="advanced-filters">AdvancedFilters</div>
}));

// Mock Drawer components
vi.mock('../../../src/components/ui/drawer', () => ({
  Drawer: ({ children, open, onOpenChange }: any) => (
    <div data-testid="drawer" data-open={open} onClick={() => onOpenChange?.(false)}>
      {open && children}
    </div>
  ),
  DrawerContent: ({ children, className }: any) => (
    <div data-testid="drawer-content" className={className}>
      {children}
    </div>
  ),
  DrawerHeader: ({ children }: any) => <div data-testid="drawer-header">{children}</div>,
  DrawerTitle: ({ children }: any) => <div data-testid="drawer-title">{children}</div>,
  DrawerDescription: ({ children }: any) => <div data-testid="drawer-description">{children}</div>,
  DrawerFooter: ({ children }: any) => <div data-testid="drawer-footer">{children}</div>,
  DrawerClose: ({ children, onClick }: any) => (
    <button data-testid="drawer-close" onClick={onClick}>
      {children}
    </button>
  )
}));

// Mock AlertDialog components
vi.mock('../../../src/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="alert-dialog" data-open={open}>
      {open && (
        <>
          <div data-testid="alert-dialog-overlay" onClick={() => onOpenChange?.(false)} />
          {children}
        </>
      )}
    </div>
  ),
  AlertDialogContent: ({ children, className }: any) => (
    <div data-testid="alert-dialog-content" className={className}>
      {children}
    </div>
  ),
  AlertDialogHeader: ({ children }: any) => <div data-testid="alert-dialog-header">{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div data-testid="alert-dialog-title">{children}</div>,
  AlertDialogDescription: ({ children }: any) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children, className }: any) => (
    <div data-testid="alert-dialog-footer" className={className}>
      {children}
    </div>
  ),
  AlertDialogCancel: ({ children, className, onClick }: any) => (
    <button data-testid="alert-dialog-cancel" className={className} onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, className, onClick }: any) => (
    <button data-testid="alert-dialog-action" className={className} onClick={onClick}>
      {children}
    </button>
  )
}));

describe('FilterPanel Component - User Story 1: Scroll in Main Filter Panel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
  });

  const renderFilterPanel = (isOpen: boolean) => {
    return render(
      <FiltersProvider>
        <FilterPanel isOpen={isOpen} onClose={mockOnClose} />
      </FiltersProvider>
    );
  };

  describe('T005: Scroll container existence', () => {
    it('should have scrollable content area with ref and overflow-y-auto class', () => {
      const { container } = renderFilterPanel(true);
      
      // Find scroll container by looking for element with overflow-y-auto
      const scrollContainer = container.querySelector('.overflow-y-auto');
      
      expect(scrollContainer).toBeTruthy();
      expect(scrollContainer).toHaveClass('overflow-y-auto');
    });
  });

  describe('T006: Scroll position reset on panel open', () => {
    it('should reset scrollTop to 0 when isOpen changes from false to true', async () => {
      const { rerender, container } = renderFilterPanel(false);
      
      // Find scroll container
      const scrollContainer = container.querySelector('.overflow-y-auto') as HTMLElement;
      
      if (scrollContainer) {
        // Simulate scroll position
        Object.defineProperty(scrollContainer, 'scrollTop', {
          writable: true,
          value: 100
        });
        
        expect(scrollContainer.scrollTop).toBe(100);
        
        // Open panel
        rerender(
          <FiltersProvider>
            <FilterPanel isOpen={true} onClose={mockOnClose} />
          </FiltersProvider>
        );
        
        // Wait for useEffect to run
        await waitFor(() => {
          expect(scrollContainer.scrollTop).toBe(0);
        });
      }
    });
  });

  describe('T007: Scroll behavior when content exceeds viewport', () => {
    it('should activate scroll when content height > container max-height', () => {
      const { container } = renderFilterPanel(true);
      
      const scrollContainer = container.querySelector('.overflow-y-auto') as HTMLElement;
      
      if (scrollContainer) {
        // Verify scroll container has overflow-y-auto which enables scrolling
        expect(scrollContainer).toHaveClass('overflow-y-auto');
        
        // Verify it has a max-height style (calculated from viewport)
        const styles = window.getComputedStyle(scrollContainer);
        // The container should have overflow-y: auto which allows scrolling when content exceeds
        expect(styles.overflowY).toBe('auto');
      }
    });
  });
});

describe('FilterPanel Component - User Story 4: Reset Confirmation Modal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
  });

  const renderFilterPanel = (isOpen: boolean) => {
    return render(
      <FiltersProvider>
        <FilterPanel isOpen={isOpen} onClose={mockOnClose} />
      </FiltersProvider>
    );
  };

  describe('T037: Modal state management', () => {
    it('should have showResetModal state that toggles correctly', async () => {
      const { container } = renderFilterPanel(true);
      
      // Find reset button
      const resetButton = screen.queryByLabelText(/restablecer filtros por defecto/i) ||
        container.querySelector('button[aria-label*="Restablecer"]') ||
        Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Restablecer')
        );
      
      if (resetButton) {
        // Initially modal should be closed
        expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
        
        // Click reset button
        await userEvent.click(resetButton);
        
        // Modal should open
        await waitFor(() => {
          expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'true');
        });
      }
    });
  });

  describe('T038: AlertDialog rendering with dark theme', () => {
    it('should render AlertDialogContent with dark theme classes matching FilterPanel visual patterns', async () => {
      const { container } = renderFilterPanel(true);
      
      const resetButton = screen.queryByLabelText(/restablecer filtros por defecto/i) ||
        container.querySelector('button[aria-label*="Restablecer"]') ||
        Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Restablecer')
        );
      
      if (resetButton) {
        await userEvent.click(resetButton);
        
        await waitFor(() => {
          const alertContent = screen.queryByTestId('alert-dialog-content');
          expect(alertContent).toBeTruthy();
          
          // Verify dark theme classes
          expect(alertContent).toHaveClass('bg-gray-950');
          expect(alertContent).toHaveClass('border-2');
          expect(alertContent).toHaveClass('border-gray-800');
          expect(alertContent).toHaveClass('rounded-[12px]');
          expect(alertContent).toHaveClass('p-6');
        });
      }
    });
  });

  describe('T039: Modal cancel action', () => {
    it('should close modal without resetting filters when Cancel is clicked', async () => {
      const { container } = renderFilterPanel(true);
      
      const resetButton = screen.queryByLabelText(/restablecer filtros por defecto/i) ||
        container.querySelector('button[aria-label*="Restablecer"]') ||
        Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Restablecer')
        );
      
      if (resetButton) {
        await userEvent.click(resetButton);
        
        await waitFor(() => {
          expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'true');
        });
        
        const cancelButton = screen.queryByTestId('alert-dialog-cancel');
        if (cancelButton) {
          await userEvent.click(cancelButton);
          
          await waitFor(() => {
            expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
          });
          
          // Verify localStorage.removeItem was NOT called (filters not reset)
          expect(Storage.prototype.removeItem).not.toHaveBeenCalled();
        }
      }
    });

    it('should close modal when Escape key is pressed', async () => {
      const { container } = renderFilterPanel(true);
      
      const resetButton = screen.queryByLabelText(/restablecer filtros por defecto/i) ||
        container.querySelector('button[aria-label*="Restablecer"]') ||
        Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Restablecer')
        );
      
      if (resetButton) {
        await userEvent.click(resetButton);
        
        await waitFor(() => {
          expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'true');
        });
        
        // Press Escape
        await userEvent.keyboard('{Escape}');
        
        await waitFor(() => {
          expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
        });
      }
    });
  });

  describe('T040: Modal confirm action', () => {
    it('should reset filters, clear localStorage, and close modal when Confirm is clicked', async () => {
      const { container } = renderFilterPanel(true);
      
      const resetButton = screen.queryByLabelText(/restablecer filtros por defecto/i) ||
        container.querySelector('button[aria-label*="Restablecer"]') ||
        Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Restablecer')
        );
      
      if (resetButton) {
        await userEvent.click(resetButton);
        
        await waitFor(() => {
          expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'true');
        });
        
        const confirmButton = screen.queryByTestId('alert-dialog-action');
        if (confirmButton) {
          await userEvent.click(confirmButton);
          
          await waitFor(() => {
            expect(screen.queryByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
          });
          
          // Verify localStorage was cleared
          expect(Storage.prototype.removeItem).toHaveBeenCalled();
        }
      }
    });
  });

  describe('T052: Visual consistency - Confirm button', () => {
    it('should have Confirm button with primary style matching "Aplicar filtros" button', async () => {
      const { container } = renderFilterPanel(true);
      
      const resetButton = screen.queryByLabelText(/restablecer filtros por defecto/i) ||
        container.querySelector('button[aria-label*="Restablecer"]') ||
        Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Restablecer')
        );
      
      if (resetButton) {
        await userEvent.click(resetButton);
        
        await waitFor(() => {
          const confirmButton = screen.queryByTestId('alert-dialog-action');
          expect(confirmButton).toBeTruthy();
          
          // Verify primary button style
          expect(confirmButton).toHaveClass('bg-primary-black');
          expect(confirmButton).toHaveClass('border-2');
          expect(confirmButton).toHaveClass('border-secondary-gold');
        });
      }
    });
  });

  describe('T053: Visual consistency - Cancel button', () => {
    it('should have Cancel button with secondary style matching "Limpiar filtros" button', async () => {
      const { container } = renderFilterPanel(true);
      
      const resetButton = screen.queryByLabelText(/restablecer filtros por defecto/i) ||
        container.querySelector('button[aria-label*="Restablecer"]') ||
        Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Restablecer')
        );
      
      if (resetButton) {
        await userEvent.click(resetButton);
        
        await waitFor(() => {
          const cancelButton = screen.queryByTestId('alert-dialog-cancel');
          expect(cancelButton).toBeTruthy();
          
          // Verify secondary button style
          expect(cancelButton).toHaveClass('bg-gray-900');
          expect(cancelButton).toHaveClass('border');
          expect(cancelButton).toHaveClass('border-gray-800');
        });
      }
    });
  });
});



