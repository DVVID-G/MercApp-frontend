/**
 * Tests for Device Detection Utility
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectDeviceCapabilities,
  detectPlatform,
  detectBrowser,
  isMobileDevice,
  getDeviceInfoSummary
} from '../../src/utils/device-detection';

describe('device-detection utilities', () => {
  beforeEach(() => {
    // Reset navigator mocks before each test
    vi.clearAllMocks();
  });

  describe('detectPlatform', () => {
    it('should detect iOS platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });
      
      expect(detectPlatform()).toBe('ios');
    });

    it('should detect Android platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10)',
        configurable: true
      });
      
      expect(detectPlatform()).toBe('android');
    });

    it('should detect desktop platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });
      
      expect(detectPlatform()).toBe('desktop');
    });

    it('should return unknown for unrecognized platforms', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Some weird user agent',
        configurable: true
      });
      
      expect(detectPlatform()).toBe('unknown');
    });
  });

  describe('detectBrowser', () => {
    it('should detect Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });
      
      expect(detectBrowser()).toBe('chrome');
    });

    it('should detect Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        configurable: true
      });
      
      expect(detectBrowser()).toBe('safari');
    });

    it('should detect Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        configurable: true
      });
      
      expect(detectBrowser()).toBe('firefox');
    });

    it('should detect Edge', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        configurable: true
      });
      
      expect(detectBrowser()).toBe('edge');
    });

    it('should return other for unrecognized browsers', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Some weird browser',
        configurable: true
      });
      
      expect(detectBrowser()).toBe('other');
    });
  });

  describe('isMobileDevice', () => {
    it('should return true for iPhone', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });
      
      expect(isMobileDevice()).toBe(true);
    });

    it('should return true for Android', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10)',
        configurable: true
      });
      
      expect(isMobileDevice()).toBe(true);
    });

    it('should return false for desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });
      
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('detectDeviceCapabilities', () => {
    it('should detect capabilities for a mobile device', async () => {
      // Mock navigator properties
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 6,
        configurable: true
      });

      const capabilities = await detectDeviceCapabilities();
      
      expect(capabilities.platform).toBe('ios');
      expect(capabilities.isMobile).toBe(true);
      expect(capabilities.cpuCores).toBe(6);
      expect(capabilities.performanceTier).toBe('medium'); // 6 cores mobile gets medium
    });

    it('should calculate low tier for low-spec device', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 8.0)',
        configurable: true
      });
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 4,
        configurable: true
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 2,
        configurable: true
      });

      const capabilities = await detectDeviceCapabilities();
      
      expect(capabilities.performanceTier).toBe('low');
    });

    it('should calculate high tier for high-spec desktop', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 8,
        configurable: true
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 16,
        configurable: true
      });

      const capabilities = await detectDeviceCapabilities();
      
      expect(capabilities.performanceTier).toBe('high');
    });

    it('should detect API support correctly', async () => {
      const capabilities = await detectDeviceCapabilities();
      
      expect(capabilities).toHaveProperty('supportsGetUserMedia');
      expect(capabilities).toHaveProperty('supportsVibration');
      expect(capabilities).toHaveProperty('supportsPermissionsAPI');
    });
  });

  describe('getDeviceInfoSummary', () => {
    it('should generate readable summary', () => {
      const capabilities = {
        hasCamera: true,
        cameraCount: 2,
        hasBackCamera: true,
        hasFrontCamera: true,
        supportsGetUserMedia: true,
        supportsVibration: true,
        supportsPermissionsAPI: true,
        cpuCores: 8,
        memoryGB: 16,
        performanceTier: 'high' as const,
        platform: 'desktop' as const,
        browser: 'chrome' as const,
        isMobile: false
      };

      const summary = getDeviceInfoSummary(capabilities);
      
      expect(summary).toContain('desktop');
      expect(summary).toContain('chrome');
      expect(summary).toContain('8 cores');
      expect(summary).toContain('16GB');
      expect(summary).toContain('high');
      expect(summary).toContain('2');
    });
  });
});

