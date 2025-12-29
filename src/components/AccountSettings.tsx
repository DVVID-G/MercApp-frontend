import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userAccountService from '../services/user-account.service';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getMeRequest } from '../services/auth.service';

export function AccountSettings() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getMeRequest();
        setName(userData.name || '');
        setEmail(userData.email || '');
      } catch (error) {
        console.error('Failed to load user data', error);
        toast.error('Error al cargar datos del usuario');
      } finally {
        setLoadingAccount(false);
      }
    };
    loadUserData();
  }, []);

  const handleUpdateAccount = async () => {
    if (!name.trim() && !email.trim()) {
      toast.error('Debe proporcionar al menos un campo para actualizar');
      return;
    }

    setLoading(true);
    try {
      const updates: userAccountService.UpdateAccountInput = {};
      if (name.trim()) updates.name = name.trim();
      if (email.trim()) updates.email = email.trim();

      await userAccountService.updateAccount(updates);
      toast.success('Información actualizada exitosamente');
      
      // Reload user data
      const userData = await getMeRequest();
      setName(userData.name || '');
      setEmail(userData.email || '');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('El email ya está en uso');
      } else {
        toast.error('Error al actualizar la información');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Debe completar todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await userAccountService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Contraseña actualizada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Contraseña actual incorrecta');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña';
        toast.error(errorMessage);
      } else {
        toast.error('Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingAccount) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-800 rounded"></div>
          <div className="h-16 bg-gray-800 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <h4 className="text-sm font-medium text-white mb-4">Información de la Cuenta</h4>
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
          <Button
            variant="primary"
            onClick={handleUpdateAccount}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </Card>

      {/* Password Change */}
      <Card>
        <h4 className="text-sm font-medium text-white mb-4">Cambiar Contraseña</h4>
        <div className="space-y-4">
          <Input
            label="Contraseña Actual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Nueva Contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Confirmar Nueva Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          <div className="text-xs text-gray-400 space-y-1">
            <p>La contraseña debe tener:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Al menos 8 caracteres</li>
              <li>Al menos una mayúscula</li>
              <li>Al menos un número</li>
              <li>Al menos un carácter especial</li>
            </ul>
          </div>
          <Button
            variant="primary"
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

