import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for filter components.
 * Catches errors in filter components and displays a fallback UI.
 * 
 * @example
 * ```tsx
 * <FilterErrorBoundary>
 *   <FilterPanel />
 * </FilterErrorBoundary>
 * ```
 */
export class FilterErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[FilterErrorBoundary] Error caught:', error);
      console.error('[FilterErrorBoundary] Error info:', errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Error al cargar filtros
          </h3>
          <p className="text-gray-400 mb-4">
            Ocurrió un error al cargar los filtros. Por favor, intenta recargar la página.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="text-left mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer mb-2">
                Detalles del error (solo en desarrollo)
              </summary>
              <pre className="text-xs text-gray-600 bg-gray-900 p-3 rounded overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-primary-black border border-secondary-gold text-secondary-gold rounded-[8px] hover:bg-secondary-gold hover:text-primary-black transition-colors"
            aria-label="Reintentar cargar filtros"
          >
            Reintentar
          </button>
        </Card>
      );
    }

    return this.props.children;
  }
}

