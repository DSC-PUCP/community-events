'use client';

import { useState, useMemo, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import { getAllEvents } from '@/lib/actions/events';
import { getAllCategories } from '@/lib/actions/categories';
import type { Event, Category } from '@/lib/types';
import { getOrganizationsForFilter } from '@/lib/actions/organizations';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  getToday,
  getThisWeek,
  getThisMonth,
  futureDateString,
  areDateRangesEqual,
} from '@/lib/utils/date-helpers';

const PAGE_SIZE = 8;

type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'created-desc'
  | 'created-asc'
  | 'title-asc'
  | 'title-desc';

export default function HomePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizations, setOrganizations] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Read all filters directly from URL
  const search = searchParams.get('q') || '';
  const selectedCats =
    searchParams.get('cats')?.split(',').map(Number).filter(Boolean) || [];
  const dateRange = {
    start: searchParams.get('dateStart') || '',
    end: searchParams.get('dateEnd') || '',
  };
  const selectedOrg = searchParams.get('org') || null;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = (searchParams.get('sort') || 'date-desc') as SortOption;

  // Load initial data only once
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

  // Single function to update URL params
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 if any filter (not page) changed
    const filterKeys = ['q', 'cats', 'dateStart', 'dateEnd', 'org', 'sort'];
    if (Object.keys(updates).some((k) => filterKeys.includes(k))) {
      params.delete('page');
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleCategory = (id: number) => {
    const newCats = selectedCats.includes(id)
      ? selectedCats.filter((x) => x !== id)
      : [...selectedCats, id];
    updateFilters({ cats: newCats.length > 0 ? newCats.join(',') : null });
  };

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

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];

    switch (sortBy) {
      case 'date-asc':
        return sorted.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
      case 'date-desc':
        return sorted.sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        );
      case 'created-asc':
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case 'created-desc':
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  }, [filteredEvents, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / PAGE_SIZE));
  const paginatedEvents = sortedEvents.slice(
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

      {/* CONTENEDOR PRINCIPAL DE FILTROS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 space-y-4">
        {/* FILA 1: Buscador */}
        <div className="w-full">
          <div className="relative">
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
              onChange={(e) => updateFilters({ q: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-slate-600 self-center mr-2">
            Fecha:
          </span>
          <button
            onClick={() => {
              const range = getToday();
              updateFilters({ dateStart: range.start, dateEnd: range.end });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              areDateRangesEqual(dateRange, getToday())
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => {
              const range = getThisWeek();
              updateFilters({ dateStart: range.start, dateEnd: range.end });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              areDateRangesEqual(dateRange, getThisWeek())
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Esta semana
          </button>
          <button
            onClick={() => {
              const range = getThisMonth();
              updateFilters({ dateStart: range.start, dateEnd: range.end });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              areDateRangesEqual(dateRange, getThisMonth())
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Este mes
          </button>
          <button
            onClick={() => {
              const range = futureDateString(7);
              updateFilters({ dateStart: range.start, dateEnd: range.end });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              areDateRangesEqual(dateRange, futureDateString(7))
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Próximos 7d
          </button>
          <button
            onClick={() => {
              const range = futureDateString(30);
              updateFilters({ dateStart: range.start, dateEnd: range.end });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              areDateRangesEqual(dateRange, futureDateString(30))
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Próximos 30d
          </button>
        </div>

        {/* FILA 3: Controles específicos */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Fechas manuales */}
          <div className="flex gap-2 items-center">
            <input
              type="date"
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={dateRange.start}
              onChange={(e) => updateFilters({ dateStart: e.target.value })}
            />
            <span className="text-slate-400 text-xs">→</span>
            <input
              type="date"
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={dateRange.end}
              onChange={(e) => updateFilters({ dateEnd: e.target.value })}
            />
          </div>

          {/* Separador vertical */}
          <div className="hidden md:block h-8 w-px bg-slate-200"></div>

          <select
            value={selectedOrg ?? ''}
            onChange={(e) => updateFilters({ org: e.target.value || null })}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Todas las organizaciones</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          >
            <option value="date-desc">Más recientes</option>
            <option value="date-asc">Más antiguos</option>
            <option value="created-desc">Recién añadidos</option>
            <option value="created-asc">Añadidos antes</option>
            <option value="title-asc">A → Z</option>
            <option value="title-desc">Z → A</option>
          </select>

          {/* Spacer para empujar el botón a la derecha en desktop */}
          <div className="flex-1 hidden lg:block"></div>

          <button
            onClick={() => router.replace(pathname)}
            className="px-4 py-2 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center gap-2"
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
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Limpiar filtros
          </button>
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

      {sortedEvents.length > 0 ? (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {sortedEvents.length} evento
            {sortedEvents.length !== 1 ? 's' : ''} encontrado
            {sortedEvents.length !== 1 ? 's' : ''}
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
                onClick={() =>
                  updateFilters({
                    page: Math.max(1, currentPage - 1).toString(),
                  })
                }
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
                      onClick={() => updateFilters({ page: page.toString() })}
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
                  updateFilters({
                    page: Math.min(totalPages, currentPage + 1).toString(),
                  })
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
