/**
 * QuaggaJS Mock for Testing
 * 
 * Mock implementation of @ericblade/quagga2 for unit and integration tests
 * Feature: 001-barcode-scanner-mobile
 */

import { vi } from 'vitest';

export interface MockQuaggaResult {
  codeResult: {
    code: string;
    format: string;
    confidence?: number;
  };
}

// Mock callbacks
const mockCallbacks: {
  onDetected: Array<(result: MockQuaggaResult) => void>;
  onProcessed: Array<() => void>;
} = {
  onDetected: [],
  onProcessed: []
};

// Mock QuaggaJS implementation
export const Quagga = {
  // Initialization
  init: vi.fn((_config: any, callback: (err: Error | null) => void) => {
    // Simulate successful initialization
    setTimeout(() => callback(null), 0);
  }),

  // Start scanning
  start: vi.fn(() => {
    // Simulate scanner starting
  }),

  // Stop scanning
  stop: vi.fn(() => {
    // Clear callbacks on stop
    mockCallbacks.onDetected = [];
    mockCallbacks.onProcessed = [];
  }),

  // Pause scanning
  pause: vi.fn(() => {
    // Simulate pause
  }),

  // Event listeners
  onDetected: vi.fn((callback: (result: MockQuaggaResult) => void) => {
    mockCallbacks.onDetected.push(callback);
  }),

  offDetected: vi.fn((callback?: (result: MockQuaggaResult) => void) => {
    if (callback) {
      const index = mockCallbacks.onDetected.indexOf(callback);
      if (index > -1) mockCallbacks.onDetected.splice(index, 1);
    } else {
      mockCallbacks.onDetected = [];
    }
  }),

  onProcessed: vi.fn((callback: () => void) => {
    mockCallbacks.onProcessed.push(callback);
  }),

  offProcessed: vi.fn((callback?: () => void) => {
    if (callback) {
      const index = mockCallbacks.onProcessed.indexOf(callback);
      if (index > -1) mockCallbacks.onProcessed.splice(index, 1);
    } else {
      mockCallbacks.onProcessed = [];
    }
  }),

  // Camera access (for cleanup tests)
  CameraAccess: {
    getActiveStreamLabel: vi.fn(() => 'mock-stream'),
    release: vi.fn()
  },

  // Helpers for testing
  __triggerDetection: (result: MockQuaggaResult) => {
    mockCallbacks.onDetected.forEach(cb => cb(result));
  },

  __triggerProcessed: () => {
    mockCallbacks.onProcessed.forEach(cb => cb());
  },

  __reset: () => {
    mockCallbacks.onDetected = [];
    mockCallbacks.onProcessed = [];
    vi.clearAllMocks();
  }
};

export default Quagga;

