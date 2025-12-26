/**
 * MediaDevices API Mock for Testing
 * 
 * Mock implementation of navigator.mediaDevices for camera permission tests
 * Feature: 001-barcode-scanner-mobile
 */

import { vi } from 'vitest';

// Mock MediaStream
export class MockMediaStream {
  private tracks: MockMediaStreamTrack[] = [];

  constructor(tracks?: MockMediaStreamTrack[]) {
    this.tracks = tracks || [];
  }

  getTracks(): MockMediaStreamTrack[] {
    return this.tracks;
  }

  getVideoTracks(): MockMediaStreamTrack[] {
    return this.tracks.filter(t => t.kind === 'video');
  }

  getAudioTracks(): MockMediaStreamTrack[] {
    return this.tracks.filter(t => t.kind === 'audio');
  }

  addTrack(track: MockMediaStreamTrack): void {
    this.tracks.push(track);
  }

  removeTrack(track: MockMediaStreamTrack): void {
    const index = this.tracks.indexOf(track);
    if (index > -1) this.tracks.splice(index, 1);
  }
}

// Mock MediaStreamTrack
export class MockMediaStreamTrack {
  kind: 'video' | 'audio';
  enabled: boolean = true;
  muted: boolean = false;
  readyState: 'live' | 'ended' = 'live';
  private eventListeners: Map<string, Array<(event: any) => void>> = new Map();

  constructor(kind: 'video' | 'audio' = 'video') {
    this.kind = kind;
  }

  stop(): void {
    this.readyState = 'ended';
    this.dispatchEvent('ended');
  }

  addEventListener(event: string, callback: (event: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (event: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    }
  }

  dispatchEvent(event: string): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb({ type: event }));
    }
  }
}

// Mock getUserMedia behavior
let mockUserMediaBehavior: 'grant' | 'deny' | 'error' = 'grant';

// Mock MediaDevices
export const mockMediaDevices = {
  getUserMedia: vi.fn(async (_constraints: MediaStreamConstraints): Promise<MediaStream> => {
    if (mockUserMediaBehavior === 'grant') {
      const track = new MockMediaStreamTrack('video');
      return new MockMediaStream([track]) as unknown as MediaStream;
    } else if (mockUserMediaBehavior === 'deny') {
      throw new DOMException('Permission denied', 'NotAllowedError');
    } else {
      throw new DOMException('Camera not found', 'NotFoundError');
    }
  }),

  enumerateDevices: vi.fn(async (): Promise<MediaDeviceInfo[]> => {
    return [
      {
        deviceId: 'mock-camera-back',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'Back Camera',
        groupId: 'mock-group',
        toJSON: () => ({})
      },
      {
        deviceId: 'mock-camera-front',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'Front Camera',
        groupId: 'mock-group',
        toJSON: () => ({})
      }
    ];
  }),

  // Helper methods for testing
  __setUserMediaBehavior: (behavior: 'grant' | 'deny' | 'error') => {
    mockUserMediaBehavior = behavior;
  },

  __reset: () => {
    mockUserMediaBehavior = 'grant';
    vi.clearAllMocks();
  }
};

// Setup global mock
if (typeof global !== 'undefined') {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: mockMediaDevices
  });
}

export default mockMediaDevices;

