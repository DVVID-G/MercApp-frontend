/**
 * Scanner Types
 * 
 * Centralized type definitions for barcode scanner feature
 * All types are defined locally to avoid build issues with external paths
 * 
 * Feature: 001-barcode-scanner-mobile
 */

// ============================================================================
// Scanner State Machine
// ============================================================================

export type ScannerStatus = 
  | 'idle'              // Not initialized, waiting for user action
  | 'requesting'        // Requesting camera permissions
  | 'initializing'      // Initializing QuaggaJS
  | 'active'            // Actively scanning
  | 'processing'        // Code detected, looking up product
  | 'success'           // Code processed successfully
  | 'error';            // Error at any stage

export interface ScannerState {
  status: ScannerStatus;
  error: ScannerError | null;
  lastResult: ScanResult | null;
  sessionId: string;
  startedAt: Date | null;
  stoppedAt: Date | null;
}

// ============================================================================
// Scan Results
// ============================================================================

export type BarcodeFormat = 
  | 'EAN_13'      // European Article Number (13 digits)
  | 'EAN_8'       // European Article Number (8 digits)
  | 'UPC_A'       // Universal Product Code (12 digits)
  | 'UPC_E'       // Universal Product Code (6 digits, compressed)
  | 'CODE_128'    // Code 128 (variable)
  | 'CODE_39';    // Code 39 (variable)

export type ScanResultAction =
  | 'product_added'        // Product found and added to purchase
  | 'prompt_create'        // Product not found, prompt to create
  | 'duplicate_ignored'    // Code already scanned recently
  | 'low_confidence'       // Detection discarded due to low confidence
  | 'error';               // Error processing

export interface ScanResult {
  // Identification
  id: string;
  sessionId: string;
  
  // Barcode data
  barcode: string;
  format: BarcodeFormat;
  confidence: number;  // 0-100
  
  // Detection metadata
  detectedAt: Date;
  processingTime: number;  // milliseconds
  
  // Lookup result
  product: ProductLookupResult;
  
  // Action taken
  action: ScanResultAction;
}

export interface ProductLookupResult {
  found: boolean;
  product?: {
    id: string;
    nombre: string;
    marca: string;
    precio: number;
    categoria: string;
  };
  error?: string;
}

// ============================================================================
// Error Handling
// ============================================================================

export type ScannerErrorType =
  | 'permission_denied'           // User denied permissions
  | 'permission_blocked'          // Permissions permanently blocked
  | 'camera_not_found'            // No camera available
  | 'camera_in_use'               // Camera in use by another app
  | 'initialization_failed'       // Failed to init QuaggaJS
  | 'stream_interrupted'          // Stream interrupted (call, etc)
  | 'network_error'               // Error looking up product
  | 'decode_error'                // Error decoding barcode
  | 'unknown';                    // Unknown error

export interface ScannerError {
  type: ScannerErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
  timestamp: Date;
  originalError?: any;
}

export interface ErrorMessageConfig {
  user: string;
  action: string;
}

// ============================================================================
// Duplicate Detection
// ============================================================================

export interface DuplicateTracker {
  recentScans: Map<string, Date>;
  cooldownMs: number;
}

// ============================================================================
// Session Management
// ============================================================================

export interface ScanSession {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  
  // Configuration used
  config: any;  // ScannerConfig
  deviceCapabilities: any;  // DeviceCapabilities
  
  // Results
  scansAttempted: number;
  scansSuccessful: number;
  productsFound: number;
  productsCreated: number;
  
  // Errors
  errors: ScannerError[];
  
  // Performance
  avgDetectionTime: number;
  avgProcessingTime: number;
}

// ============================================================================
// Scanner State Constants
// ============================================================================

export const CONFIDENCE_THRESHOLDS = {
  MINIMUM: 75,
  GOOD: 85,
  EXCELLENT: 95
} as const;

export const STORAGE_KEYS = {
  PERMISSION_STATUS: 'mercapp:camera:permission:status',
  DENY_COUNT: 'mercapp:camera:permission:deny_count',
  BLOCKED_AT: 'mercapp:camera:permission:blocked_at',
  LAST_REQUESTED: 'mercapp:camera:permission:last_requested'
} as const;

export const SCANNER_COLORS = {
  IDLE: '#3B82F6',      // Blue
  DETECTING: '#EAB308', // Yellow
  SUCCESS: '#22C55E',   // Green
  ERROR: '#EF4444',     // Red
  OPACITY_ACTIVE: 0.8,
  OPACITY_IDLE: 0.5
} as const;

export const ANIMATION_DURATIONS = {
  STATE_TRANSITION: 200,
  SUCCESS_HOLD: 500,
  ERROR_SHAKE: 300,
  PULSE_CYCLE: 1500,
} as const;

// ============================================================================
// Permission Types
// ============================================================================

export type PermissionStatus = 
  | 'not_requested'     // Never requested permission
  | 'requesting'        // Request in progress
  | 'granted'           // User granted permission
  | 'denied'            // User denied (temporary, can retry)
  | 'blocked';          // Permanently blocked by browser

export interface PermissionState {
  status: PermissionStatus;
  lastRequested: Date | null;
  denyCount: number;
  blockedAt: Date | null;
  instructions: PermissionInstructions | null;
}

export interface PermissionResult {
  state: PermissionStatus;
  error?: string;
  blockedUntil?: Date;
}

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';
export type Browser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'other';

export interface PermissionInstructions {
  title: string;
  steps: string[];
  platform: Platform;
}

export interface UsePermissionsReturn {
  permissionState: PermissionState;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<PermissionStatus>;
  getInstructions: () => PermissionInstructions | null;
  resetPermissionState: () => void;
}

// ============================================================================
// Device Capabilities
// ============================================================================

export type PerformanceTier = 'low' | 'medium' | 'high';

export interface DeviceCapabilities {
  // Hardware
  hasCamera: boolean;
  cameraCount: number;
  hasBackCamera: boolean;
  hasFrontCamera: boolean;
  
  // APIs
  supportsGetUserMedia: boolean;
  supportsVibration: boolean;
  supportsPermissionsAPI: boolean;
  
  // Performance
  cpuCores: number;
  memoryGB: number;
  performanceTier: PerformanceTier;
  
  // Platform
  platform: Platform;
  browser: Browser;
  isMobile: boolean;
}

// ============================================================================
// Scanner Configuration
// ============================================================================

export type CameraFacing = 'environment' | 'user';  // back | front
export type PatchSize = 'small' | 'medium' | 'large';

export interface ScannerConfig {
  // Video settings
  resolution: {
    width: number;
    height: number;
  };
  
  // Camera preference
  cameraFacing: CameraFacing;
  selectedCameraId: string | null;
  
  // Performance settings
  fps: number;
  halfSample: boolean;
  patchSize: PatchSize;
  numWorkers: number;
  
  // Detection settings
  formats: BarcodeFormat[];
  confidenceThreshold: number;
  locateEnabled: boolean;
  
  // UX settings
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

// ============================================================================
// QuaggaJS Native Types
// ============================================================================

export interface QuaggaInputStreamConfig {
  type: 'LiveStream';
  target: HTMLElement | string | null;
  constraints: {
    width: { min?: number; ideal?: number; max?: number };
    height: { min?: number; ideal?: number; max?: number };
    facingMode?: 'environment' | 'user';
    deviceId?: string;
    aspectRatio?: { min?: number; max?: number };
  };
}

export interface QuaggaDecoderConfig {
  readers: string[];  // e.g., ['ean_reader', 'upc_reader']
  multiple?: boolean;
}

export interface QuaggaLocatorConfig {
  halfSample: boolean;
  patchSize: PatchSize;
}

export interface QuaggaConfig {
  inputStream: QuaggaInputStreamConfig;
  decoder: QuaggaDecoderConfig;
  locate: boolean;
  locator?: QuaggaLocatorConfig;
  frequency?: number;
  numOfWorkers?: number;
}

export interface QuaggaResult {
  codeResult: {
    code: string;
    format: string;
    confidence?: number;
  };
  line?: any;
  angle?: number;
  pattern?: any;
  box?: Array<[number, number]>;
}

// ============================================================================
// Adaptive Config Tiers
// ============================================================================

export interface TierConfig {
  resolution: { width: number; height: number };
  fps: number;
  halfSample: boolean;
  patchSize: PatchSize;
  numWorkers: number;
  formats: BarcodeFormat[];
}

export const TIER_CONFIGS: Record<PerformanceTier, TierConfig> = {
  low: {
    resolution: { width: 640, height: 480 },
    fps: 5,
    halfSample: true,
    patchSize: 'large',
    numWorkers: 0,
    formats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E']
  },
  medium: {
    resolution: { width: 1280, height: 720 },
    fps: 10,
    halfSample: true,
    patchSize: 'medium',
    numWorkers: 0,
    formats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128']
  },
  high: {
    resolution: { width: 1920, height: 1080 },
    fps: 15,
    halfSample: false,
    patchSize: 'small',
    numWorkers: 2,
    formats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39']
  }
};

// ============================================================================
// Format Mapping (QuaggaJS reader names)
// ============================================================================

export const BARCODE_READERS: Record<BarcodeFormat, string> = {
  EAN_13: 'ean_reader',
  EAN_8: 'ean_reader',
  UPC_A: 'upc_reader',
  UPC_E: 'upc_reader',
  CODE_128: 'code_128_reader',
  CODE_39: 'code_39_reader'
};

// ============================================================================
// Hooks Interfaces
// ============================================================================

export interface UseBarcodeScanner {
  // State
  state: ScannerState;
  isScanning: boolean;
  error: ScannerError | null;
  lastResult: ScanResult | null;
  
  // Actions
  startScanning: () => Promise<void>;
  stopScanning: () => Promise<void>;
  reset: () => void;
  
  // Session
  sessionId: string | null;
}

export interface UseBarcodeScannerPermissions {
  permissionState: PermissionState;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<'granted' | 'denied' | 'blocked' | 'not_requested'>;
  getInstructions: () => { title: string; steps: string[]; platform: string } | null;
  resetPermissionState: () => void;
}

export interface UseDeviceCapabilities {
  capabilities: DeviceCapabilities | null;
  isLoading: boolean;
  error: Error | null;
  recommendedConfig: ScannerConfig | null;
  refresh: () => Promise<void>;
}

export type FeedbackType = 'success' | 'error' | 'detecting';

export interface UseScannerFeedback {
  triggerVibration: (type: FeedbackType) => void;
  triggerSound: (type: FeedbackType) => void;
  showVisualFeedback: (type: FeedbackType, duration?: number) => void;
  supportsVibration: boolean;
  supportsSound: boolean;
}

export interface UseVisibilityPause {
  isVisible: boolean;
  isPaused: boolean;
}

export interface UseStreamMonitor {
  isStreamActive: boolean;
  isStreamInterrupted: boolean;
  streamError: Error | null;
  retryStream: () => Promise<void>;
}

export interface UseDuplicateDetection {
  isDuplicate: (barcode: string) => boolean;
  trackScan: (barcode: string) => void;
  clearTracking: () => void;
  getRecentScans: () => Array<{ barcode: string; timestamp: Date }>;
}

// ============================================================================
// Feedback Types
// ============================================================================

export interface VibrationPattern {
  pattern: number | number[];
  description: string;
}

export const VIBRATION_PATTERNS: Record<string, VibrationPattern> = {
  SUCCESS: {
    pattern: [50, 30, 50],
    description: 'Code detected successfully'
  },
  ERROR: {
    pattern: [100],
    description: 'Reading error'
  },
  DETECTING: {
    pattern: [20],
    description: 'Code partially visible'
  }
} as const;

export type FeedbackIcon = 'search' | 'check' | 'error' | 'loader';

export interface FeedbackState {
  color: string;
  message: string;
  icon?: FeedbackIcon;
  vibration?: keyof typeof VIBRATION_PATTERNS;
}

export type ScannerVisualState = 'idle' | 'detecting' | 'success' | 'error';

export interface FrameClasses {
  idle: string;
  detecting: string;
  success: string;
  error: string;
}

export const DEFAULT_FRAME_CLASSES: FrameClasses = {
  idle: 'border-blue-500 animate-pulse',
  detecting: 'border-yellow-500 transition-colors duration-200',
  success: 'border-green-500 scale-105 transition-all duration-200',
  error: 'border-red-500 animate-shake'
};

// ============================================================================
// Additional Hook Types (for useBarcodeScanner)
// ============================================================================

export interface UseScannerOptions {
  onScanSuccess: (code: string) => void;
  onScanError?: (error: any) => void;
  autoPauseOnBlur?: boolean;
  duplicateCooldown?: number;
}

export interface BarcodeResult {
  code: string;
  format: string;
  timestamp: number;
}
