import { z } from 'zod';
import { parseWithSchema } from '@/lib/validation';

export const ORGANIZATION_LIMITS = {
  name: {
    min: 1,
    max: 30,
    pattern: /^[\p{L}\p{N}\s&.,'()\-_/]+$/u,
  },
  email: {
    max: 254,
  },
  link: {
    max: 2048,
  },
  description: {
    max: 120,
  },
} as const;

const organizationEmailSchema = z
  .email('Ingresa un email válido.')
  .trim()
  .min(1, 'El email es obligatorio.')
  .max(
    ORGANIZATION_LIMITS.email.max,
    `El email no puede superar los ${ORGANIZATION_LIMITS.email.max} caracteres.`,
  );

const organizationNameSchema = z
  .string()
  .trim()
  .min(ORGANIZATION_LIMITS.name.min, 'El nombre es obligatorio.')
  .max(
    ORGANIZATION_LIMITS.name.max,
    `El nombre no puede superar los ${ORGANIZATION_LIMITS.name.max} caracteres.`,
  )
  .regex(
    ORGANIZATION_LIMITS.name.pattern,
    'El nombre solo puede incluir letras, números y signos básicos.',
  );

const organizationLinkSchema = z
  .url('Ingresa un link válido.')
  .trim()
  .min(1, 'El link es obligatorio.')
  .max(
    ORGANIZATION_LIMITS.link.max,
    `El link no puede superar los ${ORGANIZATION_LIMITS.link.max} caracteres.`,
  )
  .refine((link) => link.startsWith('https://'), {
    message: 'El link debe empezar con https://',
  });

const organizationDescriptionSchema = z
  .string()
  .max(
    ORGANIZATION_LIMITS.description.max,
    `La descripción no puede superar los ${ORGANIZATION_LIMITS.description.max} caracteres.`,
  )
  .transform((description) => (description ?? '').replace(/\r\n/g, '\n'));

export const organizationValidationSchema = z.object({
  name: organizationNameSchema,
  description: organizationDescriptionSchema,
});

export function validateOrganization(
  input: z.input<typeof organizationValidationSchema>,
) {
  return parseWithSchema(organizationValidationSchema, input);
}

export function validateOrganizationEmail(input: string) {
  return parseWithSchema(organizationEmailSchema, input);
}

export function validateOrganizationLink(input: string) {
  return parseWithSchema(organizationLinkSchema, input);
}
