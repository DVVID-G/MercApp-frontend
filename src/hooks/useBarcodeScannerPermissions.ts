/**
 * useBarcodeScannerPermissions Hook
 * 
 * Manages camera permission state with detection of permanent blocks
 * Feature: 001-barcode-scanner-mobile
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  PermissionState,
  PermissionStatus,
  PermissionInstructions,
  Platform,
  UseBarcodeScannerPermissions
} from '../types/scanner.types';
import {
  savePermissionStatus,
  loadPermissionStatus,
  incrementDenyCount,
  getDenyCount,
  resetDenyCount,
  saveBlockedTimestamp,
  loadBlockedTimestamp,
  saveLastRequested,
  loadLastRequested,
  clearAllScannerData
} from '../utils/scanner-storage';

/**
 * Custom hook for managing camera permission state
 */
export function useBarcodeScannerPermissions(): UseBarcodeScannerPermissions {
  const [permissionState, setPermissionState] = useState<PermissionState>({
    status: 'not_requested',
    lastRequested: null,
    denyCount: 0,
    blockedAt: null,
    instructions: null
  });

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      const status = loadPermissionStatus();
      const denyCount = getDenyCount();
      const blockedAt = loadBlockedTimestamp();
      const lastRequested = loadLastRequested();

      setPermissionState(prev => ({
        ...prev,
        status,
        denyCount,
        blockedAt,
        lastRequested,
        instructions: status === 'blocked' ? getRecoveryInstructions() : null
      }));

      // If status is granted, verify with Permissions API
      if (status === 'granted') {
        const currentStatus = await checkPermission();
        if (currentStatus !== 'granted') {
          // Permission was revoked
          setPermissionState(prev => ({
            ...prev,
            status: currentStatus
          }));
        }
      }
    };

    loadPersistedState();
  }, []);

  /**
   * Request camera permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setPermissionState(prev => ({ ...prev, status: 'requesting' }));
    
    const now = new Date();
    saveLastRequested(now);

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // Permission granted - stop stream immediately (we just needed to test permission)
      stream.getTracks().forEach(track => track.stop());

      // Update state
      savePermissionStatus('granted');
      resetDenyCount();
      
      setPermissionState({
        status: 'granted',
        lastRequested: now,
        denyCount: 0,
        blockedAt: null,
        instructions: null
      });

      return true;

    } catch (error: any) {
      const denyCount = getDenyCount();

      // Handle different error types
      if (error.name === 'NotAllowedError') {
        // User denied or browser blocked
        if (denyCount >= 2) {
          // Permanent block detected
          const blockedAt = new Date();
          savePermissionStatus('blocked');
          saveBlockedTimestamp(blockedAt);
          
          setPermissionState({
            status: 'blocked',
            lastRequested: now,
            denyCount: denyCount + 1,
            blockedAt,
            instructions: getRecoveryInstructions()
          });
        } else {
          // Temporary denial
          incrementDenyCount();
          savePermissionStatus('denied');
          
          setPermissionState({
            status: 'denied',
            lastRequested: now,
            denyCount: denyCount + 1,
            blockedAt: null,
            instructions: null
          });
        }
      } else if (error.name === 'NotFoundError') {
        // No camera available
        const blockedAt = new Date();
        savePermissionStatus('blocked');
        saveBlockedTimestamp(blockedAt);
        
        setPermissionState({
          status: 'blocked',
          lastRequested: now,
          denyCount,
          blockedAt,
          instructions: getRecoveryInstructions()
        });
      } else {
        // Other error
        savePermissionStatus('denied');
        
        setPermissionState({
          status: 'denied',
          lastRequested: now,
          denyCount,
          blockedAt: null,
          instructions: null
        });
      }

      return false;
    }
  }, []);

  /**
   * Check current permission status without requesting
   */
  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    // Check localStorage first
    const storedStatus = loadPermissionStatus();
    if (storedStatus === 'blocked') {
      return 'blocked';
    }

    // Try Permissions API if available
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'granted') return 'granted';
        if (result.state === 'denied') return 'blocked';
      } catch {
        // Permissions API not supported or failed
      }
    }

    return storedStatus;
  }, []);

  /**
   * Get recovery instructions for current platform
   */
  const getInstructions = useCallback((): PermissionInstructions | null => {
    if (permissionState.status !== 'blocked') {
      return null;
    }

    return getRecoveryInstructions();
  }, [permissionState.status]);

  /**
   * Reset permission state (for testing/debugging)
   */
  const resetPermissionState = useCallback((): void => {
    clearAllScannerData();
    setPermissionState({
      status: 'not_requested',
      lastRequested: null,
      denyCount: 0,
      blockedAt: null,
      instructions: null
    });
  }, []);

  return {
    permissionState,
    requestPermission,
    checkPermission,
    getInstructions,
    resetPermissionState
  };
}

/**
 * Get platform-specific recovery instructions
 */
function getRecoveryInstructions(): PermissionInstructions {
  const platform = detectPlatform();
  
  const instructions: Record<Platform, PermissionInstructions> = {
    ios: {
      title: 'Habilitar cámara en iOS',
      steps: [
        'Abre Configuración → Safari → Cámara',
        'Selecciona "Permitir"',
        'Regresa a la app y recarga la página'
      ],
      platform: 'ios'
    },
    android: {
      title: 'Habilitar cámara en Android',
      steps: [
        'Toca el ícono de candado/información en la barra de direcciones',
        'Selecciona "Permisos" → "Cámara"',
        'Cambia a "Permitir"',
        'Recarga la página'
      ],
      platform: 'android'
    },
    desktop: {
      title: 'Habilitar cámara en navegador',
      steps: [
        'Haz clic en el ícono de cámara en la barra de direcciones',
        'Selecciona "Permitir siempre"',
        'Recarga la página'
      ],
      platform: 'desktop'
    },
    unknown: {
      title: 'Habilitar cámara',
      steps: [
        'Busca el ícono de permisos en la barra de direcciones',
        'Habilita el acceso a la cámara',
        'Recarga la página'
      ],
      platform: 'unknown'
    }
  };

  return instructions[platform];
}

/**
 * Detect current platform
 */
function detectPlatform(): Platform {
  const userAgent = navigator.userAgent;

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'ios';
  } else if (/Android/i.test(userAgent)) {
    return 'android';
  } else if (/Windows|Mac|Linux/i.test(userAgent)) {
    return 'desktop';
  }

  return 'unknown';
}

