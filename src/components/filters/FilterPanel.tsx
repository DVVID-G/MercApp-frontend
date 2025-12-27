import React, { useEffect, useRef } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '../ui/drawer';
import { DateRangeSelector } from './DateRangeSelector';
import { SortSelector } from './SortSelector';
import { AdvancedFilters } from './AdvancedFilters';
import { useFilters } from '../../hooks/useFilters';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useFilters();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Debug: Log when drawer state changes
  React.useEffect(() => {
    console.log('[FilterPanel] isOpen changed:', isOpen);
    console.log('[FilterPanel] Context available:', !!dispatch);
  }, [isOpen, dispatch]);

  // Debug: Log when filters change
  React.useEffect(() => {
    console.log('[FilterPanel] Filter state:', state);
  }, [state]);

  // Prevent parent modal from closing when drawer is open and debug drawer visibility
  useEffect(() => {
    if (isOpen) {
      console.log('[FilterPanel] Drawer opening, preventing modal interactions...');
      
      // Find and disable ALL modal overlays that could interfere
      const modalOverlays = document.querySelectorAll('.fixed.inset-0');
      const overlaysToDisable: HTMLElement[] = [];
      
      modalOverlays.forEach((overlay) => {
        const htmlOverlay = overlay as HTMLElement;
        const zIndex = window.getComputedStyle(htmlOverlay).zIndex;
        // Only disable overlays with z-index less than drawer (z-60)
        const zIndexNum = parseInt(zIndex) || 0;
        if (zIndexNum < 60 && htmlOverlay.classList.contains('bg-black')) {
          htmlOverlay.style.pointerEvents = 'none';
          htmlOverlay.setAttribute('data-drawer-disabled', 'true');
          overlaysToDisable.push(htmlOverlay);
          console.log('[FilterPanel] Disabled modal overlay with z-index:', zIndex);
        }
      });
      
      // Also prevent clicks on the modal content itself
      const modalContent = document.querySelector('.fixed.bottom-0.max-w-\\[390px\\]');
      if (modalContent) {
        const htmlModal = modalContent as HTMLElement;
        htmlModal.style.pointerEvents = 'none';
        htmlModal.setAttribute('data-drawer-disabled', 'true');
        overlaysToDisable.push(htmlModal);
        console.log('[FilterPanel] Disabled modal content interactions');
      }
      
      // Force center drawer immediately and continuously
      const forceCenterDrawer = () => {
        const drawerContent = document.querySelector('[data-slot="drawer-content"]') as HTMLElement;
        if (drawerContent) {
          // Force centering using inline styles with !important equivalent
          drawerContent.style.setProperty('left', '50%', 'important');
          drawerContent.style.setProperty('right', 'auto', 'important');
          drawerContent.style.setProperty('transform', 'translateX(-50%)', 'important');
          drawerContent.style.setProperty('margin-left', '0', 'important');
          drawerContent.style.setProperty('margin-right', '0', 'important');
          // Also override any width constraints that might interfere
          if (drawerContent.style.maxWidth !== '390px') {
            drawerContent.style.setProperty('max-width', '390px', 'important');
          }
        }
      };
      
      // Apply immediately
      forceCenterDrawer();
      
      // Use MutationObserver to catch any style changes from Vaul
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            forceCenterDrawer();
          }
        });
      });
      
      // Observe the drawer content for style changes
      const drawerContent = document.querySelector('[data-slot="drawer-content"]') as HTMLElement;
      if (drawerContent) {
        observer.observe(drawerContent, {
          attributes: true,
          attributeFilter: ['style'],
        });
      }
      
      // Apply on next frames to catch any Vaul updates
      requestAnimationFrame(() => {
        forceCenterDrawer();
        requestAnimationFrame(() => {
          forceCenterDrawer();
          requestAnimationFrame(forceCenterDrawer);
        });
      });
      
      // Also apply periodically to catch any delayed Vaul animations
      const centerInterval = setInterval(forceCenterDrawer, 100);
      
      // Debug: Check drawer position and visibility after a delay
      const debugTimeout = setTimeout(() => {
        const drawerContent = document.querySelector('[data-slot="drawer-content"]') as HTMLElement;
        if (drawerContent) {
          const styles = window.getComputedStyle(drawerContent);
          const rect = drawerContent.getBoundingClientRect();
          console.log('[FilterPanel] Drawer position check:', {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            zIndex: styles.zIndex,
            transform: styles.transform,
            position: styles.position,
            bottom: styles.bottom,
            top: styles.top,
            left: styles.left,
            right: styles.right,
            marginTop: styles.marginTop,
            height: rect.height,
            width: rect.width,
            viewportHeight: window.innerHeight,
            viewportWidth: window.innerWidth,
            rectTop: rect.top,
            rectBottom: rect.bottom,
            rectLeft: rect.left,
            rectRight: rect.right,
            isVisible: rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0,
          });
          
          // Force visibility if needed
          if (styles.display === 'none' || styles.visibility === 'hidden') {
            console.warn('[FilterPanel] Drawer is hidden! Forcing visibility...');
            drawerContent.style.display = 'flex';
            drawerContent.style.visibility = 'visible';
          }
          
          // Force remove margin-top if present
          if (parseInt(styles.marginTop) > 0) {
            console.warn('[FilterPanel] Removing margin-top:', styles.marginTop);
            drawerContent.style.marginTop = '0';
          }
          
          // Ensure drawer is at bottom
          if (styles.bottom !== '0px' && !styles.bottom.includes('auto')) {
            console.warn('[FilterPanel] Setting bottom to 0');
            drawerContent.style.bottom = '0';
          }
        } else {
          console.error('[FilterPanel] Drawer content not found in DOM!');
        }
      }, 400);
      
      return () => {
        clearTimeout(debugTimeout);
        clearInterval(centerInterval);
        observer.disconnect();
        // Re-enable everything when drawer closes
        overlaysToDisable.forEach((element) => {
          element.style.pointerEvents = 'auto';
          element.removeAttribute('data-drawer-disabled');
        });
        console.log('[FilterPanel] Re-enabled modal interactions');
      };
    }
  }, [isOpen]);

  // Focus management: Trap focus within drawer when open
  useEffect(() => {
    if (!isOpen) {
      // Restore focus to previous element when drawer closes
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
      return;
    }

    // Store the currently focused element before opening drawer
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus trap: Handle Tab key to keep focus within drawer
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerContentRef.current) return;

      const focusableElements = drawerContentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Move focus to close button when drawer opens
    requestAnimationFrame(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else {
        // Fallback: focus the first focusable element in the drawer
        const drawerContent = drawerContentRef.current;
        const firstFocusable = drawerContent?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    });

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const hasActiveFilters =
    state.dateRange.start ||
    state.dateRange.end ||
    state.search ||
    state.priceRange.min !== null ||
    state.priceRange.max !== null ||
    state.sort.field !== 'date' ||
    state.sort.direction !== 'desc';

  const handleReset = () => {
    if (hasActiveFilters) {
      const confirmed = window.confirm('¿Estás seguro de que quieres limpiar todos los filtros?');
      if (confirmed) {
        dispatch({ type: 'reset' });
        // Clear localStorage
        try {
          localStorage.removeItem('mercapp_purchase_filters_v1');
        } catch (e) {
          // Ignore errors
        }
      }
    }
  };

  const handleResetToDefaults = () => {
    const confirmed = window.confirm('¿Restablecer filtros por defecto? Esto limpiará tus preferencias guardadas.');
    if (confirmed) {
      dispatch({ type: 'reset' });
      try {
        localStorage.removeItem('mercapp_purchase_filters_v1');
      } catch (e) {
        // Ignore errors
      }
    }
  };

  const handleApply = () => {
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    // Allow close when drawer state changes to closed
    // dismissible={false} prevents gesture-based closing, but we allow programmatic closing
    if (!open && isOpen) {
      onClose();
    }
  };

  return (
    <Drawer 
      open={isOpen} 
      onOpenChange={handleOpenChange} 
      direction="bottom"
      shouldScaleBackground={false}
      modal={true}
      dismissible={false}
      shouldCloseOnScroll={false}
    >
      <DrawerContent 
        className="bg-gray-950 border-gray-800 max-h-[85vh] !mt-0 flex flex-col max-w-[390px] !left-[50%] !-translate-x-1/2"
        style={{ 
          zIndex: 60,
          marginTop: 0,
          bottom: 0,
          position: 'fixed',
          width: '100%',
          maxWidth: '390px',
          display: 'flex',
          flexDirection: 'column',
        }}
        aria-label="Panel de filtros de compras"
        onPointerDownOutside={(e) => {
          // Only prevent if target is NOT part of drawer content or overlay
          const target = e.target as HTMLElement;
          const isDrawerContent = target.closest('[data-slot="drawer-content"]');
          const isDrawerOverlay = target.closest('[data-slot="drawer-overlay"]');
          // Allow overlay clicks to close, prevent other outside clicks
          if (!isDrawerContent && !isDrawerOverlay) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Only prevent if target is NOT part of drawer content or overlay
          const target = e.target as HTMLElement;
          const isDrawerContent = target.closest('[data-slot="drawer-content"]');
          const isDrawerOverlay = target.closest('[data-slot="drawer-overlay"]');
          // Allow overlay clicks to close, prevent other outside interactions
          if (!isDrawerContent && !isDrawerOverlay) {
            e.preventDefault();
          }
        }}
      >
        <DrawerHeader className="border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DrawerTitle className="text-white">
                Filtros
              </DrawerTitle>
              <DrawerDescription className="text-gray-400">
                Filtra tus compras por fecha, ordenamiento y más
              </DrawerDescription>
            </div>
            <DrawerClose
              ref={closeButtonRef}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-white transition-colors ml-4"
              aria-label="Cerrar panel de filtros"
            >
              <X className="w-5 h-5" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div 
          ref={drawerContentRef}
          className="overflow-y-auto flex-1 px-6 py-6 space-y-6 min-h-0" 
          role="region"
          aria-label="Contenido del panel de filtros"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            flex: '1 1 auto',
            minHeight: 0,
          }}
        >
          {/* Date Range Section */}
          <section 
            aria-labelledby="date-range-heading"
          >
            <h3 id="date-range-heading" className="text-sm font-medium text-white mb-3">Rango de fechas</h3>
            <DateRangeSelector />
          </section>

          {/* Sort Section */}
          <section 
            aria-labelledby="sort-heading"
          >
            <h3 id="sort-heading" className="text-sm font-medium text-white mb-3">Ordenar por</h3>
            <SortSelector />
          </section>

          {/* Advanced Filters Section */}
          <section 
            aria-labelledby="advanced-filters-heading"
          >
            <AdvancedFilters />
          </section>

          {/* Reset to Defaults */}
          <section className="pt-4 border-t border-gray-800">
            <button
              onClick={handleResetToDefaults}
              type="button"
              className="w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-[8px] hover:bg-gray-900"
              aria-label="Restablecer filtros por defecto"
            >
              Restablecer filtros por defecto
            </button>
          </section>
        </div>

        <DrawerFooter className="border-t border-gray-800">
          <div className="flex gap-3">
            {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 rounded-[12px] bg-gray-900 border border-gray-800 text-white hover:bg-gray-800 transition-colors"
              aria-label="Limpiar todos los filtros activos"
            >
              Limpiar filtros
            </button>
            )}
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 rounded-[12px] bg-primary-black border-2 border-secondary-gold text-white hover:bg-secondary-gold hover:text-primary-black transition-colors"
              aria-label="Aplicar filtros y cerrar panel"
            >
              Aplicar filtros
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
