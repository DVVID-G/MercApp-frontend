/**
 * Scanner Types
 * 
 * Centralized type definitions for barcode scanner feature
 * Imports from contracts in specs directory
 * 
 * Feature: 001-barcode-scanner-mobile
 */

// Re-export all scanner state types
export type {
  ScannerStatus,
  ScannerState,
  BarcodeFormat,
  ScanResultAction,
  ScanResult,
  ProductLookupResult,
  ScannerErrorType,
  ScannerError,
  ErrorMessageConfig,
  DuplicateTracker,
  ScanSession
} from '../../../specs/001-barcode-scanner-mobile/contracts/scanner-state.interface';

// Re-export scanner state constants
export {
  CONFIDENCE_THRESHOLDS,
  STORAGE_KEYS,
  SCANNER_COLORS,
  ANIMATION_DURATIONS
} from '../../../specs/001-barcode-scanner-mobile/contracts/scanner-state.interface';

// Re-export permission types
export type {
  PermissionStatus,
  PermissionState,
  PermissionResult,
  PermissionInstructions,
  Platform,
  Browser,
  UsePermissionsReturn
} from '../../../specs/001-barcode-scanner-mobile/contracts/permission.interface';

// Re-export QuaggaJS config types
export type {
  PerformanceTier,
  DeviceCapabilities,
  CameraFacing,
  PatchSize,
  ScannerConfig,
  QuaggaInputStreamConfig,
  QuaggaDecoderConfig,
  QuaggaLocatorConfig,
  QuaggaConfig,
  QuaggaResult,
  TierConfig
} from '../../../specs/001-barcode-scanner-mobile/contracts/quagga-config.interface';

// Re-export QuaggaJS constants
export {
  TIER_CONFIGS,
  BARCODE_READERS
} from '../../../specs/001-barcode-scanner-mobile/contracts/quagga-config.interface';

// Re-export hooks interfaces
export type {
  UseBarcodeScanner,
  UseBarcodeScannerPermissions,
  UseDeviceCapabilities,
  FeedbackType,
  UseScannerFeedback,
  UseVisibilityPause,
  UseStreamMonitor,
  UseDuplicateDetection
} from '../../../specs/001-barcode-scanner-mobile/contracts/hooks.interface';

// Re-export feedback types
export type {
  VibrationPattern,
  FeedbackIcon,
  FeedbackState,
  ScannerVisualState,
  FrameClasses
} from '../../../specs/001-barcode-scanner-mobile/contracts/feedback.interface';

// Re-export feedback constants
export {
  VIBRATION_PATTERNS,
  DEFAULT_FRAME_CLASSES
} from '../../../specs/001-barcode-scanner-mobile/contracts/feedback.interface';

