# Filter Components

Este directorio contiene todos los componentes relacionados con el sistema de filtros avanzados para el historial de compras.

## Componentes

### FilterPanel
Componente principal que actúa como contenedor para todos los filtros. Utiliza un drawer (bottom sheet en móvil) para mostrar los controles de filtrado.

**Props:**
- `isOpen: boolean` - Controla si el panel está abierto
- `onClose: () => void` - Callback cuando se cierra el panel

**Características:**
- Focus trap cuando está abierto (Tab/Shift+Tab mantiene el foco dentro del panel)
- Restaura el foco al elemento anterior cuando se cierra
- Integra DateRangeSelector, SortSelector y AdvancedFilters

### DateRangeSelector
Selector de rango de fechas con presets rápidos y calendario personalizado.

**Características:**
- 5 presets rápidos: Hoy, Últimos 7 días, Últimos 30 días, Este mes, Mes pasado
- Calendario personalizado usando react-day-picker
- Validación de fechas (no futuras, inicio <= fin)
- Integración con el estado de filtros global

### SortSelector
Selector de ordenamiento con dropdown personalizado (no usa `<select>` nativo).

**Opciones de ordenamiento:**
- Fecha (más reciente primero / más antigua primero)
- Monto (mayor a menor / menor a mayor)
- Artículos (más a menos / menos a más)

**Características:**
- Navegación por teclado completa (Arrow keys, Enter, Escape)
- Indicador visual de opción seleccionada
- Animaciones suaves con Motion

### AdvancedFilters
Filtros avanzados con búsqueda por producto y rango de precio.

**Características:**
- Búsqueda con debounce (300ms) para mejor rendimiento
- Validación de rango de precios (min <= max, valores >= 0)
- Badge que muestra cantidad de filtros activos
- Mensajes de error accesibles

### FilterSummary
Muestra un resumen visual de todos los filtros activos como tags.

**Características:**
- Tags con iconos y valores descriptivos
- Botón para eliminar filtros individuales
- Botón "Limpiar todo" cuando hay múltiples filtros
- Animaciones de entrada/salida con AnimatePresence
- Se oculta automáticamente cuando no hay filtros activos

### PaginationControls
Controles de paginación con botón "Cargar más".

**Características:**
- Muestra progreso: "X de Y compras"
- Botón "Cargar más" con estado de carga
- Scroll suave al primer nuevo elemento después de cargar más
- Animaciones fade-in para elementos recién cargados
- Mensaje cuando todas las compras están cargadas

### FilterErrorBoundary
Error boundary para capturar errores en componentes de filtros.

**Características:**
- Muestra UI de fallback amigable
- Botón para reintentar
- Muestra detalles del error solo en desarrollo
- Previene que errores en filtros rompan toda la aplicación

## Hooks Relacionados

### useFilters
Hook para acceder al estado de filtros y dispatch de acciones.

**Ubicación:** `src/hooks/useFilters.tsx`

**Uso:**
```tsx
const { state, dispatch } = useFilters();
dispatch({ type: 'setDateRange', payload: { start: '2024-01-01', end: '2024-01-31', preset: 'custom' } });
```

### useFilteredPurchases
Hook que aplica filtros, ordenamiento y paginación a un array de compras.

**Ubicación:** `src/hooks/usePurchaseFilter.tsx`

**Uso:**
```tsx
const { filtered, total, hasMore, loadMore } = useFilteredPurchases(purchases);
```

## Estado de Filtros

El estado de filtros se gestiona mediante React Context + useReducer. El estado incluye:

- `dateRange`: Rango de fechas (start, end, preset)
- `sort`: Criterio de ordenamiento (field, direction)
- `search`: Búsqueda por nombre de producto
- `priceRange`: Rango de precios (min, max)
- `page`: Página actual de paginación
- `pageSize`: Tamaño de página (default: 20)

## Persistencia

Los filtros se persisten automáticamente en:
1. **localStorage**: Guarda preferencias del usuario (debounced 500ms)
2. **URL params**: Sincroniza filtros con la URL para compartir

La URL tiene precedencia sobre localStorage al cargar.

## Accesibilidad

Todos los componentes siguen las mejores prácticas de accesibilidad:

- ✅ ARIA labels en todos los controles
- ✅ Focus trap en FilterPanel cuando está abierto
- ✅ Navegación por teclado completa
- ✅ Aria-live regions para anuncios de cambios
- ✅ Roles y propiedades ARIA apropiados
- ✅ Error boundaries para manejo de errores

## Dependencias

- `date-fns`: Manipulación de fechas
- `react-day-picker`: Calendario de selección de fechas
- `use-debounce`: Debounce para búsqueda
- `motion/react`: Animaciones
- `lucide-react`: Iconos

## Testing

Los componentes deben tener tests que cubran:

- Interacción del usuario (clicks, teclado)
- Validación de filtros
- Estados de carga y error
- Accesibilidad (navegación por teclado, screen readers)

