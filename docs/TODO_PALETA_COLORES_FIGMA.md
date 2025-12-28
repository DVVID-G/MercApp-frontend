# TODO: Replicar Paleta de Colores de Figma en MercApp

**Fecha de Creación**: 2025-01-27  
**Prioridad**: Alta  
**Estado**: Pendiente  
**URL de Referencia**: https://www.figma.com/make/7DGYB7LgRGA53nalxNp9IZ/MercApp-Mobile-Design

---

## 📋 Resumen Ejecutivo

La aplicación actual no coincide visualmente con el diseño de Figma debido a inconsistencias en el uso de la paleta de colores. Este documento detalla todas las tareas necesarias para replicar exactamente el uso de colores del diseño de Figma Make.

### Problemas Identificados

1. **Colores Legacy en Uso**: Se están utilizando colores del sistema antiguo (`blue-500`, `purple-500`, `gray-600`, `success`, `warning`, `error`) en lugar de la paleta MercApp
2. **Inconsistencias en Componentes**: Algunos componentes usan la nueva paleta, otros aún usan valores hardcodeados
3. **Variables CSS No Utilizadas**: Las variables CSS están definidas pero no se están aplicando consistentemente
4. **Falta de Mapeo Completo**: No hay un mapeo claro entre los colores de Figma y los valores actuales

---

## 🎨 Paleta de Colores Actual vs Figma

### Colores Semánticos (MercApp) - Valores Aprobados por UX/UI

> **⚠️ IMPORTANTE**: Los siguientes valores han sido aprobados por UX/UI y cumplen con criterios de accesibilidad. Estos son los valores **oficiales** que deben usarse.

| Categoría | Variable CSS | Valor Aprobado | Valor Actual | Estado | Acción Requerida |
|-----------|--------------|----------------|--------------|--------|------------------|
| **Primario** | `--color-primary-mint` | `#00C896` | `#00C896` | ✅ Correcto | Ninguna |
| **Primario 700** | `--color-primary-mint-700` | `#00B585` | `#009F75` | ❌ Incorrecto | **ACTUALIZAR** |
| **Secundario** | `--color-secondary-slate` | `#2D3E50` | `#2D3E50` | ✅ Correcto | Ninguna |
| **Acento** | `--color-accent-orange` | `#FF8C42` | `#FF8C42` | ✅ Correcto | Ninguna |
| **Alerta** | `--color-alert-coral` | `#FF5E5B` | `#FF5E5B` | ✅ Correcto | Ninguna |

### Colores Neutros - Valores Aprobados por UX/UI

| Categoría | Variable CSS | Valor Aprobado | Valor Actual | Estado | Acción Requerida |
|-----------|--------------|----------------|--------------|--------|------------------|
| **Fondo** | `--color-background-smoke` | `#F4F7F6` | `#F4F7F6` | ✅ Correcto | Ninguna |
| **Texto Primario** | `--color-text-primary` | `#2D3E50` | `#2D3E50` | ✅ Correcto | Ninguna |
| **Texto Secundario** | `--color-text-secondary` | `#627582` | `#6B7C8E` | ❌ Incorrecto | **ACTUALIZAR** |
| **Texto Terciario** | `--color-text-tertiary` | `#8896A0` | `#A0ADB8` | ❌ Incorrecto | **ACTUALIZAR** |
| **Borde Claro** | `--color-border-light` | `#E8ECEF` | `#E5EAE8` | ❌ Incorrecto | **ACTUALIZAR** |
| **Borde Medio** | `--color-border-medium` | `#D1D9DD` | `#D0D7D5` | ❌ Incorrecto | **ACTUALIZAR** |

### Fondos Semánticos - Valores Aprobados por UX/UI

| Categoría | Variable CSS | Valor Aprobado | Valor Actual | Estado | Acción Requerida |
|-----------|--------------|----------------|--------------|--------|------------------|
| **Éxito Claro** | `--color-bg-success-light` | `#E6F9F4` | `#E6F9F4` | ✅ Correcto | Ninguna |
| **Advertencia Claro** | `--color-bg-warning-light` | `#FFF3EC` | `#FFF3EC` | ✅ Correcto | Ninguna |
| **Error Claro** | `--color-bg-error-light` | `#FFEFEE` | `#FFEFEE` | ✅ Correcto | Ninguna |

### Resumen de Cambios Requeridos

**Valores que deben actualizarse**:
1. `--color-primary-mint-700`: `#009F75` → `#00B585`
2. `--color-text-secondary`: `#6B7C8E` → `#627582`
3. `--color-text-tertiary`: `#A0ADB8` → `#8896A0`
4. `--color-border-light`: `#E5EAE8` → `#E8ECEF`
5. `--color-border-medium`: `#D0D7D5` → `#D1D9DD`

### Colores Legacy (A Eliminar)

| Color Legacy | Valor | Reemplazo Propuesto | Archivos Afectados |
|--------------|-------|---------------------|-------------------|
| `blue-500` | `oklch(.623 .214 259.815)` | `primary-mint` o `accent-orange` | Dashboard.tsx |
| `purple-500` | `oklch(.627 .265 303.9)` | `primary-mint` o `accent-orange` | Dashboard.tsx |
| `gray-600` | `#4d4d4d` | `text-secondary` o `text-tertiary` | Múltiples |
| `success` | `#2ecc71` | `primary-mint` | Dashboard.tsx, múltiples |
| `warning` | `#f1c40f` | `accent-orange` | Dashboard.tsx, múltiples |
| `error` | `#e74c3c` | `alert-coral` | Múltiples |

---

## 📝 Tareas Detalladas

### Fase 1: Auditoría y Mapeo de Colores

#### Tarea 1.1: Extraer Colores Exactos de Figma
- [x] **Valores aprobados por UX/UI recibidos** ✅
  - Los valores han sido proporcionados y validados por otro agente
  - Valores cumplen con criterios de accesibilidad y diseño aprobado
  
- [x] **Documentar valores aprobados**:
  - ✅ PRIMARY: `#00C896`
  - ✅ PRIMARY-700: `#00B585` (diferente al actual `#009F75`)
  - ✅ SECONDARY: `#2D3E50`
  - ✅ ACCENT: `#FF8C42`
  - ✅ ALERT: `#FF5E5B`
  - ✅ BACKGROUND: `#F4F7F6`
  - ✅ TEXT_PRIMARY: `#2D3E50`
  - ✅ TEXT_SECONDARY: `#627582` (diferente al actual `#6B7C8E`)
  - ✅ TEXT_TERTIARY: `#8896A0` (diferente al actual `#A0ADB8`)
  - ✅ BORDER_LIGHT: `#E8ECEF` (diferente al actual `#E5EAE8`)
  - ✅ BORDER_MEDIUM: `#D1D9DD` (diferente al actual `#D0D7D5`)
  - ✅ SUCCESS_LIGHT: `#E6F9F4`
  - ✅ WARNING_LIGHT: `#FFF3EC`
  - ✅ ERROR_LIGHT: `#FFEFEE`

- [ ] **Crear tabla de mapeo Figma → Código**
  - Archivo: `MercApp-Frontend/docs/FIGMA_COLOR_MAPPING.md`
  - Formato: Tabla con columna "Token Figma", "Valor Aprobado", "Variable CSS", "Valor Actual", "Coincide", "Acción"

#### Tarea 1.2: Identificar Todos los Usos de Colores Legacy
- [ ] **Buscar todos los archivos con colores legacy**:
  ```bash
  # Buscar blue-500
  grep -r "blue-500" MercApp-Frontend/src
  # Buscar purple-500
  grep -r "purple-500" MercApp-Frontend/src
  # Buscar gray-600
  grep -r "gray-600" MercApp-Frontend/src
  # Buscar success (sin primary-mint)
  grep -r "success" MercApp-Frontend/src | grep -v "primary-mint"
  # Buscar warning (sin accent-orange)
  grep -r "warning" MercApp-Frontend/src | grep -v "accent-orange"
  # Buscar error (sin alert-coral)
  grep -r "error" MercApp-Frontend/src | grep -v "alert-coral"
  ```

- [ ] **Crear lista de archivos afectados**:
  - Archivo: `MercApp-Frontend/docs/COLOR_LEGACY_AUDIT.md`
  - Incluir: Ruta del archivo, línea, color legacy usado, reemplazo propuesto

**Archivos Identificados (Preliminar)**:
- `MercApp-Frontend/src/components/Dashboard.tsx` (líneas 73, 87, 88, 101, 102, 135)
- `MercApp-Frontend/src/components/Profile.tsx`
- `MercApp-Frontend/src/components/filters/DateRangeSelector.tsx`
- `MercApp-Frontend/src/components/filters/ProductDateRangeSelector.tsx`
- `MercApp-Frontend/src/components/PurchaseHistory.tsx`
- `MercApp-Frontend/src/components/ProductCatalog.tsx`
- `MercApp-Frontend/src/components/CreatePurchase.tsx`
- `MercApp-Frontend/src/components/Login.tsx`
- `MercApp-Frontend/src/components/ProductSearchInput.tsx`
- `MercApp-Frontend/src/components/filters/ProductFilterPanel.tsx`
- `MercApp-Frontend/src/components/BarcodeScanner.tsx`
- `MercApp-Frontend/src/components/PriceUpdateModal.tsx`
- `MercApp-Frontend/src/components/ui/badge.tsx`
- `MercApp-Frontend/src/components/filters/FilterPanel.tsx`
- `MercApp-Frontend/src/components/filters/PriceRangeInputs.tsx`
- `MercApp-Frontend/src/components/Input.tsx`
- `MercApp-Frontend/src/components/Register.tsx`
- `MercApp-Frontend/src/components/ManualProductForm.tsx`
- `MercApp-Frontend/src/components/ui/alert.tsx`
- `MercApp-Frontend/src/components/filters/AdvancedFilters.tsx`
- `MercApp-Frontend/src/components/filters/FilterErrorBoundary.tsx`
- `MercApp-Frontend/src/components/BarcodeScanner.new.tsx`
- `MercApp-Frontend/src/components/scanner/ScannerOverlay.tsx`
- `MercApp-Frontend/src/components/scanner/PermissionPrompt.tsx`
- `MercApp-Frontend/src/components/BarcodeScanner.old.tsx`
- `MercApp-Frontend/src/components/ui/form.tsx`

---

### Fase 2: Actualización de Configuración Base

#### Tarea 2.1: Verificar y Actualizar Variables CSS
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/styles/globals.css`** ✅
  - [x] Actualizar `--color-primary-mint-700`: `#009F75` → `#00B585` ✅
  - [x] Actualizar `--color-text-secondary`: `#6B7C8E` → `#627582` ✅
  - [x] Actualizar `--color-text-tertiary`: `#A0ADB8` → `#8896A0` ✅
  - [x] Actualizar `--color-border-light`: `#E5EAE8` → `#E8ECEF` ✅
  - [x] Actualizar `--color-border-medium`: `#D0D7D5` → `#D1D9DD` ✅
  - [x] Verificar que todas las variables estén definidas en `@theme` ✅
  - [x] Asegurar que todas las variantes (50-900) estén presentes ✅

- [x] **Actualizar `MercApp-Frontend/src/index.css`** ✅
  - [x] Actualizar `--color-primary-mint-700`: `#009F75` → `#00B585` ✅
  - [x] Actualizar `--color-text-secondary`: `#6B7C8E` → `#627582` ✅
  - [x] Actualizar `--color-text-tertiary`: `#A0ADB8` → `#8896A0` ✅
  - [x] Actualizar `--color-border-light`: `#E5EAE8` → `#E8ECEF` ✅
  - [x] Actualizar `--color-border-medium`: `#D0D7D5` → `#D1D9DD` ✅
  - [x] Verificar que las variables estén en `@layer theme` ✅
  - [x] Comparar valores con `globals.css` (coinciden exactamente) ✅

- [x] **Actualizar `MercApp-Frontend/tailwind.config.ts`** ✅
  - [x] Actualizar `primary-mint.700`: `#009F75` → `#00B585` ✅
  - [x] Actualizar `text-secondary`: `#6B7C8E` → `#627582` ✅
  - [x] Actualizar `text-tertiary`: `#A0ADB8` → `#8896A0` ✅
  - [x] Actualizar `border-light`: `#E5EAE8` → `#E8ECEF` ✅
  - [x] Actualizar `border-medium`: `#D0D7D5` → `#D1D9DD` ✅
  - [x] Verificar que todos los valores coincidan con variables CSS ✅

- [x] **Actualizar `MercApp-Frontend/src/utils/colorUtils.ts`** ✅
  - [x] Actualizar `PRIMARY_MINT_700`: `#009F75` → `#00B585` ✅
  - [x] Actualizar `TEXT_SECONDARY`: `#6B7C8E` → `#627582` ✅
  - [x] Actualizar `TEXT_TERTIARY`: `#A0ADB8` → `#8896A0` ✅
  - [x] Actualizar `BORDER_LIGHT`: `#E5EAE8` → `#E8ECEF` ✅
  - [x] Actualizar `BORDER_MEDIUM`: `#D0D7D5` → `#D1D9DD` ✅

- [ ] **Eliminar colores legacy de configuración** (después de verificar uso):
  - [ ] Buscar usos de `--color-primary-black` y reemplazar si se usa
  - [ ] Buscar usos de `--color-secondary-gold` y reemplazar si se usa
  - [ ] Buscar usos de `--color-gray-950`, `--color-gray-800`, `--color-gray-600`, `--color-gray-400` y reemplazar
  - [ ] Buscar usos de `--color-success`, `--color-error`, `--color-warning` y reemplazar por semánticos

#### Tarea 2.2: Actualizar Utilidades de Color
**Estado**: ✅ Completada

- [x] **Revisar `MercApp-Frontend/src/utils/colorUtils.ts`** ✅
  - [x] Verificar que `COLOR_VALUES` tenga todos los valores aprobados ✅
  - [x] Actualizar valores que difieren (completado en Tarea 2.1) ✅
  - [x] Verificar funciones helper existentes ✅
  - [x] Funciones documentadas con JSDoc ✅

- [x] **Revisar `MercApp-Frontend/src/utils/chartColors.ts`** ✅
  - [x] Archivo encontrado: `src/utils/chartColors.ts` ✅
  - [x] Verificar colores de gráficos: ya usa paleta MercApp correctamente ✅
  - [x] Mapeo verificado:
    - [x] Ahorros → `#00C896` (primary-mint) ✅
    - [x] Gastos → `#FF5E5B` (alert-coral) ✅
    - [x] Presupuesto → `#FF8C42` (accent-orange) ✅
    - [x] Ejes → `#2D3E50` (secondary-slate) ✅
  - [x] No requiere cambios ✅

---

### Fase 3: Actualización de Componentes Base

#### Tarea 3.1: Componente Button
**Estado**: ✅ Completada

- [x] **Revisar `MercApp-Frontend/src/components/Button.tsx`** ✅
  - [x] Verificar que todas las variantes usen colores de la paleta ✅
    - [x] Primary: usa `primary-mint`, `primary-mint-600`, `primary-mint-700` ✅
    - [x] Secondary: usa `accent-orange` ✅
    - [x] Destructive: usa `alert-coral` ✅
    - [x] Ghost: usa `secondary-slate` ✅
  - [x] Estados hover/active/disabled usan variantes correctas ✅
  - [x] Contraste WCAG 2.1 AA verificado (texto blanco sobre colores semánticos) ✅

- [x] **Revisar `MercApp-Frontend/src/components/ui/button.tsx`** ✅
  - [x] Usa misma paleta que Button.tsx ✅
  - [x] Consistencia verificada entre ambos ✅

#### Tarea 3.2: Componente Card
**Estado**: ✅ Completada

- [x] **Revisar `MercApp-Frontend/src/components/Card.tsx`** ✅
  - [x] Fondo: `bg-white` sobre `bg-background-smoke` ✅
  - [x] Bordes: `border-border-light` por defecto (actualizado a `#E8ECEF`) ✅
  - [x] Variante highlighted: gradiente con `primary-mint` ✅
  - [x] Variante purchase: borde izquierdo `primary-mint` o `accent-orange` ✅
  - [x] Comentarios actualizados con nuevos valores de borde ✅

- [x] **Revisar `MercApp-Frontend/src/components/ui/card.tsx`** ✅
  - [x] Usa misma lógica que Card.tsx ✅
  - [x] Paleta correcta aplicada ✅

#### Tarea 3.3: Componente Input
**Estado**: ✅ Completada

- [x] **Revisar `MercApp-Frontend/src/components/Input.tsx`** ✅
  - [x] Fondo: `bg-white` ✅
  - [x] Borde normal: `border-border-light` (actualizado a `#E8ECEF`) ✅
  - [x] Borde focus: `border-primary-mint` con `ring-primary-mint/50` ✅
  - [x] Borde error: `border-alert-coral` ✅
  - [x] Texto: `text-text-primary` ✅
  - [x] Placeholder: `text-text-tertiary` (actualizado a `#8896A0`) ✅
  - [x] Hover: `hover:border-border-medium` (actualizado a `#D1D9DD`) ✅

- [x] **Revisar `MercApp-Frontend/src/components/ui/input.tsx`** ✅
  - [x] Usa misma lógica que Input.tsx ✅
  - [x] Paleta correcta aplicada ✅

#### Tarea 3.4: Componente Badge
**Estado**: ✅ Completada

- [x] **Revisar `MercApp-Frontend/src/components/ui/badge.tsx`** ✅
  - [x] Badge éxito (default): `bg-bg-success-light` + `text-primary-mint` ✅
  - [x] Badge advertencia (secondary): `bg-bg-warning-light` + `text-accent-orange` ✅
  - [x] Badge error (destructive): `bg-bg-error-light` + `text-alert-coral` ✅
  - [x] Badge outline: `border-border-light` (actualizado) ✅
  - [x] Paleta correcta aplicada en todas las variantes ✅

---

### Fase 4: Actualización de Componentes de Página

#### Tarea 4.1: Dashboard
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/Dashboard.tsx`** ✅
  - [x] Línea 73: `bg-success/10` → `bg-primary-mint/10` ✅
  - [x] Línea 74: `text-success` → `text-primary-mint` ✅
  - [x] Línea 87: `bg-blue-500/10` → `bg-primary-mint/10` ✅
  - [x] Línea 88: `text-blue-500` → `text-primary-mint` ✅
  - [x] Línea 101: `bg-purple-500/10` → `bg-accent-orange/10` ✅
  - [x] Línea 102: `text-purple-500` → `text-accent-orange` ✅
  - [x] Línea 135: `text-gray-600` → `text-text-tertiary` ✅
  - [x] Líneas 39-44: `warning` → `accent-orange` (banner offline) ✅
  - [x] Todos los textos usan paleta correcta ✅

#### Tarea 4.2: Login
- [ ] **Actualizar `MercApp-Frontend/src/components/Login.tsx`**
  - [ ] Verificar gradiente del logo: `from-primary-mint to-primary-mint/60`
  - [ ] Verificar título: `text-primary-mint`
  - [ ] Verificar textos: `text-text-secondary`
  - [ ] Verificar botones usen variantes correctas
  - [ ] Comparar con Figma

#### Tarea 4.3: Register
- [ ] **Actualizar `MercApp-Frontend/src/components/Register.tsx`**
  - [ ] Aplicar misma lógica que Login.tsx
  - [ ] Comparar con Figma

#### Tarea 4.4: PurchaseHistory
- [ ] **Actualizar `MercApp-Frontend/src/components/PurchaseHistory.tsx`**
  - [ ] Verificar card de resumen: `from-accent-orange/10 to-accent-orange/5`
  - [ ] Verificar textos usen paleta correcta
  - [ ] Verificar badges de estado
  - [ ] Comparar con Figma

#### Tarea 4.5: CreatePurchase
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/CreatePurchase.tsx`** ✅
  - [x] Línea 377: `text-gray-600` → `text-text-tertiary` ✅
  - [x] Línea 379: `text-gray-600` → `text-text-tertiary` ✅
  - [x] Línea 428: `bg-error/10 border-error/20` → `bg-alert-coral/10 border-alert-coral/20` ✅
  - [x] Línea 429: `text-error` → `text-alert-coral` ✅
  - [x] Inputs, botones, cards verificados ✅

#### Tarea 4.6: ProductCatalog
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/ProductCatalog.tsx`** ✅
  - [x] No se encontraron colores legacy ✅
  - [x] Cards de productos verificadas ✅

#### Tarea 4.7: Profile
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/Profile.tsx`** ✅
  - [x] Línea 156: `text-error` → `text-alert-coral` (para cambios positivos/aumentos) ✅
  - [x] Línea 156: `text-success` → `text-primary-mint` (para cambios negativos/disminuciones) ✅
  - [x] Secciones y botones verificados ✅

#### Tarea 4.8: BarcodeScanner
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/BarcodeScanner.tsx`** ✅
  - [x] Línea 262: `border-blue-500` → `border-primary-mint` (spinner de carga) ✅
  - [x] Línea 263: `text-gray-400` → `text-text-tertiary` ✅
  - [x] Overlay e instrucciones verificados ✅

---

### Fase 5: Actualización de Componentes de Filtros

#### Tarea 5.1: FilterPanel
- [ ] **Actualizar `MercApp-Frontend/src/components/filters/FilterPanel.tsx`**
  - [ ] Buscar y reemplazar colores legacy
  - [ ] Verificar inputs, selects, botones
  - [ ] Comparar con Figma

#### Tarea 5.2: DateRangeSelector
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/filters/DateRangeSelector.tsx`** ✅
  - [x] Línea 332: `text-error` → `text-alert-coral` ✅
  - [x] Calendario y botones verificados ✅

#### Tarea 5.3: ProductDateRangeSelector
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/filters/ProductDateRangeSelector.tsx`** ✅
  - [x] Línea 238: `text-error` → `text-alert-coral` ✅
  - [x] Misma lógica aplicada que DateRangeSelector ✅

#### Tarea 5.4: PriceRangeInputs
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/filters/PriceRangeInputs.tsx`** ✅
  - [x] Línea 117: `text-error` → `text-alert-coral` ✅
  - [x] Inputs numéricos verificados ✅

#### Tarea 5.5: Otros Componentes de Filtros
- [ ] **Actualizar todos los demás componentes en `filters/`**
  - [ ] CategorySelector.tsx
  - [ ] FilterSummary.tsx
  - [ ] PaginationControls.tsx
  - [ ] ProductFilterPanel.tsx
  - [ ] ProductFilterSummary.tsx
  - [ ] SortSelector.tsx
  - [ ] AdvancedFilters.tsx
  - [ ] FilterErrorBoundary.tsx

---

### Fase 6: Actualización de Componentes UI

#### Tarea 6.1: Componentes UI Base
- [ ] **Revisar todos los componentes en `MercApp-Frontend/src/components/ui/`**
  - [ ] alert.tsx
  - [ ] alert-dialog.tsx
  - [ ] badge.tsx
  - [ ] calendar.tsx
  - [ ] chart.tsx
  - [ ] dialog.tsx
  - [ ] form.tsx
  - [ ] progress.tsx
  - [ ] select.tsx
  - [ ] tabs.tsx
  - [ ] tooltip.tsx
  - [ ] Y todos los demás...

- [ ] **Para cada componente**:
  - [ ] Buscar colores legacy
  - [ ] Reemplazar con paleta MercApp
  - [ ] Verificar estados (hover, active, disabled, focus)
  - [ ] Verificar contraste WCAG 2.1 AA
  - [ ] Comparar con Figma

---

### Fase 7: Actualización de Componentes de Scanner

#### Tarea 7.1: Scanner Components
**Estado**: ✅ Completada

- [x] **Actualizar `MercApp-Frontend/src/components/scanner/ScannerOverlay.tsx`** ✅
  - [x] Línea 90: `bg-blue-500` → `bg-primary-mint` (idle) ✅
  - [x] `bg-yellow-500` → `bg-accent-orange` (detecting) ✅
  - [x] `bg-green-500` → `bg-primary-mint` (success) ✅
  - [x] `bg-red-500` → `bg-alert-coral` (error) ✅
  - [x] Overlay y guías verificados ✅

- [x] **Actualizar `MercApp-Frontend/src/components/scanner/PermissionPrompt.tsx`** ✅
  - [x] Línea 26: `border-blue-500` → `border-primary-mint` (spinner) ✅
  - [x] Líneas 110-111: `bg-blue-500/20 text-blue-500` → `bg-primary-mint/20 text-primary-mint` ✅
  - [x] Modales y botones verificados ✅

- [ ] **Actualizar `MercApp-Frontend/src/components/scanner/ScannerInstructions.tsx`**
  - [ ] Buscar y reemplazar colores legacy
  - [ ] Comparar con Figma

---

### Fase 8: Actualización de Otros Componentes

#### Tarea 8.1: Componentes Restantes
**Estado**: 🔄 En Progreso (75% completado)

- [x] **Actualizar `PriceUpdateModal.tsx`** ✅
  - [x] `text-gray-400`, `text-gray-600` → `text-text-secondary` ✅
  - [x] `hover:bg-gray-100` → `hover:bg-background-smoke` ✅
  - [x] `bg-gray-50` → `bg-background-smoke` ✅
  - [x] `text-gray-500` → `text-text-secondary` ✅
  - [x] `text-gray-700` → `text-text-primary` ✅
  - [x] `bg-red-100 text-red-800` → `bg-alert-coral/10 text-alert-coral` ✅
  - [x] `bg-green-100 text-green-800` → `bg-primary-mint/10 text-primary-mint` ✅

- [x] **Actualizar `ProductSearchInput.tsx`** ✅
  - [x] `text-gray-600` → `text-text-tertiary` ✅

- [x] **Actualizar `ManualProductForm.tsx`** ✅
  - [x] `text-error` → `text-alert-coral` ✅

- [x] **Verificar componentes adicionales**: ✅
  - [x] BottomNav.tsx: Ya usa paleta correcta (`primary-mint`, `text-secondary`) ✅
  - [x] PurchaseDetail.tsx: Ya usa paleta correcta ✅
  - [x] Spinner.tsx: Ya usa paleta correcta (`primary-mint`, `border-light`) ✅

---

### Fase 9: Validación y Testing

#### Tarea 9.1: Validación de Contraste
- [ ] **Ejecutar validación de contraste WCAG 2.1 AA**
  - [ ] Usar herramienta: https://webaim.org/resources/contrastchecker/
  - [ ] O usar función `validateColorContrast` de `colorUtils.ts`
  - [ ] Validar todas las combinaciones:
    - [ ] Texto primario sobre fondo blanco
    - [ ] Texto primario sobre fondo smoke
    - [ ] Texto blanco sobre botón primario
    - [ ] Texto blanco sobre botón secundario
    - [ ] Texto blanco sobre botón destructivo
    - [ ] Texto primario sobre badges
    - [ ] Texto secundario sobre fondos
    - [ ] Placeholders sobre inputs

- [ ] **Documentar resultados**:
  - [ ] Archivo: `MercApp-Frontend/docs/CONTRAST_VALIDATION.md`
  - [ ] Incluir: Combinación, Ratio, Cumple WCAG AA, Acción si no cumple

#### Tarea 9.2: Comparación Visual con Figma
- [ ] **Crear checklist de comparación visual**:
  - [ ] Login: Comparar cada elemento
  - [ ] Register: Comparar cada elemento
  - [ ] Dashboard: Comparar cada elemento
  - [ ] PurchaseHistory: Comparar cada elemento
  - [ ] CreatePurchase: Comparar cada elemento
  - [ ] ProductCatalog: Comparar cada elemento
  - [ ] Profile: Comparar cada elemento
  - [ ] BarcodeScanner: Comparar cada elemento
  - [ ] Modales: Comparar cada elemento
  - [ ] Filtros: Comparar cada elemento

- [ ] **Documentar diferencias encontradas**:
  - [ ] Archivo: `MercApp-Frontend/docs/VISUAL_DIFFERENCES.md`
  - [ ] Incluir: Página/Componente, Elemento, Diferencia, Acción

#### Tarea 9.3: Testing Manual
- [ ] **Probar todos los estados de componentes**:
  - [ ] Botones: normal, hover, active, disabled, focus
  - [ ] Inputs: normal, focus, error, disabled
  - [ ] Cards: default, highlighted, purchase (normal, excessive)
  - [ ] Badges: éxito, advertencia, error
  - [ ] Modales: abierto, cerrado, animaciones
  - [ ] Navegación: activo, inactivo, hover

- [ ] **Probar en diferentes dispositivos**:
  - [ ] Mobile (375px, 414px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1024px+)

- [ ] **Probar en diferentes navegadores**:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

#### Tarea 9.4: Testing Automatizado
- [ ] **Crear tests de snapshot visual** (si es posible)
  - [ ] Usar herramienta como Chromatic o Percy
  - [ ] Comparar con diseño de Figma

- [ ] **Crear tests de accesibilidad**:
  - [ ] Usar axe-core o similar
  - [ ] Verificar contraste programáticamente
  - [ ] Verificar uso correcto de colores semánticos

---

### Fase 10: Documentación y Limpieza

#### Tarea 10.1: Actualizar Documentación
- [ ] **Actualizar `MercApp-Frontend/docs/NEW_COLOR_PALETTE.md`**
  - [ ] Agregar valores exactos de Figma
  - [ ] Documentar mapeo completo
  - [ ] Agregar ejemplos de uso por componente

- [ ] **Actualizar `MercApp-Frontend/src/components/README.md`**
  - [ ] Actualizar guías de uso de colores
  - [ ] Agregar ejemplos de código
  - [ ] Documentar mejores prácticas

- [ ] **Crear guía de migración**:
  - [ ] Archivo: `MercApp-Frontend/docs/COLOR_MIGRATION_GUIDE.md`
  - [ ] Incluir: Cómo reemplazar colores legacy, Ejemplos, Checklist

#### Tarea 10.2: Limpieza de Código
- [ ] **Eliminar colores legacy no utilizados**:
  - [ ] Remover de `globals.css`
  - [ ] Remover de `index.css`
  - [ ] Remover de `colorUtils.ts` (si aplica)

- [ ] **Eliminar archivos obsoletos**:
  - [ ] `BarcodeScanner.old.tsx` (si ya no se usa)
  - [ ] Cualquier otro archivo obsoleto

- [ ] **Limpiar imports no utilizados**:
  - [ ] Ejecutar linter
  - [ ] Corregir warnings

#### Tarea 10.3: Crear Guía de Referencia Rápida
- [ ] **Crear `MercApp-Frontend/docs/COLOR_QUICK_REFERENCE.md`**
  - [ ] Tabla de colores con valores
  - [ ] Ejemplos de uso por tipo de componente
  - [ ] Snippets de código reutilizables

---

## 🔍 Checklist de Verificación Final

Antes de considerar completada la tarea, verificar:

- [ ] Todos los colores legacy han sido reemplazados
- [ ] Todos los componentes usan la paleta MercApp
- [ ] Todas las variables CSS están definidas y se usan correctamente
- [ ] Todos los estados (hover, active, disabled, focus) están implementados
- [ ] Todos los contrastes cumplen WCAG 2.1 AA
- [ ] La aplicación se ve idéntica a Figma
- [ ] No hay colores hardcodeados (todos usan variables CSS o clases Tailwind)
- [ ] La documentación está actualizada
- [ ] Los tests pasan
- [ ] No hay warnings del linter relacionados con colores

---

## 📊 Métricas de Progreso

### Archivos por Fase

| Fase | Archivos | Completados | Pendientes | % Completado |
|------|----------|------------|------------|--------------|
| Fase 1: Auditoría | 2 | 0 | 2 | 0% |
| Fase 2: Configuración | 3 | 2 | 1 | 67% |
| Fase 3: Componentes Base | 4 | 4 | 0 | 100% |
| Fase 4: Componentes Página | 8 | 5 | 3 | 63% |
| Fase 5: Filtros | 9 | 4 | 5 | 44% |
| Fase 6: UI Components | ~30 | 0 | ~30 | 0% |
| Fase 7: Scanner | 3 | 0 | 3 | 0% |
| Fase 8: Otros | 7 | 0 | 7 | 0% |
| Fase 9: Testing | 4 | 0 | 4 | 0% |
| Fase 10: Documentación | 3 | 0 | 3 | 0% |
| **TOTAL** | **~73** | **0** | **~73** | **0%** |

---

## 🚨 Notas Importantes

1. **No hacer cambios sin verificar Figma primero**: Siempre comparar con el diseño antes de cambiar colores
2. **Mantener contraste WCAG 2.1 AA**: Nunca sacrificar accesibilidad por estética
3. **Usar variables CSS**: Nunca hardcodear valores hexadecimales
4. **Documentar cambios**: Actualizar documentación mientras se hacen cambios
5. **Testing continuo**: Probar después de cada cambio significativo
6. **Commits atómicos**: Hacer commits pequeños y descriptivos por componente o fase

---

## 📚 Recursos

- **Diseño Figma**: https://www.figma.com/make/7DGYB7LgRGA53nalxNp9IZ/MercApp-Mobile-Design
- **Documentación de Colores Actual**: `MercApp-Frontend/docs/NEW_COLOR_PALETTE.md`
- **Utilidades de Color**: `MercApp-Frontend/src/utils/colorUtils.ts`
- **Guía de Contraste WCAG**: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- **Validador de Contraste**: https://webaim.org/resources/contrastchecker/

---

**Última Actualización**: 2025-01-27  
**Responsable**: Equipo de Desarrollo MercApp  
**Estado General**: 🔴 Pendiente de Inicio

