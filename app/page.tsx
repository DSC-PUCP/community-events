'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EventCard from '@/components/EventCard';
import { getAllEvents } from '@/lib/actions/events';
import { getAllCategories } from '@/lib/actions/categories';
import type { Event, Category } from '@/lib/types';
import { getOrganizationsForFilter } from '@/lib/actions/organizations';

const PAGE_SIZE = 8;

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizations, setOrganizations] = useState<
    { id: string; name: string }[]
  >([]);
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventsData, categoriesData, organizationsData] =
          await Promise.all([
            getAllEvents(),
            getAllCategories(),
            getOrganizationsForFilter(),
          ]);
        setEvents(eventsData);
        setCategories(categoriesData);
        setOrganizations(organizationsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCats, dateRange, selectedOrg]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(search.toLowerCase())
        || ev.description.toLowerCase().includes(search.toLowerCase());
      const matchesCats =
        selectedCats.length === 0
        || selectedCats.some((c) => ev.categories.includes(c));

      const evStart = new Date(ev.startDate).getTime();
      const matchesDateStart =
        !dateRange.start || evStart >= new Date(dateRange.start).getTime();
      const matchesDateEnd =
        !dateRange.end || evStart <= new Date(dateRange.end).getTime();

      const matchesOrg = selectedOrg === null || ev.orgId === selectedOrg;
      return (
        matchesSearch
        && matchesCats
        && matchesDateStart
        && matchesDateEnd
        && matchesOrg
      );
    });
  }, [events, search, selectedCats, dateRange, selectedOrg]);

  const toggleCategory = (id: number) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Descubre <span className="text-indigo-600">eventos comunitarios</span>{' '}
          en nuestro campus
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Desde charlas hasta concursos, descubre los mejores eventos y
          actividades organizados por los estudiantes.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
        {/* Buscador */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Busca eventos, temas u organizaciones..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtro por fechas */}
        <div className="flex gap-4 items-center">
          <input
            type="date"
            className="px-3 py-3 rounded-xl border border-slate-200 text-sm"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
          <span className="text-slate-400">hasta</span>
          <input
            type="date"
            className="px-3 py-3 rounded-xl border border-slate-200 text-sm"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </div>

        {/* Filtro por organización */}
        <div>
          <select
            value={selectedOrg ?? ''}
            onChange={(e) => setSelectedOrg(e.target.value || null)}
            className="px-3 py-3 rounded-xl border border-slate-200 text-sm w-full md:w-auto"
          >
            <option value="">Todas las organizaciones</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedCats.includes(cat.id)
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filteredEvents.length > 0 ? (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {filteredEvents.length} evento
            {filteredEvents.length !== 1 ? 's' : ''} encontrado
            {filteredEvents.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                categories={categories}
                onClick={(ev) => router.push(`/events/${ev.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                        page === currentPage
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="text-slate-400 mb-4 text-5xl">🔭</div>
          <h3 className="text-xl font-semibold text-slate-800">
            Sin eventos encontrados
          </h3>
          <p className="text-slate-500">
            Intenta ajustar tus filtros o términos de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
