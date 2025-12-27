import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '../ui/drawer';
import { useProductFilters } from '../../hooks/useProductFilters';
import { ProductDateRangeSelector } from './ProductDateRangeSelector';
import { PriceRangeInputs } from './PriceRangeInputs';
import { CategorySelector } from './CategorySelector';

interface ProductFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFilterPanel: React.FC<ProductFilterPanelProps> = ({
  isOpen,
  onClose
}) => {
  const { state, dispatch } = useProductFilters();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Debug: Log when isOpen changes
  useEffect(() => {
    console.log('[ProductFilterPanel] isOpen changed:', isOpen);
  }, [isOpen]);

  // Focus management: Trap focus within drawer when open
  useEffect(() => {
    if (!isOpen) {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
      return;
    }
    previousActiveElementRef.current = document.activeElement as HTMLElement;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerContentRef.current) return;
      const focusableElements = drawerContentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    requestAnimationFrame(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else {
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

  const handleOpenChange = (open: boolean) => {
    console.log('[ProductFilterPanel] handleOpenChange called with:', open, 'current isOpen:', isOpen);
    
    // IMPORTANT: Only handle close events, never open events
    // The drawer is controlled via the `open` prop from parent
    if (!open) {
      // Only close if we were actually open (prevent false closes during initialization)
      if (isOpen) {
        console.log('[ProductFilterPanel] Drawer closing via handleOpenChange');
        onClose();
      } else {
        console.log('[ProductFilterPanel] Ignoring close event - drawer was not open');
      }
    } else {
      console.log('[ProductFilterPanel] Ignoring open event - controlled by parent prop');
    }
  };

  // Prevent parent modal from closing when drawer is open
  useEffect(() => {
    if (isOpen) {
      console.log('[ProductFilterPanel] Drawer opening, preventing modal interactions...');
      
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
          console.log('[ProductFilterPanel] Disabled modal overlay with z-index:', zIndex);
        }
      });
      
      // Also prevent clicks on the modal content itself
      const modalContent = document.querySelector('.fixed.bottom-0.max-w-\\[390px\\]');
      if (modalContent) {
        const htmlModal = modalContent as HTMLElement;
        htmlModal.style.pointerEvents = 'none';
        htmlModal.setAttribute('data-drawer-disabled', 'true');
        overlaysToDisable.push(htmlModal);
        console.log('[ProductFilterPanel] Disabled modal content interactions');
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
          console.log('[ProductFilterPanel] Drawer position check:', {
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
            console.warn('[ProductFilterPanel] Drawer is hidden! Forcing visibility...');
            drawerContent.style.display = 'flex';
            drawerContent.style.visibility = 'visible';
          }
          
          // Force remove margin-top if present
          if (parseInt(styles.marginTop) > 0) {
            console.warn('[ProductFilterPanel] Removing margin-top:', styles.marginTop);
            drawerContent.style.marginTop = '0';
          }
          
          // Ensure drawer is at bottom
          if (styles.bottom !== '0px' && !styles.bottom.includes('auto')) {
            console.warn('[ProductFilterPanel] Setting bottom to 0');
            drawerContent.style.bottom = '0';
          }
        } else {
          console.error('[ProductFilterPanel] Drawer content not found in DOM!');
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
        console.log('[ProductFilterPanel] Re-enabled modal interactions');
      };
    }
  }, [isOpen]);

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
        aria-label="Panel de filtros de productos"
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
                Filtros de productos
              </DrawerTitle>
              <DrawerDescription className="text-gray-400">
                Filtra por fecha, precio y categoría
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

        {/* Content - Scrollable */}
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
          
          {/* Date Range */}
          <ProductDateRangeSelector
            dateRange={state.dateRange}
            onDateRangeChange={(dateRange) => 
              dispatch({ type: 'setDateRange', payload: dateRange })
            }
          />

          <div className="h-px bg-gray-800" />

          {/* Price Range */}
          <PriceRangeInputs
            priceRange={state.priceRange}
            onPriceRangeChange={(priceRange) => 
              dispatch({ type: 'setPriceRange', payload: priceRange })
            }
          />

          <div className="h-px bg-gray-800" />

          {/* Categories */}
          <CategorySelector
            selectedCategories={state.categories}
            onCategoriesChange={(categories) => 
              dispatch({ type: 'setCategories', payload: categories })
            }
          />
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t border-gray-800">
          <div className="flex gap-3">
            <button
              onClick={() => {
                dispatch({ type: 'reset' });
              }}
              className="flex-1 px-4 py-3 rounded-[8px] bg-transparent border-2 border-error/30 text-error text-sm font-medium hover:bg-error/10 hover:border-error transition-colors"
              aria-label="Limpiar todos los filtros"
            >
              Limpiar todos
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-[8px] bg-secondary-gold text-gray-950 text-sm font-medium hover:bg-secondary-gold/90 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

