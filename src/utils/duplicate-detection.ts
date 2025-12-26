/**
 * Duplicate Detection Utility
 * 
 * Prevents scanning the same barcode multiple times within a cooldown period
 * Feature: 001-barcode-scanner-mobile
 */

import type { DuplicateTracker } from '../types/scanner.types';

/**
 * Default cooldown period in milliseconds (2 seconds)
 */
const DEFAULT_COOLDOWN_MS = 2000;

/**
 * Maximum age for tracked scans before cleanup (30 seconds)
 */
const MAX_SCAN_AGE_MS = 30000;

/**
 * Create a new duplicate tracker instance
 * @param cooldownMs - Cooldown period in milliseconds (default: 2000)
 * @returns DuplicateTracker instance
 */
export function createDuplicateTracker(cooldownMs: number = DEFAULT_COOLDOWN_MS): DuplicateTracker {
  return {
    recentScans: new Map<string, Date>(),
    cooldownMs
  };
}

/**
 * Check if a barcode was scanned recently (within cooldown period)
 * @param barcode - Barcode string to check
 * @param tracker - Duplicate tracker instance
 * @returns true if barcode is a duplicate (scanned recently)
 */
export function isDuplicate(barcode: string, tracker: DuplicateTracker): boolean {
  const lastScan = tracker.recentScans.get(barcode);
  
  if (!lastScan) {
    return false; // Never scanned before
  }

  const elapsed = Date.now() - lastScan.getTime();
  return elapsed < tracker.cooldownMs;
}

/**
 * Track a scanned barcode
 * @param barcode - Barcode string to track
 * @param tracker - Duplicate tracker instance
 */
export function trackScan(barcode: string, tracker: DuplicateTracker): void {
  tracker.recentScans.set(barcode, new Date());
  
  // Cleanup old entries to prevent memory leaks
  cleanupOldScans(tracker);
}

/**
 * Remove old scan entries that exceed max age
 * @param tracker - Duplicate tracker instance
 */
function cleanupOldScans(tracker: DuplicateTracker): void {
  const cutoff = Date.now() - MAX_SCAN_AGE_MS;
  
  for (const [barcode, timestamp] of tracker.recentScans.entries()) {
    if (timestamp.getTime() < cutoff) {
      tracker.recentScans.delete(barcode);
    }
  }
}

/**
 * Clear all tracked scans
 * @param tracker - Duplicate tracker instance
 */
export function clearTracking(tracker: DuplicateTracker): void {
  tracker.recentScans.clear();
}

/**
 * Get list of recently scanned barcodes
 * @param tracker - Duplicate tracker instance
 * @returns Array of objects with barcode and timestamp
 */
export function getRecentScans(tracker: DuplicateTracker): Array<{ barcode: string; timestamp: Date }> {
  const scans: Array<{ barcode: string; timestamp: Date }> = [];
  
  for (const [barcode, timestamp] of tracker.recentScans.entries()) {
    scans.push({ barcode, timestamp });
  }
  
  // Sort by most recent first
  return scans.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get time remaining in cooldown for a barcode
 * @param barcode - Barcode to check
 * @param tracker - Duplicate tracker instance
 * @returns Milliseconds remaining in cooldown, or 0 if not in cooldown
 */
export function getCooldownRemaining(barcode: string, tracker: DuplicateTracker): number {
  const lastScan = tracker.recentScans.get(barcode);
  
  if (!lastScan) {
    return 0;
  }

  const elapsed = Date.now() - lastScan.getTime();
  const remaining = tracker.cooldownMs - elapsed;
  
  return Math.max(0, remaining);
}

/**
 * Check if tracker has any recent scans
 * @param tracker - Duplicate tracker instance
 * @returns true if there are recent scans
 */
export function hasRecentScans(tracker: DuplicateTracker): boolean {
  return tracker.recentScans.size > 0;
}

/**
 * Get count of tracked scans
 * @param tracker - Duplicate tracker instance
 * @returns Number of currently tracked scans
 */
export function getTrackedCount(tracker: DuplicateTracker): number {
  return tracker.recentScans.size;
}

/**
 * Check if a barcode was scanned within a time window
 * Alternative to tracker-based approach for simpler use cases
 * @param code - Barcode to check
 * @param cooldownMs - Cooldown period in milliseconds
 * @param recentScans - Array of recent scans with code and timestamp
 * @returns true if code was scanned within cooldown window
 */
export function isDuplicateInWindow(
  code: string,
  cooldownMs: number,
  recentScans: Array<{ code: string; timestamp: number }>
): boolean {
  const now = Date.now();
  
  for (const scan of recentScans) {
    if (scan.code === code && (now - scan.timestamp) < cooldownMs) {
      return true;
    }
  }
  
  return false;
}

