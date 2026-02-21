'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrganizationById } from '@/lib/actions/organizations';
import { getEventsByOrgId } from '@/lib/actions/events';
import { getAllCategories } from '@/lib/actions/categories';
import type { Organization, Event, Category } from '@/lib/types';

export default function OrgProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [org, setOrg] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [orgData, catsData] = await Promise.all([
          getOrganizationById(id),
          getAllCategories(),
        ]);
        if (!orgData) {
          router.push('/');
          return;
        }
        setOrg(orgData);
        setCategories(catsData);
        const eventsData = await getEventsByOrgId(id);
        setEvents(eventsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500">Cargando perfil...</div>
      </div>
    );
  }

  if (!org) return null;

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= now);
  const pastEvents = events.filter((e) => new Date(e.startDate) < now);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium"
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

      {/* Header card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="h-36 bg-gradient-to-r from-indigo-500 to-purple-600" />
        <div className="px-8 pb-8">
          <div className="-mt-12 mb-6">
            {org.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.image}
                alt={org.name ?? 'Organización'}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-white flex items-center justify-center text-indigo-600 text-4xl font-bold">
                {org.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
            {org.name ?? 'Organización'}
          </h1>
          <p className="text-slate-500 mb-6">{org.email}</p>

          {org.description && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Acerca de
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {org.description}
              </p>
            </div>
          )}

          {/* Contacts */}
          {Array.isArray(org.contacts) && org.contacts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Contacto
              </h3>
              <div className="flex flex-wrap gap-3">
                {org.contacts.map((contact, idx) => (
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
                        : 'Sitio web'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total eventos', value: events.length },
          { label: 'Próximos', value: upcomingEvents.length },
          { label: 'Realizados', value: pastEvents.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center"
          >
            <div className="text-3xl font-extrabold text-indigo-600 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Eventos de la organización
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            Esta organización aún no ha publicado eventos.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upcoming */}
            {upcomingEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Próximos
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((ev) => (
                    <EventRow key={ev.id} event={ev} categories={categories} />
                  ))}
                </div>
              </div>
            )}
            {/* Past */}
            {pastEvents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Realizados
                </h3>
                <div className="space-y-3">
                  {pastEvents.map((ev) => (
                    <EventRow
                      key={ev.id}
                      event={ev}
                      categories={categories}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventRow({
  event,
  categories,
  isPast = false,
}: {
  event: Event;
  categories: Category[];
  isPast?: boolean;
}) {
  const eventCats = categories.filter((c) => event.categories.includes(c.id));
  const start = new Date(event.startDate);

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
    >
      {event.banner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.banner}
          alt={event.title}
          className="w-16 h-16 rounded-lg object-cover shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}`}
          >
            {isPast ? 'Pasado' : 'Próximo'}
          </span>
          {eventCats.slice(0, 2).map((c) => (
            <span
              key={c.id}
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"
            >
              {c.name}
            </span>
          ))}
        </div>
        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
          {event.title}
        </p>
        <p className="text-sm text-slate-500">
          {start.toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}{' '}
          · {event.location}
        </p>
      </div>
      <svg
        className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}
