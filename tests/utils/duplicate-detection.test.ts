/**
 * Tests for Duplicate Detection Utility
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createDuplicateTracker,
  isDuplicate,
  trackScan,
  clearTracking,
  getRecentScans,
  getCooldownRemaining,
  hasRecentScans,
  getTrackedCount
} from '../../src/utils/duplicate-detection';

describe('duplicate-detection utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createDuplicateTracker', () => {
    it('should create tracker with default cooldown', () => {
      const tracker = createDuplicateTracker();
      
      expect(tracker.cooldownMs).toBe(2000);
      expect(tracker.recentScans.size).toBe(0);
    });

    it('should create tracker with custom cooldown', () => {
      const tracker = createDuplicateTracker(5000);
      
      expect(tracker.cooldownMs).toBe(5000);
    });
  });

  describe('isDuplicate', () => {
    it('should return false for never-scanned barcode', () => {
      const tracker = createDuplicateTracker();
      
      expect(isDuplicate('12345', tracker)).toBe(false);
    });

    it('should return true for recently scanned barcode', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      expect(isDuplicate('12345', tracker)).toBe(true);
    });

    it('should return false after cooldown expires', () => {
      const tracker = createDuplicateTracker(2000);
      
      trackScan('12345', tracker);
      expect(isDuplicate('12345', tracker)).toBe(true);
      
      // Advance time past cooldown
      vi.advanceTimersByTime(2001);
      expect(isDuplicate('12345', tracker)).toBe(false);
    });

    it('should handle multiple different barcodes', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      trackScan('67890', tracker);
      
      expect(isDuplicate('12345', tracker)).toBe(true);
      expect(isDuplicate('67890', tracker)).toBe(true);
      expect(isDuplicate('11111', tracker)).toBe(false);
    });
  });

  describe('trackScan', () => {
    it('should track a new barcode scan', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      
      expect(tracker.recentScans.has('12345')).toBe(true);
    });

    it('should update timestamp for re-scanned barcode', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      const firstTime = tracker.recentScans.get('12345')!;
      
      vi.advanceTimersByTime(1000);
      trackScan('12345', tracker);
      const secondTime = tracker.recentScans.get('12345')!;
      
      expect(secondTime.getTime()).toBeGreaterThan(firstTime.getTime());
    });

    it('should cleanup old entries automatically', () => {
      const tracker = createDuplicateTracker();
      
      // Track multiple scans
      trackScan('code1', tracker);
      
      // Advance time to make entry old (>30s)
      vi.advanceTimersByTime(31000);
      
      // Track new scan should trigger cleanup
      trackScan('code2', tracker);
      
      // Old entry should be removed
      expect(tracker.recentScans.has('code1')).toBe(false);
      expect(tracker.recentScans.has('code2')).toBe(true);
    });
  });

  describe('clearTracking', () => {
    it('should remove all tracked scans', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      trackScan('67890', tracker);
      expect(tracker.recentScans.size).toBe(2);
      
      clearTracking(tracker);
      expect(tracker.recentScans.size).toBe(0);
    });
  });

  describe('getRecentScans', () => {
    it('should return array of recent scans', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      trackScan('67890', tracker);
      
      const scans = getRecentScans(tracker);
      
      expect(scans).toHaveLength(2);
      expect(scans.some(s => s.barcode === '12345')).toBe(true);
      expect(scans.some(s => s.barcode === '67890')).toBe(true);
    });

    it('should return scans sorted by most recent first', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('first', tracker);
      vi.advanceTimersByTime(1000);
      trackScan('second', tracker);
      vi.advanceTimersByTime(1000);
      trackScan('third', tracker);
      
      const scans = getRecentScans(tracker);
      
      expect(scans[0].barcode).toBe('third');
      expect(scans[1].barcode).toBe('second');
      expect(scans[2].barcode).toBe('first');
    });

    it('should return empty array when no scans', () => {
      const tracker = createDuplicateTracker();
      
      expect(getRecentScans(tracker)).toEqual([]);
    });
  });

  describe('getCooldownRemaining', () => {
    it('should return 0 for never-scanned barcode', () => {
      const tracker = createDuplicateTracker();
      
      expect(getCooldownRemaining('12345', tracker)).toBe(0);
    });

    it('should return remaining cooldown time', () => {
      const tracker = createDuplicateTracker(2000);
      
      trackScan('12345', tracker);
      
      expect(getCooldownRemaining('12345', tracker)).toBeGreaterThan(1900);
      expect(getCooldownRemaining('12345', tracker)).toBeLessThanOrEqual(2000);
    });

    it('should return 0 after cooldown expires', () => {
      const tracker = createDuplicateTracker(2000);
      
      trackScan('12345', tracker);
      vi.advanceTimersByTime(2001);
      
      expect(getCooldownRemaining('12345', tracker)).toBe(0);
    });

    it('should decrease over time', () => {
      const tracker = createDuplicateTracker(2000);
      
      trackScan('12345', tracker);
      const initial = getCooldownRemaining('12345', tracker);
      
      vi.advanceTimersByTime(1000);
      const after1s = getCooldownRemaining('12345', tracker);
      
      expect(after1s).toBeLessThan(initial);
      expect(after1s).toBeGreaterThan(900);
    });
  });

  describe('hasRecentScans', () => {
    it('should return false for empty tracker', () => {
      const tracker = createDuplicateTracker();
      
      expect(hasRecentScans(tracker)).toBe(false);
    });

    it('should return true when scans exist', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      
      expect(hasRecentScans(tracker)).toBe(true);
    });

    it('should return false after clearing', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      clearTracking(tracker);
      
      expect(hasRecentScans(tracker)).toBe(false);
    });
  });

  describe('getTrackedCount', () => {
    it('should return 0 for empty tracker', () => {
      const tracker = createDuplicateTracker();
      
      expect(getTrackedCount(tracker)).toBe(0);
    });

    it('should return correct count', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('code1', tracker);
      expect(getTrackedCount(tracker)).toBe(1);
      
      trackScan('code2', tracker);
      expect(getTrackedCount(tracker)).toBe(2);
      
      trackScan('code3', tracker);
      expect(getTrackedCount(tracker)).toBe(3);
    });

    it('should not increase when tracking same barcode', () => {
      const tracker = createDuplicateTracker();
      
      trackScan('12345', tracker);
      expect(getTrackedCount(tracker)).toBe(1);
      
      trackScan('12345', tracker);
      expect(getTrackedCount(tracker)).toBe(1); // Still 1
    });
  });
});

