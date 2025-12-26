# Escáner de Códigos de Barras

## Descripción

Sistema completo de escaneo de códigos de barras optimizado para dispositivos móviles usando QuaggaJS, con gestión inteligente de permisos de cámara, feedback visual/táctil y configuración adaptativa según las capacidades del dispositivo.

## Características

### ✅ Gestión de Permisos (US1)
- **Solicitud automática** de permisos de cámara al iniciar
- **Detección de bloqueo permanente** después de 2 denegaciones
- **Instrucciones de recuperación** específicas por plataforma (iOS/Safari, Android/Chrome, Desktop)
- **Persistencia de estado** en localStorage

### ✅ Feedback Visual (US2)
- **Marco de guía animado** con cambio de color según estado:
  - 🔵 **Azul (idle)**: Esperando código
  - 🟡 **Amarillo (detecting)**: Detectando código
  - 🟢 **Verde (success)**: Código leído correctamente
  - 🔴 **Rojo (error)**: Error en la lectura
- **Vibración táctil** (Vibration API):
  - Doble pulso (50ms, pausa 30ms, 50ms) en éxito
  - Pulso único (100ms) en error
  - Pulso corto (20ms) al detectar
- **Mensajes contextuales** y animaciones fluidas

### ✅ Optimización Móvil con QuaggaJS (US3)
- **Configuración adaptativa** en 3 niveles:
  - **Low tier** (2 cores, <2GB RAM): 320px, 5 FPS, sin locate
  - **Medium tier** (4 cores, 4GB RAM): 640px, 10 FPS, con locate
  - **High tier** (8+ cores, 8GB+ RAM): 1280px, 10 FPS, 4 workers
- **Lifecycle management**:
  - Auto-pausa en cambio de pestaña (blur/focus)
  - Manejo de interrupciones de stream
  - Cleanup completo en unmount
- **Performance**: <40% CPU, detección en <3s, 90% precisión

### ✅ Prevención de Duplicados
- **Cooldown configurable** (por defecto 500ms) entre escaneos del mismo código
- **Tracking de scans recientes** (últimos 10)

## Uso

### Componente Principal

```tsx
import { BarcodeScanner } from '@/components/BarcodeScanner';

function MyComponent() {
  const handleScan = (code: string) => {
    console.log('Código escaneado:', code);
    // Buscar producto, agregar a compra, etc.
  };

  const handleClose = () => {
    // Cerrar modal/vista
  };

  const handleManualEntry = () => {
    // Abrir input manual como fallback
  };

  return (
    <BarcodeScanner
      onScan={handleScan}
      onClose={handleClose}
      onManualEntry={handleManualEntry}
      vibrationEnabled={true}      // Opcional, por defecto true
      autoPauseOnBlur={true}       // Opcional, por defecto true
    />
  );
}
```

### Hooks Disponibles

#### `useBarcodeScannerPermissions()`
Gestiona el estado de permisos de cámara.

```tsx
import { useBarcodeScannerPermissions } from '@/hooks/useBarcodeScannerPermissions';

const {
  permissionState,        // { status, lastRequested, denyCount, blockedAt, instructions }
  requestPermission,      // () => Promise<boolean>
  checkPermission,        // () => Promise<PermissionStatus>
  getInstructions,        // () => PermissionInstructions | null
  resetPermissionState    // () => void
} = useBarcodeScannerPermissions();
```

**Estados de permiso**: `not_requested` | `requesting` | `granted` | `denied` | `blocked`

#### `useBarcodeScanner(options)`
Hook principal para escaneo de códigos.

```tsx
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

const {
  scannerState,          // 'idle' | 'success' | 'error'
  isScanning,            // boolean
  lastScannedCode,       // BarcodeResult | null
  error,                 // string | null
  startScanning,         // (containerId: string) => Promise<void>
  stopScanning,          // () => void
  pauseScanning,         // () => void
  resumeScanning         // () => Promise<void>
} = useBarcodeScanner({
  onScanSuccess: (code: string) => {},
  onScanError: (error: any) => {},
  autoPauseOnBlur: true,
  duplicateCooldown: 500
});
```

#### `useDeviceCapabilities()`
Detecta capacidades del dispositivo y genera configuración adaptativa.

```tsx
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

const {
  capabilities,          // DeviceCapabilities | null
  tier,                  // 'low' | 'medium' | 'high'
  isLoading,             // boolean
  getQuaggaConfig        // () => QuaggaConfig
} = useDeviceCapabilities();
```

## Componentes Auxiliares

### `PermissionPrompt`
Muestra UI para solicitud/recuperación de permisos.

```tsx
<PermissionPrompt
  permissionState={permissionState}
  onRequestPermission={requestPermission}
/>
```

### `ScannerOverlay`
Marco visual con feedback de estado.

```tsx
<ScannerOverlay
  state="idle" // 'idle' | 'detecting' | 'success' | 'error'
  vibrationEnabled={true}
/>
```

### `ScannerInstructions`
Instrucciones y formatos soportados.

```tsx
<ScannerInstructions />
```

## Formatos Soportados

- **EAN-13** (European Article Number)
- **EAN-8** (8 dígitos)
- **UPC-A** (Universal Product Code)
- **UPC-E** (6 dígitos)
- **Code 128** (alfanumérico)

## Arquitectura

```
src/
├── components/
│   ├── BarcodeScanner.tsx          # Componente principal
│   └── scanner/
│       ├── PermissionPrompt.tsx     # UI de permisos
│       ├── ScannerOverlay.tsx       # Feedback visual
│       ├── ScannerInstructions.tsx  # Instrucciones
│       └── index.ts                 # Barrel export
├── hooks/
│   ├── useBarcodeScannerPermissions.ts  # Hook de permisos
│   ├── useBarcodeScanner.ts            # Hook principal de escaneo
│   ├── useDeviceCapabilities.ts        # Detección de dispositivo
│   └── index.ts                         # Barrel export
├── utils/
│   ├── quagga-config.ts            # Configuración QuaggaJS
│   ├── device-detection.ts         # Detección de capacidades
│   ├── barcode-validation.ts       # Validación de códigos
│   ├── duplicate-detection.ts      # Prevención de duplicados
│   ├── scanner-storage.ts          # Persistencia localStorage
│   └── scanner-feedback.ts         # Utilidades de feedback
└── types/
    └── scanner.types.ts            # Tipos TypeScript

tests/
├── hooks/
│   ├── useBarcodeScannerPermissions.test.ts
│   ├── useBarcodeScanner.test.ts
│   └── useDeviceCapabilities.test.ts
├── components/
│   └── scanner/
│       ├── PermissionPrompt.test.tsx
│       ├── ScannerOverlay.test.tsx
│       ├── ScannerInstructions.test.tsx
│       └── FeedbackIntegration.test.tsx
└── utils/
    ├── quagga-config.test.ts
    ├── device-detection.test.ts
    ├── barcode-validation.test.ts
    ├── duplicate-detection.test.ts
    └── scanner-feedback.test.ts
```

## Pruebas

### Ejecutar Tests

```bash
npm run test                    # Todos los tests
npm run test:coverage           # Con cobertura
npm run test -- scanner         # Solo tests del scanner
```

### Cobertura Esperada
- **Backend**: ≥80% (constitution requirement)
- **Frontend**: ≥70% (constitution requirement)

### Tests Manuales Recomendados

1. **Dispositivos reales**:
   - iOS Safari (iPhone)
   - Android Chrome (Samsung/Pixel)
   - Gama baja, media y alta

2. **Casos Edge**:
   - Iluminación pobre
   - Códigos dañados
   - Múltiples códigos en vista
   - Denegación y recuperación de permisos

3. **Lifecycle**:
   - Cambio de orientación
   - Cambio de pestaña (blur/focus)
   - Interrupciones de stream

## Troubleshooting

### "No se puede inicializar la cámara"
1. Verificar permisos en configuración del navegador
2. Revisar que el sitio usa HTTPS (required por getUserMedia)
3. Comprobar que el dispositivo tiene cámara disponible

### "Permisos bloqueados"
1. Seguir instrucciones específicas de la plataforma mostradas
2. En iOS: Configuración → Safari → Cámara → Permitir
3. En Android: Tocar ícono de candado → Permisos → Cámara
4. En Desktop: Clic en ícono de cámara en barra de direcciones

### "Detección muy lenta"
1. El escáner se adapta automáticamente al dispositivo
2. Dispositivos de gama baja usan configuración reducida
3. Asegurar buena iluminación
4. Mantener código estable dentro del marco

### "Código no detectado"
1. Verificar que el formato es soportado (EAN-13, UPC, Code-128)
2. Asegurar que el código está completo y legible
3. Ajustar distancia (15-30cm recomendado)
4. Usar botón "Ingresar Manualmente" como fallback

## Performance

### Métricas Objetivo
- **CPU Usage**: <40%
- **Detection Time**: <3 segundos
- **Accuracy**: >90%
- **FPS**: 5-10 según tier

### Optimizaciones Implementadas
- React.memo para componentes
- useCallback para callbacks
- Lazy loading de QuaggaJS
- Configuración adaptativa por tier
- Auto-pausa en background
- Cleanup completo de recursos

## Accesibilidad (WCAG 2.1 AA)

- ✅ ARIA labels en todos los controles
- ✅ Touch targets ≥44x44px
- ✅ Mensajes de estado con aria-live
- ✅ Alto contraste en feedback visual
- ✅ Feedback multi-modal (visual + táctil)
- ✅ Fallback a entrada manual

## Licencias

- **QuaggaJS**: MIT License (@ericblade/quagga2)
- **MercApp**: Propietario

## Changelog

### v2.0.0 (2025-12-26)
- ✨ Migración completa a QuaggaJS
- ✨ Sistema de permisos con detección de bloqueo
- ✨ Feedback visual y táctil mejorado
- ✨ Configuración adaptativa por dispositivo
- ✨ Auto-pausa y lifecycle management
- ✨ Prevención de duplicados
- ✨ Accesibilidad WCAG 2.1 AA
- 🗑️ Eliminada dependencia html5-qrcode

### v1.0.0
- Implementación inicial con html5-qrcode (deprecada)

## Referencias

- [QuaggaJS Documentation](https://github.com/ericblade/quagga2)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

