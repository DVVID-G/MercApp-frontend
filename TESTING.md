# Guía de Testing - MercApp Frontend

## 🧪 Configuración de Testing

Este proyecto usa **Vitest** como framework de testing, con React Testing Library para componentes.

### Dependencias Instaladas

- `vitest` - Framework de testing
- `@vitest/ui` - Interfaz gráfica para tests
- `@testing-library/react` - Testing de componentes React
- `@testing-library/user-event` - Simulación de interacciones de usuario
- `@testing-library/jest-dom` - Matchers personalizados para DOM
- `jsdom` - Entorno DOM para tests

---

## 🚀 Comandos de Testing

### Ejecutar Tests

```bash
# Modo watch (se re-ejecuta al detectar cambios)
npm test

# Ejecutar todos los tests una vez
npm run test:run

# Ejecutar con interfaz gráfica
npm run test:ui

# Ejecutar con cobertura de código
npm run test:coverage
```

---

## 📊 Cobertura de Código

### Objetivos (según constitution.md)

- **Backend**: ≥80% de cobertura
- **Frontend**: ≥70% de cobertura

### Ver Reporte de Cobertura

```bash
npm run test:coverage

# El reporte HTML se genera en:
# coverage/index.html
```

### Archivos Excluidos de Cobertura

- `src/**/*.test.{ts,tsx}` - Tests
- `src/**/*.spec.{ts,tsx}` - Specs
- `src/__mocks__/**` - Mocks
- `src/test/**` - Setup de testing
- `src/types/**` - Definiciones de tipos
- `src/**/*.d.ts` - Archivos de declaración

---

## 🏗️ Estructura de Testing

```
MercApp-Frontend/
├── src/
│   ├── test/
│   │   └── setup.ts           # Configuración global de tests
│   └── __mocks__/
│       ├── quagga.ts           # Mock de QuaggaJS
│       └── mediaDevices.ts     # Mock de MediaDevices API
├── tests/
│   ├── hooks/
│   │   └── *.test.ts          # Tests de hooks
│   ├── components/
│   │   └── *.test.tsx         # Tests de componentes
│   └── utils/
│       └── *.test.ts          # Tests de utilidades
└── vitest.config.ts           # Configuración de Vitest
```

---

## ✍️ Escribir Tests

### Ejemplo: Test de Hook

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

describe('useBarcodeScanner', () => {
  beforeEach(() => {
    // Setup
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useBarcodeScanner({
      onScanSuccess: vi.fn(),
      onScanError: vi.fn()
    }));

    expect(result.current.scannerState).toBe('idle');
  });
});
```

### Ejemplo: Test de Componente

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScannerOverlay } from '@/components/scanner/ScannerOverlay';

describe('ScannerOverlay', () => {
  it('should render with idle state', () => {
    render(<ScannerOverlay state="idle" />);
    
    const frame = screen.getByTestId('scanner-frame');
    expect(frame).toBeInTheDocument();
    expect(frame.className).toContain('border-scanner-idle');
  });
});
```

---

## 🔧 Configuración

### vitest.config.ts

- **Environment**: `jsdom` (para DOM testing)
- **Globals**: Habilitado (no necesitas importar `describe`, `it`, etc.)
- **Setup**: `src/test/setup.ts` se ejecuta antes de cada suite
- **Coverage**: Configurado con `v8` provider

### src/test/setup.ts

- Importa `@testing-library/jest-dom` para matchers
- Configura cleanup automático después de cada test
- Mockea APIs del navegador:
  - `navigator.mediaDevices`
  - `navigator.permissions`
  - `navigator.vibrate`
  - `window.matchMedia`
  - `IntersectionObserver`
  - `ResizeObserver`

---

## 🎯 Tests del Scanner de Códigos

### Cobertura Actual

**80+ tests implementados** para el scanner de códigos de barras:

#### Hooks (25 tests)
- `useBarcodeScannerPermissions` - 8 tests
- `useBarcodeScanner` - 12 tests
- `useDeviceCapabilities` - 5 tests

#### Componentes (26 tests)
- `PermissionPrompt` - 6 tests
- `ScannerOverlay` - 6 tests
- `ScannerInstructions` - 4 tests
- `FeedbackIntegration` - 10 tests

#### Utilidades (29 tests)
- `quagga-config` - 6 tests
- `device-detection` - 4 tests
- `barcode-validation` - 5 tests
- `duplicate-detection` - 4 tests
- `scanner-feedback` - 10 tests

---

## 🐛 Debugging Tests

### Modo Watch con UI

```bash
npm run test:ui
```

Abre una interfaz gráfica en `http://localhost:51204` que permite:
- Ver tests en tiempo real
- Ejecutar tests individuales
- Ver stacktraces detallados
- Explorar cobertura visualmente

### Debug en VSCode

1. Agregar configuración en `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

2. Poner breakpoints en los tests
3. Presionar F5 para iniciar debugging

---

## 📝 Best Practices

### 1. Nomenclatura

- Archivos de test: `*.test.ts` o `*.test.tsx`
- Mocks: `src/__mocks__/[moduleName].ts`
- Setup: `src/test/setup.ts`

### 2. Estructura de Tests

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup común
  });

  describe('when condition', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 3. Usar Testing Library Queries

**Orden de preferencia**:
1. `getByRole` - Accesibilidad first
2. `getByLabelText` - Para inputs
3. `getByText` - Para texto visible
4. `getByTestId` - Solo cuando no hay alternativa

### 4. Async Testing

```typescript
// Esperar a que algo aparezca
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// Queries async
const button = await screen.findByRole('button');
```

### 5. Mocks

```typescript
import { vi } from 'vitest';

// Mock de función
const mockFn = vi.fn();

// Mock de módulo
vi.mock('@/services/api', () => ({
  fetchData: vi.fn()
}));

// Limpiar mocks
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## 🚨 Solución de Problemas

### Error: Cannot find module 'vitest'

```bash
npm install -D vitest @vitest/ui
```

### Tests no encuentran componentes

Verificar que `vitest.config.ts` tenga:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts']
}
```

### Mocks no funcionan

1. Verificar que los mocks estén en `src/__mocks__/`
2. Usar `vi.mock()` en los tests
3. Limpiar mocks con `vi.clearAllMocks()` en `beforeEach`

### Cobertura baja

```bash
npm run test:coverage
# Abrir coverage/index.html para ver qué falta
```

---

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Vitest UI](https://vitest.dev/guide/ui.html)

---

## ✅ Checklist de Testing

Antes de hacer commit:

- [ ] Todos los tests pasan (`npm run test:run`)
- [ ] Cobertura cumple requisitos (≥70% frontend)
- [ ] No hay tests skipped (`it.skip`, `describe.skip`)
- [ ] Mocks están correctamente configurados
- [ ] Tests son independientes y no tienen side effects
- [ ] Nombres de tests son descriptivos
- [ ] Se usan queries accesibles (`getByRole`)

