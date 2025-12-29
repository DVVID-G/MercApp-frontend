import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from './Card';
import { Button } from './Button';
import { Trash2, Smartphone, Monitor, Tablet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function SessionList() {
  const { sessions, loadingSessions, fetchSessions, revokeSession, revokeAllSessions } = useAuth();
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await revokeSession(sessionId);
      toast.success('Sesión revocada exitosamente');
      await fetchSessions();
    } catch (error) {
      toast.error('Error al revocar la sesión');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('¿Estás seguro de que deseas cerrar sesión en todos los dispositivos?')) {
      return;
    }

    setRevokingAll(true);
    try {
      await revokeAllSessions();
      toast.success('Todas las sesiones han sido revocadas');
    } catch (error) {
      toast.error('Error al revocar todas las sesiones');
    } finally {
      setRevokingAll(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loadingSessions) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-800 rounded w-1/3"></div>
          <div className="h-20 bg-gray-800 rounded"></div>
          <div className="h-20 bg-gray-800 rounded"></div>
        </div>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay sesiones activas</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Sesiones Activas ({sessions.length})</h4>
        {sessions.length > 1 && (
          <Button
            variant="ghost"
            onClick={handleRevokeAll}
            disabled={revokingAll}
            className="text-error hover:text-error text-sm px-3 py-1.5"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Cerrar todas
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${
                    session.isCurrent ? 'bg-secondary-gold/20 text-secondary-gold' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {getDeviceIcon(session.deviceInfo.deviceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-sm">
                        {session.deviceInfo.deviceType === 'mobile' ? 'Móvil' : 
                         session.deviceInfo.deviceType === 'tablet' ? 'Tablet' : 'Escritorio'}
                      </p>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 bg-secondary-gold/20 border border-secondary-gold/30 rounded text-secondary-gold text-xs">
                          Actual
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mb-1">
                      {session.deviceInfo.browser} • {session.deviceInfo.platform}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {session.ipAddress} • Última actividad: {formatDate(session.lastActivityAt)}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revokingSessionId === session.id}
                    className="text-error hover:text-error text-sm px-3 py-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

