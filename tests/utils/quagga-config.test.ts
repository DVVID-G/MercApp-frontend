/**
 * Tests for QuaggaJS Configuration Utilities
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect } from 'vitest';
import {
  getConfigForTier,
  generateAdaptiveConfig,
  getBarcodeReaders,
  createCustomConfig,
  isValidQuaggaConfig,
  getRecommendedFPS
} from '../../src/utils/quagga-config';
import type { DeviceCapabilities } from '../../src/types/scanner.types';

describe('quagga-config utilities', () => {
  describe('getConfigForTier', () => {
    it('should return low tier config with correct fps', () => {
      const config = getConfigForTier('low');
      
      expect(config.frequency).toBe(5);
      expect(config.inputStream?.constraints.width?.ideal).toBe(640);
      expect(config.inputStream?.constraints.height?.ideal).toBe(480);
      expect(config.locator?.halfSample).toBe(true);
      expect(config.locator?.patchSize).toBe('large');
      expect(config.numOfWorkers).toBe(0);
    });

    it('should return medium tier config with correct fps', () => {
      const config = getConfigForTier('medium');
      
      expect(config.frequency).toBe(10);
      expect(config.inputStream?.constraints.width?.ideal).toBe(1280);
      expect(config.inputStream?.constraints.height?.ideal).toBe(720);
      expect(config.locator?.patchSize).toBe('medium');
    });

    it('should return high tier config with correct fps', () => {
      const config = getConfigForTier('high');
      
      expect(config.frequency).toBe(15);
      expect(config.inputStream?.constraints.width?.ideal).toBe(1920);
      expect(config.inputStream?.constraints.height?.ideal).toBe(1080);
      expect(config.locator?.halfSample).toBe(false);
      expect(config.numOfWorkers).toBe(2);
    });

    it('should include correct readers for each tier', () => {
      const lowConfig = getConfigForTier('low');
      const mediumConfig = getConfigForTier('medium');
      const highConfig = getConfigForTier('high');
      
      // Low tier has fewer formats
      expect(lowConfig.decoder?.readers).toContain('ean_reader');
      expect(lowConfig.decoder?.readers).toContain('upc_reader');
      
      // Medium adds CODE_128
      expect(mediumConfig.decoder?.readers).toContain('code_128_reader');
      
      // High has all formats
      expect(highConfig.decoder?.readers).toContain('code_39_reader');
    });
  });

  describe('generateAdaptiveConfig', () => {
    it('should generate config for low tier mobile device', () => {
      const capabilities: DeviceCapabilities = {
        hasCamera: true,
        cameraCount: 1,
        hasBackCamera: true,
        hasFrontCamera: false,
        supportsGetUserMedia: true,
        supportsVibration: true,
        supportsPermissionsAPI: false,
        cpuCores: 4,
        memoryGB: 2,
        performanceTier: 'low',
        platform: 'android',
        browser: 'chrome',
        isMobile: true
      };

      const config = generateAdaptiveConfig(capabilities);
      
      expect(config.frequency).toBe(5);
      expect(config.inputStream.constraints.facingMode).toBe('environment');
    });

    it('should use front camera if back camera not available', () => {
      const capabilities: DeviceCapabilities = {
        hasCamera: true,
        cameraCount: 1,
        hasBackCamera: false,
        hasFrontCamera: true,
        supportsGetUserMedia: true,
        supportsVibration: false,
        supportsPermissionsAPI: false,
        cpuCores: 6,
        memoryGB: 4,
        performanceTier: 'medium',
        platform: 'ios',
        browser: 'safari',
        isMobile: true
      };

      const config = generateAdaptiveConfig(capabilities);
      
      expect(config.inputStream.constraints.facingMode).toBe('user');
    });

    it('should attach to target element if provided', () => {
      const capabilities: DeviceCapabilities = {
        hasCamera: true,
        cameraCount: 2,
        hasBackCamera: true,
        hasFrontCamera: true,
        supportsGetUserMedia: true,
        supportsVibration: true,
        supportsPermissionsAPI: true,
        cpuCores: 8,
        memoryGB: 8,
        performanceTier: 'high',
        platform: 'desktop',
        browser: 'chrome',
        isMobile: false
      };

      const mockElement = document.createElement('div');
      const config = generateAdaptiveConfig(capabilities, mockElement);
      
      expect(config.inputStream.target).toBe(mockElement);
    });
  });

  describe('getBarcodeReaders', () => {
    it('should convert formats to reader names', () => {
      const formats = ['EAN_13', 'UPC_A', 'CODE_128'] as const;
      const readers = getBarcodeReaders([...formats]);
      
      expect(readers).toContain('ean_reader');
      expect(readers).toContain('upc_reader');
      expect(readers).toContain('code_128_reader');
    });

    it('should deduplicate reader names', () => {
      // EAN_13 and EAN_8 both map to 'ean_reader'
      const formats = ['EAN_13', 'EAN_8'] as const;
      const readers = getBarcodeReaders([...formats]);
      
      expect(readers).toHaveLength(1);
      expect(readers[0]).toBe('ean_reader');
    });
  });

  describe('createCustomConfig', () => {
    it('should create config with custom resolution', () => {
      const config = createCustomConfig({
        resolution: { width: 800, height: 600 },
        fps: 8,
        formats: ['EAN_13'],
        cameraFacing: 'user',
        halfSample: false,
        patchSize: 'small',
        confidenceThreshold: 80,
        locateEnabled: true,
        numWorkers: 1,
        selectedCameraId: null,
        vibrationEnabled: true,
        soundEnabled: false
      });
      
      expect(config.inputStream?.constraints.width?.ideal).toBe(800);
      expect(config.inputStream?.constraints.height?.ideal).toBe(600);
      expect(config.frequency).toBe(8);
      expect(config.locator?.halfSample).toBe(false);
    });

    it('should use device ID if provided', () => {
      const config = createCustomConfig({
        selectedCameraId: 'camera-123',
        resolution: { width: 1280, height: 720 },
        fps: 10,
        formats: ['EAN_13'],
        cameraFacing: 'environment',
        halfSample: true,
        patchSize: 'medium',
        confidenceThreshold: 75,
        locateEnabled: true,
        numWorkers: 0,
        vibrationEnabled: false,
        soundEnabled: false
      });
      
      expect(config.inputStream?.constraints).toHaveProperty('deviceId', 'camera-123');
    });
  });

  describe('isValidQuaggaConfig', () => {
    it('should validate complete config as valid', () => {
      const config = getConfigForTier('medium');
      
      expect(isValidQuaggaConfig(config)).toBe(true);
    });

    it('should reject config without inputStream', () => {
      const config = {
        decoder: { readers: ['ean_reader'] }
      };
      
      expect(isValidQuaggaConfig(config)).toBe(false);
    });

    it('should reject config without decoder', () => {
      const config = {
        inputStream: {
          type: 'LiveStream' as const,
          target: null,
          constraints: {}
        }
      };
      
      expect(isValidQuaggaConfig(config)).toBe(false);
    });

    it('should reject config with empty readers array', () => {
      const config = {
        inputStream: {
          type: 'LiveStream' as const,
          target: null,
          constraints: {}
        },
        decoder: { readers: [] }
      };
      
      expect(isValidQuaggaConfig(config)).toBe(false);
    });
  });

  describe('getRecommendedFPS', () => {
    it('should return correct fps for each tier', () => {
      expect(getRecommendedFPS('low')).toBe(5);
      expect(getRecommendedFPS('medium')).toBe(10);
      expect(getRecommendedFPS('high')).toBe(15);
    });
  });
});

