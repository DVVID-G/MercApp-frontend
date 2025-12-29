import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from './Card';
import { Button } from './Button';
import { LogIn, LogOut, Shield, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function ActivityLog() {
  const { activityLogs, loadingActivityLogs, fetchActivityLogs } = useAuth();
  const [eventTypeFilter, setEventTypeFilter] = useState<'login' | 'logout' | 'session_revoked' | 'login_failed' | 'all'>('all');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadLogs();
  }, [eventTypeFilter, offset]);

  const loadLogs = async () => {
    const params: any = {
      limit,
      offset
    };
    if (eventTypeFilter !== 'all') {
      params.eventType = eventTypeFilter;
    }
    const data = await fetchActivityLogs(params);
    if (data) {
      setTotal(data.total);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return <LogIn className="w-4 h-4 text-success" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-gray-400" />;
      case 'session_revoked':
        return <Shield className="w-4 h-4 text-warning" />;
      case 'login_failed':
        return <XCircle className="w-4 h-4 text-error" />;
      default:
        return null;
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return 'Inicio de sesión';
      case 'logout':
        return 'Cierre de sesión';
      case 'session_revoked':
        return 'Sesión revocada';
      case 'login_failed':
        return 'Intento fallido';
      default:
        return eventType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return 'Móvil';
      case 'tablet':
        return 'Tablet';
      default:
        return 'Escritorio';
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Historial de Actividad</h4>
        <div className="flex gap-2">
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value as any);
              setOffset(0);
            }}
            className="bg-gray-950 border border-gray-800 rounded-[8px] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-secondary-gold"
          >
            <option value="all">Todos</option>
            <option value="login">Inicio de sesión</option>
            <option value="logout">Cierre de sesión</option>
            <option value="session_revoked">Sesiones revocadas</option>
            <option value="login_failed">Intentos fallidos</option>
          </select>
        </div>
      </div>

      {loadingActivityLogs ? (
        <Card className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-800 rounded"></div>
            <div className="h-16 bg-gray-800 rounded"></div>
            <div className="h-16 bg-gray-800 rounded"></div>
          </div>
        </Card>
      ) : activityLogs.length === 0 ? (
        <Card className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-400">No hay registros de actividad</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {activityLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center ${
                      log.success ? 'bg-gray-800' : 'bg-error/20'
                    }`}>
                      {getEventIcon(log.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-medium">
                          {getEventLabel(log.eventType)}
                        </p>
                        {!log.success && (
                          <span className="px-2 py-0.5 bg-error/20 border border-error/30 rounded text-error text-xs">
                            Fallido
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mb-1">
                        {getDeviceLabel(log.deviceInfo.deviceType)} • {log.deviceInfo.browser} • {log.deviceInfo.platform}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {log.ipAddress} • {formatDate(log.createdAt)}
                      </p>
                      {log.reason && (
                        <p className="text-gray-600 text-xs mt-1">
                          Razón: {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="text-sm px-3 py-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <span className="text-gray-400 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="ghost"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="text-sm px-3 py-1.5"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

