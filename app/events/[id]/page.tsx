'use client';

import { use, useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { deleteEvent, getEventById } from '@/lib/actions/events';
import { getOrganizationById } from '@/lib/actions/organizations';
import { getAllCategories } from '@/lib/actions/categories';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';
import type { Category, Event, Organization } from '@/lib/types';

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventData, categoriesData] = await Promise.all([
          getEventById(id),
          getAllCategories(),
        ]);

        if (!eventData) {
          notFound();
        }

        setEvent(eventData);
        setCategories(categoriesData);

        if (eventData.orgId) {
          const orgData = await getOrganizationById(eventData.orgId);
          setOrg(orgData);
        }
      } catch (error) {
        console.error('Failed to load event:', error);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500">Cargando evento...</div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const eventCategories = categories.filter((c) =>
    event.categories.includes(c.id),
  );
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const canManage =
    session?.user?.role === 'admin' || session?.user?.id === event?.orgId;

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await deleteEvent(id);
      router.push('/dashboard');
    } catch (err) {
      setDeleteError((err as Error).message || 'Error al eliminar el evento.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver
        </button>
        {canManage && (
          <div className="flex gap-2">
            <Link
              href={`/events/${id}/edit`}
              className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </Link>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Eliminar
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="relative h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.banner}
            className="w-full h-full object-cover"
            alt={event.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex gap-2 mb-4">
              {eventCategories.map((c) => (
                <span
                  key={c.id}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                >
                  {c.name}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Información
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {org && (
                <div
                  onClick={() => setIsOrgModalOpen(true)}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800">Organización</h4>
                    <span className="text-indigo-600 text-xs font-bold group-hover:translate-x-1 transition-transform">
                      Ver Perfil
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {org.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {org.name || 'Organización'}
                      </div>
                      <div className="text-sm text-slate-500">{org.email}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Fecha y Hora
                      </p>
                      <p className="text-sm text-slate-800 font-semibold">
                        {startDate.toLocaleDateString('es-PE', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-slate-500">
                        {startDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {endDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Lugar
                      </p>
                      <p className="text-sm text-slate-800 font-semibold">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {event.registrationLink && (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                      Registrarse
                    </a>
                  )}
                  {event.whatsappContact && (
                    <a
                      href={`https://wa.me/${event.whatsappContact.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-500 text-white text-center py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de borrado */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              ¿Eliminar evento?
            </h2>
            <p className="text-slate-600 mb-6">
              Esta acción no se puede deshacer. El evento será eliminado
              permanentemente.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteError('');
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOrgModalOpen && org && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="relative h-32 bg-indigo-600">
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-indigo-600 text-3xl font-bold">
                  {org.name?.charAt(0) || '?'}
                </div>
              </div>
            </div>
            <div className="pt-14 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {org.name || 'Student Organization'}
              </h2>
              <p className="text-slate-500 mb-6">{org.email}</p>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    About the Host
                  </h4>
                  <p className="text-slate-600 leading-relaxed italic">
                    {org.description
                      || 'No description provided by the organization yet.'}
                  </p>
                </div>

                {org.contacts && org.contacts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Contact Information
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {org.contacts.map((contact, idx: number) => (
                        <a
                          key={idx}
                          href={
                            contact.type === 'link'
                              ? contact.value
                              : contact.type === 'whatsapp'
                                ? `https://wa.me/${contact.value.replace(/\D/g, '')}`
                                : `mailto:${contact.value}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm font-medium"
                        >
                          {contact.type === 'whatsapp' && (
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                          )}
                          {contact.type === 'email' && (
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                          {contact.type === 'link' && (
                            <svg
                              className="w-4 h-4 text-indigo-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          )}
                          {contact.type === 'whatsapp'
                            ? 'WhatsApp'
                            : contact.type === 'email'
                              ? 'Email'
                              : 'Website'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end">
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
