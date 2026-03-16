export const WHATSAPP_CONSTRAINTS = {
  countryCode: '+51',
  countryCallingCode: '51',
  localDigits: 9,
} as const;

function extractWhatsappDigits(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (
    digits.length > WHATSAPP_CONSTRAINTS.localDigits
    && digits.startsWith(WHATSAPP_CONSTRAINTS.countryCallingCode)
  ) {
    return digits.slice(WHATSAPP_CONSTRAINTS.countryCallingCode.length);
  }

  return digits;
}

export function sanitizeWhatsappInput(input: string): string {
  return extractWhatsappDigits(input).slice(
    0,
    WHATSAPP_CONSTRAINTS.localDigits,
  );
}

export function validateWhatsappContact(input: string): string | null {
  const digits = extractWhatsappDigits(input);

  if (digits.length === 0) {
    return null;
  }

  if (digits.length !== WHATSAPP_CONSTRAINTS.localDigits || digits[0] !== '9') {
    return `Ingresa un número de WhatsApp válido de ${WHATSAPP_CONSTRAINTS.localDigits} dígitos.`;
  }

  return null;
}

export function normalizeWhatsappContact(input: string): string | null {
  const digits = sanitizeWhatsappInput(input);
  return digits.length === 0 ? null : digits;
}

export function buildWhatsappUrl(input: string): string {
  const normalized = normalizeWhatsappContact(input);
  const digits = normalized
    ? `${WHATSAPP_CONSTRAINTS.countryCallingCode}${normalized}`
    : input.replace(/\D/g, '');

  return `https://wa.me/${digits}`;
}
