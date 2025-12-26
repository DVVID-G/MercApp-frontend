/**
 * Tests for PermissionPrompt Component (T022-T023)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionPrompt } from '../../../src/components/scanner/PermissionPrompt';
import type { PermissionState } from '../../../src/types/scanner.types';

describe('PermissionPrompt Component', () => {
  // T022: Renders request message
  it('should render permission request message', () => {
    const permissionState: PermissionState = {
      status: 'not_requested',
      lastRequested: null,
      denyCount: 0,
      blockedAt: null,
      instructions: null
    };
    
    const mockOnRequest = vi.fn();
    
    render(
      <PermissionPrompt
        permissionState={permissionState}
        onRequestPermission={mockOnRequest}
      />
    );
    
    expect(screen.getByRole('heading', { name: /acceso a cámara/i })).toBeInTheDocument();
    expect(screen.getByText(/escanear códigos de barras/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show requesting state', () => {
    const permissionState: PermissionState = {
      status: 'requesting',
      lastRequested: new Date(),
      denyCount: 0,
      blockedAt: null,
      instructions: null
    };
    
    render(
      <PermissionPrompt
        permissionState={permissionState}
        onRequestPermission={vi.fn()}
      />
    );
    
    expect(screen.getByText(/solicitando/i)).toBeInTheDocument();
  });

  it('should show denied state with retry button', () => {
    const permissionState: PermissionState = {
      status: 'denied',
      lastRequested: new Date(),
      denyCount: 1,
      blockedAt: null,
      instructions: null
    };
    
    render(
      <PermissionPrompt
        permissionState={permissionState}
        onRequestPermission={vi.fn()}
      />
    );
    
    expect(screen.getByText(/rechazado|denegado/i)).toBeInTheDocument();
    expect(screen.getByText(/reintentar|intentar/i)).toBeInTheDocument();
  });

  // T023: Renders blocked state with instructions
  it('should render blocked state with recovery instructions', () => {
    const permissionState: PermissionState = {
      status: 'blocked',
      lastRequested: new Date(),
      denyCount: 3,
      blockedAt: new Date(),
      instructions: {
        title: 'Habilitar cámara en iOS',
        steps: [
          'Abre Configuración → Safari → Cámara',
          'Selecciona "Permitir"',
          'Regresa a la app y recarga'
        ],
        platform: 'ios'
      }
    };
    
    render(
      <PermissionPrompt
        permissionState={permissionState}
        onRequestPermission={vi.fn()}
      />
    );
    
    expect(screen.getByRole('heading', { name: /permisos bloqueados/i })).toBeInTheDocument();
    expect(screen.getByText(/Habilitar cámara en iOS/i)).toBeInTheDocument();
    expect(screen.getByText(/Configuración/i)).toBeInTheDocument();
    expect(screen.getByText(/Safari/i)).toBeInTheDocument();
  });

  it('should call onRequestPermission when button clicked', async () => {
    const permissionState: PermissionState = {
      status: 'not_requested',
      lastRequested: null,
      denyCount: 0,
      blockedAt: null,
      instructions: null
    };
    
    const mockOnRequest = vi.fn();
    
    const { getByRole } = render(
      <PermissionPrompt
        permissionState={permissionState}
        onRequestPermission={mockOnRequest}
      />
    );
    
    const button = getByRole('button');
    await button.click();
    
    expect(mockOnRequest).toHaveBeenCalledTimes(1);
  });

  it('should show explanation text', () => {
    const permissionState: PermissionState = {
      status: 'not_requested',
      lastRequested: null,
      denyCount: 0,
      blockedAt: null,
      instructions: null
    };
    
    render(
      <PermissionPrompt
        permissionState={permissionState}
        onRequestPermission={vi.fn()}
      />
    );
    
    expect(screen.getByText(/necesitamos|requiere/i)).toBeInTheDocument();
  });
});

