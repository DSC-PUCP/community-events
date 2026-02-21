'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { createEvent, uploadBanner } from '@/lib/actions/events';
import { getAllCategories } from '@/lib/actions/categories';
import type { Category } from '@/lib/types';

export default function NewEventPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
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
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!session) return;
    if (!session.user) {
      router.push('/login');
    }
  }, [session, router]);

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

      if (!finalBannerUrl) {
        setError('Se requiere una imagen de portada (URL o archivo).');
        setLoading(false);
        return;
      }

      const event = await createEvent({
        title,
        description,
        banner: finalBannerUrl,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationLink: registrationLink || null,
        whatsappContact: whatsappContact || null,
        orgId: session!.user!.id,
        categories: selectedCategories,
      });

      router.push(`/events/${event.id}`);
    } catch (err) {
      setError((err as Error).message || 'Error al crear el evento.');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500">Cargando...</div>
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

      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Crear Nuevo Evento
      </h1>

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
            placeholder="Nombre del evento"
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
            placeholder="Describe el evento..."
          />
        </div>

        {/* Imagen de portada */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Imagen de portada *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="text-xs text-slate-400 mt-1">O proporciona una URL:</p>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => {
              setBannerUrl(e.target.value);
              setPreviewUrl(e.target.value);
            }}
            className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://..."
          />
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-3 w-full h-48 object-cover rounded-xl"
            />
          )}
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
            placeholder="PUCP - Auditorio de Estudios Generales"
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
            {loading ? 'Creando...' : 'Crear Evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
