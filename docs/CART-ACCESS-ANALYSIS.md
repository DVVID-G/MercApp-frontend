# Análisis de Alternativas: Acceso al Carrito desde Cualquier Pantalla

## Problema Identificado
Cuando el usuario está creando una compra y navega a otra sección, pierde el acceso al carrito y los productos agregados se pierden.

## Objetivo
Permitir al usuario regresar a su carrito (compra en progreso) desde cualquier pantalla de la aplicación.

---

## Alternativa 1: Botón de Carrito en Header con Badge

### Descripción
Botón de carrito fijo en el header de todas las pantallas autenticadas, con badge numérico mostrando la cantidad de productos.

### Ubicación
- Header superior derecho
- Visible en: Dashboard, History, Profile, CreatePurchase
- Posición: Fixed o sticky en el header

### Implementación Visual
```
┌─────────────────────────────────┐
│  [←] Dashboard        [🛒 3]   │ ← Header
├─────────────────────────────────┤
│                                 │
│  Contenido de la pantalla       │
│                                 │
└─────────────────────────────────┘
```

### Pros ✅
- **Alta visibilidad**: Siempre visible, no requiere scroll
- **Acceso rápido**: Un solo clic desde cualquier pantalla
- **Familiar**: Patrón común en e-commerce (Amazon, MercadoLibre)
- **No interfiere con navegación**: No compite con BottomNav
- **WCAG compliant**: Fácil de hacer accesible con aria-label y keyboard navigation
- **Mobile-first**: Funciona bien en pantallas pequeñas
- **Consistente**: Mismo lugar en todas las pantallas

### Contras ❌
- **Espacio limitado**: Puede competir con otros elementos del header
- **Requiere header consistente**: Todas las pantallas deben tener header
- **Puede distraer**: Siempre visible puede ser intrusivo

### Cumplimiento WCAG
- ✅ Contraste: Badge con fondo destacado (secondary-gold)
- ✅ Tamaño mínimo: 44x44px touch target
- ✅ ARIA: `aria-label="Carrito de compra, {count} productos"`
- ✅ Keyboard: Tab navigation, Enter/Space para activar
- ✅ Screen reader: Anuncia cantidad de productos

---

## Alternativa 2: Icono de Carrito en BottomNav con Badge

### Descripción
Agregar un icono de carrito al BottomNav existente, reemplazando o agregando como 5to elemento, con badge numérico.

### Ubicación
- BottomNav (navegación inferior)
- Visible en todas las pantallas autenticadas
- Posición: Fixed bottom

### Implementación Visual
```
┌─────────────────────────────────┐
│                                 │
│  Contenido de la pantalla       │
│                                 │
├─────────────────────────────────┤
│ [🏠] [🛒] [📷] [👤]             │ ← BottomNav
│  3                               │ ← Badge
└─────────────────────────────────┘
```

### Pros ✅
- **Integrado en navegación**: Parte del flujo natural de navegación
- **No ocupa espacio extra**: Usa espacio existente
- **Consistente con patrón**: Similar a apps como Instagram, WhatsApp
- **Fácil acceso**: Siempre visible en bottom
- **No compite con header**: Usa espacio dedicado

### Contras ❌
- **Menos visible**: Compite con otros iconos del nav
- **Puede confundir**: El icono "Compras" ya existe (history)
- **Espacio limitado**: BottomNav tiene 4 items, agregar 5to puede ser apretado
- **Requiere decisión**: ¿Reemplazar "Compras" o agregar como 5to?
- **Badge puede ser pequeño**: En bottom nav el espacio es limitado

### Cumplimiento WCAG
- ✅ Contraste: Badge sobre fondo oscuro
- ✅ Tamaño: Touch target adecuado (60px mínimo)
- ✅ ARIA: `aria-label` descriptivo
- ⚠️ Posible problema: Badge pequeño puede ser difícil de leer

---

## Alternativa 3: Floating Action Button (FAB) con Badge

### Descripción
Botón flotante circular fijo en la esquina inferior derecha, con badge numérico superpuesto.

### Ubicación
- Fixed position, bottom-right
- Visible en todas las pantallas autenticadas
- Flotante sobre el contenido

### Implementación Visual
```
┌─────────────────────────────────┐
│                                 │
│  Contenido de la pantalla       │
│                                 │
│                            ┌───┐ │
│                            │🛒│3│ │ ← FAB
│                            └───┘ │
└─────────────────────────────────┘
```

### Pros ✅
- **Muy visible**: Destacado, no pasa desapercibido
- **No interfiere con layout**: Flotante, no ocupa espacio fijo
- **Moderno**: Patrón Material Design, usado en Gmail, Google Maps
- **Accesible**: Fácil de alcanzar con pulgar (bottom-right)
- **Flexible**: Puede tener animación de entrada/salida

### Contras ❌
- **Puede tapar contenido**: En pantallas pequeñas puede ocultar información
- **Requiere z-index alto**: Debe estar sobre todo
- **Puede ser intrusivo**: Siempre visible puede distraer
- **Badge pequeño**: En botón circular el badge puede ser difícil de leer
- **No estándar en e-commerce**: Menos común que header/bottom nav

### Cumplimiento WCAG
- ✅ Contraste: Botón destacado (secondary-gold)
- ✅ Tamaño: 56x56px (Material Design standard)
- ✅ ARIA: `aria-label` completo
- ⚠️ Posible problema: Badge pequeño, necesita contraste alto

---

## Comparación Rápida

| Criterio | Header Button | BottomNav | FAB |
|----------|---------------|-----------|-----|
| **Visibilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Accesibilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **No intrusivo** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Familiaridad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Espacio** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mobile UX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Recomendación: Alternativa 1 (Header Button)

### Justificación
1. **Mejor balance UX/UI**: Alta visibilidad sin ser intrusivo
2. **Patrón familiar**: Usuarios esperan carrito en header
3. **WCAG compliance**: Más fácil de implementar correctamente
4. **Consistencia**: Header ya existe en todas las pantallas
5. **Mobile-first**: Funciona perfectamente en pantallas pequeñas
6. **No compite**: No interfiere con BottomNav ni contenido

### Implementación Propuesta
- Botón en header superior derecho
- Badge circular con número de productos
- Solo visible cuando hay productos en el carrito
- Animación suave al aparecer/desaparecer
- Persistencia del estado en contexto global

---

## Requisitos Técnicos

### Estado Global
- Crear `PurchaseContext` para mantener compra en progreso
- Persistir en `localStorage` para sobrevivir recargas
- Sincronizar entre componentes

### Componentes Necesarios
1. `PurchaseContext` - Estado global de compra
2. `CartButton` - Botón de carrito con badge
3. `CartHeader` - Header reutilizable con botón integrado

### Consideraciones
- Estado debe persistir entre navegaciones
- Limpiar estado al guardar compra
- Mostrar confirmación antes de descartar compra
- Sincronizar con `CreatePurchase` component


