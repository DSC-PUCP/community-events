'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import {
  getOrganizationById,
  updateOrganization,
} from '@/lib/actions/organizations';
import { resolveReturnTo } from '@/lib/utils/navigation';
import {
  ORGANIZATION_LIMITS,
  validateOrganization,
  validateOrganizationEmail,
  validateOrganizationLink,
} from '@/lib/validation/organization';
import type { Contact, Organization } from '@/lib/types';
import Select from '@/components/Select';
import {
  sanitizeWhatsappInput,
  validateWhatsappContact,
  WHATSAPP_CONSTRAINTS,
} from '@/lib/validation/whatsapp';

export default function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [, setOrg] = useState<Organization | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const returnTo = resolveReturnTo(searchParams.get('returnTo'), '/dashboard');
  const organizationValidation = validateOrganization({
    name,
    description,
  });
  const nameError = organizationValidation.success
    ? null
    : (organizationValidation.fieldErrors.name ?? null);
  const descriptionError = organizationValidation.success
    ? null
    : (organizationValidation.fieldErrors.description ?? null);
  const visibleNameError = name.trim().length === 0 ? null : nameError;
  const contactErrors = contacts.map((contact) => {
    if (contact.value.trim().length === 0) {
      return null;
    }

    if (contact.type === 'email') {
      const parsedContactEmail = validateOrganizationEmail(contact.value);
      return parsedContactEmail.success ? null : parsedContactEmail.formError;
    }

    if (contact.type === 'link') {
      const parsedContactLink = validateOrganizationLink(contact.value);
      return parsedContactLink.success ? null : parsedContactLink.formError;
    }

    if (contact.type === 'whatsapp') {
      return validateWhatsappContact(contact.value);
    }

    return null;
  });

  useEffect(() => {
    getOrganizationById(id)
      .then((data) => {
        if (!data) {
          router.push('/dashboard');
          return;
        }
        setOrg(data);
        setName(data.name ?? '');
        setDescription(data.description ?? '');
        setImage(data.image ?? '');
        setContacts(
          ((data.contacts as Contact[]) ?? []).map((contact) =>
            contact.type === 'whatsapp'
              ? { ...contact, value: sanitizeWhatsappInput(contact.value) }
              : contact,
          ),
        );
      })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!session) return;
    if (!session.user) router.push('/login');
  }, [session, router]);

  const canEdit = session?.user?.role === 'admin' || session?.user?.id === id;

  const addContact = () => {
    setContacts((prev) => [...prev, { type: 'email', value: '' }]);
  };

  const updateContact = (idx: number, field: 'type' | 'value', val: string) => {
    setContacts((prev) =>
      prev.map((c, i) => {
        if (i !== idx) {
          return c;
        }

        if (field === 'type') {
          return {
            ...c,
            type: val as Contact['type'],
            value:
              val === 'whatsapp' ? sanitizeWhatsappInput(c.value) : c.value,
          };
        }

        return {
          ...c,
          value: c.type === 'whatsapp' ? sanitizeWhatsappInput(val) : val,
        };
      }),
    );
  };

  const removeContact = (idx: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!organizationValidation.success) {
      setError(organizationValidation.formError);
      return;
    }

    const firstInvalidContact = contactErrors.find(
      (contactError) => contactError !== null,
    );

    if (firstInvalidContact) {
      setError(firstInvalidContact);
      return;
    }

    setLoading(true);

    try {
      await updateOrganization(id, {
        name,
        description,
        image: image || null,
        contacts,
      });
      setSuccess('¡Perfil actualizado correctamente!');
    } catch (err) {
      setError((err as Error).message || 'Error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-700 font-semibold mb-4">
            No tienes permisos para editar esta organización.
          </p>
          <button
            onClick={() => router.push(returnTo)}
            className="text-brand-600 hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => router.push(returnTo)}
        className="flex items-center text-slate-500 hover:text-brand-600 transition-colors mb-8 font-medium"
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
        Editar Perfil de Organización
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
      >
        {/* Nombre */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Nombre de la organización *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={ORGANIZATION_LIMITS.name.max}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Nombre de tu organización"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={visibleNameError ? 'text-red-600' : 'text-slate-400'}
            >
              {visibleNameError
                ? visibleNameError
                : `Maximo ${ORGANIZATION_LIMITS.name.max} caracteres.`}
            </span>
            <span
              className={
                visibleNameError
                  ? 'font-semibold text-red-600'
                  : 'text-slate-500'
              }
            >
              {name.length}/{ORGANIZATION_LIMITS.name.max}
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={ORGANIZATION_LIMITS.description.max}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            placeholder="Cuéntanos sobre tu organización..."
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={descriptionError ? 'text-red-600' : 'text-slate-400'}
            >
              {descriptionError
                ? descriptionError
                : `Maximo ${ORGANIZATION_LIMITS.description.max} caracteres.`}
            </span>
            <span
              className={
                descriptionError
                  ? 'font-semibold text-red-600'
                  : 'text-slate-500'
              }
            >
              {description.length}/{ORGANIZATION_LIMITS.description.max}
            </span>
          </div>
        </div>

        {/* Avatar / Imagen */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            URL de imagen (avatar)
          </label>
          <div className="flex gap-3 items-start">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Avatar preview"
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
            )}
            {!image && (
              <div className="w-16 h-16 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 text-2xl font-bold shrink-0">
                {name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Contactos */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-bold text-slate-700">
              Métodos de contacto
            </label>
            <button
              type="button"
              onClick={addContact}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Agregar contacto
            </button>
          </div>

          {contacts.length === 0 && (
            <p className="text-sm text-slate-400 italic">
              No has agregado métodos de contacto aún.
            </p>
          )}

          <div className="space-y-3">
            {contacts.map((contact, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <Select
                    value={contact.type}
                    onChange={(val) => updateContact(idx, 'type', val)}
                    options={[
                      { value: 'email', label: 'Email' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'link', label: 'Link' },
                    ]}
                    className="py-2.5! font-semibold"
                  />
                  {contact.type === 'whatsapp' ? (
                    <div className="flex-1">
                      <div
                        className={`flex overflow-hidden rounded-xl border text-sm focus-within:ring-2 focus-within:ring-brand-500 ${contactErrors[idx] ? 'border-red-300' : 'border-slate-200'}`}
                      >
                        <span className="flex items-center bg-slate-50 px-4 font-semibold text-slate-500 border-r border-slate-200">
                          {WHATSAPP_CONSTRAINTS.countryCode}
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={WHATSAPP_CONSTRAINTS.localDigits}
                          value={contact.value}
                          onChange={(e) =>
                            updateContact(idx, 'value', e.target.value)
                          }
                          className="min-w-0 flex-1 px-4 py-2.5 outline-none"
                          placeholder="999999999"
                          aria-label="Número de WhatsApp sin prefijo"
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type={contact.type === 'email' ? 'email' : 'text'}
                      value={contact.value}
                      onChange={(e) =>
                        updateContact(idx, 'value', e.target.value)
                      }
                      className={`flex-1 px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-brand-500 text-sm ${contactErrors[idx] ? 'border-red-300' : 'border-slate-200'}`}
                      placeholder={
                        contact.type === 'email'
                          ? 'org@pucp.edu.pe'
                          : 'https://...'
                      }
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeContact(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {contactErrors[idx] && (
                  <p className="text-xs text-red-600 pl-33">
                    {contactErrors[idx]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(returnTo)}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
