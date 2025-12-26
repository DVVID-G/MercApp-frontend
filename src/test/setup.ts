/**
 * Vitest Test Setup
 * 
 * Global test configuration and mocks
 * Feature: 001-barcode-scanner-mobile
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock navigator.mediaDevices globally
const mockGetUserMedia = vi.fn();
const mockEnumerateDevices = vi.fn();

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices
  }
});

// Mock navigator.permissions
Object.defineProperty(global.navigator, 'permissions', {
  writable: true,
  value: {
    query: vi.fn()
  }
});

// Mock navigator.vibrate
Object.defineProperty(global.navigator, 'vibrate', {
  writable: true,
  value: vi.fn()
});

// Mock window.matchMedia
Object.defineProperty(global.window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

export { mockGetUserMedia, mockEnumerateDevices };

