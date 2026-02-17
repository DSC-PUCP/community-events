'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from '@/lib/auth-client';

export default function Page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { data: session } = useSession();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
            });

            if (result.error) {
                console.error(result.error);
                setError(result.error.message || 'Invalid credentials');
            } else {
                if (!session?.user) {
                    router.push('/login');
                    return;
                }

                if (session.user.isFirstLogin) {
                    router.push('/change-password');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-20 px-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
                <h2 className="text-3xl font-bold mb-6 text-center">Inicio de Sesión para Organizaciones</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Correo
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="org@pucp.edu.pe"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">
                        Cuenta demo
                    </p>
                    <p className="text-xs text-slate-500 text-center mt-2">
                        Admin: dsc-admin@pucp.edu.pe / admin123
                    </p>
                </div>
            </div>
        </div>
    );
}