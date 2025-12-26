/**
 * Tests for useDeviceCapabilities Hook (T051-T054)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDeviceCapabilities } from '../../src/hooks/useDeviceCapabilities';
import * as deviceDetection from '../../src/utils/device-detection';

vi.mock('../../src/utils/device-detection');

describe('useDeviceCapabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T051: Detects capabilities correctly
  it('should detect device capabilities on mount', async () => {
    const mockCapabilities = {
      hasCamera: true,
      cameraCount: 2,
      hasBackCamera: true,
      hasFrontCamera: true,
      supportsGetUserMedia: true,
      supportsVibration: true,
      supportsPermissionsAPI: true,
      cpuCores: 4,
      memoryGB: 4,
      performanceTier: 'medium' as const,
      platform: 'android' as const,
      browser: 'chrome' as const,
      isMobile: true
    };

    vi.mocked(deviceDetection.detectDeviceCapabilities).mockResolvedValue(mockCapabilities);

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.capabilities).toEqual(mockCapabilities);
    expect(result.current.tier).toBe('medium');
  });

  // T052: Generates low tier config for low-spec device
  it('should generate low tier config for low-spec device', async () => {
    const mockCapabilities = {
      hasCamera: true,
      cameraCount: 1,
      hasBackCamera: true,
      hasFrontCamera: false,
      supportsGetUserMedia: true,
      supportsVibration: false,
      supportsPermissionsAPI: false,
      cpuCores: 2,
      memoryGB: 1,
      performanceTier: 'low' as const,
      platform: 'android' as const,
      browser: 'chrome' as const,
      isMobile: true
    };

    vi.mocked(deviceDetection.detectDeviceCapabilities).mockResolvedValue(mockCapabilities);

    const { result } = renderHook(() => useDeviceCapabilities());

    await waitFor(() => {
      expect(result.current.tier).toBe('low');
    });

    const config = result.current.getQuaggaConfig();
    
    expect(config.locate).toBe(true);
    expect(config.inputStream.constraints.width?.ideal).toBe(640);
    expect(config.frequency).toBe(5);
  });

  // T053: Generates medium tier config for mid-spec device
  it('should generate medium tier config for mid-spec device', async () => {
    const mockCapabilities = {
      hasCamera: true,
      cameraCount: 2,
      hasBackCamera: true,
      hasFrontCamera: true,
      supportsGetUserMedia: true,
      supportsVibration: true,
      supportsPermissionsAPI: true,
      cpuCores: 4,
      memoryGB: 4,
      performanceTier: 'medium' as const,
      platform: 'android' as const,
      browser: 'chrome' as const,
      isMobile: true
    };

    vi.mocked(deviceDetection.detectDeviceCapabilities).mockResolvedValue(mockCapabilities);

    const { result } = renderHook(() => useDeviceCapabilities());

    await waitFor(() => {
      expect(result.current.tier).toBe('medium');
    });

    const config = result.current.getQuaggaConfig();
    
    expect(config.locate).toBe(true);
    expect(config.inputStream.constraints.width?.ideal).toBe(1280);
    expect(config.frequency).toBe(10);
  });

  // T054: Generates high tier config for high-spec device
  it('should generate high tier config for high-spec device', async () => {
    const mockCapabilities = {
      hasCamera: true,
      cameraCount: 2,
      hasBackCamera: true,
      hasFrontCamera: true,
      supportsGetUserMedia: true,
      supportsVibration: true,
      supportsPermissionsAPI: true,
      cpuCores: 8,
      memoryGB: 8,
      performanceTier: 'high' as const,
      platform: 'desktop' as const,
      browser: 'chrome' as const,
      isMobile: false
    };

    vi.mocked(deviceDetection.detectDeviceCapabilities).mockResolvedValue(mockCapabilities);

    const { result } = renderHook(() => useDeviceCapabilities());

    await waitFor(() => {
      expect(result.current.tier).toBe('high');
    });

    const config = result.current.getQuaggaConfig();
    
    expect(config.locate).toBe(true);
    expect(config.inputStream.constraints.width.ideal).toBe(1920);
    expect(config.frequency).toBe(15);
    expect(config.numOfWorkers).toBe(2);
  });

  it('should fallback to medium tier on error', async () => {
    vi.mocked(deviceDetection.detectDeviceCapabilities).mockRejectedValue(
      new Error('Detection failed')
    );

    const { result } = renderHook(() => useDeviceCapabilities());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tier).toBe('medium');
  });
});

