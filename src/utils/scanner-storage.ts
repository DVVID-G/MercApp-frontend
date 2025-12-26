/**
 * Scanner Storage Utility
 * 
 * LocalStorage operations for persisting scanner state (permissions, settings)
 * Feature: 001-barcode-scanner-mobile
 */

import type { PermissionStatus } from '../types/scanner.types';
import { STORAGE_KEYS } from '../types/scanner.types';

/**
 * Save permission status to localStorage
 * @param status - Permission status to save
 */
export function savePermissionStatus(status: PermissionStatus): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PERMISSION_STATUS, status);
  } catch (error) {
    console.error('Failed to save permission status:', error);
  }
}

/**
 * Load permission status from localStorage
 * @returns Saved permission status or 'not_requested' if none saved
 */
export function loadPermissionStatus(): PermissionStatus {
  try {
    const status = localStorage.getItem(STORAGE_KEYS.PERMISSION_STATUS);
    if (status && isValidPermissionStatus(status)) {
      return status as PermissionStatus;
    }
  } catch (error) {
    console.error('Failed to load permission status:', error);
  }
  
  return 'not_requested';
}

/**
 * Increment deny count in localStorage
 * @returns New deny count
 */
export function incrementDenyCount(): number {
  try {
    const current = getDenyCount();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEYS.DENY_COUNT, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Failed to increment deny count:', error);
    return 0;
  }
}

/**
 * Get current deny count from localStorage
 * @returns Deny count (0 if none saved)
 */
export function getDenyCount(): number {
  try {
    const count = localStorage.getItem(STORAGE_KEYS.DENY_COUNT);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Failed to get deny count:', error);
    return 0;
  }
}

/**
 * Reset deny count to 0 (e.g., when permission is granted)
 */
export function resetDenyCount(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DENY_COUNT, '0');
  } catch (error) {
    console.error('Failed to reset deny count:', error);
  }
}

/**
 * Save blocked timestamp
 * @param timestamp - Date when permissions were blocked
 */
export function saveBlockedTimestamp(timestamp: Date): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_AT, timestamp.toISOString());
  } catch (error) {
    console.error('Failed to save blocked timestamp:', error);
  }
}

/**
 * Load blocked timestamp
 * @returns Date when permissions were blocked, or null if not blocked
 */
export function loadBlockedTimestamp(): Date | null {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.BLOCKED_AT);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Failed to load blocked timestamp:', error);
    return null;
  }
}

/**
 * Save last requested timestamp
 * @param timestamp - Date when permission was last requested
 */
export function saveLastRequested(timestamp: Date): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_REQUESTED, timestamp.toISOString());
  } catch (error) {
    console.error('Failed to save last requested timestamp:', error);
  }
}

/**
 * Load last requested timestamp
 * @returns Date when permission was last requested, or null if never requested
 */
export function loadLastRequested(): Date | null {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_REQUESTED);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Failed to load last requested timestamp:', error);
    return null;
  }
}

/**
 * Clear all scanner-related data from localStorage
 * Useful for testing or reset functionality
 */
export function clearAllScannerData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear scanner data:', error);
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is supported and accessible
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__scanner_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate permission status string
 * @param status - String to validate
 * @returns true if valid permission status
 */
function isValidPermissionStatus(status: string): boolean {
  const validStatuses: PermissionStatus[] = [
    'not_requested',
    'requesting',
    'granted',
    'denied',
    'blocked'
  ];
  return validStatuses.includes(status as PermissionStatus);
}

/**
 * Get all scanner storage data (for debugging)
 * @returns Object with all scanner-related localStorage data
 */
export function getAllScannerData(): Record<string, string | null> {
  const data: Record<string, string | null> = {};
  
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    try {
      data[key] = localStorage.getItem(storageKey);
    } catch (error) {
      data[key] = null;
    }
  });
  
  return data;
}

