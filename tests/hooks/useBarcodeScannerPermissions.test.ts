/**
 * Tests for useBarcodeScannerPermissions Hook (T016-T021)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBarcodeScannerPermissions } from '../../src/hooks/useBarcodeScannerPermissions';
import * as storageUtils from '../../src/utils/scanner-storage';

// Mock storage utilities
vi.mock('../../src/utils/scanner-storage');

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn();
const mockPermissions = {
  query: vi.fn()
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset localStorage mocks
  vi.mocked(storageUtils.loadPermissionStatus).mockReturnValue('not_requested');
  vi.mocked(storageUtils.getDenyCount).mockReturnValue(0);
  vi.mocked(storageUtils.loadBlockedTimestamp).mockReturnValue(null);
  
  // Setup navigator.mediaDevices mock
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true
  });
  
  Object.defineProperty(navigator, 'permissions', {
    value: mockPermissions,
    writable: true
  });
});

describe('useBarcodeScannerPermissions', () => {
  // T016: Initial state test
  it('should initialize with not_requested status', () => {
    const { result } = renderHook(() => useBarcodeScannerPermissions());
    
    expect(result.current.permissionState.status).toBe('not_requested');
    expect(result.current.permissionState.lastRequested).toBeNull();
    expect(result.current.permissionState.denyCount).toBe(0);
    expect(result.current.permissionState.blockedAt).toBeNull();
    expect(result.current.permissionState.instructions).toBeNull();
  });

  // T017: Request permission - granted
  it('should grant permission when user accepts', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }]
    };
    mockGetUserMedia.mockResolvedValue(mockStream);
    
    const { result } = renderHook(() => useBarcodeScannerPermissions());
    
    let granted = false;
    await act(async () => {
      granted = await result.current.requestPermission();
    });
    
    expect(granted).toBe(true);
    expect(result.current.permissionState.status).toBe('granted');
    expect(storageUtils.savePermissionStatus).toHaveBeenCalledWith('granted');
    expect(storageUtils.resetDenyCount).toHaveBeenCalled();
  });

  // T018: Request permission - denied
  it('should handle permission denial', async () => {
    mockGetUserMedia.mockRejectedValue(
      new DOMException('Permission denied', 'NotAllowedError')
    );
    vi.mocked(storageUtils.getDenyCount).mockReturnValue(0);
    
    const { result } = renderHook(() => useBarcodeScannerPermissions());
    
    let granted = false;
    await act(async () => {
      granted = await result.current.requestPermission();
    });
    
    expect(granted).toBe(false);
    expect(result.current.permissionState.status).toBe('denied');
    expect(storageUtils.savePermissionStatus).toHaveBeenCalledWith('denied');
    expect(storageUtils.incrementDenyCount).toHaveBeenCalled();
  });

  // T019: Detect permanent block after 2 denials
  it('should detect permanent block after 2 denials', async () => {
    mockGetUserMedia.mockRejectedValue(
      new DOMException('Permission denied', 'NotAllowedError')
    );
    vi.mocked(storageUtils.getDenyCount).mockReturnValue(2);
    
    const { result } = renderHook(() => useBarcodeScannerPermissions());
    
    let granted = false;
    await act(async () => {
      granted = await result.current.requestPermission();
    });
    
    expect(granted).toBe(false);
    expect(result.current.permissionState.status).toBe('blocked');
    expect(storageUtils.savePermissionStatus).toHaveBeenCalledWith('blocked');
    expect(storageUtils.saveBlockedTimestamp).toHaveBeenCalled();
  });

  // T020: Get platform-specific instructions
  it('should return platform-specific recovery instructions when blocked', () => {
    vi.mocked(storageUtils.loadPermissionStatus).mockReturnValue('blocked');
    
    const { result } = renderHook(() => useBarcodeScannerPermissions());
    
    const instructions = result.current.getInstructions();
    
    expect(instructions).not.toBeNull();
    expect(instructions?.title).toBeTruthy();
    expect(instructions?.steps).toBeInstanceOf(Array);
    expect(instructions?.steps.length).toBeGreaterThan(0);
    expect(instructions?.platform).toBeTruthy();
  });

  // T021: State persistence in localStorage
  it('should load and persist permission state in localStorage', async () => {
    vi.mocked(storageUtils.loadPermissionStatus).mockReturnValue('granted');
    vi.mocked(storageUtils.getDenyCount).mockReturnValue(0);
    
    const { result } = renderHook(() => useBarcodeScannerPermissions());
    
    // Should load from localStorage on mount
    await waitFor(() => {
      expect(result.current.permissionState.status).toBe('granted');
    });
    
    expect(storageUtils.loadPermissionStatus).toHaveBeenCalled();
    expect(storageUtils.getDenyCount).toHaveBeenCalled();
  });

  it('should handle camera not found error', async () => {
    mockGetUserMedia.mockRejectedValue(
      new DOMException('Camera not found', 'NotFoundError')
    );
    
    const { result } = renderHook(() => useBarcodeScannerPermissions());
    
    let granted = false;
    await act(async () => {
      granted = await result.current.requestPermission();
    });
    
    expect(granted).toBe(false);
    expect(result.current.permissionState.status).toBe('blocked');
  });

  it('should reset permission state', () => {
    vi.mocked(storageUtils.loadPermissionStatus).mockReturnValue('denied');
    
    const { result } = renderHook(() => useBarcodeScannerPermissions());
    
    act(() => {
      result.current.resetPermissionState();
    });
    
    expect(result.current.permissionState.status).toBe('not_requested');
    expect(storageUtils.clearAllScannerData).toHaveBeenCalled();
  });
});

