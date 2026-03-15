'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from '@/lib/auth-client';

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center cursor-pointer">
            <div className="bg-brand-600 p-2 rounded-lg mr-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-600 to-violet-600">
              CampusPulse
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {!user ? (
              <Link
                href="/login"
                className="text-slate-600 hover:text-brand-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-brand-700 bg-brand-50 border border-brand-100 rounded-lg text-sm font-medium px-4 py-2 hover:bg-brand-100 hover:text-brand-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
