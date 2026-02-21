'use client';

import { useState, useEffect, use, useRef  } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { getEventById, updateEvent, uploadBanner } from '@/lib/actions/events';
import { getAllCategories } from '@/lib/actions/categories';
import type { Event, Category } from '@/lib/types';

function toDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [ev, cats] = await Promise.all([
          getEventById(id),
          getAllCategories(),
        ]);
        if (!ev) {
          router.push('/');
          return;
        }
        setEvent(ev);
        setCategories(cats);
        setTitle(ev.title);
        setDescription(ev.description);
        setBannerUrl(ev.banner);
        setPreviewUrl(ev.banner);
        setLocation(ev.location);
        setStartDate(toDatetimeLocal(ev.startDate));
        setEndDate(toDatetimeLocal(ev.endDate));
        setRegistrationLink(ev.registrationLink ?? '');
        setWhatsappContact(ev.whatsappContact ?? '');
        setSelectedCategories(ev.categories ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    }
    void load();
  }, [id, router]);

  useEffect(() => {
    if (!session) return;
    if (!session.user) router.push('/login');
  }, [session, router]);

  const canEdit =
    session?.user?.role === 'admin' || session?.user?.id === event?.orgId;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let finalBannerUrl = bannerUrl;

      if (bannerFile) {
        const formData = new FormData();
        formData.append('file', bannerFile);
        finalBannerUrl = await uploadBanner(formData);
      }

      await updateEvent(id, {
        title,
        description,
        banner: finalBannerUrl,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationLink: registrationLink || null,
        whatsappContact: whatsappContact || null,
        categories: selectedCategories,
      });

      router.push(`/events/${id}`);
    } catch (err) {
      setError((err as Error).message || 'Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500">Cargando evento...</div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-700 font-semibold mb-4">
            No tienes permisos para editar este evento.
          </p>
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
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

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Editar Evento</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
      >
        {/* Título */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Descripción *
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Imagen de portada */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Imagen de portada
          </label>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Preview"
              className="mb-3 w-full h-48 object-cover rounded-xl"
            />
          )}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
                {bannerFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setBannerFile(null);
                      setPreviewUrl(bannerUrl);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    title="Quitar archivo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            O actualiza la URL directamente:
          </p>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => {
              setBannerUrl(e.target.value);
              if (!bannerFile) setPreviewUrl(e.target.value);
            }}
            className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://..."
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Ubicación *
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Fecha y hora de inicio *
            </label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Fecha y hora de fin *
            </label>
            <input
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Categorías */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Categorías
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contacto de inscripción */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">
            Contacto de Inscripción (opcional)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Link de inscripción
              </label>
              <input
                type="url"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://forms.gle/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Número de WhatsApp
              </label>
              <input
                type="text"
                value={whatsappContact}
                onChange={(e) => setWhatsappContact(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+51 999 999 999"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
