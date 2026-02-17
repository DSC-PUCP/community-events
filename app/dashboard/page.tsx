'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session?.user) {
            router.push('/login');
        }
    }, [session, router]);

    if (!session?.user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    const isAdmin = session.user.role === 'admin';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    {isAdmin ? 'Admin Dashboard' : 'Organization Dashboard'}
                </h1>
                <p className="text-slate-600 mt-2">
                    Welcome back, {session.user.name || session.user.email}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">0</div>
                    <div className="text-slate-600">Total Events</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-2xl font-bold text-green-600 mb-2">0</div>
                    <div className="text-slate-600">Upcoming Events</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-2xl font-bold text-slate-600 mb-2">0</div>
                    <div className="text-slate-600">Past Events</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {isAdmin ? 'System Management' : 'Your Events'}
                </h2>
                <p className="text-slate-600">
                    Dashboard features coming soon. This is a placeholder for the full dashboard component.
                </p>

                {isAdmin && (
                    <div className="mt-6 space-y-3">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="font-semibold text-slate-900">Manage Organizations</div>
                            <div className="text-sm text-slate-600">Create and manage organization accounts</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="font-semibold text-slate-900">Manage Categories</div>
                            <div className="text-sm text-slate-600">Add or remove event categories</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="font-semibold text-slate-900">View All Events</div>
                            <div className="text-sm text-slate-600">Monitor all campus events</div>
                        </div>
                    </div>
                )}

                {!isAdmin && (
                    <div className="mt-6">
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Create New Event
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}