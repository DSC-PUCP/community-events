'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changePassword } from '@/lib/actions/organizations';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña nueva debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(newPassword, oldPassword);
      if (result.success) {
        router.push('/dashboard');
      } else {
        switch (result.error) {
          case 'INVALID_CURRENT_PASSWORD':
            setError('Contraseña actual incorrecta.');
            break;
          default:
            throw result.error satisfies never;
        }
      }
    } catch {
      setError(
        'Hubo un error al cambiar la contraseña. Por favor inténtalo de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-2xl font-bold mb-2">¡Hola!</h2>
        <p className="text-slate-500 mb-6">Establece una nueva contraseña.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Contraseña Antigua
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Contraseña Nueva
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Confirma la Contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Actualizar y continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
