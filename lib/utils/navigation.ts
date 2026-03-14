interface SearchParamsLike {
  toString(): string;
}

export function sanitizeReturnTo(returnTo: string | null | undefined) {
  if (!returnTo) return null;

  const trimmed = returnTo.trim();

  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return null;

  return trimmed;
}

export function resolveReturnTo(
  returnTo: string | null | undefined,
  fallback: string,
) {
  return sanitizeReturnTo(returnTo) ?? fallback;
}

export function buildReturnTo(
  pathname: string,
  searchParams: SearchParamsLike,
) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function appendReturnTo(
  path: string,
  returnTo: string | null | undefined,
) {
  const safeReturnTo = sanitizeReturnTo(returnTo);

  if (!safeReturnTo) return path;

  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}returnTo=${encodeURIComponent(safeReturnTo)}`;
}
