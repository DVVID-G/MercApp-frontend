/**
 * QuaggaJS Configuration Utilities
 * 
 * Functions for generating adaptive QuaggaJS configurations based on device capabilities
 * Feature: 001-barcode-scanner-mobile
 */

import type {
  PerformanceTier,
  QuaggaConfig,
  ScannerConfig,
  DeviceCapabilities,
  BarcodeFormat
} from '../types/scanner.types';

import { TIER_CONFIGS, BARCODE_READERS } from '../types/scanner.types';

/**
 * Map QuaggaJS format string to our BarcodeFormat type
 * QuaggaJS returns formats like 'ean_13', 'upc_a', etc. (lowercase with underscore)
 * We use 'EAN_13', 'UPC_A', etc. (uppercase with underscore)
 */
export function mapQuaggaFormatToBarcodeFormat(quaggaFormat: string): BarcodeFormat | null {
  const formatMap: Record<string, BarcodeFormat> = {
    'ean_13': 'EAN_13',
    'ean_8': 'EAN_8',
    'upc_a': 'UPC_A',
    'upc_e': 'UPC_E',
    'code_128': 'CODE_128',
    'code_39': 'CODE_39'
  };
  
  return formatMap[quaggaFormat.toLowerCase()] || null;
}

/**
 * Get QuaggaJS configuration for a specific performance tier
 * @param tier - Device performance tier (low/medium/high)
 * @returns Partial QuaggaJS configuration optimized for the tier
 */
export function getConfigForTier(tier: PerformanceTier): Partial<QuaggaConfig> {
  const tierConfig = TIER_CONFIGS[tier];
  
  // Convert formats to QuaggaJS reader names
  const readers = tierConfig.formats.map(format => BARCODE_READERS[format]);
  // Remove duplicates (e.g., EAN_13 and EAN_8 both map to 'ean_reader')
  const uniqueReaders = Array.from(new Set(readers));

  return {
    inputStream: {
      type: 'LiveStream',
      target: null, // Will be set when initializing
      constraints: {
        width: { ideal: tierConfig.resolution.width },
        height: { ideal: tierConfig.resolution.height },
        facingMode: 'environment', // Back camera
        aspectRatio: { min: 1, max: 2 }
      }
    },
    decoder: {
      readers: uniqueReaders,
      multiple: false // Only detect one code at a time
    },
    locate: true, // Enable code localization
    locator: {
      halfSample: tierConfig.halfSample,
      patchSize: tierConfig.patchSize
    },
    frequency: tierConfig.fps,
    numOfWorkers: tierConfig.numWorkers
  };
}

/**
 * Generate adaptive QuaggaJS configuration based on device capabilities
 * @param capabilities - Detected device capabilities
 * @param targetElement - DOM element to attach scanner to (optional)
 * @returns Complete QuaggaJS configuration
 */
export function generateAdaptiveConfig(
  capabilities: DeviceCapabilities,
  targetElement?: HTMLElement | null
): QuaggaConfig {
  const baseConfig = getConfigForTier(capabilities.performanceTier);
  
  // Set target element if provided
  if (targetElement && baseConfig.inputStream) {
    baseConfig.inputStream.target = targetElement;
  }
  
  // Override camera facing if device doesn't have back camera
  if (!capabilities.hasBackCamera && capabilities.hasFrontCamera && baseConfig.inputStream) {
    baseConfig.inputStream.constraints.facingMode = 'user';
  }
  
  return baseConfig as QuaggaConfig;
}

/**
 * Get array of QuaggaJS reader names for given barcode formats
 * @param formats - Array of barcode formats to support
 * @returns Array of QuaggaJS reader names (deduplicated)
 */
export function getBarcodeReaders(formats: BarcodeFormat[]): string[] {
  const readers = formats.map(format => BARCODE_READERS[format]);
  return Array.from(new Set(readers));
}

/**
 * Create a custom scanner configuration
 * Useful for overriding default tier configs for testing or special cases
 * @param config - Custom scanner configuration
 * @returns QuaggaJS configuration
 */
export function createCustomConfig(config: Partial<ScannerConfig>): Partial<QuaggaConfig> {
  const readers = config.formats 
    ? getBarcodeReaders(config.formats)
    : ['ean_reader', 'upc_reader', 'code_128_reader'];

  return {
    inputStream: {
      type: 'LiveStream',
      target: null,
      constraints: {
        width: { ideal: config.resolution?.width || 1280 },
        height: { ideal: config.resolution?.height || 720 },
        facingMode: config.cameraFacing || 'environment',
        ...(config.selectedCameraId && { deviceId: config.selectedCameraId })
      }
    },
    decoder: {
      readers,
      multiple: false
    },
    locate: config.locateEnabled ?? true,
    locator: {
      halfSample: config.halfSample ?? true,
      patchSize: config.patchSize || 'medium'
    },
    frequency: config.fps || 10,
    numOfWorkers: config.numWorkers ?? 0
  };
}

/**
 * Validate that a QuaggaJS configuration is complete and valid
 * @param config - Configuration to validate
 * @returns true if valid, false otherwise
 */
export function isValidQuaggaConfig(config: Partial<QuaggaConfig>): config is QuaggaConfig {
  return !!(
    config.inputStream &&
    config.inputStream.type === 'LiveStream' &&
    config.inputStream.constraints &&
    config.decoder &&
    config.decoder.readers &&
    config.decoder.readers.length > 0
  );
}

/**
 * Get recommended FPS for a performance tier
 * Helper function for testing and validation
 * @param tier - Performance tier
 * @returns Recommended frames per second
 */
export function getRecommendedFPS(tier: PerformanceTier): number {
  return TIER_CONFIGS[tier].fps;
}

/**
 * Generate QuaggaJS configuration based on device tier
 * Simplified version of generateAdaptiveConfig for direct tier usage
 * @param tier - Device performance tier ('low' | 'medium' | 'high')
 * @returns QuaggaJS configuration object
 */
export function generateQuaggaConfig(tier: PerformanceTier): QuaggaConfig {
  const baseConfig = getConfigForTier(tier);
  
  return {
    inputStream: {
      type: 'LiveStream',
      target: null,
      constraints: baseConfig.inputStream?.constraints || {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment'
      }
    },
    decoder: baseConfig.decoder || {
      readers: ['ean_reader', 'upc_reader', 'code_128_reader'],
      multiple: false
    },
    locate: baseConfig.locate ?? true,
    locator: baseConfig.locator || {
      halfSample: true,
      patchSize: 'medium'
    },
    frequency: baseConfig.frequency || 10,
    numOfWorkers: baseConfig.numOfWorkers ?? 0
  };
}

