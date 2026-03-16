function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return null;
}

export function validateEventDateRange(
  startDate: unknown,
  endDate: unknown,
): string | null {
  const start = toValidDate(startDate);
  const end = toValidDate(endDate);

  if (!start || !end) {
    return 'Ingresa fechas de inicio y fin válidas.';
  }

  if (end < start) {
    return 'La fecha de fin debe ser igual o posterior a la fecha de inicio.';
  }

  return null;
}
