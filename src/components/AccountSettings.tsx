import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Eye, EyeOff, Save, Lock } from 'lucide-react';
import { UpdateAccountInput } from '../services/user-account.service';

const updateAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').optional(),
  email: z.string().email('Email inválido').optional(),
}).refine((data) => (data.name?.trim() ?? '') !== '' || (data.email?.trim() ?? '') !== '', {
  message: 'Debe proporcionar al menos un campo para actualizar',
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente de la actual',
  path: ['newPassword'],
});

type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function AccountSettings() {
  const { user } = useAuth();
  const { updateAccount, changePassword, updatingAccount, changingPassword } = useSettings();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    formState: { errors: accountErrors },
    reset: resetAccount,
  } = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onAccountSubmit = async (data: UpdateAccountFormData) => {
    setAccountMessage('');
    try {
      const updates: UpdateAccountInput = {};
      if (data.name && data.name.trim() !== user?.name) {
        updates.name = data.name.trim();
      }
      if (data.email && data.email.trim() !== user?.email) {
        updates.email = data.email.trim();
      }
      
      if (Object.keys(updates).length > 0) {
        await updateAccount(updates);
        resetAccount();
        setAccountMessage('Información de cuenta actualizada exitosamente');
      }
    } catch (error) {
      // Error handling is done in SettingsContext
      setAccountMessage('Error al actualizar la información de cuenta');
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordMessage('');
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      setPasswordMessage('Contraseña actualizada exitosamente');
    } catch (error) {
      // Error handling is done in SettingsContext
      setPasswordMessage('Error al cambiar la contraseña');
    }
  };

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? {} : { duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
      role="region"
      aria-label="Configuración de cuenta"
    >
      {/* Update Account Info */}
      <Card className="p-4 sm:p-6">
        <h3 id="account-info-heading" className="mb-4 sm:mb-6">
          Información de Cuenta
        </h3>
        <form 
          onSubmit={handleSubmitAccount(onAccountSubmit)} 
          className="space-y-4 sm:space-y-6"
          aria-labelledby="account-info-heading"
          noValidate
        >
          <Input
            label="Nombre"
            {...registerAccount('name')}
            placeholder="Tu nombre"
            error={accountErrors.name?.message}
            aria-required="false"
            aria-invalid={!!accountErrors.name}
            aria-describedby={accountErrors.name ? 'name-error' : undefined}
          />
          {accountErrors.name && (
            <div id="name-error" role="alert" className="text-error text-sm mt-1">
              {accountErrors.name.message}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            {...registerAccount('email')}
            placeholder="tu@email.com"
            error={accountErrors.email?.message}
            aria-required="false"
            aria-invalid={!!accountErrors.email}
            aria-describedby={accountErrors.email ? 'email-error' : undefined}
          />
          {accountErrors.email && (
            <div id="email-error" role="alert" className="text-error text-sm mt-1">
              {accountErrors.email.message}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={updatingAccount}
            fullWidth
            className="min-h-[44px]"
            aria-label={updatingAccount ? 'Guardando cambios...' : 'Guardar cambios en información de cuenta'}
          >
            <Save className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {updatingAccount ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
        {accountMessage && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`mt-4 text-sm ${accountMessage.includes('Error') ? 'text-error' : 'text-success'}`}
          >
            {accountMessage}
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card className="p-4 sm:p-6">
        <h3 id="password-heading" className="mb-4 sm:mb-6">
          Cambiar Contraseña
        </h3>
        <form 
          onSubmit={handleSubmitPassword(onPasswordSubmit)} 
          className="space-y-4 sm:space-y-6"
          aria-labelledby="password-heading"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                {...registerPassword('currentPassword')}
                className={`w-full bg-gray-950 border ${passwordErrors.currentPassword ? 'border-error' : 'border-gray-800'} rounded-[8px] pl-4 pr-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-secondary-gold transition-colors`}
                aria-required="true"
                aria-invalid={!!passwordErrors.currentPassword}
                aria-describedby={passwordErrors.currentPassword ? 'current-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-0 top-0 bottom-0 px-3 text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2 focus-visible:rounded min-w-[44px] flex items-center justify-center z-10"
                aria-label={showCurrentPassword ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
                aria-pressed={showCurrentPassword}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <div id="current-password-error" role="alert" className="text-error text-sm">
                {passwordErrors.currentPassword.message}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...registerPassword('newPassword')}
                className={`w-full bg-gray-950 border ${passwordErrors.newPassword ? 'border-error' : 'border-gray-800'} rounded-[8px] pl-4 pr-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-secondary-gold transition-colors`}
                aria-required="true"
                aria-invalid={!!passwordErrors.newPassword}
                aria-describedby={passwordErrors.newPassword ? 'new-password-error' : 'new-password-help'}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-0 top-0 bottom-0 px-3 text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2 focus-visible:rounded min-w-[44px] flex items-center justify-center z-10"
                aria-label={showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                aria-pressed={showNewPassword}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordErrors.newPassword ? (
              <div id="new-password-error" role="alert" className="text-error text-sm">
                {passwordErrors.newPassword.message}
              </div>
            ) : (
              <p 
                id="new-password-help"
                className="text-xs text-gray-500"
              >
                Mínimo 8 caracteres, una mayúscula, un número y un carácter especial
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...registerPassword('confirmPassword')}
                className={`w-full bg-gray-950 border ${passwordErrors.confirmPassword ? 'border-error' : 'border-gray-800'} rounded-[8px] pl-4 pr-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-secondary-gold transition-colors`}
                aria-required="true"
                aria-invalid={!!passwordErrors.confirmPassword}
                aria-describedby={passwordErrors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-0 bottom-0 px-3 text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2 focus-visible:rounded min-w-[44px] flex items-center justify-center z-10"
                aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <div id="confirm-password-error" role="alert" className="text-error text-sm">
                {passwordErrors.confirmPassword.message}
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={changingPassword}
            fullWidth
            className="min-h-[44px]"
            aria-label={changingPassword ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
          >
            <Lock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {changingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
          </Button>
        </form>
        {passwordMessage && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`mt-4 text-sm ${passwordMessage.includes('Error') ? 'text-error' : 'text-success'}`}
          >
            {passwordMessage}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

